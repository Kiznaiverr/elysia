export default {
    command: 'premlist',
    description: 'Show list of premium users',
    category: 'owner',
    usage: '',
    example: '.premlist',
    aliases: ['listprem', 'premiumlist'],
    ownerOnly: true,
    
    async execute(context) {
        const { sock, msg, db } = context
        
        try {
            const premiumUsers = db.getPremiumUsers()
            
            if (!premiumUsers || premiumUsers.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: '👑 ɴᴏ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀs ғᴏᴜɴᴅ'
                }, { quoted: msg })
            }
            
            let premlistText = '👑 ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀs ʟɪsᴛ:\n\n'
            
            premiumUsers.forEach((user, index) => {
                premlistText += `${index + 1}. @${user.split('@')[0]}\n`
            })
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: premlistText,
                mentions: premiumUsers
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ɢᴇᴛᴛɪɴɢ ᴘʀᴇᴍɪᴜᴍ ʟɪsᴛ'
            }, { quoted: msg })
        }
    }
}
