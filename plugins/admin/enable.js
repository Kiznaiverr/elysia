export default {
    command: 'enable',
    description: 'Enable features in group',
    category: 'admin',
    usage: '<feature>',
    example: '.enable antisticker',
    aliases: ['on'],
    groupOnly: true,
    adminOnly: true,
    
    async execute(context) {
        const { msg, args, db, reply, sock } = context
        
        if (!args.length) {
            return await reply('❌ ɢᴜɴᴀᴋᴀɴ: .enable <feature>\n\n📋 ᴀᴠᴀɪʟᴀʙʟᴇ ғᴇᴀᴛᴜʀᴇs:\n• welcome\n• leave\n• antisticker\n• antilink\n• antidelete\n• antibadword')
        }
        
        const feature = args[0].toLowerCase()
        const groupId = msg.key.remoteJid
        const groupData = db.getGroup(groupId)
        
        switch (feature) {
            case 'welcome':
                if (groupData.welcome) {
                    return await reply('✅ ᴡᴇʟᴄᴏᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴇɴᴀʙʟᴇᴅ')
                }
                groupData.welcome = true
                db.saveGroups()
                await reply('✅ ᴡᴇʟᴄᴏᴍᴇ ʜᴀs ʙᴇᴇɴ ᴇɴᴀʙʟᴇᴅ\n\n👋 ɴᴇᴡ ᴍᴇᴍʙᴇʀs ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇ')
                break
                
            case 'leave':
            case 'bye':
                if (groupData.bye) {
                    return await reply('✅ ʟᴇᴀᴠᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴇɴᴀʙʟᴇᴅ')
                }
                groupData.bye = true
                db.saveGroups()
                await reply('✅ ʟᴇᴀᴠᴇ ʜᴀs ʙᴇᴇɴ ᴇɴᴀʙʟᴇᴅ\n\n👋 ᴀ ᴍᴇssᴀɢᴇ ᴡɪʟʟ ʙᴇ sᴇɴᴛ ᴡʜᴇɴ ᴍᴇᴍʙᴇʀs ʟᴇᴀᴠᴇ')
                break
                
            case 'antisticker':
                if (groupData.antisticker) {
                    return await reply('✅ ᴀɴᴛɪsᴛɪᴄᴋᴇʀ ɪs ᴀʟʀᴇᴀᴅʏ ᴇɴᴀʙʟᴇᴅ')
                }
                groupData.antisticker = true
                db.saveGroups()
                await reply('✅ ᴀɴᴛɪsᴛɪᴄᴋᴇʀ ʜᴀs ʙᴇᴇɴ ᴇɴᴀʙʟᴇᴅ\n\n⚠️ sᴇᴍᴜᴀ sᴛɪᴄᴋᴇʀ ʏᴀɴɢ ᴅɪᴋɪʀɪᴍ ᴀᴋᴀɴ ᴅɪʜᴀᴘᴜs')
                break
                
            case 'antilink':
                if (groupData.antilink) {
                    return await reply('✅ ᴀɴᴛɪʟɪɴᴋ ɪs ᴀʟʀᴇᴀᴅʏ ᴇɴᴀʙʟᴇᴅ')
                }
                groupData.antilink = true
                db.saveGroups()
                await reply('✅ ᴀɴᴛɪʟɪɴᴋ ʜᴀs ʙᴇᴇɴ ᴇɴᴀʙʟᴇᴅ')
                break
                
            case 'antidelete':
                if (groupData.antidelete) {
                    return await reply('✅ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴇɴᴀʙʟᴇᴅ')
                }
                groupData.antidelete = true
                db.saveGroups()
                await reply('✅ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ʜᴀs ʙᴇᴇɴ ᴇɴᴀʙʟᴇᴅ\n\n🔒 ᴘᴇsᴀɴ ʏᴀɴɢ ᴅɪʜᴀᴘᴜs ᴀᴋᴀɴ ᴅɪᴛᴀᴍᴘɪʟᴋᴀɴ ᴋᴇᴍʙᴀʟɪ')
                break
                
            case 'antibadword':
                if (groupData.antibadword) {
                    return await reply('✅ ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ ɪs ᴀʟʀᴇᴀᴅʏ ᴇɴᴀʙʟᴇᴅ')
                }
                groupData.antibadword = true
                db.saveGroups()
                await reply('✅ ᴀɴᴛɪʙᴀᴅᴡᴏʀᴅ ʜᴀs ʙᴇᴇɴ ᴇɴᴀʙʟᴇᴅ\n\n🚫 ᴘᴇsᴀɴ ʙᴇʀɪsɪ ᴋᴀᴛᴀ ᴋᴀsᴀʀ ᴀᴋᴀɴ ᴅɪʜᴀᴘᴜs')
                break
                
            default:
                await reply('❌ ғᴇᴀᴛᴜʀᴇ ɴᴏᴛ ғᴏᴜɴᴅ\n\n📋 ᴀᴠᴀɪʟᴀʙʟᴇ ғᴇᴀᴛᴜʀᴇs:\n• welcome\n• leave\n• antisticker\n• antilink\n• antidelete\n• antibadword')
                break
        }
    }
}
