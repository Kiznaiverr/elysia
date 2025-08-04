export default {
    command: 'sticker',
    description: 'Convert image to sticker',
    category: 'tools',
    usage: '[reply to image]',
    example: '.sticker',
    aliases: ['s', 'stiker', 'stick'],
    
    async execute(context) {
        const { sock, msg } = context
        
        const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const messageType = Object.keys(quotedMessage || {})[0]
        
        if (!quotedMessage || !['imageMessage', 'videoMessage'].includes(messageType)) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴏʀ ᴠɪᴅᴇᴏ'
            }, { quoted: msg })
        }
        
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '🔄 ᴄᴏɴᴠᴇʀᴛɪɴɢ ᴛᴏ sᴛɪᴄᴋᴇʀ...'
            }, { quoted: msg })
            
            const mediaData = await sock.downloadMediaMessage(quotedMessage)
            
            if (!mediaData) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴇᴅɪᴀ'
                }, { quoted: msg })
            }
            
            await sock.sendMessage(msg.key.remoteJid, {
                sticker: mediaData
            }, { quoted: msg })
            
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴄᴏɴᴠᴇʀᴛɪɴɢ ᴛᴏ sᴛɪᴄᴋᴇʀ'
            }, { quoted: msg })
        }
    }
}
