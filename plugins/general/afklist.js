export default {
    command: 'afklist',
    aliases: ['listafk', 'afkusers'],
    category: 'general',
    desc: 'Lihat daftar user yang sedang AFK',
    usage: '',
    execute: async (sock, m, { db }) => {
        const afkUsers = Object.entries(db.data.users)
            .filter(([jid, user]) => user?.afk?.status)
            .map(([jid, user]) => {
                const afkTime = new Date(user.afk.time).toLocaleString('id-ID')
                const duration = getAfkDuration(user.afk.time)
                return {
                    jid,
                    name: user.name || jid.split('@')[0],
                    reason: user.afk.reason,
                    time: afkTime,
                    duration
                }
            })
        
        if (afkUsers.length === 0) {
            await sock.sendMessage(m.chat, {
                text: '📝 *Daftar AFK*\n\n❌ Tidak ada user yang sedang AFK'
            }, { quoted: m });
            return;
        }
        
        let text = '📝 *Daftar User AFK*\n\n'
        
        afkUsers.forEach((user, index) => {
            text += `${index + 1}. @${user.jid.split('@')[0]}\n`
            text += `   📝 Alasan: ${user.reason}\n`
            text += `   ⏰ Sejak: ${user.time}\n`
            text += `   ⌛ Durasi: ${user.duration}\n\n`
        })
        
        const mentions = afkUsers.map(user => user.jid)
        
        await sock.sendMessage(m.chat, {
            text: text.trim(),
            mentions
        }, { quoted: m });
    }
};

function getAfkDuration(startTime) {
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
