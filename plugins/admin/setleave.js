export default {
    command: 'setleave',
    description: 'Set custom leave message for this group',
    category: 'admin',
    usage: '.setleave <pesan>',
    example: '.setleave Selamat tinggal @user dari grup @group!',
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { msg, args, db, reply } = context
        
        if (!args.length) {
            return await reply(`❌ ᴍᴀꜱᴜᴋᴋᴀɴ ᴘᴇꜱᴀɴ ʟᴇᴀᴠᴇ

📝 *ᴄᴏɴᴛᴏʜ:*
\`.setleave Selamat tinggal @user dari grup @group!\`

💡 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ ʏᴀɴɢ ᴅᴀᴘᴀᴛ ᴅɪɢᴜɴᴀᴋᴀɴ:*
• \`@user\` - ᴍᴇɴᴛɪᴏɴ ᴜꜱᴇʀ ʏᴀɴɢ ᴋᴇʟᴜᴀʀ
• \`@group\` - ɴᴀᴍᴀ ɢʀᴜᴘ
• \`@mention\` - ᴍᴇɴᴛɪᴏɴ ᴜꜱᴇʀ (ᴀʟɪᴀꜱ)`)
        }
        
        const pesan = args.join(' ')
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        groupData.byeText = pesan
        db.saveGroups()
        
        await reply(`✅ ᴘᴇꜱᴀɴ ʟᴇᴀᴠᴇ ʙᴇʀʜᴀꜱɪʟ ᴅɪᴜʙᴀʜ!

📄 *ᴘʀᴇᴠɪᴇᴡ:*
${pesan}`)
    }
}
