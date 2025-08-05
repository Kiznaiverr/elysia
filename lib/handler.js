import { getContentType } from '@whiskeysockets/baileys'
import config from './config.js'
import logger from './logger.js'

// Intercept Baileys sendMessage to apply global styling
function createStyledSocket(sock) {
    const originalSendMessage = sock.sendMessage.bind(sock)
    
    sock.sendMessage = async function(jid, content, options = {}) {
        if (content.text && global.FontStyler) {
            const urlPattern = /(https?:\/\/[^\s]+)/gi
            if (!urlPattern.test(content.text)) {
                content.text = global.FontStyler.apply(content.text)
            }
        }
        
        if (content.caption && global.FontStyler) {
            const urlPattern = /(https?:\/\/[^\s]+)/gi
            if (!urlPattern.test(content.caption)) {
                content.caption = global.FontStyler.apply(content.caption)
            }
        }
        
        if (content.templateButtons && global.FontStyler) {
            content.templateButtons.forEach(button => {
                if (button.text && !/(https?:\/\/[^\s]+)/gi.test(button.text)) {
                    button.text = global.FontStyler.apply(button.text)
                }
            })
        }
        
        return originalSendMessage(jid, content, options)
    }
    
    return sock
}

export class Handler {
    constructor(sock, db, plugins) {
        this.sock = createStyledSocket(sock) // Apply global styling intercept
        this.db = db
        this.plugins = plugins
        this.config = config
        this.initializeAntiFeatures()
    }
    
    async initializeAntiFeatures() {
        try {
            const { AntiFeatures, MessageStore } = await import('./antiFeatures.js')
            global.antiFeatures = global.antiFeatures || new AntiFeatures()
            global.messageStore = global.messageStore || new MessageStore()
        } catch (error) {
            console.error('Error initializing anti features:', error)
        }
    }
    
    updatePlugins(newPlugins) {
        this.plugins.length = 0
        this.plugins.push(...newPlugins)
    }

    async handleMessage(m) {
        try {
            const msg = m.messages[0]
            if (!msg.message) return
            
            if (msg.key.fromMe) return
            
            if (msg.key.remoteJid === 'status@broadcast') return
              
            const botNumber = this.sock.user?.id?.split(':')[0] || this.sock.user?.id?.replace(/:\d+/, '')
            if (botNumber && msg.key.participant?.includes(botNumber)) return
            if (botNumber && msg.key.remoteJid?.includes(botNumber) && !msg.key.remoteJid?.endsWith('@g.us')) return
            
            const messageType = getContentType(msg.message)
            const body = this.getMessageBody(msg, messageType)
            const isGroup = msg.key.remoteJid.endsWith('@g.us')
            
            let sender = msg.key.participant || msg.key.remoteJid
            
            // Normalize sender for LID support
            if (sender.includes('@lid')) {
            } else if (!sender.includes('@')) {
                sender = config.normalizeJid(sender)
            }
            
            let groupMetadata = null
            if (isGroup) {
                try {
                    groupMetadata = await this.sock.groupMetadata(msg.key.remoteJid)
                } catch (error) {
                    logger.error('Error getting group metadata:', error)
                    groupMetadata = null
                }
            }
            
            const pushName = msg.pushName || 'Unknown'

            const context = {
                sock: this.sock,
                msg,
                body,
                messageType,
                isGroup,
                sender,
                groupMetadata,
                pushName,
                db: this.db,
                config: this.config,
                reply: (text) => this.reply(msg, text),
                react: (emoji) => this.react(msg, emoji)
            }

            if (this.db.isBanned(sender)) {
                return
            }

            if (global.messageStore) {
                global.messageStore.storeMessage(msg, messageType, body)
            }

            if (global.antiFeatures && isGroup) {
                const antiLinkResult = await global.antiFeatures.checkAntiLink(context)
                const antiStickerResult = await global.antiFeatures.checkAntiSticker(context)
                const antiBadwordResult = await global.antiFeatures.checkAntiBadword(context)
                
                if (antiLinkResult || antiStickerResult || antiBadwordResult) {
                    return
                }
            }

            if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
                await this.checkAfkMentions(msg.message.extendedTextMessage.contextInfo.mentionedJid, msg)
            }

            await this.checkAfkReturn(sender, msg)

            const botPrefix = this.config.getPrefix()
            const isCommand = this.isValidCommand(body, botPrefix)
            
            const chatType = isGroup ? 'GROUP' : 'PRIVATE'
            const chatName = isGroup ? (groupMetadata?.subject || 'Unknown Group') : 'Private Chat'
            const messageContent = body || `[${messageType}]`
            
            if (isCommand) {
            } else {
                const adaptedMessage = {
                    mtype: messageType,
                    text: body,
                    isGroup: isGroup,
                    chat: msg.key.remoteJid,
                    sender: sender,
                    pushName: pushName,
                    messageTimestamp: msg.messageTimestamp,
                    fromMe: msg.key.fromMe,
                    msg: msg.message[messageType] || {},
                    mentionedJid: msg.message.extendedTextMessage?.contextInfo?.mentionedJid || null
                }
                
                await logger.messageReceived(adaptedMessage, this.sock)
            }

            if (this.isValidCommand(body, botPrefix)) {
                await this.handleCommand(context)
            } else {
                await this.handleNonCommand(context)
            }

        } catch (error) {
            logger.error('Error handling message:', error)
        }
    }

    async handleCommand(context) {
        const { body, sender, isGroup, msg, groupMetadata } = context
        const prefix = this.config.getPrefix()
        const { command, args } = this.parseCommand(body, prefix)
        const cmd = command.toLowerCase()

        const plugin = this.plugins.find(p => 
            p.command === cmd || (p.aliases && p.aliases.includes(cmd))
        )

        if (!plugin) {
            if (body && body.trim() === prefix) {
                return
            }
            logger.command(command, 'not_found', isGroup ? 'group' : 'private', context.pushName, prefix)
            return
        }

        const cooldown = this.db.checkCooldown(sender, cmd)
        if (cooldown > 0) {
            logger.warn(`COOLDOWN: Command "${prefix}${cmd}" by ${context.pushName} - ${cooldown}s remaining`)
            await context.reply(this.config.get('replyMessages', 'cooldown').replace('{cooldown}', cooldown))
            return
        }

        if (plugin.groupOnly && !isGroup) {
            logger.warn(`ACCESS: Command "${cmd}" denied for ${context.pushName} - Group only`)
            await context.reply(this.config.get('replyMessages', 'groupOnly'))
            return
        }

        if (plugin.privateOnly && isGroup) {
            await context.reply(this.config.get('replyMessages', 'privateOnly'))
            return
        }

        if (plugin.ownerOnly && !this.config.isOwner(sender)) {
            await context.reply(this.config.get('replyMessages', 'ownerOnly'))
            return
        }

        if (plugin.premium && !this.db.isPremium(sender)) {
            await context.reply(this.config.get('replyMessages', 'premiumOnly'))
            return
        }

        if (plugin.limit && !this.config.isOwner(sender) && !this.db.isPremium(sender)) {
            if (!this.db.useLimit(sender, plugin.limit)) {
                const user = this.db.getUser(sender)
                await context.reply(this.config.get('replyMessages', 'limitReached').replace('{limit}', user.limit))
                return
            }
        }

        try {
            if (plugin.botAdmin && isGroup && groupMetadata) {
                const botNumber = this.sock.user.id.split(':')[0] + '@s.whatsapp.net'
                const groupAdmins = groupMetadata.participants?.filter(p => p.admin)?.map(p => p.id) || []
                if (!groupAdmins.includes(botNumber) && !groupAdmins.includes(this.sock.user.id)) {
                    await context.reply(this.config.get('replyMessages', 'botAdmin'))
                    return
                }
            }

            if (plugin.adminOnly) {
                if (this.config.isOwner(sender)) {
                } else if (isGroup && groupMetadata) {
                    const groupAdmins = groupMetadata.participants?.filter(p => p.admin)?.map(p => p.id) || []
                    if (!groupAdmins.includes(sender)) {
                        await context.reply(this.config.get('replyMessages', 'adminOnly'))
                        return
                    }
                } else {
                    if (!this.config.isAdmin(sender)) {
                        await context.reply(this.config.get('replyMessages', 'adminOnly'))
                        return
                    }
                }
            }

            if (plugin.cooldown) {
                this.db.setCooldown(sender, cmd, plugin.cooldown * 1000)
            }

            context.command = cmd
            context.args = args
            context.text = args.join(' ')
            context.prefix = prefix
            context.groupMetadata = groupMetadata
            context.plugins = this.plugins
            
            if (isGroup && groupMetadata) {
                const groupAdmins = groupMetadata.participants?.filter(p => p.admin)?.map(p => p.id) || []
                context.isGroupAdmin = groupAdmins.includes(sender) || this.config.isOwner(sender)
                const botNumber = this.sock.user.id.split(':')[0] + '@s.whatsapp.net'
                context.isBotAdmin = groupAdmins.includes(botNumber) || groupAdmins.includes(this.sock.user.id)
            } else {
                context.isGroupAdmin = false
                context.isBotAdmin = false
            }
            
            context.isOwner = this.config.isOwner(sender)
            context.isBotGlobalAdmin = this.config.isAdmin(sender) || this.config.isOwner(sender)

            await plugin.execute(context)

            this.db.addExp(sender, 5)
            
            logger.command(cmd, 'success', isGroup ? 'group' : 'private', context.pushName, prefix)

        } catch (error) {
            const chatType = isGroup ? 'group' : 'private'
            logger.command(cmd, 'error', chatType, context.pushName, prefix)
            logger.error(`Command execution failed: ${error.message || 'Unknown error'}`)
            await context.reply(this.config.get('replyMessages', 'error'))
        }
    }

    async handleNonCommand(context) {
        const { sender, body } = context

        if (body) {
            // Auto responses disabled for testing
            /*
            const autoResponses = {
                'hi': 'Hello! 👋',
                'hello': 'Hi there! 👋',
                'bot': 'Yes, I am Elysia! 🤖'
            }

            const lowerBody = body.toLowerCase()
            for (const [trigger, response] of Object.entries(autoResponses)) {
                if (lowerBody.includes(trigger)) {
                    await context.reply(response)
                    break
                }
            }
            */
        }

        const user = this.db.getUser(sender)
        if (user) {
            user.lastSeen = Date.now()
            this.db.saveUsers()
        }
    }

    async handleGroupUpdate(update) {
        try {
            const { id, participants, action } = update
            const groupData = this.db.getGroup(id)

            const context = {
                participants,
                action,
                groupId: id,
                sock: this.sock,
                db: this.db,
                groupData
            }

            if (action === 'add' && global.antiFeatures) {
                const welcomeHandler = global.antiFeatures.getEventHandler('welcome')
                if (welcomeHandler) {
                    await welcomeHandler.execute(context)
                }
            }

            if (action === 'remove' && global.antiFeatures) {
                const byeHandler = global.antiFeatures.getEventHandler('bye')
                if (byeHandler) {
                    await byeHandler.execute(context)
                }
            }

        } catch (error) {
            logger.error('Error handling group update:', error)
        }
    }

    async handleGroupsUpdate(updates) {
        for (const update of updates) {
            const groupData = this.db.getGroup(update.id)
            if (update.subject) {
                groupData.name = update.subject
                this.db.saveGroups()
            }
        }
    }

    getMessageBody(msg, messageType) {
        switch (messageType) {
            case 'conversation':
                return msg.message.conversation
            case 'extendedTextMessage':
                return msg.message.extendedTextMessage.text
            case 'imageMessage':
                return msg.message.imageMessage.caption || ''
            case 'videoMessage':
                return msg.message.videoMessage.caption || ''
            case 'documentMessage':
                return msg.message.documentMessage.caption || ''
            default:
                return ''
        }
    }

    async reply(msg, text) {
        return await this.sock.sendMessage(msg.key.remoteJid, {
            text: text
        }, {
            quoted: msg
        })
    }

    async react(msg, emoji) {
        return await this.sock.sendMessage(msg.key.remoteJid, {
            react: {
                text: emoji,
                key: msg.key
            }
        })
    }

    isValidCommand(body, prefix) {
        if (!body || typeof body !== 'string') return false
        return body.startsWith(prefix) && body.length > prefix.length
    }

    parseCommand(body, prefix) {
        if (!body || typeof body !== 'string') {
            return { command: '', args: [] }
        }

        let commandText = ''
        
        if (body.startsWith(prefix) && !body.startsWith(prefix + ' ')) {
            commandText = body.slice(prefix.length).trim()
        } else if (body.startsWith(prefix + ' ')) {
            commandText = body.slice(prefix.length + 1).trim()
        }
        
        if (!commandText) {
            return { command: '', args: [] }
        }
        
        const [command, ...args] = commandText.split(' ')
        return { 
            command: command || '', 
            args: args || [] 
        }
    }

    async checkAfkMentions(mentionedJid, msg) {
        for (const jid of mentionedJid) {
            const user = this.db.data.users[jid]
            if (user?.afk?.status) {
                const afkTime = new Date(user.afk.time).toLocaleString('id-ID')
                const duration = this.getAfkDuration(user.afk.time)
                
                await this.sock.sendMessage(msg.key.remoteJid, {
                    text: `😴 *User sedang AFK*\n\n👤 @${jid.split('@')[0]}\n📝 Alasan: ${user.afk.reason}\n⏰ Sejak: ${afkTime}\n⌛ Durasi: ${duration}`,
                    mentions: [jid]
                }, { quoted: msg })
            }
        }
    }

    async checkAfkReturn(sender, msg) {
        const user = this.db.data.users[sender]
        if (user?.afk?.status) {
            const afkTime = new Date(user.afk.time).toLocaleString('id-ID')
            const duration = this.getAfkDuration(user.afk.time)
            
            user.afk.status = false
            delete user.afk.reason
            delete user.afk.time
            
            await this.db.write()
            
            await this.sock.sendMessage(msg.key.remoteJid, {
                text: `🎉 *Selamat datang kembali!*\n\n👤 @${sender.split('@')[0]}\n📝 Telah kembali dari AFK\n⏰ AFK sejak: ${afkTime}\n⌛ Durasi AFK: ${duration}`,
                mentions: [sender]
            }, { quoted: msg })
        }
    }

    getAfkDuration(startTime) {
        const now = Date.now()
        const diff = now - startTime
        
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        
        if (days > 0) {
            return `${days} hari ${hours % 24} jam`
        } else if (hours > 0) {
            return `${hours} jam ${minutes % 60} menit`
        } else if (minutes > 0) {
            return `${minutes} menit ${seconds % 60} detik`
        } else {
            return `${seconds} detik`
        }
    }
}
