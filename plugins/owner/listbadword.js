export default {
    command: 'listbadword',
    description: 'Show badwords list for group or global',
    category: 'owner',
    usage: '[--global]',
    example: '.listbadword --global',
    aliases: ['badwordlist', 'badwords'],
    ownerOnly: true,
    
    async execute(context) {
        const { msg, args, db, reply, isGroup } = context
        
        try {
            const isGlobal = args.includes('--global')
            
            if (isGlobal) {
                // Show global badwords
                const globalBadwords = db.getGlobalBadwords()
                
                if (globalBadwords.length === 0) {
                    return await reply(`📋 *ᴅᴀꜰᴛᴀʀ ʙᴀᴅᴡᴏʀᴅ ɢʟᴏʙᴀʟ*

❌ ᴛɪᴅᴀᴋ ᴀᴅᴀ ʙᴀᴅᴡᴏʀᴅ ɢʟᴏʙᴀʟ`)
                }
                
                const chunkSize = 20 // Show 20 words per message
                const chunks = []
                for (let i = 0; i < globalBadwords.length; i += chunkSize) {
                    chunks.push(globalBadwords.slice(i, i + chunkSize))
                }
                
                for (let i = 0; i < chunks.length; i++) {
                    const badwordsList = chunks[i]
                        .map((word, index) => `${i * chunkSize + index + 1}. ${word}`)
                        .join('\n')
                    
                    const message = `📋 *ᴅᴀꜰᴛᴀʀ ʙᴀᴅᴡᴏʀᴅ ɢʟᴏʙᴀʟ* (${i + 1}/${chunks.length})

📊 *ᴛᴏᴛᴀʟ:* ${globalBadwords.length} ᴋᴀᴛᴀ

📝 *ᴅᴀꜰᴛᴀʀ ᴋᴀᴛᴀ:*
${badwordsList}

🔧 *ᴘᴇʀɪɴᴛᴀʜ:*
• \`.addbadword <kata> --global\` - ᴛᴀᴍʙᴀʜ ᴋᴇ ɢʟᴏʙᴀʟ
• \`.delbadword <kata> --global\` - ʜᴀᴘᴜs ᴅᴀʀɪ ɢʟᴏʙᴀʟ`
                    
                    await reply(message)
                }
            } else {
                // Show group badwords
                if (!isGroup) {
                    return await reply('❌ ᴘᴇʀɪɴᴛᴀʜ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴅɪɢᴜɴᴀᴋᴀɴ ᴅɪ ɢʀᴜᴘ ᴀᴛᴀᴜ ᴅᴇɴɢᴀɴ --global')
                }
                
                const groupId = msg.key.remoteJid
                const groupBadwords = db.getGroupBadwords(groupId)
                const globalBadwords = db.getGlobalBadwords()
                
                if (groupBadwords.length === 0) {
                    return await reply(`📋 *ᴅᴀꜰᴛᴀʀ ʙᴀᴅᴡᴏʀᴅ ɢʀᴜᴘ*

❌ ᴛɪᴅᴀᴋ ᴀᴅᴀ ʙᴀᴅᴡᴏʀᴅ ᴄᴜsᴛᴏᴍ ᴅɪ ɢʀᴜᴘ ɪɴɪ

💡 *ᴄᴀᴛᴀᴛᴀɴ:* ʙᴏᴛ ᴛᴇᴛᴀᴘ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ${globalBadwords.length} ʙᴀᴅᴡᴏʀᴅ ᴅᴇꜰᴀᴜʟᴛ

ᴜɴᴛᴜᴋ ᴍᴇɴᴀᴍʙᴀʜ: \`.addbadword <kata>\`
ᴜɴᴛᴜᴋ ᴍᴇʟɪʜᴀᴛ ɢʟᴏʙᴀʟ: \`.listbadword --global\``)
                }
                
                const badwordsList = groupBadwords
                    .map((word, index) => `${index + 1}. ${word}`)
                    .join('\n')
                
                const message = `📋 *ᴅᴀꜰᴛᴀʀ ʙᴀᴅᴡᴏʀᴅ ɢʀᴜᴘ*

📊 *ᴛᴏᴛᴀʟ:* ${groupBadwords.length} ᴋᴀᴛᴀ ᴄᴜsᴛᴏᴍ + ${globalBadwords.length} ᴋᴀᴛᴀ ᴅᴇꜰᴀᴜʟᴛ

📝 *ᴅᴀꜰᴛᴀʀ ᴋᴀᴛᴀ ᴄᴜsᴛᴏᴍ ɢʀᴜᴘ:*
${badwordsList}

🔧 *ᴘᴇʀɪɴᴛᴀʜ:*
• \`.addbadword <kata>\` - ᴛᴀᴍʙᴀʜ ᴋᴇ ɢʀᴜᴘ
• \`.delbadword <kata>\` - ʜᴀᴘᴜs ᴅᴀʀɪ ɢʀᴜᴘ
• \`.listbadword --global\` - ʟɪʜᴀᴛ ᴅᴀꜰᴛᴀʀ ɢʟᴏʙᴀʟ`
                
                await reply(message)
            }
            
        } catch (error) {
            console.error('Error showing badwords list:', error)
            await reply('❌ ᴛᴇʀᴊᴀᴅɪ ᴋᴇꜱᴀʟᴀʜᴀɴ ꜱᴀᴀᴛ ᴍᴇɴᴀᴍᴘɪʟᴋᴀɴ ᴅᴀꜰᴛᴀʀ ʙᴀᴅᴡᴏʀᴅ')
        }
    }
}
