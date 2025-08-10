export default {
    command: 'runtime',
    description: 'Check bot runtime',
    category: 'general',
    usage: '',
    example: '.runtime',
    aliases: ['uptime', 'alive'],
    
    async execute(context) {
        const { sock, msg } = context
        const uptime = process.uptime()
        const days = Math.floor(uptime / 86400)
        const hours = Math.floor((uptime % 86400) / 3600)
        const minutes = Math.floor((uptime % 3600) / 60)
        const seconds = Math.floor(uptime % 60)
        
        let runtimeText = '⏱️ ʙᴏᴛ ʀᴜɴᴛɪᴍᴇ:\n'
        if (days > 0) runtimeText += `${days} ᴅᴀʏs, `
        if (hours > 0) runtimeText += `${hours} ʜᴏᴜʀs, `
        if (minutes > 0) runtimeText += `${minutes} ᴍɪɴᴜᴛᴇs, `
        runtimeText += `${seconds} sᴇᴄᴏɴᴅs`

        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: runtimeText
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴄʜᴇᴄᴋɪɴɢ ʀᴜɴᴛɪᴍᴇ'
            }, { quoted: msg })
        }
    }
}
