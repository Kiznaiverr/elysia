export default {
    command: 'status',
    description: 'Check group features status',
    category: 'admin',
    usage: '',
    example: '.status',
    aliases: ['groupinfo'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { msg, db, reply } = context
        
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        const statusEmoji = (status) => status ? '✅' : '❌'
        
        const statusText = `
📊 *ɢʀᴏᴜᴘ ғᴇᴀᴛᴜʀᴇs sᴛᴀᴛᴜs*

${statusEmoji(groupData.welcome)} ᴡᴇʟᴄᴏᴍᴇ (ᴅᴇғᴀᴜʟᴛ: ᴏɴ)
${statusEmoji(groupData.bye)} ʟᴇᴀᴠᴇ (ᴅᴇғᴀᴜʟᴛ: ᴏɴ)
${statusEmoji(groupData.antilink)} ᴀɴᴛɪʟɪɴᴋ (ᴅᴇғᴀᴜʟᴛ: ᴏғғ)
${statusEmoji(groupData.antisticker)} ᴀɴᴛɪsᴛɪᴄᴋᴇʀ (ᴅᴇғᴀᴜʟᴛ: ᴏғғ)
${statusEmoji(groupData.antidelete)} ᴀɴᴛɪᴅᴇʟᴇᴛᴇ (ᴅᴇғᴀᴜʟᴛ: ᴏғғ)
${statusEmoji(groupData.antibadword)} ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ (ᴅᴇғᴀᴜʟᴛ: ᴏғғ)
${statusEmoji(groupData.antispam)} ᴀɴᴛɪsᴘᴀᴍ (ᴅᴇғᴀᴜʟᴛ: ᴏғғ)
${statusEmoji(groupData.mute)} ᴍᴜᴛᴇ (ᴅᴇғᴀᴜʟᴛ: ᴏғғ)

💡 *ᴛɪᴘs:*
• ɢᴜɴᴀᴋᴀɴ \`.enable <feature>\` ᴜɴᴛᴜᴋ ᴍᴇɴɢᴀᴋᴛɪғᴋᴀɴ
• ɢᴜɴᴀᴋᴀɴ \`.disable <feature>\` ᴜɴᴛᴜᴋ ᴍᴇɴᴏɴᴀᴋᴛɪғᴋᴀɴ
        `.trim()
        
        await reply(statusText)
    }
}
