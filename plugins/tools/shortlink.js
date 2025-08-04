export default {
    command: 'shortlink',
    description: 'Shorten URL using TinyURL',
    category: 'tools',
    usage: '[url]',
    example: '.shortlink https://google.com',
    aliases: ['short', 'tinyurl', 'shorturl'],
    
    async execute(context) {
        const { sock, msg, args } = context
        
        const url = args[0]
        if (!url) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴜʀʟ ᴛᴏ sʜᴏʀᴛᴇɴ'
            }, { quoted: msg })
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴜʀʟ (must start with http:// or https://)'
            }, { quoted: msg })
        }
        
        try {
            const axios = (await import('axios')).default
            const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
            
            const response = await axios.get(apiUrl)
            const shortUrl = response.data
            
            if (shortUrl && shortUrl.startsWith('https://tinyurl.com/')) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `🔗 ᴜʀʟ sʜᴏʀᴛᴇɴᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ!\n\n📎 ᴏʀɪɢɪɴᴀʟ: ${url}\n🔗 sʜᴏʀᴛ: ${shortUrl}`
                }, { quoted: msg })
            } else {
                throw new Error('Invalid response from TinyURL')
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ sʜᴏʀᴛᴇɴɪɴɢ ᴜʀʟ'
            }, { quoted: msg })
        }
    }
}
