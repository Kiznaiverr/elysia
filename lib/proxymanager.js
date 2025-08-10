import fs from 'fs'
import path from 'path'
import axios from 'axios'

/**
 * Proxy Manager untuk mengelola proxy rotation dan user agent rotation
 */
class ProxyManager {
    constructor() {
        this.proxies = []
        this.currentProxyIndex = 0
        this.currentUserAgentIndex = 0
        this.proxyCache = path.join('cache', 'proxies.json')
        this.lastProxyUpdate = 0
        this.proxyUpdateInterval = 5 * 60 * 1000 // 5 minutes
        
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
        ]
        
        this.initializeCache()
    }

    /**
     * Initialize cache directory and load proxies
     */
    async initializeCache() {
        try {
            if (!fs.existsSync('cache')) {
                fs.mkdirSync('cache', { recursive: true })
            }
            await this.loadProxies()
        } catch (error) {
            console.error('Failed to initialize cache:', error)
        }
    }

    /**
     * Fetch fresh proxies from API
     */
    async fetchProxies() {
        try {
            const response = await axios.get('https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=json', {
                timeout: 10000
            })
            
            if (response.data && Array.isArray(response.data.proxies)) {
                const aliveProxies = response.data.proxies.filter(proxy => proxy.alive)
                this.proxies = aliveProxies
                this.lastProxyUpdate = Date.now()
                
                // Save to cache
                fs.writeFileSync(this.proxyCache, JSON.stringify({
                    proxies: this.proxies,
                    lastUpdate: this.lastProxyUpdate
                }))
                
                console.log(`Loaded ${this.proxies.length} alive proxies`)
                return true
            }
        } catch (error) {
            console.error('Failed to fetch proxies:', error)
            return false
        }
    }

    /**
     * Load proxies from cache or fetch new ones
     */
    async loadProxies() {
        try {
            if (fs.existsSync(this.proxyCache)) {
                const cache = JSON.parse(fs.readFileSync(this.proxyCache, 'utf8'))
                const cacheAge = Date.now() - cache.lastUpdate
                
                if (cacheAge < this.proxyUpdateInterval && cache.proxies?.length > 0) {
                    this.proxies = cache.proxies
                    this.lastProxyUpdate = cache.lastUpdate
                    console.log(`Loaded ${this.proxies.length} proxies from cache`)
                    return
                }
            }
        } catch (error) {
            console.error('Failed to load proxy cache:', error)
        }
        
        // Fetch fresh proxies
        await this.fetchProxies()
    }

    /**
     * Get next proxy with rotation
     */
    async getNextProxy() {
        // Check if we need to refresh proxies
        if (Date.now() - this.lastProxyUpdate > this.proxyUpdateInterval) {
            await this.loadProxies()
        }
        
        if (this.proxies.length === 0) {
            return null
        }
        
        const proxy = this.proxies[this.currentProxyIndex]
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length
        return proxy
    }

    /**
     * Get next user agent with rotation
     */
    getNextUserAgent() {
        const userAgent = this.userAgents[this.currentUserAgentIndex]
        this.currentUserAgentIndex = (this.currentUserAgentIndex + 1) % this.userAgents.length
        return userAgent
    }

    /**
     * Create client config with proxy and user agent
     */
    async createClientConfig() {
        const proxy = await this.getNextProxy()
        const userAgent = this.getNextUserAgent()
        
        const config = {
            headers: {
                'User-Agent': userAgent
            }
        }
        
        if (proxy) {
            config.proxy = {
                protocol: proxy.protocol.replace('://', ''),
                host: proxy.ip,
                port: proxy.port
            }
            console.log(`Using proxy: ${proxy.proxy} with UA: ${userAgent.substring(0, 50)}...`)
        }
        
        return config
    }

    /**
     * Get proxy statistics
     */
    getStats() {
        return {
            totalProxies: this.proxies.length,
            currentProxyIndex: this.currentProxyIndex,
            currentUserAgentIndex: this.currentUserAgentIndex,
            lastUpdate: this.lastProxyUpdate,
            cacheAge: Date.now() - this.lastProxyUpdate
        }
    }

    /**
     * Get proxy distribution by country
     */
    getProxyDistribution() {
        const countries = {}
        this.proxies.forEach(proxy => {
            const country = proxy.ip_data?.country || 'Unknown'
            countries[country] = (countries[country] || 0) + 1
        })
        return countries
    }
}

// Export singleton instance
const proxyManager = new ProxyManager()
export default proxyManager

// Also export the class for custom instances
export { ProxyManager }
