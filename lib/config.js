import fs from 'fs'
import { join } from 'path'
import { readFileSync, existsSync } from 'fs'
import logger from './logger.js'

class FontStyler {
    constructor() {
        this.smallCapsMap = {
            'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ꜰ', 'G': 'ɢ', 'H': 'ʜ',
            'I': 'ɪ', 'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ',
            'Q': 'ǫ', 'R': 'ʀ', 'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x',
            'Y': 'ʏ', 'Z': 'ᴢ',
            'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ',
            'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ',
            'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x',
            'y': 'ʏ', 'z': 'ᴢ'
        }
    }

    toSmallCaps(text) {
        if (!text || typeof text !== 'string') return text
        return text.split('').map(char => this.smallCapsMap[char] || char).join('')
    }

    apply(text) {
        if (!text || typeof text !== 'string') return text
        return this.toSmallCaps(text)
    }

    static formatSize(bytes) {
        if (!bytes || bytes === 0) return '0B'
        
        const units = ['B', 'KB', 'MB', 'GB', 'TB']
        const k = 1024
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + units[i]
    }
}

global.FontStyler = new FontStyler()

class ConfigManager {
    constructor() {
        this.configPath = join(process.cwd(), 'config.json')
        this.config = this.loadConfig()
    }

    loadConfig() {
        try {
            if (!existsSync(this.configPath)) {
                logger.error('config.json not found!')
                logger.system('Please make sure config.json exists in the root directory')
                process.exit(1)
            }
            
            const configData = readFileSync(this.configPath, 'utf8')
            const config = JSON.parse(configData)
            
            logger.system('Configuration loaded successfully')
            return config
        } catch (error) {
            logger.error('Error loading config.json:', error.message)
            logger.system('Please check your config.json syntax')
            process.exit(1)
        }
    }

    get(section, key = null) {
        if (key) {
            return this.config[section]?.[key]
        }
        return this.config[section] || {}
    }

    getBotName() { return this.get('botSettings', 'botName') || 'WhatsApp-Bot' }
    getPrefix() { return this.get('botSettings', 'prefix') || '.' }
    getOwners() { return this.get('ownerSettings', 'owners') || [] }
    getAdmins() { return this.get('adminSettings', 'admins') || [] }
    getDailyLimit() { return this.get('limitSettings', 'dailyLimit') || 50 }
    getPremiumLimit() { return this.get('limitSettings', 'premiumLimit') || 999 }
    isPairingMode() { return this.get('botSettings', 'pairingMode') || false }
    
    normalizeJid(jid) {
        if (!jid) return jid
        
        if (jid.includes('@lid')) {
            return jid
        }
        
        if (jid.includes('@s.whatsapp.net')) {
            return jid
        }
        
        if (jid.includes('@g.us')) {
            return jid
        }
        
        return jid + '@s.whatsapp.net'
    }
    
    isOwner(jid) {
        const normalizedJid = this.normalizeJid(jid)
        return this.getOwners().some(owner => this.normalizeJid(owner) === normalizedJid)
    }
    
    isAdmin(jid) {
        const normalizedJid = this.normalizeJid(jid)
        return this.getAdmins().some(admin => this.normalizeJid(admin) === normalizedJid) || this.isOwner(jid)
    }

    reload() {
        this.config = this.loadConfig()
        logger.system('Configuration reloaded')
        return true
    }

    validate() {
        const requiredSections = ['botSettings', 'ownerSettings', 'adminSettings', 'limitSettings', 'replyMessages']

        const missing = []
        for (const section of requiredSections) {
            if (!this.config[section]) {
                missing.push(section)
            }
        }

        if (missing.length > 0) {
            logger.warn('Missing config sections:', missing.join(', '))
            return false
        }

        if (!this.config.ownerSettings.owners || this.config.ownerSettings.owners.length === 0) {
            logger.warn('No owners configured! Please set owner in config.json')
            return false
        }

        logger.success('Config validation passed')
        return true
    }
}

export default new ConfigManager()
