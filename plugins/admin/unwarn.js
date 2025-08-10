export default {
    command: 'unwarn',
    description: 'Remove warning from user',
    category: 'admin',
    usage: '@user',
    example: '.unwarn @6287725735588',
    aliases: ['unwarning', 'removewarn'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { sock, msg, isGroup } = context
        
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
        
        try {
            global.warnings = global.warnings || {}
            const groupId = msg.key.remoteJid
            
            if (global.warnings[groupId] && global.warnings[groupId][target] && global.warnings[groupId][target].length > 0) {
                global.warnings[groupId][target].pop()
                const warnCount = global.warnings[groupId][target].length
                
                if (warnCount === 0) {
                    delete global.warnings[groupId][target]
                }
                
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `✅ ʀᴇᴍᴏᴠᴇᴅ ᴡᴀʀɴɪɴɢ ғʀᴏᴍ @${target.split('@')[0]}\nᴄᴜʀʀᴇɴᴛ ᴡᴀʀɴɪɴɢs: ${warnCount}/3`,
                    mentions: [target]
                }, { quoted: msg })
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: `❌ @${target.split('@')[0]} ʜᴀs ɴᴏ ᴡᴀʀɴɪɴɢs`,
                    mentions: [target]
                }, { quoted: msg })
            }
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ʀᴇᴍᴏᴠɪɴɢ ᴡᴀʀɴɪɴɢ'
            }, { quoted: msg })
        }
    }
}
