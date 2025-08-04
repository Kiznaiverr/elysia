import fs from 'fs'
import path from 'path'
import config from './config.js'
import logger from './logger.js'

export class Database {
    constructor() {
        this.dataDir = './database'
        this.ensureDataDir()
        this.users = this.loadData('users.json', {})
        this.groups = this.loadData('groups.json', {})
        this.badwords = this.loadData('badwords.json', { global: [], groups: {} })
        this.cooldowns = new Map()
        
        // Add data property for compatibility
        this.data = {
            users: this.users,
            groups: this.groups,
            badwords: this.badwords
        }
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true })
        }
    }

    loadData(filename, defaultData = {}) {
        const filePath = path.join(this.dataDir, filename)
        try {
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8')
                const parsed = JSON.parse(data)
                logger.database(`loaded ${filename}`, 'success')
                return parsed
            }
        } catch (error) {
            logger.error(`Error loading ${filename}:`, error)
        }
        return defaultData
    }

    saveData(filename, data) {
        const filePath = path.join(this.dataDir, filename)
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
            return true
        } catch (error) {
            logger.error(`Error saving ${filename}:`, error)
            return false
        }
    }

    // Utility untuk handle JID/LID migration
    getUserId(jid) {
        if (!jid) return null
        
        // Handle LID format
        if (jid.includes('@lid')) {
            return jid.split('@')[0]
        }
        
        // Handle legacy JID format
        if (jid.includes('@s.whatsapp.net')) {
            return jid.split('@')[0]
        }
        
        // Handle group format
        if (jid.includes('@g.us')) {
            return jid
        }
        
        return jid.split('@')[0]
    }

    // User methods
    getUser(jid) {
        const userId = this.getUserId(jid)
        if (!userId) return null
        
        if (!this.users[userId]) {
            this.users[userId] = {
                jid: jid,
                userId: userId,
                name: '',
                level: 1,
                exp: 0,
                limit: config.getDailyLimit(),
                premium: false,
                premiumSince: null,
                premiumExpiry: null,
                banned: false,
                warning: 0,
                lastSeen: Date.now(),
                registered: false,
                regTime: 0,
                // Track JID migrations untuk LID support
                jidHistory: [jid],
                currentJid: jid
            }
            this.saveUsers()
        }
        
        if (this.users[userId].currentJid !== jid) {
            if (!this.users[userId].jidHistory.includes(jid)) {
                this.users[userId].jidHistory.push(jid)
                logger.lidMigration(this.users[userId].currentJid, jid)
            }
            this.users[userId].currentJid = jid
            this.saveUsers()
        }
        
        if (this.users[userId].premium && this.users[userId].premiumExpiry) {
            if (Date.now() > this.users[userId].premiumExpiry) {
                this.users[userId].premium = false
                this.users[userId].premiumSince = null
                this.users[userId].premiumExpiry = null
                this.users[userId].limit = config.getDailyLimit()
                this.saveUsers()
            }
        }
        
        return this.users[userId]
    }

    saveUsers() {
        return this.saveData('users.json', this.users)
    }

    getGroup(jid) {
        if (!this.groups[jid]) {
            this.groups[jid] = {
                jid: jid,
                name: '',
                welcome: true,
                bye: true,
                antilink: false,
                antispam: false,
                antisticker: false,
                antidelete: false,
                antibadword: false,
                mute: false,
                banned: false,
                created: Date.now(),
                welcomeText: '🎉 *ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ!*\n\n👋 ʜᴀɪ @user!\n✨ ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ @group\n\n💡 ᴋᴇᴛɪᴋ *.menu* ᴜɴᴛᴜᴋ ᴍᴇɴᴀᴍᴘɪʟᴋᴀɴ ᴅᴀꜰᴛᴀʀ ᴄᴏᴍᴍᴀɴᴅ\n\nꜱᴇʟᴀᴍᴀᴛ ʙᴇʀɢᴀʙᴜɴɢ! 🎊',
                byeText: '👋 *ꜱᴇʟᴀᴍᴀᴛ ᴛɪɴɢɢᴀʟ!*\n\n😢 @user ᴛᴇʟᴀʜ ᴍᴇɴɪɴɢɢᴀʟᴋᴀɴ @group\n\n🌟 ᴛᴇʀɪᴍᴀ ᴋᴀꜱɪʜ ᴛᴇʟᴀʜ ᴍᴇɴᴊᴀᴅɪ ʙᴀɢɪᴀɴ ᴅᴀʀɪ ᴋᴏᴍᴜɴɪᴛᴀꜱ ɪɴɪ\n\nꜱᴇᴍᴏɢᴀ ꜱᴜᴋꜱᴇꜱ ꜱᴇʟᴀʟᴜ! 🚀',
                whitelist: []
            }
            this.saveGroups()
        }
        return this.groups[jid]
    }

    saveGroups() {
        return this.saveData('groups.json', this.groups)
    }

    saveBadwords() {
        return this.saveData('badwords.json', this.badwords)
    }

    // Get all badwords for a specific group (global + group-specific)
    getBadwords(groupId) {
        const globalBadwords = this.badwords.global || []
        const groupBadwords = this.badwords.groups[groupId] || []
        return [...globalBadwords, ...groupBadwords]
    }

    // Get only group-specific badwords
    getGroupBadwords(groupId) {
        return this.badwords.groups[groupId] || []
    }

    // Get only global badwords
    getGlobalBadwords() {
        return this.badwords.global || []
    }

    // Add badword to specific group
    addGroupBadword(groupId, word) {
        if (!this.badwords.groups[groupId]) {
            this.badwords.groups[groupId] = []
        }
        
        const wordLower = word.toLowerCase().trim()
        if (!this.badwords.groups[groupId].includes(wordLower)) {
            this.badwords.groups[groupId].push(wordLower)
            this.saveBadwords()
            return true
        }
        return false // Already exists
    }

    // Remove badword from specific group
    removeGroupBadword(groupId, word) {
        if (!this.badwords.groups[groupId]) {
            return false
        }
        
        const wordLower = word.toLowerCase().trim()
        const index = this.badwords.groups[groupId].indexOf(wordLower)
        if (index > -1) {
            this.badwords.groups[groupId].splice(index, 1)
            this.saveBadwords()
            return true
        }
        return false // Not found
    }

    // Add global badword (owner only)
    addGlobalBadword(word) {
        const wordLower = word.toLowerCase().trim()
        if (!this.badwords.global.includes(wordLower)) {
            this.badwords.global.push(wordLower)
            this.saveBadwords()
            return true
        }
        return false // Already exists
    }

    // Remove global badword (owner only)
    removeGlobalBadword(word) {
        const wordLower = word.toLowerCase().trim()
        const index = this.badwords.global.indexOf(wordLower)
        if (index > -1) {
            this.badwords.global.splice(index, 1)
            this.saveBadwords()
            return true
        }
        return false // Not found
    }

    // Check if text contains any badword
    containsBadword(text, groupId) {
        if (!text) return false
        
        const allBadwords = this.getBadwords(groupId)
        const textLower = text.toLowerCase()
        
        return allBadwords.some(badword => {
            const badwordLower = badword.toLowerCase()
            // Use word boundary regex to match whole words only
            const regex = new RegExp(`\\b${badwordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
            return regex.test(textLower)
        })
    }

    setCooldown(jid, command, duration = 5000) {
        const key = `${this.getUserId(jid)}_${command}`
        this.cooldowns.set(key, Date.now() + duration)
    }

    checkCooldown(jid, command) {
        const key = `${this.getUserId(jid)}_${command}`
        const cooldownEnd = this.cooldowns.get(key)
        if (!cooldownEnd) return 0
        
        const remaining = cooldownEnd - Date.now()
        if (remaining <= 0) {
            this.cooldowns.delete(key)
            return 0
        }
        
        return Math.ceil(remaining / 1000)
    }

    addExp(jid, exp) {
        const user = this.getUser(jid)
        if (!user) return false
        
        user.exp += exp
        const newLevel = Math.floor(user.exp / 100) + 1
        
        if (newLevel > user.level) {
            user.level = newLevel
        }
        
        this.saveUsers()
        return true
    }

    useLimit(jid, amount = 1) {
        const user = this.getUser(jid)
        if (!user) return false
        
        if (user.limit < amount) {
            return false
        }
        
        user.limit -= amount
        this.saveUsers()
        return true
    }

    isOwner(jid) {
        return config.isOwner(jid)
    }

    isPremium(jid) {
        const user = this.getUser(jid)
        if (!user) return false
        
        if (user.premium && user.premiumExpiry) {
            if (Date.now() > user.premiumExpiry) {
                user.premium = false
                user.premiumSince = null
                user.premiumExpiry = null
                this.saveUsers()
            }
        }
        
        return user.premium || this.isOwner(jid)
    }

    isBanned(jid) {
        const user = this.getUser(jid)
        return user?.banned || false
    }

    isAdmin(jid) {
        return config.isAdmin(jid)
    }

    addPremium(jid, days = 30) {
        const user = this.getUser(jid)
        if (!user) return false
        
        const premiumDuration = days * 24 * 60 * 60 * 1000
        
        user.premium = true
        user.premiumSince = Date.now()
        user.premiumExpiry = Date.now() + premiumDuration
        user.limit = config.getPremiumLimit()
        
        this.saveUsers()
        return true
    }

    removePremium(jid) {
        const user = this.getUser(jid)
        if (!user) return false
        
        user.premium = false
        user.premiumSince = null
        user.premiumExpiry = null
        user.limit = config.getDailyLimit()
        
        this.saveUsers()
        return true
    }

    getStats() {
        return {
            totalUsers: Object.keys(this.users).length,
            totalGroups: Object.keys(this.groups).length,
            premiumUsers: Object.values(this.users).filter(u => u.premium).length,
            bannedUsers: Object.values(this.users).filter(u => u.banned).length,
            activeCooldowns: this.cooldowns.size
        }
    }

    async write() {
        this.saveUsers()
        this.saveGroups()
        return true
    }
}
