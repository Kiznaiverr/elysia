import chalk from 'chalk'
import moment from 'moment-timezone'
import urlRegex from 'url-regex-safe'
import PhoneNumber from 'awesome-phonenumber'

const urlRegexConfig = urlRegex({
    strict: false
})

class Logger {
    constructor() {
        this.colors = {
            primary: chalk.hex("#e9c46a"),
            secondary: chalk.hex("#274753"),
            success: chalk.green,
            warning: chalk.yellow,
            error: chalk.red,
            info: chalk.blue,
            debug: chalk.gray,
            system: chalk.cyan
        }
    }

    formatSize(bytes) {
        if (!bytes || bytes === 0) return '0B'
        
        const units = ['B', 'KB', 'MB', 'GB', 'TB']
        const k = 1024
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + units[i]
    }

    banner() {
        const banner = `
${chalk.hex("#e9c46a")('╔══════════════════════════════════════════════════════════════╗')}
${chalk.hex("#e9c46a")('║')}                     ${chalk.bold.hex("#274753")('ᴇʟʏsɪᴀ ʙᴏᴛ')}                         ${chalk.hex("#e9c46a")('║')}
${chalk.hex("#e9c46a")('║')}                  ${chalk.gray('sᴜᴘᴘᴏʀᴛ ʟɪᴅ ᴍɪɢʀᴀᴛɪᴏɴ')}                    ${chalk.hex("#e9c46a")('║')}
${chalk.hex("#e9c46a")('║')}                    ${chalk.whiteBright('ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴋɪᴢɴᴀᴠɪᴇʀʀ')}                     ${chalk.hex("#e9c46a")('║')}
${chalk.hex("#e9c46a")('╚══════════════════════════════════════════════════════════════╝')}
        `
        console.log(banner)
    }

    async getChatName(sock, jid) {
        try {
            if (jid.endsWith('@g.us')) {
                const groupData = await sock.groupMetadata(jid)
                return groupData?.subject || 'Unknown Group'
            } else {
                return jid.split('@')[0] // Fallback to number
            }
        } catch (error) {
            return jid.split('@')[0] // Fallback to number if error
        }
    }

    async getContactName(sock, jid) {
        try {
            return jid.split('@')[0] // For now just return the number part
        } catch (error) {
            return jid.split('@')[0]
        }
    }

    formatTimestamp() {
        return moment().tz(process.env.TZ || "Asia/Jakarta").format("DD/MM/YY HH:mm:ss")
    }

    formatLevel(level) {
        switch (level.toUpperCase()) {
            case 'ERROR': return chalk.redBright('[ ERROR ]')
            case 'WARN': return chalk.yellow('[ WARN ]')
            case 'INFO': return chalk.blue('[ INFO ]')
            case 'SUCCESS': return chalk.green('[ SUCCESS ]')
            case 'DEBUG': return chalk.gray('[ DEBUG ]')
            case 'SYSTEM': return chalk.hex("#e9c46a")('[ SYSTEM ]')
            case 'COMMAND': return chalk.hex("#e9c46a")('[ CMD ]')
            case 'PLUGIN': return chalk.yellow('[ PLUGIN ]')
            case 'CONNECTION': return chalk.blue('[ CONN ]')
            case 'MSG': return chalk.whiteBright('[ MSG ]')
            case 'LOADING': return chalk.hex("#e9c46a")('[ LOADING ]')
            default: return chalk.white(`[ ${level} ]`)
        }
    }

    createMessageBox(header, content, footer = null) {
        const boxWidth = 70
        const topLine = chalk.hex("#e9c46a")('╔' + '═'.repeat(boxWidth - 2) + '╗')
        const bottomLine = chalk.hex("#e9c46a")('╚' + '═'.repeat(boxWidth - 2) + '╝')
        const emptyLine = chalk.hex("#e9c46a")('║') + ' '.repeat(boxWidth - 2) + chalk.hex("#e9c46a")('║')
        
        console.log()
        console.log(topLine)
        
        if (header) {
            const headerPadding = Math.max(0, Math.floor((boxWidth - 2 - header.length) / 2))
            const headerLine = chalk.hex("#e9c46a")('║') + ' '.repeat(headerPadding) + 
                             chalk.bold.hex("#274753")(header) + 
                             ' '.repeat(boxWidth - 2 - headerPadding - header.length) + 
                             chalk.hex("#e9c46a")('║')
            console.log(headerLine)
            console.log(emptyLine)
        }
        
        if (content && Array.isArray(content)) {
            content.forEach(line => {
                if (typeof line === 'string') {
                    const contentLine = chalk.hex("#e9c46a")('║ ') + line + 
                                      ' '.repeat(Math.max(0, boxWidth - 4 - line.length)) + 
                                      chalk.hex("#e9c46a")(' ║')
                    console.log(contentLine)
                }
            })
        }
        
        if (footer) {
            console.log(emptyLine)
            const footerPadding = Math.max(0, Math.floor((boxWidth - 2 - footer.length) / 2))
            const footerLine = chalk.hex("#e9c46a")('║') + ' '.repeat(footerPadding) + 
                             chalk.gray(footer) + 
                             ' '.repeat(boxWidth - 2 - footerPadding - footer.length) + 
                             chalk.hex("#e9c46a")('║')
            console.log(footerLine)
        }
        
        console.log(bottomLine)
        console.log()
    }

    async messageReceived(message, whatsappClient) {
        try {
            if (!message || message.mtype === undefined || message.mtype === null) {
                return
            }

            const senderName = message.fromMe ? "ꜱᴇʟꜰ" : (message.pushName || "ɴᴏ ɴᴀᴍᴇ")
            const senderId = message.sender?.split('@')[0] || 'unknown'
            
            const chatName = message.isGroup 
                ? (await this.getChatName(whatsappClient, message.chat)) || 'ᴜɴᴋɴᴏᴡɴ ɢʀᴏᴜᴘ'
                : 'ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛ'
            
            const chatType = message.isGroup ? '👥 ɢʀᴏᴜᴘ' : '👤 ᴘʀɪᴠᴀᴛᴇ'
            
            const messageType = message.mtype.toUpperCase()
            const fileSize = /(document|audio|sticker|image|video)/.test(message.mtype) 
                ? this.formatSize(message.msg?.fileLength) 
                : null
            
            const timestamp = moment(message.messageTimestamp * 1000)
                .tz(process.env.TZ || "Asia/Jakarta")
                .format("DD/MM/YY HH:mm:ss")

            let categoryIcon = ''
            switch(message.mtype) {
                case 'conversation':
                case 'extendedTextMessage':
                    categoryIcon = '💬'
                    break
                case 'imageMessage':
                    categoryIcon = '🖼️'
                    break
                case 'videoMessage':
                    categoryIcon = '🎥'
                    break
                case 'audioMessage':
                    categoryIcon = message.msg?.ptt ? '🎤' : '🎧'
                    break
                case 'documentMessage':
                    categoryIcon = '📄'
                    break
                case 'stickerMessage':
                    categoryIcon = '🎭'
                    break
                case 'contactMessage':
                    categoryIcon = '📞'
                    break
                case 'locationMessage':
                    categoryIcon = '📍'
                    break
                default:
                    categoryIcon = '📨'
            }

            console.log(`${chalk.gray(`[${timestamp}]`)} ${this.formatLevel('MSG')} ${categoryIcon} ${chalk.hex("#e9c46a")(messageType)}`)
            console.log(`${chalk.gray('   • ᴘᴇsᴀɴ:')} ${chalk.whiteBright(message.text || '[Media/File]')}`)
            console.log(`${chalk.gray('   • ᴘᴇɴɢɪʀɪᴍ:')} ${chalk.hex("#e9c46a")(senderName)} ${chalk.gray(`(${senderId})`)}`)
            
            if (message.isGroup) {
                console.log(`${chalk.gray('   • ɢʀᴏᴜᴘ:')} ${chalk.whiteBright(chatName)}`)
            } else {
                console.log(`${chalk.gray('   • ᴘʀɪᴠᴀᴛᴇ:')} ${chalk.whiteBright('Direct Message')}`)
            }
            
            if (fileSize) {
                console.log(`${chalk.gray('   • ᴜᴋᴜʀᴀɴ:')} ${chalk.yellow(fileSize)}`)
            }

            if (/document/i.test(message.mtype)) {
                const documentName = message.msg?.filename || 
                    message.msg?.displayName || 
                    "ᴅᴏᴄᴜᴍᴇɴᴛ"
                console.log(`${chalk.gray('   • ꜰɪʟᴇ:')} ${chalk.yellow(documentName)}`)
                
            } else if (/contact/i.test(message.mtype)) {
                const contactName = message.msg?.displayName || "ᴄᴏɴᴛᴀᴄᴛ"
                console.log(`${chalk.gray('   • ᴋᴏɴᴛᴀᴋ:')} ${chalk.yellow(contactName)}`)
                
            } else if (/audio/i.test(message.mtype)) {
                const minutes = Math.floor(message.msg?.seconds / 60).toString().padStart(2, '0')
                const seconds = (message.msg?.seconds % 60).toString().padStart(2, '0')
                const audioType = message.msg?.ptt ? "ᴘᴛᴛ" : "ᴀᴜᴅɪᴏ"
                console.log(`${chalk.gray('   • ᴅᴜʀᴀsɪ:')} ${chalk.yellow(`${audioType} ${minutes}:${seconds}`)}`)
            }

        } catch (error) {
            console.log(this.formatLevel('ERROR'), chalk.red('Error in messageReceived:'), error.message)
        }
    }

    system(message) {
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('SYSTEM')} ${chalk.whiteBright(message)}`)
    }

    success(message) {
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('SUCCESS')} ${chalk.green(message)}`)
    }

    error(message, error = null) {
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('ERROR')} ${chalk.red(message)}`)
        if (error && error.stack) {
            console.log(chalk.red(error.stack))
        }
    }

    warn(message) {
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('WARN')} ${chalk.yellow(message)}`)
    }

    info(message) {
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('INFO')} ${chalk.blue(message)}`)
    }

    debug(message) {
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('DEBUG')} ${chalk.gray(message)}`)
    }

    loading(message) {
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('LOADING')} ${chalk.whiteBright(message)}`)
    }

    connection(status, details = '') {
        const level = status === 'connected' ? 'SUCCESS' : status === 'disconnected' ? 'WARN' : 'CONNECTION'
        const message = `WhatsApp ${status} ${details}`.trim()
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel(level)} ${chalk.whiteBright(message)}`)
    }

    command(cmd, status, chatType, user, prefix = '.') {
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('CMD')} 🤖 ${chalk.hex("#e9c46a")(`${prefix}${cmd}`)}`)
        console.log(`${chalk.gray('   • sᴛᴀᴛᴜs:')} ${this.getCommandStatusColor(status)}`)
        console.log(`${chalk.gray('   • ᴘᴇɴɢɢᴜɴᴀ:')} ${chalk.hex("#e9c46a")(user || 'Unknown')}`)
        if (chatType) {
            console.log(`${chalk.gray('   • ᴄʜᴀᴛ:')} ${chalk.whiteBright(chatType === 'group' ? '👥 Group' : '👤 Private')}`)
        }
    }

    getCommandStatusColor(status) {
        switch (status) {
            case 'detected': return chalk.blue('ᴅᴇᴛᴇᴄᴛᴇᴅ')
            case 'success': return chalk.green('sᴜᴄᴄᴇss')
            case 'error': return chalk.red('ᴇʀʀᴏʀ')
            case 'not_found': return chalk.yellow('ɴᴏᴛ ꜰᴏᴜɴᴅ')
            default: return chalk.white(status)
        }
    }

    plugin(message, status = 'INFO') {
        const level = status === 'ERROR' ? 'ERROR' : 'PLUGIN'
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel(level)} ${chalk.yellow(message)}`)
    }

    pluginLoaded(pluginName, category) {
        const message = `Loaded "${pluginName}" [${category}]`
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('SUCCESS')} ${chalk.green(message)}`)
    }

    pluginError(pluginName, error) {
        const message = `Error in plugin "${pluginName}": ${error.message}`
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('ERROR')} ${chalk.red(message)}`)
    }

    authUpdate(status, details = '') {
        const message = `Authentication ${status} ${details}`.trim()
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('INFO')} ${chalk.blue(message)}`)
    }

    lidMigration(oldJid, newLid) {
        const message = `JID migration: ${oldJid} -> ${newLid}`
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel('INFO')} ${chalk.cyan(message)}`)
    }

    database(operation, status = 'success', details = '') {
        const level = status === 'error' ? 'ERROR' : 'INFO'
        const message = `Database ${operation} ${status} ${details}`.trim()
        console.log(`${chalk.gray(`[${this.formatTimestamp()}]`)} ${this.formatLevel(level)} ${chalk.blue(message)}`)
    }

    pairingCode(code) {
        console.log(chalk.hex("#e9c46a")('╔═══════════════════════════════════════╗'))
        console.log(chalk.hex("#e9c46a")('║') + chalk.bold.hex("#274753")('           ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ             ') + chalk.hex("#e9c46a")('║'))
        console.log(chalk.hex("#e9c46a")('║') + chalk.bold.yellow(`              ${code}              `) + chalk.hex("#e9c46a")('║'))
        console.log(chalk.hex("#e9c46a")('╚═══════════════════════════════════════╝'))
        console.log(chalk.hex("#e9c46a")('ᴍᴀsᴜᴋᴋᴀɴ ᴋᴏᴅᴇ ɪɴɪ ᴅɪ ᴡʜᴀᴛsᴀᴘᴘ: ʟɪɴᴋᴇᴅ ᴅᴇᴠɪᴄᴇs > ʟɪɴᴋ ᴀ ᴅᴇᴠɪᴄᴇ'))
    }

    separator() {
        console.log(chalk.hex("#e9c46a")('═'.repeat(60)))
    }
}

export default new Logger()
