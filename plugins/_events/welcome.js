import { siputzxBuffer } from '../../lib/siputzxApi.js'

export default {
    name: 'welcome',
    description: 'Send welcome message when new members join',
    
    async execute(context) {
        const { participants, action, groupId, sock, db } = context
        
        if (action !== 'add') return false
        
        const groupData = db.getGroup(groupId)
        
        if (!groupData.welcome) return false
        
        try {
            const groupMetadata = await sock.groupMetadata(groupId).catch(() => null)
            const groupName = groupMetadata?.subject || 'grup ini'
            
            for (const participant of participants) {
                if (participant.includes(sock.user?.id?.split(':')[0])) continue
                
                const username = `@${participant.split('@')[0]}`
                
                let welcomeMessage = groupData.welcomeText || groupData.welcomeMessage || this.getDefaultMessage()
                
                welcomeMessage = welcomeMessage
                    .replace(/@user/g, username)
                    .replace(/@group/g, groupName)
                    .replace(/@mention/g, username)
                
                try {
                    let avatarUrl = 'https://pomf2.lain.la/f/q66743ww.png' // Default avatar
                    try {
                        const profilePic = await sock.profilePictureUrl(participant, 'image').catch(() => null)
                        if (profilePic) {
                            avatarUrl = profilePic
                        }
                    } catch (error) {
                        console.log('Could not get profile picture, using default')
                    }
                    
                    const welcomeImage = await siputzxBuffer('/api/canvas/welcomev4', {
                        avatar: avatarUrl,
                        background: 'https://i.ibb.co/4YBNyvP/images-76.jpg',
                        description: `Welcome ${username}!`
                    })
                    
                    await sock.sendMessage(groupId, {
                        image: welcomeImage,
                        caption: welcomeMessage,
                        mentions: [participant]
                    })
                } catch (error) {
                    console.error('Error generating welcome image, sending text only:', error)
                    // Fallback to text only
                    await sock.sendMessage(groupId, {
                        text: welcomeMessage,
                        mentions: [participant]
                    })
                }
            }
            
            return true
        } catch (error) {
            console.error('Error sending welcome message:', error)
            return false
        }
    },
    
    getDefaultMessage() {
        return `🎉 *ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ!* 

👋 ʜᴀɪ @user! 
✨ ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ @group

📝 *ᴘᴇʀᴀᴛᴜʀᴀɴ ɢʀᴜᴘ:*
• ʙᴇʀꜱɪᴋᴀᴘ ꜱᴏᴘᴀɴ ᴅᴀɴ ʀᴇꜱᴘᴇᴋ
• ᴊᴀɴɢᴀɴ ꜱᴘᴀᴍ ᴀᴛᴀᴜ ꜰʟᴏᴏᴅ
• ɢᴜɴᴀᴋᴀɴ ʙᴀʜᴀꜱᴀ ʏᴀɴɢ ꜱᴏᴘᴀɴ
• ᴊᴀɴɢᴀɴ ꜱʜᴀʀᴇ ᴋᴏɴᴛᴇɴ ɴꜱꜰᴡ

💡 ᴋᴇᴛɪᴋ *.menu* ᴜɴᴛᴜᴋ ᴍᴇɴᴀᴍᴘɪʟᴋᴀɴ ᴅᴀꜰᴛᴀʀ ᴄᴏᴍᴍᴀɴᴅ

ꜱᴇʟᴀᴍᴀᴛ ʙᴇʀɢᴀʙᴜɴɢ! 🎊`
    }
}
