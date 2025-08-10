export default {
    command: 'eval',
    description: 'Execute JavaScript code',
    category: 'owner',
    usage: '[code]',
    example: '.eval console.log("Hello World")',
    aliases: ['ev', 'js'],
    ownerOnly: true,
    
    async execute(context) {
        const { sock, msg, args } = context
        
        const code = args.join(' ')
        if (!code) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴄᴏᴅᴇ ᴛᴏ ᴇxᴇᴄᴜᴛᴇ'
            }, { quoted: msg })
        }
        
        try {
            let result = await eval(`(async () => { ${code} })()`)
            
            if (typeof result !== 'string') {
                result = require('util').inspect(result, {
                    depth: 0
                })
            }
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `📤 ʀᴇsᴜʟᴛ:\n\`\`\`${result}\`\`\``
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ ᴇʀʀᴏʀ:\n\`\`\`${error.message}\`\`\``
            }, { quoted: msg })
        }
    }
}
