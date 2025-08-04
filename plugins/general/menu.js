import { getAllCategories, getPluginsByCategory } from '../../lib/loader.js'
import path from 'path'
import fs from 'fs'
import os from 'os'

const runtimes = (seconds) => {
    seconds = Number(seconds)
    var d = Math.floor(seconds / (3600 * 24))
    var h = Math.floor(seconds % (3600 * 24) / 3600)
    var m = Math.floor(seconds % 3600 / 60)
    var s = Math.floor(seconds % 60)
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
    return dDisplay + hDisplay + mDisplay + sDisplay
}

export default {
    command: 'menu',
    description: 'Display bot menu by category',
    category: 'general',
    usage: 'menu [category]',
    example: '.menu admin',
    aliases: ['help', 'h'],
    
    async execute(context) {
        const { sock, msg, config, args, sender } = context
        const prefix = config.getPrefix()
        const category = args[0]?.toLowerCase()
        
        const botName = config.getBotName() || 'Elysia'
        const ownerName = config.get('botSettings', 'author') || 'Kiznavierr'
        const user = context.db?.getUser(sender)
        const isOwner = context.db?.isOwner(sender) || false
        const isAdmin = context.db?.isAdmin(sender) || false
        const isPremium = context.db?.isPremium(sender) || false
        
        const userName = user?.name || msg.pushName || 'User'
        const userLimit = user?.limit ?? 0
        const maxLimit = context.db?.getSetting ? (context.db.getSetting('dailyLimit') || 50) : 50
        const premiumText = isOwner ? 'Owner' : (isPremium ? 'Premium' : 'Free')
        const uptime = runtimes(process.uptime())
        
        // Get database size
        let dbSize = 'Unknown'
        try {
            const dbPath = path.join(process.cwd(), 'database', 'users.json')
            if (fs.existsSync(dbPath)) {
                const dbSizeBytes = fs.statSync(dbPath).size
                dbSize = dbSizeBytes > 1000000 
                    ? `${(dbSizeBytes / 1000000).toFixed(2)} MB` 
                    : `${(dbSizeBytes / 1000).toFixed(2)} KB`
            }
        } catch (error) {
            dbSize = 'Unknown'
        }

        try {
            if (category) {
                // Show specific category
                const categoryPlugins = getPluginsByCategory(category).filter(plugin => {
                    if (plugin.ownerOnly && !isOwner) return false
                    if (plugin.adminOnly && !isAdmin && !isOwner) return false
                    return true
                })
                
                if (categoryPlugins.length === 0) {
                    const categories = getAllCategories()
                    await sock.sendMessage(msg.key.remoteJid, {
                        text: `❌ Kategori "${category}" tidak ditemukan atau tidak ada command yang tersedia!\n\nKategori yang tersedia:\n${categories.map(cat => `▣ ${prefix}menu ${cat}`).join('\n')}`
                    }, { quoted: msg })
                    return
                }
                
                const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
                
                let categoryMenu = `${global.FontStyler.toSmallCaps('Hello')}! ${userName}, ${global.FontStyler.toSmallCaps("I'm")} ${botName}, ${global.FontStyler.toSmallCaps('a WhatsApp-based smart assistant who is here to help you')}.

⛨〡︎ *${global.FontStyler.toSmallCaps('Premium')}:* ${premiumText} 🅟
⛨〡︎ *${global.FontStyler.toSmallCaps('Limit')}:* ${userLimit}/${maxLimit} 🅛
⛨〡 *${global.FontStyler.toSmallCaps('Uptime')}* : *${uptime}*
⛨〡 *${global.FontStyler.toSmallCaps('Version')}* : *2.0.0*
⛨〡 *${global.FontStyler.toSmallCaps('Prefix Used')}* : *[ ${prefix} ]*
⛨〡︎ *${global.FontStyler.toSmallCaps('HomePage')}:* https://kiznavierr.my.id
⛨〡︎ *${global.FontStyler.toSmallCaps('Database')}:* ${dbSize}

*⋠ ${global.FontStyler.toSmallCaps(categoryName.toUpperCase())} ⋡*
`
                
                const sortedPlugins = categoryPlugins.sort((a, b) => a.command.localeCompare(b.command))
                
                sortedPlugins.forEach(plugin => {
                    const isPremiumCmd = plugin.premium ? '🅟' : ''
                    const isLimitCmd = plugin.limit ? '🅛' : ''
                    categoryMenu += `*╎❈* ${prefix}${global.FontStyler.toSmallCaps(plugin.command)} ${isPremiumCmd} ${isLimitCmd}\n`
                })
                
                categoryMenu += `

🤖 ${global.FontStyler.toSmallCaps('powered by elysia-md | created by kiznavierr')}`

                // Send with external ad reply
                await sock.sendMessage(msg.key.remoteJid, {
                    text: categoryMenu,
                    contextInfo: {
                        externalAdReply: {
                            title: botName || 'Elysia-MD',
                            body: ownerName || 'Kiznavierr',
                            thumbnail: fs.existsSync(path.join(process.cwd(), 'src', 'images', 'elysia.jpeg')) 
                                ? fs.readFileSync(path.join(process.cwd(), 'src', 'images', 'elysia.jpeg'))
                                : Buffer.alloc(0),
                            sourceUrl: 'https://github.com/kiznaiverr/elysia-md',
                            mediaType: 1,
                            renderLargerThumbnail: true,
                        }
                    }
                }, { quoted: msg })
            } else {
                // Show main menu with categories
                const categories = getAllCategories()
                
                let mainMenu = `${global.FontStyler.toSmallCaps('Hello')}! ${userName}, ${global.FontStyler.toSmallCaps("I'm")} ${botName}, ${global.FontStyler.toSmallCaps('a WhatsApp-based smart assistant who is here to help you')}.

⛨〡︎ *${global.FontStyler.toSmallCaps('Premium')}:* ${premiumText} 🅟
⛨〡︎ *${global.FontStyler.toSmallCaps('Limit')}:* ${userLimit}/${maxLimit} 🅛
⛨〡 *${global.FontStyler.toSmallCaps('Uptime')}* : *${uptime}*
⛨〡 *${global.FontStyler.toSmallCaps('Version')}* : *2.0.0*
⛨〡 *${global.FontStyler.toSmallCaps('Prefix Used')}* : *[ ${prefix} ]*
⛨〡︎ *${global.FontStyler.toSmallCaps('HomePage')}:* https://kiznavierr.my.id
⛨〡︎ *${global.FontStyler.toSmallCaps('Database')}:* ${dbSize}

${global.FontStyler.toSmallCaps('What can I do for you? I am designed to provide information, perform specific tasks, and provide direct support via WhatsApp messages')}.

*           ⋠ ${global.FontStyler.toSmallCaps('CATEGORIES')} ⋡*
`
                
                categories.forEach(cat => {
                    const categoryCount = getPluginsByCategory(cat).length
                    mainMenu += `*❈* ${prefix}menu ${global.FontStyler.toSmallCaps(cat)} (${categoryCount} commands)\n`
                })
                
                mainMenu += `

🤖 ${global.FontStyler.toSmallCaps('powered by elysia-md | created by kiznavierr')}`

                // Send with external ad reply
                await sock.sendMessage(msg.key.remoteJid, {
                    text: mainMenu,
                    contextInfo: {
                        externalAdReply: {
                            title: botName || 'Elysia-MD',
                            body: ownerName || 'Kiznavierr',
                            thumbnail: fs.existsSync(path.join(process.cwd(), 'src', 'images', 'elysia.jpeg')) 
                                ? fs.readFileSync(path.join(process.cwd(), 'src', 'images', 'elysia.jpeg'))
                                : Buffer.alloc(0),
                            sourceUrl: 'https://github.com/kiznaiverr/elysia-md',
                            mediaType: 1,
                            renderLargerThumbnail: true,
                        }
                    }
                }, { quoted: msg })
            }
        } catch (error) {
            console.error('Menu error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Failed to generate menu. Please try again.'
            }, { quoted: msg })
        }
    }
}
