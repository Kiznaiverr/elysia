export default {
    command: 'hidetag',
    description: 'Send message with hidden tag to all members',
    category: 'group',
    usage: '[message]',
    example: '.hidetag hello everyone',
    aliases: ['htag', 'hiddenTag'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { sock, msg, args, isGroup, groupMetadata } = context
        
        if (!isGroup) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs'
            }, { quoted: msg })
        }
        
        const participants = groupMetadata?.participants || []
        const message = args.join(' ') || 'ɴᴏ ᴍᴇssᴀɢᴇ'
        let mentions = participants.map(p => p.id)
        
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: message,
                mentions: mentions
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ sᴇɴᴅɪɴɢ ʜɪᴅᴅᴇɴ ᴛᴀɢ'
            }, { quoted: msg })
        }
    }
}
