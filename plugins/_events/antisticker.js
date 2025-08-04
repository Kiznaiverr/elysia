export default {
    name: 'antisticker',
    description: 'Auto delete stickers when antisticker is enabled',
    
    async execute(context) {
        const { msg, messageType, isGroup, sock, db } = context
        
        if (!isGroup) return false
        
        if (messageType !== 'stickerMessage') return false
        
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        if (!groupData.antisticker) return false
        
        try {
            await sock.sendMessage(groupId, { delete: msg.key })
            
            // Send warning message (optional - you can remove this if you want silent deletion)
            // await sock.sendMessage(groupId, {
            //     text: '🚫 sᴛɪᴄᴋᴇʀ ᴅɪʜᴀᴘᴜs ᴋᴀʀᴇɴᴀ ᴀɴᴛɪsᴛɪᴄᴋᴇʀ ᴀᴋᴛɪғ'
            // })
            
            return true 
        } catch (error) {
            console.error('Error deleting sticker:', error)
            return false
        }
    }
}
