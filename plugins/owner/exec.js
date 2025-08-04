export default {
    command: 'exec',
    description: 'Execute shell command',
    category: 'owner',
    usage: '[command]',
    example: '.exec ls -la',
    aliases: ['ex', 'shell', 'cmd'],
    ownerOnly: true,
    
    async execute(context) {
        const { sock, msg, args } = context
        
        const command = args.join(' ')
        if (!command) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴄᴏᴍᴍᴀɴᴅ'
            }, { quoted: msg })
        }
        
        const { exec } = await import('child_process')
        const { promisify } = await import('util')
        const execAsync = promisify(exec)
        
        try {
            const { stdout, stderr } = await execAsync(command)
            let result = stdout || stderr || 'ɴᴏ ᴏᴜᴛᴘᴜᴛ'
            
            if (result.length > 4000) {
                result = result.substring(0, 4000) + '...\n[ᴏᴜᴛᴘᴜᴛ ᴛʀᴜɴᴄᴀᴛᴇᴅ]'
            }
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📤 ᴄᴏᴍᴍᴀɴᴅ: ${command}\n\n📋 ᴏᴜᴛᴘᴜᴛ:\n\`\`\`${result}\`\`\``
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ ᴇʀʀᴏʀ ᴇxᴇᴄᴜᴛɪɴɢ ᴄᴏᴍᴍᴀɴᴅ:\n\`\`\`${error.message}\`\`\``
            }, { quoted: msg })
        }
    }
}
