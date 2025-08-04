export default {
    command: 'warnings',
    description: 'Check user warnings',
    category: 'admin',
    usage: '@user',
    example: '.warnings @6287725735588',
    aliases: ['checkwarn', 'warnlist'],
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
            
            const userWarnings = global.warnings[groupId]?.[target] || []
            
            if (userWarnings.length === 0) {
                return await sock.sendMessage(msg.key.remoteJid, {
                    text: `✅ @${target.split('@')[0]} ʜᴀs ɴᴏ ᴡᴀʀɴɪɴɢs`,
                    mentions: [target]
                }, { quoted: msg })
            }
            
            let warningText = `⚠️ ᴡᴀʀɴɪɴɢs ғᴏʀ @${target.split('@')[0]}:\n\n`
            
            userWarnings.forEach((warning, index) => {
                const date = new Date(warning.date).toLocaleDateString()
                warningText += `${index + 1}. ${warning.reason}\n   ᴅᴀᴛᴇ: ${date}\n\n`
            })
            
            warningText += `ᴛᴏᴛᴀʟ ᴡᴀʀɴɪɴɢs: ${userWarnings.length}/3`
            
            await sock.sendMessage(msg.key.remoteJid, {
                text: warningText,
                mentions: [target]
            }, { quoted: msg })
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ ᴄʜᴇᴄᴋɪɴɢ ᴡᴀʀɴɪɴɢs'
            }, { quoted: msg })
        }
    }
}
