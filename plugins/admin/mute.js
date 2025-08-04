export default {
    command: 'mute',
    description: 'Mute user in group temporarily',
    category: 'admin',
    usage: '@user [duration]',
    example: '.mute @6287725735588 30m',
    aliases: ['silence', 'muted'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { sock, msg, args, isGroup, groupMetadata } = context
        
        if (!isGroup) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs'
            }, { quoted: msg })
        }
        
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
        const quotedUser = msg.message?.extendedTextMessage?.contextInfo?.participant
        
        let target = mentionedJid?.[0] || quotedUser
        
        if (!target) {
            return await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴜsᴇʀ'
            }, { quoted: msg })
        }
        
        const duration = args[0] || '5m'
        
        try {
            global.mutedUsers = global.mutedUsers || {}
            const groupId = msg.key.remoteJid
            
            if (!global.mutedUsers[groupId]) {
                global.mutedUsers[groupId] = {}
            }
            
            const timeInMs = parseDuration(duration)
            global.mutedUsers[groupId][target] = Date.now() + timeInMs
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `🔇 @${target.split('@')[0]} ʜᴀs ʙᴇᴇɴ ᴍᴜᴛᴇᴅ ғᴏʀ ${duration}`,
                mentions: [target]
            }, { quoted: msg })
            
            setTimeout(() => {
                if (global.mutedUsers[groupId] && global.mutedUsers[groupId][target]) {
                    delete global.mutedUsers[groupId][target]
                }
            }, timeInMs)
            
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴍᴜᴛɪɴɢ ᴜsᴇʀ'
            }, { quoted: msg })
        }
    }
}

function parseDuration(duration) {
    const units = {
        's': 1000,
        'm': 60000,
        'h': 3600000,
        'd': 86400000
    }
    
    const match = duration.match(/^(\d+)([smhd])$/)
    if (match) {
        const value = parseInt(match[1])
        const unit = match[2]
        return value * units[unit]
    }
    
    return 300000
}
