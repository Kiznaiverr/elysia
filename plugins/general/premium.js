export default {
    command: 'premium',
    description: 'Display premium information and benefits',
    category: 'general',
    usage: '',
    example: '.premium',
    aliases: ['prem', 'upgrade'],
    
    async execute(context) {
        const { sock, msg, config, sender } = context
        const prefix = config.getPrefix()
        const botName = config.getBotName() || 'Elysia'
        const ownerName = config.get('botSettings', 'author') || 'Kiznavierr'
        const isPremium = context.db?.isPremium(sender) || false
        
        if (isPremium) {
            const premiumText = `⌬〡 ᴘʀᴇᴍɪᴜᴍ sᴛᴀᴛᴜs - ${botName}
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

🌟 ᴄᴏɴɢʀᴀᴛᴜʟᴀᴛɪᴏɴs!
You are already a PREMIUM user! 👑

✨ ʏᴏᴜʀ ʙᴇɴᴇꜰɪᴛs:
• ✧ Unlimited daily commands
• ✧ No cooldown restrictions  
• ✧ Priority support
• ✧ Access to premium features
• ✧ Special premium commands
• ✧ Early access to new features

🎯 ᴇɴᴊᴏʏ ʏᴏᴜʀ ᴘʀᴇᴍɪᴜᴍ ᴇxᴘᴇʀɪᴇɴᴄᴇ!

╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Thank you for supporting ${botName}! 🚀`

            await sock.sendMessage(msg.key.remoteJid, {
                text: premiumText
            }, { quoted: msg })
        } else {
            const premiumText = `⌬〡 ᴘʀᴇᴍɪᴜᴍ ɪɴꜰᴏ - ${botName}
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

💎 ᴜᴘɢʀᴀᴅᴇ ᴛᴏ ᴘʀᴇᴍɪᴜᴍ!

🆓 ꜰʀᴇᴇ ᴜsᴇʀ ʟɪᴍɪᴛᴀᴛɪᴏɴs:
• ✧ 10 commands per day
• ✧ Cooldown between commands
• ✧ Limited features access
• ✧ Basic support

👑 ᴘʀᴇᴍɪᴜᴍ ʙᴇɴᴇꜰɪᴛs:
• ✧ Unlimited daily commands
• ✧ No cooldown restrictions
• ✧ Priority support
• ✧ Access to premium features
• ✧ Special premium commands
• ✧ Early access to new features
• ✧ Custom command requests

💰 ᴘʀɪᴄɪɴɢ:
• Contact owner for pricing
• Multiple payment methods
• Affordable rates
• Worth the upgrade!

📞 ᴄᴏɴᴛᴀᴄᴛ ᴏᴡɴᴇʀ:
• Use ${prefix}owner command
• Name: ${ownerName}
• Ask about premium upgrade

🎁 sᴘᴇᴄɪᴀʟ ᴏꜰꜰᴇʀs:
• First-time buyer discounts
• Group package deals
• Long-term subscriptions

╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Upgrade now and enjoy unlimited access! ⭐`

            await sock.sendMessage(msg.key.remoteJid, {
                text: premiumText
            }, { quoted: msg })
        }
    }
}
