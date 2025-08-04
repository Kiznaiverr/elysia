export default {
    command: 'delbadword',
    description: 'Remove custom badword from global or group list',
    category: 'owner',
    usage: '<word> [--global]',
    example: '.delbadword kontol --global',
    aliases: ['delword', 'removebadword'],
    ownerOnly: true,
    
    async execute(context) {
        const { msg, args, db, reply, isGroup } = context
        
        if (!args.length) {
            return await reply(`❌ ᴍᴀsᴜᴋᴋᴀɴ ᴋᴀᴛᴀ ʏᴀɴɢ ɪɴɢɪɴ ᴅɪʜᴀᴘᴜs

📝 *ᴄᴏɴᴛᴏʜ:*
\`.delbadword kontol\` - ʜᴀᴘᴜs ᴅᴀʀɪ ɢʀᴜᴘ ɪɴɪ
\`.delbadword kontol --global\` - ʜᴀᴘᴜs ᴅᴀʀɪ ᴅᴀꜰᴛᴀʀ ɢʟᴏʙᴀʟ

💡 *ᴛɪᴘ:* ɢᴜɴᴀᴋᴀɴ \`.listbadword\` ᴜɴᴛᴜᴋ ᴍᴇʟɪʜᴀᴛ ᴅᴀꜰᴛᴀʀ`)
        }
        
        const isGlobal = args.includes('--global')
        const word = args.filter(arg => arg !== '--global').join(' ').toLowerCase().trim()
        
        if (!word) {
            return await reply('❌ ᴋᴀᴛᴀ ᴛɪᴅᴀᴋ ʙᴏʟᴇʜ ᴋᴏsᴏɴɢ')
        }
        
        try {
            if (isGlobal) {
                // Remove from global badwords
                const success = db.removeGlobalBadword(word)
                if (success) {
                    const globalBadwords = db.getGlobalBadwords()
                    await reply(`✅ ᴋᴀᴛᴀ "${word}" ᴅɪʜᴀᴘᴜs ᴅᴀʀɪ ᴅᴀꜰᴛᴀʀ ɢʟᴏʙᴀʟ

📊 *ᴛᴏᴛᴀʟ ʙᴀᴅᴡᴏʀᴅ ɢʟᴏʙᴀʟ:* ${globalBadwords.length}`)
                } else {
                    await reply(`❌ ᴋᴀᴛᴀ "${word}" ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ ᴅɪ ᴅᴀꜰᴛᴀʀ ɢʟᴏʙᴀʟ`)
                }
            } else {
                if (!isGroup) {
                    return await reply('❌ ᴘᴇʀɪɴᴛᴀʜ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴅɪɢᴜɴᴀᴋᴀɴ ᴅɪ ɢʀᴜᴘ')
                }
                
                const groupId = msg.key.remoteJid
                const success = db.removeGroupBadword(groupId, word)
                
                if (success) {
                    const groupBadwords = db.getGroupBadwords(groupId)
                    await reply(`✅ ᴋᴀᴛᴀ "${word}" ᴅɪʜᴀᴘᴜs ᴅᴀʀɪ ᴅᴀꜰᴛᴀʀ ʙᴀᴅᴡᴏʀᴅ ɢʀᴜᴘ

📋 *ᴛᴏᴛᴀʟ ʙᴀᴅᴡᴏʀᴅ ɢʀᴜᴘ:* ${groupBadwords.length}`)
                } else {
                    await reply(`❌ ᴋᴀᴛᴀ "${word}" ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ ᴅɪ ᴅᴀꜰᴛᴀʀ ɢʀᴜᴘ`)
                }
            }
        } catch (error) {
            console.error('Error removing badword:', error)
            await reply('❌ ᴛᴇʀᴊᴀᴅɪ ᴋᴇꜱᴀʟᴀʜᴀɴ ꜱᴀᴀᴛ ᴍᴇɴɢʜᴀᴘᴜs ʙᴀᴅᴡᴏʀᴅ')
        }
    }
}
