import logger from '../../lib/logger.js'

export default {
    command: 'broadcastgc',
    description: 'Broadcast message to all groups',
    category: 'owner',
    usage: '<message>',
    example: '.broadcastgc Important announcement for all groups!',
    aliases: ['bcgc', 'bcgroup'],
    ownerOnly: true,
    
    async execute(context) {
        const { args, sock, msg, db } = context
        
        if (!args.length) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Please provide a message to broadcast\n\nUsage: broadcastgc <message>'
            }, { quoted: msg })
        }
        
        const message = args.join(' ')
        
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '📡 Starting broadcast to all groups...'
            }, { quoted: msg })
            
            // Get all groups from database
            const groups = db.getAllGroups()
            const groupChats = groups.filter(group => group.jid.endsWith('@g.us') && !group.banned && !group.mute)
            
            if (groupChats.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ No groups found in database'
                }, { quoted: msg })
            }
            
            let successCount = 0
            let failedCount = 0
            let botNotAdminCount = 0
            
            // Send broadcast message to each group
            for (const group of groupChats) {
                try {
                    // Check if bot is still in the group
                    const groupMetadata = await sock.groupMetadata(group.jid)
                    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
                    const participants = groupMetadata.participants || []
                    const botParticipant = participants.find(p => p.id === botNumber || p.id === sock.user.id)
                    
                    if (!botParticipant) {
                        failedCount++
                        logger.warn(`Bot not in group: ${group.jid}`)
                        continue
                    }
                    
                    // Check if bot is admin (optional, for better delivery)
                    const groupAdmins = participants.filter(p => p.admin).map(p => p.id)
                    const isBotAdmin = groupAdmins.includes(botNumber) || groupAdmins.includes(sock.user.id)
                    
                    if (!isBotAdmin) {
                        botNotAdminCount++
                    }
                    
                    await sock.sendMessage(group.jid, {
                        text: `📢 *GROUP BROADCAST*\n\n${message}\n\n━━━━━━━━━━━━━━━\n👥 *${groupMetadata.subject}*`
                    })
                    successCount++
                    
                    // Add small delay to prevent spam
                    await new Promise(resolve => setTimeout(resolve, 200))
                } catch (error) {
                    failedCount++
                    logger.error(`Failed to send broadcast to group ${group.jid}:`, error)
                }
            }
            
            // Send completion report
            let reportText = `✅ *Group Broadcast completed*\n\n📊 *Statistics:*\n• Total groups: ${groupChats.length}\n• Successful: ${successCount}\n• Failed: ${failedCount}`
            
            if (botNotAdminCount > 0) {
                reportText += `\n• Bot not admin: ${botNotAdminCount}`
            }
            
            reportText += `\n\n📝 *Message:*\n${message}`
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: reportText
            }, { quoted: msg })
            
            logger.info(`Group broadcast completed: ${successCount}/${groupChats.length} successful`)
            
        } catch (error) {
            logger.error('Group broadcast error:', error)
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ Error occurred during group broadcast'
            }, { quoted: msg })
        }
    }
}
