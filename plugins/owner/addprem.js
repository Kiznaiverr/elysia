export default {
    command: 'addprem',
    description: 'Add premium user',
    category: 'owner',
    usage: '@user',
    example: '.addprem @6287725735588',
    aliases: ['addpremium', 'prem+'],
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
        
        if (db.isPremium(target)) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴜsᴇʀ ɪs ᴀʟʀᴇᴀᴅʏ ᴘʀᴇᴍɪᴜᴍ'
            }, { quoted: msg })
        }
        
        try {
            db.addPremium(target)
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴀᴅᴅᴇᴅ @${target.split('@')[0]} ᴛᴏ ᴘʀᴇᴍɪᴜᴍ`,
                mentions: [target]
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴀᴅᴅɪɴɢ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ'
            }, { quoted: msg })
        }
    }
}
