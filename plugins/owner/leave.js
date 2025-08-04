export default {
    command: 'leave',
    description: 'Leave current group',
    category: 'owner',
    usage: '',
    example: '.leave',
    aliases: ['leavegc', 'leavegroup', 'out'],
    ownerOnly: true,
    groupOnly: true,
    
    async execute(context) {
        const { sock, msg, isGroup } = context
        
        if (!isGroup) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs'
            })
        }
        
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '👋 ɢᴏᴏᴅʙʏᴇ! ʟᴇᴀᴠɪɴɢ ɢʀᴏᴜᴘ...'
            }, { quoted: msg })
            
            setTimeout(async () => {
                await sock.groupLeave(msg.key.remoteJid)
            }, 2000)
            
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ʟᴇᴀᴠɪɴɢ ɢʀᴏᴜᴘ'
            }, { quoted: msg })
        }
    }
}
