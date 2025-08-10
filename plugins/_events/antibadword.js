export default {
    name: 'antibadword',
    description: 'Delete messages containing badwords when antibadword is enabled',
    
    async execute(context) {
        const { msg, messageType, isGroup, sock, db } = context
        
        if (!isGroup) return false
        
        if (messageType !== 'conversation' && messageType !== 'extendedTextMessage') return false
        
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        if (!groupData.antibadword) return false
        
        let messageText = ''
        if (messageType === 'conversation') {
            messageText = msg.message.conversation
        } else if (messageType === 'extendedTextMessage') {
            messageText = msg.message.extendedTextMessage.text
        }
        
        if (!messageText) return false
        
        // Use the new badword database
        if (db.containsBadword(messageText, groupId)) {
            try {
                await sock.sendMessage(groupId, { delete: msg.key })
                
                const sender = msg.key.participant || msg.key.remoteJid
                await sock.sendMessage(groupId, {
                    text: `🚫 *ᴀɴᴛɪ-ʙᴀᴅᴡᴏʀᴅ*\n\nᴘᴇsᴀɴ ᴅᴀʀɪ @${sender.split('@')[0]} ᴅɪʜᴀᴘᴜs ᴋᴀʀᴇɴᴀ ᴍᴇɴɢᴀɴᴅᴜɴɢ ᴋᴀᴛᴀ ᴋᴀsᴀʀ`,
                    mentions: [sender]
                })
                
                return true 
            } catch (error) {
                console.error('Error deleting badword message:', error)
                return false
            }
        }
        
        return false
    }
}
