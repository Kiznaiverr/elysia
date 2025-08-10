export default {
    command: 'antisticker',
    description: 'Show antisticker help',
    category: 'admin',
    usage: '',
    example: '.antisticker',
    aliases: ['antistickerhelp'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { reply } = context
        
        const helpText = `
🛡️ *ᴀɴᴛɪsᴛɪᴄᴋᴇʀ ʜᴇʟᴘ*

📋 *ᴄᴏᴍᴍᴀɴᴅs:*
• \`.enable antisticker\` - ᴀᴋᴛɪғᴋᴀɴ ᴀɴᴛɪsᴛɪᴄᴋᴇʀ
• \`.disable antisticker\` - ɴᴏɴᴀᴋᴛɪғᴋᴀɴ ᴀɴᴛɪsᴛɪᴄᴋᴇʀ
• \`.status\` - ʟɪʜᴀᴛ sᴛᴀᴛᴜs ғᴇᴀᴛᴜʀᴇs ɢʀᴜᴘ

⚠️ *ᴘᴇʀɪɴɢᴀᴛᴀɴ:*
• sᴇᴍᴜᴀ sᴛɪᴄᴋᴇʀ ᴀᴋᴀɴ ᴅɪʜᴀᴘᴜs ᴛᴀɴᴘᴀ ᴘᴀɴᴅᴀɴɢ ʙᴜʟᴜ
• ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴇxᴄᴇᴘᴛɪᴏɴ ᴜɴᴛᴜᴋ ᴀᴅᴍɪɴ ᴀᴛᴀᴜ ᴏᴡɴᴇʀ
• ғᴇᴀᴛᴜʀᴇ ʙᴇʀʙᴇᴅᴀ ᴘᴇʀ ɢʀᴜᴘ

💡 *ᴀʟɪᴀsᴇs:*
• \`.on antisticker\` = \`.enable antisticker\`
• \`.off antisticker\` = \`.disable antisticker\`
        `.trim()
        
        await reply(helpText)
    }
}
