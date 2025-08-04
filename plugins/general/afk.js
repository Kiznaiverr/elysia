export default {
    command: 'afk',
    aliases: ['away', 'awayfromkeyboard'],
    category: 'general',
    desc: 'Set status AFK',
    usage: 'reason',
    execute: async (sock, m, { args, db }) => {
        const reason = args.join(' ') || 'tanpa alasan';
        const user = m.sender;
        const now = Date.now();
        
        if (!db.data.users[user]) {
            db.data.users[user] = {};
        }
        
        db.data.users[user].afk = {
            status: true,
            reason: reason,
            time: now
        };
        
        await db.write();
        
        const timeStr = new Date(now).toLocaleString('id-ID');
        await sock.sendMessage(m.chat, {
            text: `📴 *AFK Status*\n\n✅ Anda sekarang dalam mode AFK\n📝 Alasan: ${reason}\n⏰ Waktu: ${timeStr}\n\n_Bot akan memberitahu orang yang mention anda bahwa anda sedang AFK_`
        }, { quoted: m });
    }
};
