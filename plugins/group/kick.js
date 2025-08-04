export default {
    command: 'kick',
    description: 'Kick member from group',
    category: 'group',
    usage: '@user',
    example: '.kick @6287725735588',
    aliases: ['remove', 'kickmember', '-'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { sock, msg, isGroup, groupMetadata } = context
        
        if (!isGroup) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs'
            }, { quoted: msg })
        }
        
        const botNumber = sock.user?.id?.split(':')[0]
        const isAdmin = groupMetadata?.participants?.find(p => p.id.split('@')[0] === botNumber)?.admin
        
        if (!isAdmin) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ʙᴏᴛ ɴᴇᴇᴅs ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ'
            }, { quoted: msg })
        }
        
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
        const quotedUser = msg.message?.extendedTextMessage?.contextInfo?.participant
        
        let target = mentionedJid?.[0] || quotedUser
        
        if (!target) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ'
            }, { quoted: msg })
        }
        
        if (target === sock.user?.id) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴄᴀɴɴᴏᴛ ᴋɪᴄᴋ ᴍʏsᴇʟғ'
            }, { quoted: msg })
        }
        
        try {
            const response = await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'remove')
            
            if (response[0]?.status === '200') {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴋɪᴄᴋᴇᴅ @${target.split('@')[0]}`,
                    mentions: [target]
                }, { quoted: msg })
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴋɪᴄᴋ @${target.split('@')[0]}`,
                    mentions: [target]
                }, { quoted: msg })
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴋɪᴄᴋɪɴɢ ᴍᴇᴍʙᴇʀ'
            }, { quoted: msg })
        }
    }
}
