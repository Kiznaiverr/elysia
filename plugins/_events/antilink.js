export default {
    name: 'antilink',
    description: 'Auto delete messages containing links when antilink is enabled',
    
    async execute(context) {
        const { msg, messageType, isGroup, sock, db } = context
        
        if (!isGroup) return false
        
        if (messageType !== 'conversation' && messageType !== 'extendedTextMessage') return false
        
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        if (!groupData.antilink) return false
        
        let messageText = ''
        if (messageType === 'conversation') {
            messageText = msg.message.conversation
        } else if (messageType === 'extendedTextMessage') {
            messageText = msg.message.extendedTextMessage.text
        }
        
        const linkPatterns = [
            /https?:\/\/[^\s]+/gi,           // http/https links
            /www\.[^\s]+/gi,                // www links
            /[^\s]+\.(com|net|org|edu|gov|mil|int|co|io|me|tv|cc|tk|ml|ga|cf|xyz|info|biz|name)[^\s]*/gi, // domain extensions
            /chat\.whatsapp\.com\/[^\s]+/gi, // WhatsApp group links
            /t\.me\/[^\s]+/gi,              // Telegram links
            /discord\.gg\/[^\s]+/gi,        // Discord invite links
            /bit\.ly\/[^\s]+/gi,            // Bitly shortened links
            /tinyurl\.com\/[^\s]+/gi,       // TinyURL links
            /instagram\.com\/[^\s]+/gi,     // Instagram links
            /youtube\.com\/[^\s]+/gi,       // YouTube links
            /youtu\.be\/[^\s]+/gi           // YouTube short links
        ]
        
        const hasLink = linkPatterns.some(pattern => pattern.test(messageText))
        
        if (hasLink) {
            try {
                await sock.sendMessage(groupId, { delete: msg.key })
                
                // Optional: Send warning message (uncomment if needed)
                // await sock.sendMessage(groupId, {
                //     text: '🚫 ʟɪɴᴋ ᴅɪʜᴀᴘᴜs ᴋᴀʀᴇɴᴀ ᴀɴᴛɪʟɪɴᴋ ᴀᴋᴛɪғ'
                // })
                
                return true 
            } catch (error) {
                console.error('Error deleting link message:', error)
                return false
            }
        }
        
        return false
    }
}
