export default {
    command: 'block',
    description: 'Block user',
    category: 'owner',
    usage: '@user',
    example: '.block @6287725735588',
    aliases: ['blokir', 'blocked'],
    ownerOnly: true,
    
    async execute(context) {
        const { sock, msg } = context
        
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
        const quotedUser = msg.message?.extendedTextMessage?.contextInfo?.participant
        
        let target = mentionedJid?.[0] || quotedUser
        
        if (!target) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ'
            }, { quoted: msg })
        }
        
        try {
            await sock.updateBlockStatus(target, 'block')
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ sᴜᴄᴄᴇssғᴜʟʟʏ ʙʟᴏᴄᴋᴇᴅ @${target.split('@')[0]}`,
                mentions: [target]
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ʙʟᴏᴄᴋɪɴɢ ᴜsᴇʀ'
            }, { quoted: msg })
        }
    }
}
