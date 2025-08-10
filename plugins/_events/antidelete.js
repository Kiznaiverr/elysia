export default {
    name: 'antidelete',
    description: 'Restore deleted messages when antidelete is enabled',
    
    async execute(context) {
        const { messageUpdate, sock, db } = context
        
        if (!messageUpdate || messageUpdate.type !== 'delete') return false
        
        const { key } = messageUpdate
        const groupId = key.remoteJid
        
        if (!groupId || !groupId.includes('@g.us')) return false
        
        const groupData = db.getGroup(groupId)
        
        if (!groupData.antidelete) return false
        
        try {
            if (global.messageStore) {
                const storedMessage = global.messageStore.getMessage(groupId, key.id)
                
                if (storedMessage) {
                    const { msg, messageType, body } = storedMessage
                    const sender = key.participant || key.remoteJid
                    const senderName = `@${sender.split('@')[0]}`
                    
                    let messageContent = ''
                    if (body) {
                        messageContent = body
                    } else if (messageType === 'imageMessage') {
                        messageContent = '[Gambar]'
                        if (msg.message.imageMessage?.caption) {
                            messageContent += ` ${msg.message.imageMessage.caption}`
                        }
                    } else if (messageType === 'videoMessage') {
                        messageContent = '[Video]'
                        if (msg.message.videoMessage?.caption) {
                            messageContent += ` ${msg.message.videoMessage.caption}`
                        }
                    } else if (messageType === 'stickerMessage') {
                        messageContent = '[Sticker]'
                    } else if (messageType === 'audioMessage') {
                        messageContent = '[Audio/Voice Note]'
                    } else if (messageType === 'documentMessage') {
                        messageContent = `[Dokumen: ${msg.message.documentMessage?.fileName || 'Unknown'}]`
                    } else {
                        messageContent = `[${messageType}]`
                    }
                    
                    const antiDeleteMessage = `🚫 *ᴀɴᴛɪ-ᴅᴇʟᴇᴛᴇ*
                    
👤 *ᴘᴇɴɢɪʀɪᴍ:* ${senderName}
📝 *ᴘᴇsᴀɴ ʏᴀɴɢ ᴅɪʜᴀᴘᴜs:*
${messageContent}

⏰ *ᴡᴀᴋᴛᴜ:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
                    
                    await sock.sendMessage(groupId, {
                        text: antiDeleteMessage,
                        mentions: [sender]
                    })
                    
                    return true
                }
            }
            
            return false
        } catch (error) {
            console.error('Error handling anti-delete:', error)
            return false
        }
    }
}
