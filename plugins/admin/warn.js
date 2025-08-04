export default {
    command: 'warn',
    description: 'Warn user in group',
    category: 'admin',
    usage: '@user [reason]',
    example: '.warn @6287725735588 spamming',
    aliases: ['warning', 'peringatan'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { sock, msg, args, isGroup } = context
        
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
        
        const reason = args.join(' ') || 'ɴᴏ ʀᴇᴀsᴏɴ ɢɪᴠᴇɴ'
        
        try {
            global.warnings = global.warnings || {}
            const groupId = msg.key.remoteJid
            
            if (!global.warnings[groupId]) {
                global.warnings[groupId] = {}
            }
            
            if (!global.warnings[groupId][target]) {
                global.warnings[groupId][target] = []
            }
            
            global.warnings[groupId][target].push({
                reason: reason,
                date: new Date().toISOString(),
                admin: msg.key.participant || msg.key.remoteJid
            })
            
            const warnCount = global.warnings[groupId][target].length
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: `⚠️ @${target.split('@')[0]} ʜᴀs ʙᴇᴇɴ ᴡᴀʀɴᴇᴅ\n\nʀᴇᴀsᴏɴ: ${reason}\nᴡᴀʀɴɪɴɢs: ${warnCount}/3\n\n${warnCount >= 3 ? '❌ ᴍᴀx ᴡᴀʀɴɪɴɢs ʀᴇᴀᴄʜᴇᴅ!' : ''}`,
                mentions: [target]
            }, { quoted: msg })
            
            if (warnCount >= 3) {
                setTimeout(async () => {
                    try {
                        await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'remove')
                        delete global.warnings[groupId][target]
                    } catch (error) {
                        console.error('Error removing user after warnings:', error)
                    }
                }, 2000)
            }
            
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴡᴀʀɴɪɴɢ ᴜsᴇʀ'
            }, { quoted: msg })
        }
    }
}
