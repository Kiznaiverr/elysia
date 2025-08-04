export default {
    command: 'ping',
    description: 'Check bot response time and latency',
    category: 'general',
    usage: '',
    example: '.ping',
    aliases: ['pong', 'test'],
    
    async execute(context) {
        const { sock, msg } = context
        const start = Date.now()
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '🏓 ᴘɪɴɢ!'
            }, { quoted: msg })
            
            const end = Date.now()
            const responseTime = end - start
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `⚡ ʀᴇsᴘᴏɴsᴇ ᴛɪᴍᴇ: ${responseTime}s`
            }, { quoted: msg })
            
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ ᴡʜɪʟᴇ ᴇxᴇᴄᴜᴛɪɴɢ ᴄᴏᴍᴍᴀɴᴅ'
            }, { quoted: msg })
        }
        }
    }

