export default {
    command: 'unban',
    description: 'Unban user from using bot',
    category: 'owner',
    usage: '@user',
    example: '.unban @6287725735588',
    aliases: ['unbanned', 'unbanuser'],
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
        
        if (!db.isBanned(target)) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴜsᴇʀ ɪs ɴᴏᴛ ʙᴀɴɴᴇᴅ'
            })
        }
        
        try {
            db.removeBanned(target)
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴜɴʙᴀɴɴᴇᴅ @${target.split('@')[0]}`,
                mentions: [target]
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴜɴʙᴀɴɴɪɴɢ ᴜsᴇʀ'
            })
        }
    }
}
