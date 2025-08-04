export default {
    command: 'setwelcome',
    description: 'Set custom welcome message for this group',
    category: 'admin',
    usage: '.setwelcome <pesan>',
    example: '.setwelcome Selamat datang @user di grup @group!',
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { msg, args, db, reply } = context
        
        if (!args.length) {
            return await reply(`❌ ᴍᴀꜱᴜᴋᴋᴀɴ ᴘᴇꜱᴀɴ ᴡᴇʟᴄᴏᴍᴇ

📝 *ᴄᴏɴᴛᴏʜ:*
\`.setwelcome Selamat datang @user di grup @group!\`

💡 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ ʏᴀɴɢ ᴅᴀᴘᴀᴛ ᴅɪɢᴜɴᴀᴋᴀɴ:*
• \`@user\` - ᴍᴇɴᴛɪᴏɴ ᴜꜱᴇʀ ʙᴀʀᴜ
• \`@group\` - ɴᴀᴍᴀ ɢʀᴜᴘ
• \`@mention\` - ᴍᴇɴᴛɪᴏɴ ᴜꜱᴇʀ (ᴀʟɪᴀꜱ)`)
        }
        
        const pesan = args.join(' ')
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        groupData.welcomeText = pesan
        db.saveGroups()
        
        await reply(`✅ ᴘᴇꜱᴀɴ ᴡᴇʟᴄᴏᴍᴇ ʙᴇʀʜᴀꜱɪʟ ᴅɪᴜʙᴀʜ!

📄 *ᴘʀᴇᴠɪᴇᴡ:*
${pesan}`)
    }
}
