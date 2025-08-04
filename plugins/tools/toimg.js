export default {
    command: 'toimg',
    description: 'Convert sticker to image',
    category: 'tools',
    usage: '[reply to sticker]',
    example: '.toimg',
    aliases: ['toimage', 'stickertoimg'],
    
    async execute(context) {
        const { sock, msg } = context
        
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        
        if (!quotedMessage?.stickerMessage) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ sᴛɪᴄᴋᴇʀ'
            }, { quoted: msg })
        }
        
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '🔄 ᴄᴏɴᴠᴇʀᴛɪɴɢ ᴛᴏ ɪᴍᴀɢᴇ...'
            }, { quoted: msg })
            
            const stickerData = await sock.downloadMediaMessage(quotedMessage)
            
            if (!stickerData) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ sᴛɪᴄᴋᴇʀ'
                }, { quoted: msg })
            }
            
            await sock.sendMessage(msg.key.remoteJid, {
                image: stickerData
            }, { quoted: msg })
            
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴄᴏɴᴠᴇʀᴛɪɴɢ sᴛɪᴄᴋᴇʀ'
            }, { quoted: msg })
        }
    }
}
