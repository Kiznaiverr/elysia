import fs from 'fs/promises'
import path from 'path'
import logger from '../../lib/logger.js'

const GENSHIN_BUILD_FILE = path.join(process.cwd(), 'lib', 'genshinBuild.json')

async function resolveRedirectUrl(shortUrl) {
  try {
    const response = await fetch(shortUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      logger.info(`HTTP ${response.status} for ${shortUrl}`)
      return shortUrl 
    }
    
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.startsWith('image/')) {
      return shortUrl
    }
    
    if (contentType && contentType.includes('text/html')) {
      const html = await response.text()
      
      const refreshMatch = html.match(/meta\s+http-equiv=["']Refresh["']\s+content=["']0;\s*url=["']([^"']+)["']/i)
      if (refreshMatch) {
        const imageUrl = refreshMatch[1]
        
        try {
          const imageResponse = await fetch(imageUrl, {
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          
          if (imageResponse.ok) {
            return imageUrl
          }
        } catch (error) {
          logger.info(`Error verifying extracted URL: ${error.message}`)
        }
      }
      
      const ogImageMatch = html.match(/meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
      if (ogImageMatch) {
        const imageUrl = ogImageMatch[1]
        
        try {
          const imageResponse = await fetch(imageUrl, {
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          
          if (imageResponse.ok) {
            return imageUrl
          }
        } catch (error) {
          logger.info(`Error verifying og:image URL: ${error.message}`)
        }
      }
    }
    
    return shortUrl
    
  } catch (error) {
    logger.info(`Error resolving redirect for ${shortUrl}: ${error.message}`)
    return shortUrl 
  }
}

async function loadGenshinBuilds() {
  try {
    const data = await fs.readFile(GENSHIN_BUILD_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    logger.error('Error loading Genshin data:', error)
    throw error
  }
}

function searchCharacterBuilds(characters, searchTerm) {
  const term = searchTerm.toLowerCase().trim()
  
  if (characters[term]) {
    return { character: term, builds: characters[term] }
  }
  
  for (const [character, builds] of Object.entries(characters)) {
    if (character.includes(term) || term.includes(character)) {
      return { character, builds }
    }
  }
  
  return null
}

function searchBuildType(builds, buildTerm) {
  const term = buildTerm.toLowerCase().trim()
  
  for (const build of builds) {
    const buildType = build.buildType.toLowerCase()
    if (buildType.includes(term) || term.includes(buildType.replace(/\s+/g, ''))) {
      return build
    }
  }
  
  const termMap = {
    'melt': ['melt', 'reverse melt', 'c4 melt', 'c6 melt'],
    'freeze': ['freeze', 'mono cryo', 'c4 freeze', 'c6 freeze'],
    'support': ['support', 'off-field', 'shielder'],
    'dps': ['dps', 'on-field dps', 'driver'],
    'hyperbloom': ['hyperbloom', 'bloom'],
    'aggravate': ['aggravate', 'quicken', 'c4 aggravate', 'c6 aggravate'],
    'physical': ['physical'],
    'electro': ['electro'],
    'pyro': ['pyro'],
    'cryo': ['cryo'],
    'hydro': ['hydro'],
    'anemo': ['anemo'],
    'geo': ['geo'],
    'dendro': ['dendro'],
    'teams': ['teams', 'team'],
    'c4': ['c4', 'c4 melt', 'c4 freeze', 'c4 aggravate'],
    'c6': ['c6', 'c6 melt', 'c6 freeze', 'c6 aggravate'],
    'c2': ['c2'],
    'c1': ['c1'],
    'burgeon': ['burgeon'],
    'sunfire': ['sunfire'],
    'transformative': ['transformative'],
    'reverse': ['reverse melt'],
    'mono': ['mono'],
    'driver': ['driver'],
    'shielder': ['shielder'],
    'quickswap': ['quickswap']
  }
  
  for (const [key, variations] of Object.entries(termMap)) {
    if (variations.some(variation => term.includes(variation))) {
      for (const build of builds) {
        const buildType = build.buildType.toLowerCase()
        if (variations.some(variation => buildType.includes(variation))) {
          return build
        }
      }
    }
  }
  
  return null
}

export default {
  command: 'buildgi',
  description: 'Get Genshin Impact character build infographics or list all characters',
  category: 'media',
  usage: '<character> [build_type] | list',
  example: '.buildgi hu tao | .buildgi list',
  aliases: ['build'],
  cooldown: 5,
  
  async execute(context) {
    const { args, sock, msg } = context
    const chatId = msg.key.remoteJid
    
    // Check if user wants to see character list
    if (args[0] && args[0].toLowerCase() === 'list') {
      try {
        await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })
        
        const characters = await loadGenshinBuilds()
        const characterList = Object.keys(characters).sort()
        
        if (characterList.length === 0) {
          await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
          return sock.sendMessage(chatId, {
            text: `**No data found**\n\nNo character data available`
          }, { quoted: msg })
        }
        
        await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
        
        const characterNames = characterList.map(char => `• ${char}`).join('\n')
        
        let response = `**Genshin Impact Characters**\n\n${characterNames}\n\n`
        response += `Total: ${characterList.length} characters\n`
        response += `Usage: buildgi <character> [build_type]`
        
        return sock.sendMessage(chatId, {
          text: response
        }, { quoted: msg })
        
      } catch (error) {
        logger.error('BuildGI List Error:', error)
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
        return sock.sendMessage(chatId, {
          text: `**Error occurred**\n\nFailed to fetch character list`
        }, { quoted: msg })
      }
    }
    
    if (!args[0]) {
      return sock.sendMessage(chatId, {
        text: `Siapa karakternya?\n\n*Usage*: buildgi <character> <build_type>\n*Usage*: buildgi list\n\nContoh: buildgi ayaka dps`
      }, { quoted: msg })
    }
    
    const characterName = args[0].toLowerCase()
    const buildType = args.slice(1).join(' ').toLowerCase()
    
    try {
      await sock.sendMessage(chatId, { react: { text: '🕔', key: msg.key } })
      
      const characters = await loadGenshinBuilds()
      const result = searchCharacterBuilds(characters, characterName)
      
      if (!result) {
        await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
        return sock.sendMessage(chatId, {
          text: `*Character not found*\n\nAvailable characters:\n${Object.keys(characters).map(char => char).slice(0, 10).join('\n')}\n${Object.keys(characters).length > 10 ? `\n...and ${Object.keys(characters).length - 10} more\n\nUse "buildgi list" to see all characters` : ''}`
        }, { quoted: msg })
      }
      
      const { character, builds } = result
      
      if (buildType) {
        const specificBuild = searchBuildType(builds, buildType)
        
        if (!specificBuild) {
          await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
          const availableBuilds = builds.map((build, index) => `${index + 1}. ${build.buildType}`).join('\n')
          return sock.sendMessage(chatId, {
            text: `*Build type not found*\n\nAvailable builds for *${character}*:\n${availableBuilds}`
          }, { quoted: msg })
        }
        
        const caption = `${global.FontStyler.toSmallCaps('character')}: ${global.FontStyler.toSmallCaps(character)}\n\n*${global.FontStyler.toSmallCaps('genshin impact guide')}*\n${global.FontStyler.toSmallCaps('source: keqing mains')}`
        
        const resolvedUrl = await resolveRedirectUrl(specificBuild.url)
        
        await sock.sendMessage(chatId, {
          image: { url: resolvedUrl },
          caption: caption
        }, { quoted: msg })
        
        await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
        return
      }
      
      if (builds.length === 1) {
        const build = builds[0]
        const caption = `${global.FontStyler.toSmallCaps('character')}: ${global.FontStyler.toSmallCaps(character)}\n\n*${global.FontStyler.toSmallCaps('genshin impact guide')}*\n${global.FontStyler.toSmallCaps('source: keqing mains')}`
        
        const resolvedUrl = await resolveRedirectUrl(build.url)
        
        await sock.sendMessage(chatId, {
          image: { url: resolvedUrl },
          caption: caption
        }, { quoted: msg })
        
        await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
        return
      }
      
      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } })
      const buildList = builds.map((build, index) => `${index + 1}. ${global.FontStyler.toSmallCaps(build.buildType)}`).join('\n')
      
      return sock.sendMessage(chatId, {
        text: `*${global.FontStyler.toSmallCaps('multiple builds available')}*\n\n${global.FontStyler.toSmallCaps('character')}: ${global.FontStyler.toSmallCaps(character)}\n\n${global.FontStyler.toSmallCaps('available builds')}:\n${buildList}\n\n${global.FontStyler.toSmallCaps('usage')}: ${global.FontStyler.toSmallCaps('buildgi')} ${global.FontStyler.toSmallCaps(character)} <${global.FontStyler.toSmallCaps('build_type')}>\n${global.FontStyler.toSmallCaps('example')}: ${global.FontStyler.toSmallCaps('buildgi')} ${global.FontStyler.toSmallCaps(character)} ${global.FontStyler.toSmallCaps(builds[0].buildType.toLowerCase())}`
      }, { quoted: msg })
      
    } catch (error) {
      logger.error('BuildGI Error:', error)
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } })
      
      return sock.sendMessage(chatId, {
        text: `*${global.FontStyler.toSmallCaps('error occurred')}*\n\n${global.FontStyler.toSmallCaps('failed to load character data. please try again later.')}`
      }, { quoted: msg })
    }
  }
}
