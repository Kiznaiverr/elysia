export default {
    command: 'setprefix',
    description: 'Change bot prefix',
    category: 'owner',
    usage: '[new prefix]',
    example: '.setprefix !',
    aliases: ['prefix', 'changeprefix'],
    ownerOnly: true,
    
    async execute(context) {
        const { sock, msg, args, config } = context
        
        const newPrefix = args[0]
        if (!newPrefix) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴇᴡ ᴘʀᴇғɪx'
            }, { quoted: msg })
        }
        
        if (newPrefix.length > 3) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʀᴇғɪx ᴍᴜsᴛ ʙᴇ 3 ᴄʜᴀʀᴀᴄᴛᴇʀs ᴏʀ ʟᴇss'
            })
        }
        
        try {
            config.setPrefix(newPrefix)
            
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ ᴘʀᴇғɪx ᴄʜᴀɴɢᴇᴅ ᴛᴏ: ${newPrefix}`
        }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴄʜᴀɴɢɪɴɢ ᴘʀᴇғɪx'
            })
        }
    }
}
