import logger from '../../lib/logger.js'

export default {
    command: 'broadcast',
    description: 'Broadcast message to all users (private chats)',
    category: 'owner',
    usage: '<message>',
    example: '.broadcast Hello everyone!',
    aliases: ['bc'],
    ownerOnly: true,
    
    async execute(context) {
        const { args, sock, msg, db } = context
        
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a message to broadcast\n\nUsage: broadcast <message>'
            }, { quoted: msg })
        }
        
        const message = args.join(' ')
        
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '📡 Starting broadcast to all users...'
            }, { quoted: msg })
            
            // Get all users from database
            const users = db.getAllUsers()
            const privateChats = users.filter(user => !user.jid.endsWith('@g.us') && !user.banned)
            
            if (privateChats.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ No private chats found in database'
                }, { quoted: msg })
            }
            
            let successCount = 0
            let failedCount = 0
            
            // Send broadcast message to each private chat
            for (const user of privateChats) {
                try {
                    await sock.sendMessage(user.jid, {
                        text: `📢 *BROADCAST MESSAGE*\n\n${message}\n\n━━━━━━━━━━━━━━━`
                    })
                    successCount++
                    
                    // Add small delay to prevent spam
                    await new Promise(resolve => setTimeout(resolve, 100))
                } catch (error) {
                    failedCount++
                    logger.error(`Failed to send broadcast to ${user.jid}:`, error)
                }
            }
            
            // Send completion report
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ *Broadcast completed*\n\n📊 *Statistics:*\n• Total users: ${privateChats.length}\n• Successful: ${successCount}\n• Failed: ${failedCount}\n\n📝 *Message:*\n${message}`
            }, { quoted: msg })
            
            logger.info(`Broadcast completed: ${successCount}/${privateChats.length} successful`)
            
        } catch (error) {
            logger.error('Broadcast error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error occurred during broadcast'
            }, { quoted: msg })
        }
    }
}
