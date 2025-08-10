export default {
    command: 'addbadword',
    description: 'Add custom badword to global or group list',
    category: 'owner',
    usage: '<word> [--global]',
    example: '.addbadword kontol --global',
    aliases: ['addword'],
    ownerOnly: true,
    
    async execute(context) {
        const { msg, args, db, reply, isGroup } = context
        
        if (!args.length) {
            return await reply(`❌ ᴍᴀsᴜᴋᴋᴀɴ ᴋᴀᴛᴀ ʏᴀɴɢ ɪɴɢɪɴ ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ

📝 *ᴄᴏɴᴛᴏʜ:*
\`.addbadword kontol\` - ᴛᴀᴍʙᴀʜ ᴋᴇ ɢʀᴜᴘ ɪɴɪ
\`.addbadword kontol --global\` - ᴛᴀᴍʙᴀʜ ᴋᴇ ᴅᴀꜰᴛᴀʀ ɢʟᴏʙᴀʟ`)
        }
        
        const isGlobal = args.includes('--global')
        const word = args.filter(arg => arg !== '--global').join(' ').toLowerCase().trim()
        
        if (!word) {
            return await reply('❌ ᴋᴀᴛᴀ ᴛɪᴅᴀᴋ ʙᴏʟᴇʜ ᴋᴏsᴏɴɢ')
        }
        
        try {
            if (isGlobal) {
                // Add to global badwords
                const success = db.addGlobalBadword(word)
                if (success) {
                    const globalBadwords = db.getGlobalBadwords()
                    await reply(`✅ ᴋᴀᴛᴀ "${word}" ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ ᴋᴇ ᴅᴀꜰᴛᴀʀ ɢʟᴏʙᴀʟ

📊 *ᴛᴏᴛᴀʟ ʙᴀᴅᴡᴏʀᴅ ɢʟᴏʙᴀʟ:* ${globalBadwords.length}`)
                } else {
                    await reply(`❌ ᴋᴀᴛᴀ "${word}" ꜱᴜᴅᴀʜ ᴀᴅᴀ ᴅɪ ᴅᴀꜰᴛᴀʀ ɢʟᴏʙᴀʟ`)
                }
            } else {
                if (!isGroup) {
                    return await reply('❌ ᴘᴇʀɪɴᴛᴀʜ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴅɪɢᴜɴᴀᴋᴀɴ ᴅɪ ɢʀᴜᴘ')
                }
                
                const groupId = msg.key.remoteJid
                const success = db.addGroupBadword(groupId, word)
                
                if (success) {
                    const groupBadwords = db.getGroupBadwords(groupId)
                    await reply(`✅ ᴋᴀᴛᴀ "${word}" ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ ᴋᴇ ᴅᴀꜰᴛᴀʀ ʙᴀᴅᴡᴏʀᴅ ɢʀᴜᴘ

📋 *ᴛᴏᴛᴀʟ ʙᴀᴅᴡᴏʀᴅ ɢʀᴜᴘ:* ${groupBadwords.length}`)
                } else {
                    await reply(`❌ ᴋᴀᴛᴀ "${word}" ꜱᴜᴅᴀʜ ᴀᴅᴀ ᴅɪ ᴅᴀꜰᴛᴀʀ ɢʀᴜᴘ`)
                }
            }
        } catch (error) {
            console.error('Error adding badword:', error)
            await reply('❌ ᴛᴇʀᴊᴀᴅɪ ᴋᴇꜱᴀʟᴀʜᴀɴ ꜱᴀᴀᴛ ᴍᴇɴᴀᴍʙᴀʜ ʙᴀᴅᴡᴏʀᴅ')
        }
    }
}
