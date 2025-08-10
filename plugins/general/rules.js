export default {
    command: 'rules',
    description: 'Display bot usage rules and guidelines',
    category: 'general',
    usage: '',
    example: '.rules',
    aliases: ['rule', 'aturan'],
    
    async execute(context) {
        const { sock, msg, config } = context
        const prefix = config.getPrefix()
        const botName = config.getBotName() || 'Elysia'
        const ownerName = config.get('botSettings', 'author') || 'Kiznavierr'
        
        const rulesText = `⌬〡 ʀᴜʟᴇs & ɢᴜɪᴅᴇʟɪɴᴇs - ${botName}
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

📋 ɢᴇɴᴇʀᴀʟ ʀᴜʟᴇs:

🚫 ᴅᴏɴ'ᴛ:
• Spam commands (cooldown applies)
• Use for illegal activities
• Share inappropriate content
• Abuse the bot features
• Try to exploit or hack

✅ ᴅᴏ:
• Use commands properly
• Read command descriptions
• Respect other users
• Report bugs to owner
• Follow group rules

⚡ ʟɪᴍɪᴛ sʏsᴛᴇᴍ:
• Free users: 10 commands/day
• Premium users: Unlimited
• Limits reset daily
• Some commands are free

🏆 ᴘʀᴇᴍɪᴜᴍ ʙᴇɴᴇꜰɪᴛs:
• Unlimited daily commands
• Priority support
• Access to premium features
• No cooldown restrictions

👑 ᴏᴡɴᴇʀ ᴄᴏɴᴛᴀᴄᴛ:
• Name: ${ownerName}
• For support and premium upgrade

⚠️ ᴠɪᴏʟᴀᴛɪᴏɴs:
• Breaking rules may result in ban
• Appeals can be made to owner
• Temporary or permanent restrictions

🔧 ᴄᴏᴍᴍᴀɴᴅs:
• ${prefix}menu - Main menu
• ${prefix}allmenu - All commands
• ${prefix}owner - Contact owner
• ${prefix}premium - Premium info

╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
By using ${botName}, you agree to these rules! 📜`

        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: rulesText
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ sᴇɴᴅɪɴɢ ʀᴜʟᴇs'
            }, { quoted: msg })
        }
    }
}
