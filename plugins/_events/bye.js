import { siputzxBuffer } from '../../lib/siputzxApi.js'

export default {
    name: 'bye',
    description: 'Send goodbye message when members leave',
    
    async execute(context) {
        const { participants, action, groupId, sock, db } = context
        
        if (action !== 'remove') return false
        
        const groupData = db.getGroup(groupId)
        
        if (!groupData.bye) return false
        
        try {
            const groupMetadata = await sock.groupMetadata(groupId).catch(() => null)
            const groupName = groupMetadata?.subject || 'grup ini'
            
            for (const participant of participants) {
                if (participant.includes(sock.user?.id?.split(':')[0])) continue
                
                const username = `@${participant.split('@')[0]}`
                
                let byeMessage = groupData.byeText || groupData.leaveMessage || this.getDefaultMessage()
                
                byeMessage = byeMessage
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
                    
                    const goodbyeImage = await siputzxBuffer('/api/canvas/goodbyev4', {
                        avatar: avatarUrl,
                        background: 'https://i.ibb.co/4YBNyvP/images-76.jpg',
                        description: `Goodbye ${username}!`
                    })
                    
                    await sock.sendMessage(groupId, {
                        image: goodbyeImage,
                        caption: byeMessage,
                        mentions: [participant]
                    })
                } catch (error) {
                    console.error('Error generating goodbye image, sending text only:', error)
                    // Fallback to text only
                    await sock.sendMessage(groupId, {
                        text: byeMessage,
                        mentions: [participant]
                    })
                }
            }
            
            return true
        } catch (error) {
            console.error('Error sending bye message:', error)
            return false
        }
    },
    
    getDefaultMessage() {
        return `👋 *ꜱᴇʟᴀᴍᴀᴛ ᴛɪɴɢɢᴀʟ!*

😢 @user ᴛᴇʟᴀʜ ᴍᴇɴɪɴɢɢᴀʟᴋᴀɴ @group

🌟 ᴛᴇʀɪᴍᴀ ᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ᴍᴇɴᴊᴀᴅɪ ʙᴀɢɪᴀɴ ᴅᴀʀɪ ᴋᴏᴍᴜɴɪᴛᴀꜱ ɪɴɪ

✨ ꜱᴇᴍᴏɢᴀ ꜱᴜᴋꜱᴇꜱ ꜱᴇʟᴀʟᴜ ᴅɪ ᴍᴀɴᴀ ᴘᴜɴ ᴋᴀᴍᴜ ʙᴇʀᴀᴅᴀ! 🚀

ᴊᴀɴɢᴀɴ ʟᴜᴘᴀ ᴋᴀᴍɪ! 💙`
    }
}
