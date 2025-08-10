export default {
    command: 'delprem',
    description: 'Remove premium user',
    category: 'owner',
    usage: '@user',
    example: '.delprem @6287725735588',
    aliases: ['delpremium', 'removeprem', 'prem-'],
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
        
        if (!db.isPremium(target)) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴜsᴇʀ ɪs ɴᴏᴛ ᴘʀᴇᴍɪᴜᴍ'
            }, { quoted: msg })
        }
        
        try {
            db.removePremium(target)
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ sᴜᴄᴄᴇssғᴜʟʟʏ ʀᴇᴍᴏᴠᴇᴅ @${target.split('@')[0]} ғʀᴏᴍ ᴘʀᴇᴍɪᴜᴍ`,
                mentions: [target]
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ʀᴇᴍᴏᴠɪɴɢ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ'
            }, { quoted: msg })
        }
    }
}
