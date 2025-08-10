import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import pino from 'pino'
import readline from 'readline'
import { Handler } from './lib/handler.js'
import { Database } from './lib/database.js'
import { loadPlugins, startAutoReload, stopAutoReload } from './lib/loader.js'
import config from './lib/config.js'
import logger from './lib/logger.js'

const pinoLogger = pino({ 
    level: 'silent',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
})

// Initialize database
const db = new Database()

// Load plugins
const plugins = await loadPlugins()

let handler = null

// Interface untuk pairing code
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const question = (text) => new Promise((resolve) => rl.question(text, resolve))

logger.banner()
logger.system(`Initializing ${config.getBotName()}`)
logger.system(`Created by ${config.get('botSettings', 'author')}`)

logger.system(`Prefix: ${config.getPrefix()}`)
logger.system(`Owners: ${config.getOwners().length} configured`)
logger.connection('Setting up WhatsApp connection...')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    
    logger.system(`Using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const pairingMode = process.argv.includes('--pairing-code') || config.get('botSettings', 'pairingMode')
    const sessionExists = state.creds?.registered

    const sock = makeWASocket({
        version,
        logger: pinoLogger,
        printQRInTerminal: !pairingMode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pinoLogger)
        },
        browser: [config.getBotName(), 'Chrome', '3.0'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        fireInitQueries: true,
        getMessage: async (key) => {
            return undefined
        }
    })

    handler = new Handler(sock, db, plugins)
    
    startAutoReload((updatedPlugins) => {
        if (handler) {
            handler.updatePlugins(updatedPlugins)
        }
    })

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr, isNewLogin } = update
        
        if (qr && !sessionExists && pairingMode) {
            logger.connection('Pairing mode enabled - waiting for phone number...')
            
            try {
                const phoneNumber = await question('Masukkan nomor WhatsApp Anda (dengan kode negara, contoh: 628123456789): ')
                const code = await sock.requestPairingCode(phoneNumber.trim())
                logger.connection(`Pairing Code: ${code}`)
                logger.system('Masukkan kode pairing di WhatsApp Anda: Linked Devices > Link a Device > Link with phone number')
                logger.system('Atau gunakan menu: WhatsApp Web > Tautkan dengan nomor telepon')
            } catch (error) {
                logger.error('Error requesting pairing code:', error)
            }
        } else if (qr && !pairingMode) {
            logger.connection('QR Code generated - scan to connect')
            logger.separator()
            qrcode.generate(qr, { small: true })
            logger.separator()
            logger.system('Scan QR code di atas dengan WhatsApp Web untuk menghubungkan bot')
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
            logger.error('Connection closed:', lastDisconnect.error)
            if (shouldReconnect) {
                logger.connection('Reconnecting in 3 seconds...')
                setTimeout(startBot, 3000)
            } else {
                logger.connection('Logged out. Please restart bot.')
                rl.close()
            }
        } else if (connection === 'open') {
            const botNumber = sock.user.id.split(':')[0] || sock.user.id.replace(/:\d+/, '')
            const currentTime = new Date().toLocaleTimeString('id-ID')
            
            logger.success('Bot connected successfully!')
            logger.system(`Number: ${botNumber}`)
            logger.system(`LID Support: ${sock.user.lid ? 'Yes' : 'Legacy JID'}`)
            logger.system(`Time: ${currentTime}`)
            logger.success('Bot is now ready to receive messages!')
            logger.system('Auto-reload is active - plugins will reload on file changes')
            
            if (process.argv.includes('--pairing-code')) {
                logger.system('Pairing code mode was used for connection')
            }
            
            rl.close()
        }
    })

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', handler.handleMessage.bind(handler))
    sock.ev.on('messages.update', async (messageUpdate) => {
        if (global.messageStore && messageUpdate.length > 0) {
            for (const update of messageUpdate) {
                await global.messageStore.handleAntiDelete(sock, update, global.antiFeatures)
            }
        }
    })
    sock.ev.on('group-participants.update', handler.handleGroupUpdate.bind(handler))
    sock.ev.on('groups.update', handler.handleGroupsUpdate.bind(handler))

    return sock
}

startBot().catch(err => {
    logger.error('Error starting bot:', err)
    rl.close()
    process.exit(1)
})

process.on('SIGINT', () => {
    logger.system('Bot stopped by user')
    stopAutoReload()
    rl.close()
    process.exit(0)
})

process.on('uncaughtException', (err) => {
    if (err.stack && err.stack.includes('plugins')) {
        logger.error('Plugin Error:', err)
        return
    }
    
    logger.error('Uncaught Exception:', err)
    stopAutoReload()
    rl.close()
})

process.on('unhandledRejection', (err) => {
    if (err && err.stack && err.stack.includes('plugins')) {
        logger.error('Plugin Rejection:', err)
        return
    }
    
    logger.error('Unhandled Rejection:', err)
    stopAutoReload()
    rl.close()
})
