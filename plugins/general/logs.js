export default {
    command: 'logs',
    description: 'Display recent bot features and updates',
    category: 'general',
    usage: '',
    example: '.logs',
    aliases: ['changelog', 'updates'],
    
    async execute(context) {
        const { sock, msg, config } = context
        const prefix = config.getPrefix()
        const botName = config.getBotName() || 'Elysia'
        
        const logsText = `⌬〡 ʟᴏɢs & ᴜᴘᴅᴀᴛᴇs - ${botName}
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

✨ ʀᴇᴄᴇɴᴛ ᴜᴘᴅᴀᴛᴇs:

📅 2025-08-02
• ✧ Dynamic menu system added
• ✧ Category-based command organization
• ✧ ${prefix}allmenu command implemented
• ✧ Improved menu styling like moon-bot
• ✧ Auto-categorization of plugins

📅 Previous Updates
• ✧ Plugin hot-reload system
• ✧ Local JSON database
• ✧ Anti-spam protection
• ✧ Group management features
• ✧ Owner-only commands
• ✧ Premium user system

🔧 ᴄᴏᴍᴍᴀɴᴅs:
• ${prefix}menu - Show categories
• ${prefix}menu [category] - Show category commands  
• ${prefix}allmenu - Show all commands
• ${prefix}logs - Show this logs

💡 ɴᴇᴡ ꜰᴇᴀᴛᴜʀᴇs ᴄᴏᴍɪɴɢ sᴏᴏɴ:
• ✧ AI integration
• ✧ Download features
• ✧ Game commands
• ✧ Economy system

╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Keep using ${botName} for the best experience! 🚀`

        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: logsText
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ sᴇɴᴅɪɴɢ ʟᴏɢs'
            }, { quoted: msg })
        }
    }
}
