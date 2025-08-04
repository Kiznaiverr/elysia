export default {
    command: 'promote',
    description: 'Promote member to admin',
    category: 'group',
    usage: '@user',
    example: '.promote @6287725735588',
    aliases: ['admin', 'makeadmin'],
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
        
        const targetMember = groupMetadata?.participants?.find(p => p.id === target)
        if (targetMember?.admin) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴜsᴇʀ ɪs ᴀʟʀᴇᴀᴅʏ ᴀɴ ᴀᴅᴍɪɴ'
            }, { quoted: msg })
        }
        
        try {
            const response = await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'promote')
            
            if (response[0]?.status === '200') {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴘʀᴏᴍᴏᴛᴇᴅ @${target.split('@')[0]} ᴛᴏ ᴀᴅᴍɪɴ`,
                    mentions: [target]
                }, { quoted: msg })
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ @${target.split('@')[0]}`,
                    mentions: [target]
                }, { quoted: msg })
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴘʀᴏᴍᴏᴛɪɴɢ ᴍᴇᴍʙᴇʀ'
            }, { quoted: msg })
        }
    }
}
