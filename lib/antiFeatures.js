import fs from 'fs'
import path from 'path'

export class AntiFeatures {
    constructor() {
        this.eventHandlers = new Map()
        this.loadEventHandlers()
    }
    
    async loadEventHandlers() {
        try {
            const eventsDir = './plugins/_events'
            if (!fs.existsSync(eventsDir)) {
                return
            }
            
            const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'))
            
            for (const file of eventFiles) {
                try {
                    const eventPath = path.resolve(eventsDir, file)
                    const eventModule = await import(`file://${eventPath}`)
                    const eventHandler = eventModule.default
                    
                    if (eventHandler && eventHandler.name) {
                        this.eventHandlers.set(eventHandler.name, eventHandler)
                        console.log(`✅ Loaded event handler: ${eventHandler.name}`)
                    }
                } catch (error) {
                    console.error(`❌ Failed to load event handler ${file}:`, error)
                }
            }
        } catch (error) {
            console.error('Error loading event handlers:', error)
        }
    }
    
    async checkAntiSticker(context) {
        const handler = this.eventHandlers.get('antisticker')
        if (handler) {
            return await handler.execute(context)
        }
        return false
    }
    
    async checkAntiLink(context) {
        const handler = this.eventHandlers.get('antilink')
        if (handler) {
            return await handler.execute(context)
        }
        return false
    }
    
    async checkAntiBadword(context) {
        const handler = this.eventHandlers.get('antibadword')
        if (handler) {
            return await handler.execute(context)
        }
        return false
    }
    
    async handleAntiDelete(messageUpdate, sock, db) {
        const handler = this.eventHandlers.get('antidelete')
        if (handler) {
            const context = { messageUpdate, sock, db }
            return await handler.execute(context)
        }
        return false
    }
    
    getEventHandler(name) {
        return this.eventHandlers.get(name)
    }
}

export class MessageStore {
    constructor() {
        this.messages = new Map()
        this.maxMessages = 1000 // Limit stored messages
    }
    
    storeMessage(msg, messageType, body) {
        const key = `${msg.key.remoteJid}_${msg.key.id}`
        this.messages.set(key, {
            msg,
            messageType,
            body,
            timestamp: Date.now()
        })
        
        // Clean old messages if limit exceeded
        if (this.messages.size > this.maxMessages) {
            const oldestKey = this.messages.keys().next().value
            this.messages.delete(oldestKey)
        }
    }
    
    getMessage(jid, messageId) {
        const key = `${jid}_${messageId}`
        return this.messages.get(key)
    }
    
    async handleAntiDelete(sock, update, antiFeatures) {
        try {
            // Handle message deletion
            if (update.type === 'notify' && update.notify) {
                for (const notification of update.notify) {
                    if (notification.type === 'message_delete') {
                        const messageUpdate = {
                            type: 'delete',
                            key: notification.key
                        }
                        
                        if (antiFeatures) {
                            await antiFeatures.handleAntiDelete(messageUpdate, sock, global.db || {})
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error handling anti-delete in MessageStore:', error)
        }
    }
}
