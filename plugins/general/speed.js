export default {
    command: 'speed',
    description: 'Check bot speed',
    category: 'general',
    usage: '',
    example: '.speed',
    aliases: ['speedtest', 'benchmark'],
    
    async execute(context) {
        const { sock, msg } = context
        const start = Date.now()
        
        try {
            const firstMessage = await sock.sendMessage(msg.key.remoteJid, {
                text: '📊 ᴄᴀʟᴄᴜʟᴀᴛɪɴɢ sᴘᴇᴇᴅ...'
            })
            
            const end = Date.now()
            const responseTime = end - start
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `⚡ sᴘᴇᴇᴅ ᴛᴇsᴛ ʀᴇsᴜʟᴛs:
• ʀᴇsᴘᴏɴsᴇ ᴛɪᴍᴇ: ${responseTime}ᴍs
• ᴍᴇᴍᴏʀʏ ᴜsᴀɢᴇ: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}ᴍʙ
• ᴄᴘᴜ ᴜsᴀɢᴇ: ${process.cpuUsage().user / 1000000}s`
            })
            
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴄʜᴇᴄᴋɪɴɢ sᴘᴇᴇᴅ'
            })
        }
    }
}
