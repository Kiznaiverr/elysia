export default {
    command: 'owner',
    description: 'Get owner contact',
    category: 'general',
    usage: '',
    example: '.owner',
    aliases: ['creator', 'author'],
    
    async execute(context) {
        const { sock, msg } = context

        try {
            // Send owner contact with vcard directly
            const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Kiznavierr
ORG:Bot Developer
TEL;type=CELL;type=VOICE;waid=6287863806297:+62 878-6380-6297
END:VCARD`

            await sock.sendMessage(msg.key.remoteJid, {
                contacts: {
                    displayName: 'Kiznavierr',
                    contacts: [{
                        vcard: vcard
                    }]
                }
            }, { quoted: msg })
            
        } catch (error) {
            await sock.sendMessage(msg.key.remoteJid, {
                text: '❌ ᴇʀʀᴏʀ sᴇɴᴅɪɴɢ ᴏᴡɴᴇʀ ᴄᴏɴᴛᴀᴄᴛ'
            }, { quoted: msg })
        }
    }
}
