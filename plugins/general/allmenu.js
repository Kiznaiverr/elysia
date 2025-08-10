import { getAllCategories, getPluginsByCategory, getPlugins } from '../../lib/loader.js'
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

const readMore = String.fromCharCode(8206).repeat(4001)

export default {
    command: 'allmenu',
    aliases: ['allmenu', 'allcommands', 'allcmd'],
    category: 'general',
    description: 'Show all commands',
    usage: '',
    cooldown: 3,

    async execute(context) {
        const { sock, msg, config, sender } = context
        const prefix = config.getPrefix()
        const allPlugins = getPlugins()
        const categories = getAllCategories()
        
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
            // Group plugins by category
            const categorized = {}
            const availablePlugins = allPlugins.filter(plugin => {
                if (plugin.ownerOnly && !isOwner) return false
                if (plugin.adminOnly && !isAdmin && !isOwner) return false
                return true
            })

            for (const plugin of availablePlugins) {
                const cat = (plugin.category || 'other').toLowerCase()
                if (!categorized[cat]) categorized[cat] = []
                categorized[cat].push(plugin)
            }

            const categoryIcons = {
                'admin': '👑',
                'owner': '🔱',
                'general': '📋',
                'user': '👤',
                'group': '👥',
                'fun': '🎮',
                'media': '🎨',
                'tools': '🔧',
                'search': '🔍',
                'downloader': '📥',
                'ai': '🤖'
            }

            // Build menu text using FontStyler
            let menuText = `${global.FontStyler.toSmallCaps('Hello')}! ${userName}, ${global.FontStyler.toSmallCaps("I'm")} ${botName}, ${global.FontStyler.toSmallCaps('a WhatsApp-based smart assistant who is here to help you')}.

⛨〡︎ *${global.FontStyler.toSmallCaps('Premium')}:* ${premiumText} 🅟
⛨〡︎ *${global.FontStyler.toSmallCaps('Limit')}:* ${userLimit}/${maxLimit} 🅛
⛨〡 *${global.FontStyler.toSmallCaps('Uptime')}* : *${uptime}*
⛨〡 *${global.FontStyler.toSmallCaps('Version')}* : *2.0.0*
⛨〡 *${global.FontStyler.toSmallCaps('Prefix Used')}* : *[ ${prefix} ]*
⛨〡︎ *${global.FontStyler.toSmallCaps('HomePage')}:* https://kiznavierr.my.id
⛨〡︎ *${global.FontStyler.toSmallCaps('Database')}:* ${dbSize}

${global.FontStyler.toSmallCaps('What can I do for you? I am designed to provide information, perform specific tasks, and provide direct support via WhatsApp messages')}.
${readMore}

`

            const sortedCats = Object.keys(categorized).sort()
            
            sortedCats.forEach(cat => {
                const icon = categoryIcons[cat] || '📂'
                const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1)
                
                menuText += `*ㅤㅤㅤㅤㅤㅤ⋠ ${global.FontStyler.toSmallCaps(categoryName.toUpperCase())} ⋡*\n`
                
                const sortedPlugins = categorized[cat].sort((a, b) => a.command.localeCompare(b.command))
                
                sortedPlugins.forEach(plugin => {
                    const isPremiumCmd = plugin.premium ? '🅟' : ''
                    const isLimitCmd = plugin.limit ? '🅛' : ''
                    menuText += `*❈* ${prefix}${global.FontStyler.toSmallCaps(plugin.command)} ${isPremiumCmd} ${isLimitCmd}\n`
                })
                
                menuText += `\n\n`
            })

            menuText += `${global.FontStyler.toSmallCaps('powered by Elysia')}`

            // Send with external ad reply
            await sock.sendMessage(msg.key.remoteJid, {
                text: menuText,
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

        } catch (error) {
            console.error('Allmenu error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Failed to generate allmenu. Please try again.'
            }, { quoted: msg })
        }
    }
}
