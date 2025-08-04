import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from './logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let plugins = []
let watcher = null

export async function loadPlugins() {
    plugins = []
    const pluginsDir = path.join(process.cwd(), 'plugins')
    
    try {
        logger.loading('📦 ʟᴏᴀᴅɪɴɢ ᴘʟᴜɢɪɴs...')
        await loadPluginsFromDir(pluginsDir)
        logger.success('✅ ᴘʟᴜɢɪɴs ʟᴏᴀᴅᴇᴅ sᴜᴄᴄᴇssꜰᴜʟʟʏ')
        return plugins
    } catch (error) {
        logger.error('❌ ᴇʀʀᴏʀ ʟᴏᴀᴅɪɴɢ ᴘʟᴜɢɪɴs:', error)
        return []
    }
}

async function loadPluginsFromDir(dir, category = '') {
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
        const itemPath = path.join(dir, item)
        const stat = fs.statSync(itemPath)
        
        if (stat.isDirectory()) {
            if (item === '_events') {
                continue
            }
            await loadPluginsFromDir(itemPath, item)
        } else if (item.endsWith('.js')) {
            try {
                const moduleUrl = `file:///${itemPath.replace(/\\/g, '/')}`
                
                const plugin = await import(`${moduleUrl}?t=${Date.now()}`)
                const pluginData = plugin.default
                
                if (pluginData && pluginData.command) {
                    if (!pluginData.category) {
                        pluginData.category = category || 'general'
                    }
                    
                    pluginData._filePath = itemPath
                    pluginData._category = category || 'general'
                    
                    plugins.push(pluginData)
                    logger.pluginLoaded(pluginData.command, pluginData.category)
                } else {
                    logger.warn(`ɪɴᴠᴀʟɪᴅ ᴘʟᴜɢɪɴ ꜰᴏʀᴍᴀᴛ: ${item}`)
                }
            } catch (error) {
                logger.pluginError(item, error)
            }
        }
    }
}

export function startAutoReload(callback) {
    if (watcher) {
        watcher.close()
    }
    
    const pluginsDir = path.join(process.cwd(), 'plugins')
    
    if (!fs.existsSync(pluginsDir)) {
        return
    }
    
    try {
        watcher = fs.watch(pluginsDir, { recursive: true }, async (eventType, filename) => {
            if (filename && filename.endsWith('.js')) {
                // Skip _events folder files
                if (filename.includes('_events')) {
                    return
                }
                
                try {
                    await reloadSpecificPlugin(filename, callback)
                } catch (error) {
                    logger.error('ᴇʀʀᴏʀ ʀᴇʟᴏᴀᴅɪɴɢ ᴘʟᴜɢɪɴ:', error)
                }
            }
        })
        
        logger.plugin('ᴀᴜᴛᴏ-ʀᴇʟᴏᴀᴅ ᴇɴᴀʙʟᴇᴅ ꜰᴏʀ ᴘʟᴜɢɪɴs ᴅɪʀᴇᴄᴛᴏʀʏ')
    } catch (error) {
        logger.error('ᴇʀʀᴏʀ sᴇᴛᴛɪɴɢ ᴜᴘ ᴀᴜᴛᴏ-ʀᴇʟᴏᴀᴅ:', error)
    }
}

async function reloadSpecificPlugin(filename, callback) {
    try {
        const pluginsDir = path.join(process.cwd(), 'plugins')
        
        // Handle both relative path and filename
        let filePath = null
        
        // If filename includes path separator, it's a relative path
        if (filename.includes(path.sep) || filename.includes('/') || filename.includes('\\')) {
            // Normalize path separators
            const normalizedFilename = filename.replace(/[\/\\]/g, path.sep)
            filePath = path.join(pluginsDir, normalizedFilename)
            
            // Check if file exists at this path
            if (!fs.existsSync(filePath)) {
                logger.warn(`ᴄᴀɴɴᴏᴛ ꜰɪɴᴅ ꜰɪʟᴇ: ${filename}`)
                return
            }
        } else {
            // Search for file recursively
            function findFile(dir, targetFile) {
                const items = fs.readdirSync(dir)
                for (const item of items) {
                    const itemPath = path.join(dir, item)
                    const stat = fs.statSync(itemPath)
                    
                    if (stat.isDirectory() && item !== '_events') {
                        const found = findFile(itemPath, targetFile)
                        if (found) return found
                    } else if (item === targetFile) {
                        return itemPath
                    }
                }
                return null
            }
            
            filePath = findFile(pluginsDir, filename)
            if (!filePath) {
                logger.warn(`ᴄᴀɴɴᴏᴛ ꜰɪɴᴅ ꜰɪʟᴇ: ${filename}`)
                return
            }
        }
        
        const oldPluginIndex = plugins.findIndex(p => p._filePath === filePath)
        if (oldPluginIndex !== -1) {
            plugins.splice(oldPluginIndex, 1)
        }
        
        if (fs.existsSync(filePath)) {
            const moduleUrl = `file:///${filePath.replace(/\\/g, '/')}`
            const plugin = await import(`${moduleUrl}?t=${Date.now()}`)
            const pluginData = plugin.default
            
            if (pluginData && pluginData.command) {
                const relativePath = path.relative(pluginsDir, filePath)
                const pathParts = relativePath.split(path.sep)
                const category = pathParts.length > 1 ? pathParts[0] : 'general'
                
                if (!pluginData.category) {
                    pluginData.category = category
                }
                
                pluginData._filePath = filePath
                pluginData._category = category
                
                plugins.push(pluginData)
                logger.pluginLoaded(pluginData.command, pluginData.category)
            } else {
                logger.warn(`ɪɴᴠᴀʟɪᴅ ᴘʟᴜɢɪɴ ꜰᴏʀᴍᴀᴛ: ${filename}`)
            }
        } else {
            // File deleted, just update the plugins array silently
        }
    } catch (error) {
        logger.error(`ᴇʀʀᴏʀ ʀᴇʟᴏᴀᴅɪɴɢ ${filename}:`, error)
    }
}

export function stopAutoReload() {
    if (watcher) {
        watcher.close()
        watcher = null
        logger.plugin('ᴀᴜᴛᴏ-ʀᴇʟᴏᴀᴅ ᴅɪsᴀʙʟᴇᴅ')
    }
}

export function getPlugins() {
    return plugins
}

export function getPlugin(command) {
    return plugins.find(p => 
        p.command === command || 
        (p.aliases && p.aliases.includes(command))
    )
}

export function getPluginsByCategory(category) {
    return plugins.filter(p => p.category === category)
}

export function getAllCategories() {
    const categories = new Set()
    plugins.forEach(p => {
        if (p.category) {
            categories.add(p.category)
        }
    })
    return Array.from(categories).sort()
}
