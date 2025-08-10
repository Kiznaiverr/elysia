export default {
    command: 'add',
    description: 'Add member to group',
    category: 'group',
    usage: '628xxxxxxxxx',
    example: '.add 6287725735588',
    aliases: ['addmember', '+'],
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
        
        if (!args[0]) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴜᴍʙᴇʀ'
            }, { quoted: msg })
        }
        
        let number = args[0].replace(/[^0-9]/g, '')
        if (!number.startsWith('62')) {
            if (number.startsWith('0')) {
                number = '62' + number.slice(1)
            } else {
                number = '62' + number
            }
        }
        
        const jid = number + '@s.whatsapp.net'
        
        try {
            const response = await sock.groupParticipantsUpdate(msg.key.remoteJid, [jid], 'add')
            
            if (response[0]?.status === '200') {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴀᴅᴅᴇᴅ @${number}`,
                    mentions: [jid]
                }, { quoted: msg })
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴀᴅᴅ @${number}\nʀᴇᴀsᴏɴ: ${response[0]?.status}`,
                    mentions: [jid]
                }, { quoted: msg })
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴀᴅᴅɪɴɢ ᴍᴇᴍʙᴇʀ'
            }, { quoted: msg })
        }
    }
}
