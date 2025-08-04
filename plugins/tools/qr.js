export default {
    command: 'qr',
    description: 'Generate QR code',
    category: 'tools',
    usage: '[text]',
    example: '.qr Hello World',
    aliases: ['qrcode', 'qrgen'],
    
    async execute(context) {
        const { sock, msg, args } = context
        
        const text = args.join(' ')
        if (!text) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴛᴇxᴛ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ǫʀ ᴄᴏᴅᴇ'
            }, { quoted: msg })
        }
        
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`
            
            await sock.sendMessage(msg.key.remoteJid, {
                image: { url: qrUrl },
                caption: `📱 ǫʀ ᴄᴏᴅᴇ ɢᴇɴᴇʀᴀᴛᴇᴅ\n\nᴛᴇxᴛ: ${text}`
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ɢᴇɴᴇʀᴀᴛɪɴɢ ǫʀ ᴄᴏᴅᴇ'
            }, { quoted: msg })
        }
    }
}
