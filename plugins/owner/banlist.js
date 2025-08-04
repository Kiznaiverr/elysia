export default {
    command: 'banlist',
    description: 'Show list of banned users',
    category: 'owner',
    usage: '',
    example: '.banlist',
    aliases: ['listban', 'bannedlist'],
    ownerOnly: true,
    
    async execute(context) {
        const { sock, msg, db } = context
        
        try {
            const bannedUsers = db.getBannedUsers()
            
            if (!bannedUsers || bannedUsers.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: '📝 ɴᴏ ʙᴀɴɴᴇᴅ ᴜsᴇʀs ғᴏᴜɴᴅ'
                }, { quoted: msg })
            }
            
            let banlistText = '📝 ʙᴀɴɴᴇᴅ ᴜsᴇʀs ʟɪsᴛ:\n\n'
            
            bannedUsers.forEach((user, index) => {
                banlistText += `${index + 1}. @${user.split('@')[0]}\n`
            })
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: banlistText,
                mentions: bannedUsers
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ɢᴇᴛᴛɪɴɢ ʙᴀɴ ʟɪsᴛ'
            }, { quoted: msg })
        }
    }
}
