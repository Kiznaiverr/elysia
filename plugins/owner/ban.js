export default {
    command: 'ban',
    description: 'Ban user from using bot',
    category: 'owner',
    usage: '@user',
    example: '.ban @6287725735588',
    aliases: ['banned', 'banuser'],
    ownerOnly: true,
    
    async execute(context) {
        const { sock, msg, db } = context
        
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
        const quotedUser = msg.message?.extendedTextMessage?.contextInfo?.participant
        
        let target = mentionedJid?.[0] || quotedUser
        
        if (!target) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ'
            }, { quoted: msg })
        }
        
        if (db.isOwner(target)) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴄᴀɴɴᴏᴛ ʙᴀɴ ᴏᴡɴᴇʀ'
            }, { quoted: msg })
        }
        
        if (db.isBanned(target)) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴜsᴇʀ ɪs ᴀʟʀᴇᴀᴅʏ ʙᴀɴɴᴇᴅ'
            }, { quoted: msg })
        }
        
        try {
            db.addBanned(target)
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ sᴜᴄᴄᴇssғᴜʟʟʏ ʙᴀɴɴᴇᴅ @${target.split('@')[0]}`,
                mentions: [target]
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ʙᴀɴɴɪɴɢ ᴜsᴇʀ'
            }, { quoted: msg })
        }
    }
}
