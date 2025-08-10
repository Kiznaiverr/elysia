export default {
    command: 'join',
    description: 'Join group via invite link',
    category: 'owner',
    usage: '[invite link]',
    example: '.join https://chat.whatsapp.com/xxxxxx',
    aliases: ['joingc', 'joingroup'],
    ownerOnly: true,
    
    async execute(context) {
        const { sock, msg, args } = context
        
        const link = args[0]
        if (!link) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɢʀᴏᴜᴘ ɪɴᴠɪᴛᴇ ʟɪɴᴋ'
            }, { quoted: msg })
        }
        
        const inviteCode = link.replace('https://chat.whatsapp.com/', '')
        
        if (!inviteCode || inviteCode === link) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ɪɴᴠᴀʟɪᴅ ɪɴᴠɪᴛᴇ ʟɪɴᴋ'
            })
        }
        
        try {
            const response = await sock.groupAcceptInvite(inviteCode)
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴊᴏɪɴᴇᴅ ɢʀᴏᴜᴘ`
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴊᴏɪɴɪɴɢ ɢʀᴏᴜᴘ'
            }, { quoted: msg })
        }
    }
}
