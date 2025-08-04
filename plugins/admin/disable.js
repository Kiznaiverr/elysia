export default {
    command: 'disable',
    description: 'Disable features in group',
    category: 'admin',
    usage: '<feature>',
    example: '.disable antisticker',
    aliases: ['off'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { msg, args, db, reply, sock } = context
        
        if (!args.length) {
            return await reply('❌ ɢᴜɴᴀᴋᴀɴ: .disable <feature>\n\n📋 ᴀᴠᴀɪʟᴀʙʟᴇ ғᴇᴀᴛᴜʀᴇs:\n• welcome\n• leave\n• antisticker\n• antilink\n• antidelete\n• antibadword')
        }
        
        const feature = args[0].toLowerCase()
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        switch (feature) {
            case 'welcome':
                if (!groupData.welcome) {
                    return await reply('❌ ᴡᴇʟᴄᴏᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴅɪsᴀʙʟᴇᴅ')
                }
                groupData.welcome = false
                db.saveGroups()
                await reply('❌ ᴡᴇʟᴄᴏᴍᴇ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ')
                break
                
            case 'leave':
            case 'bye':
                if (!groupData.bye) {
                    return await reply('❌ ʟᴇᴀᴠᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴅɪsᴀʙʟᴇᴅ')
                }
                groupData.bye = false
                db.saveGroups()
                await reply('❌ ʟᴇᴀᴠᴇ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ')
                break
                
            case 'antisticker':
                if (!groupData.antisticker) {
                    return await reply('❌ ᴀɴᴛɪsᴛɪᴄᴋᴇʀ ɪs ᴀʟʀᴇᴀᴅʏ ᴅɪsᴀʙʟᴇᴅ')
                }
                groupData.antisticker = false
                db.saveGroups()
                await reply('❌ ᴀɴᴛɪsᴛɪᴄᴋᴇʀ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ')
                break
                
            case 'antilink':
                if (!groupData.antilink) {
                    return await reply('❌ ᴀɴᴛɪʟɪɴᴋ ɪs ᴀʟʀᴇᴀᴅʏ ᴅɪsᴀʙʟᴇᴅ')
                }
                groupData.antilink = false
                db.saveGroups()
                await reply('❌ ᴀɴᴛɪʟɪɴᴋ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ')
                break
                
            case 'antidelete':
                if (!groupData.antidelete) {
                    return await reply('❌ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴅɪsᴀʙʟᴇᴅ')
                }
                groupData.antidelete = false
                db.saveGroups()
                await reply('❌ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ')
                break
                
            case 'antibadword':
                if (!groupData.antibadword) {
                    return await reply('❌ ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ ɪs ᴀʟʀᴇᴀᴅʏ ᴅɪsᴀʙʟᴇᴅ')
                }
                groupData.antibadword = false
                db.saveGroups()
                await reply('❌ ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ')
                break
                
            default:
                await reply('❌ ғᴇᴀᴛᴜʀᴇ ɴᴏᴛ ғᴏᴜɴᴅ\n\n📋 ᴀᴠᴀɪʟᴀʙʟᴇ ғᴇᴀᴛᴜʀᴇs:\n• welcome\n• leave\n• antisticker\n• antilink\n• antidelete\n• antibadword')
                break
        }
    }
}
