export default {
    command: 'tagall',
    description: 'Tag all group members',
    category: 'group',
    usage: '[message]',
    example: '.tagall hello everyone',
    aliases: ['everyone', 'all', 'mentionall'],
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
        let mentionText = `📢 ${message}\n\n`
        
        participants.forEach((participant, index) => {
            mentionText += `@${participant.id.split('@')[0]} `
            if ((index + 1) % 5 === 0) mentionText += '\n'
        })
        
        try {
            await sock.sendMessage(msg.key.remoteJid, {
                text: mentionText,
                mentions: mentions
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴛᴀɢɢɪɴɢ ᴍᴇᴍʙᴇʀs'
            }, { quoted: msg })
        }
    }
}
