export default {
    command: 'setname',
    description: 'Change group name',
    category: 'group',
    usage: '[new name]',
    example: '.setname My Awesome Group',
    aliases: ['changename', 'groupname'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { sock, msg, args, isGroup, groupMetadata } = context
        
        if (!isGroup) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs'
            }, { quoted: msg })
        }
        
        const botNumber = sock.user?.id?.split(':')[0]
        const isAdmin = groupMetadata?.participants?.find(p => p.id.split('@')[0] === botNumber)?.admin
        
        if (!isAdmin) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ʙᴏᴛ ɴᴇᴇᴅs ᴛᴏ ʙᴇ ᴀɴ ᴀᴅᴍɪɴ'
            }, { quoted: msg })
        }
        
        const newName = args.join(' ')
        if (!newName) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴇᴡ ɢʀᴏᴜᴘ ɴᴀᴍᴇ'
            }, { quoted: msg })
        }
        
        try {
            await sock.groupUpdateSubject(msg.key.remoteJid, newName)
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `✅ ɢʀᴏᴜᴘ ɴᴀᴍᴇ ᴄʜᴀɴɢᴇᴅ ᴛᴏ: ${newName}`
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴄʜᴀɴɢɪɴɢ ɢʀᴏᴜᴘ ɴᴀᴍᴇ'
            }, { quoted: msg })
        }
    }
}
