export default {
    command: 'link',
    description: 'Get group invite link',
    category: 'group',
    usage: '',
    example: '.link',
    aliases: ['linkgc', 'invite', 'invitelink'],
    groupOnly: true,
    adminOnly: false,
    
    async execute(context) {
        const { sock, msg, isGroup, groupMetadata } = context
        
        if (!isGroup) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs'
            })
        }
        
        const botNumber = sock.user?.id?.split(':')[0]
        const isAdmin = groupMetadata?.participants?.find(p => p.id.split('@')[0] === botNumber)?.admin
        
        if (!isAdmin) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ʙᴏᴛ ɴᴇᴇᴅs ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ'
            })
        }
        
        try {
            const inviteCode = await sock.groupInviteCode(msg.key.remoteJid)
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🔗 ɢʀᴏᴜᴘ ɪɴᴠɪᴛᴇ ʟɪɴᴋ:
${inviteLink}

ɢʀᴏᴜᴘ: ${groupMetadata?.subject || 'Unknown'}`
            })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ɢᴇᴛᴛɪɴɢ ɪɴᴠɪᴛᴇ ʟɪɴᴋ'
            })
        }
    }
}
