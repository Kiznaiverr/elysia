export default {
    command: 'unmute',
    description: 'Unmute user in group',
    category: 'admin',
    usage: '@user',
    example: '.unmute @6287725735588',
    aliases: ['unsilence', 'unmuted'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { sock, msg, isGroup } = context
        
        if (!isGroup) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs'
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
        
        try {
            global.mutedUsers = global.mutedUsers || {}
            const groupId = msg.key.remoteJid
            
            if (global.mutedUsers[groupId] && global.mutedUsers[groupId][target]) {
                delete global.mutedUsers[groupId][target]
                
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🔊 @${target.split('@')[0]} ʜᴀs ʙᴇᴇɴ ᴜɴᴍᴜᴛᴇᴅ`,
                    mentions: [target]
                }, { quoted: msg })
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ @${target.split('@')[0]} ɪs ɴᴏᴛ ᴍᴜᴛᴇᴅ`,
                    mentions: [target]
                }, { quoted: msg })
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴜɴᴍᴜᴛɪɴɢ ᴜsᴇʀ'
            }, { quoted: msg })
        }
    }
}
