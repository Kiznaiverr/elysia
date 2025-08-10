export default {
    command: 'group',
    description: 'Group settings (open/close)',
    category: 'group',
    usage: 'open/close',
    example: '.group open',
    aliases: ['gc', 'groupset'],
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
        
        const action = args[0]?.toLowerCase()
        
        if (!action || !['open', 'close'].includes(action)) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴜsᴀɢᴇ: .group open/close'
            }, { quoted: msg })
        }
        
        try {
            await sock.groupSettingUpdate(msg.key.remoteJid, action === 'open' ? 'not_announcement' : 'announcement')
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: action === 'open' ? 
                    '✅ ɢʀᴏᴜᴘ ᴄʜᴀᴛ ᴏᴘᴇɴᴇᴅ' : 
                    '✅ ɢʀᴏᴜᴘ ᴄʜᴀᴛ ᴄʟᴏsᴇᴅ'
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴜᴘᴅᴀᴛɪɴɢ ɢʀᴏᴜᴘ sᴇᴛᴛɪɴɢs'
            }, { quoted: msg })
        }
    }
}
