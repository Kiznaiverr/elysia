# Elysia WhatsApp Bot
> Script bot WhatsApp 100% gratis yang menggunakan API dari [api.siputzx.my.id](https://api.siputzx.my.id)

## Table of Contents
- [Requirements](#requirements)
- [Server Recommendations](#server-recommendations)
- [Database](#database)
- [Configuration](#configuration)
- [Installation](#installation)
- [Pairing Code](#pairing-code)
- [Plugins](#plugins)
- [Troubleshooting](#troubleshooting)

## Requirements

- [x] Server vCPU/RAM 1/1GB (Min)
- [x] Node.js v18+
- [x] WhatsApp Account
- [x] Stable Internet Connection

## Server Recommendations

- [x] [Heroku](https://heroku.com/) (Free Tier Available)
- [x] VPS [DigitalOcean](https://digitalocean.com/)
- [x] VPS [Contabo](https://contabo.com/)
- [x] Local Computer (For Testing)

Note: Use trusted hosting providers for better stability and performance.

## Database

- [x] Local JSON (Default - No setup required)
- [x] [MongoDB](https://mongodb.com) (Optional)

## Configuration

Edit the `config.json` file to configure your bot:

```json
{
  "botSettings": {
    "botName": "Elysia",
    "prefix": ".",
    "timezone": "Asia/Jakarta",
    "pairingMode": false
  },
  "ownerSettings": {
    "number": "6281234567890",
    "name": "Owner Name"
  },
  
}
```

## Installation

```bash
$ git clone https://github.com/kiznaiverr/elysia
$ cd elysia-bot
$ npm install
$ node index.js
```

## Pairing Code

To enable pairing code authentication, edit `config.json`:

```json
{
   "pairingMode": true
}
```

## Plugins

Create new plugins in the `plugins/` folder:

```javascript
export default {
    command: 'hello',
    description: 'Say hello',
    category: 'general',
    usage: 'hello',
    cooldown: 5,
    
    async execute(context) {
        const { reply } = context
        await reply('Hello World!')
    }
}
```

### Plugin Properties

- `command`: Command name
- `description`: Command description  
- `category`: Plugin category
- `usage`: Usage example
- `cooldown`: Cooldown in seconds
- `ownerOnly`: Owner only command
- `groupOnly`: Group only command
- `execute`: Function to execute

## Troubleshooting

### Error saat install
- Pastikan Node.js sudah terinstall (versi 18+)
- Hapus folder `node_modules` dan `package-lock.json`, lalu `npm install` ulang
- Pastikan koneksi internet stabil

### Bot tidak bisa kick/promote
- Pastikan bot sudah jadi admin di grup
- Cek apakah target adalah admin (admin tidak bisa kick admin)

### Session bermasalah
- Hapus folder `sessions`
- Login ulang dengan QR code atau pairing



<p align="center">.....</p>
