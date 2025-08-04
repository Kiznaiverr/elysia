export default {
    command: 'owner',
    description: 'Get owner contact',
    category: 'general',
    usage: '',
    example: '.owner',
    aliases: ['creator', 'author'],
    
    async execute(context) {
        const { sock, msg } = context
        
        const ownerText = `
👤 ᴏᴡɴᴇʀ ɪɴғᴏʀᴍᴀᴛɪᴏɴ

• ɴᴀᴍᴇ: ᴋɪᴢɴᴀᴠɪᴇʀʀ
• ᴡʜᴀᴛsᴀᴘᴘ: wa.me/6287863806297
• ɢɪᴛʜᴜʙ: github.com/kiznavierr

ɪғ ʏᴏᴜ ʜᴀᴠᴇ ᴀɴʏ ǫᴜᴇsᴛɪᴏɴs ᴏʀ ɪssᴜᴇs, ғᴇᴇʟ ғʀᴇᴇ ᴛᴏ ᴄᴏɴᴛᴀᴄᴛ!`

        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: ownerText
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ sᴇɴᴅɪɴɢ ᴏᴡɴᴇʀ ɪɴғᴏ'
            }, { quoted: msg })
        }
    }
}
