// Background script untuk Rijunime.Com
// Import analytics (will be loaded via importScripts in service worker)
importScripts('analytics-config.js', 'analytics.js');

class RijunimeBackground {
    constructor() {
        this.analytics = new RijunimeAnalytics();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNotifications();
        this.setupContextMenus();
        this.checkForUpdates();
    }

    setupEventListeners() {
        // Event listener untuk installation
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.onFirstInstall();
            } else if (details.reason === 'update') {
                this.onUpdate(details.previousVersion);
            }
        });

        // Event listener untuk pesan dari content script dan popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Event listener untuk perubahan storage
        chrome.storage.onChanged.addListener((changes, namespace) => {
            this.handleStorageChange(changes, namespace);
        });

        // Event listener untuk tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url?.includes('rijunime.com')) {
                this.handleRijunimePageLoad(tabId, tab);
            }
        });
    }

    setupNotifications() {
        // Setup notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    setupContextMenus() {
        // Buat context menu untuk rijunime.com
        chrome.contextMenus.create({
            id: 'add-to-watchlist',
            title: 'Tambah ke Watchlist',
            contexts: ['page', 'link'],
            documentUrlPatterns: ['*://rijunime.com/*', '*://*.rijunime.com/*']
        });

        chrome.contextMenus.create({
            id: 'mark-as-favorite',
            title: 'Tandai sebagai Favorit',
            contexts: ['page', 'link'],
            documentUrlPatterns: ['*://rijunime.com/*', '*://*.rijunime.com/*']
        });

        // Event listener untuk context menu
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    async onFirstInstall() {
        // Setup default settings
        const defaultSettings = {
            notificationsEnabled: true,
            autoQuality: true,
            skipIntro: true,
            darkMode: false
        };

        await chrome.storage.local.set({ 
            settings: defaultSettings,
            watchlist: [],
            favorites: [],
            episodeProgress: {}
        });

        // Buka welcome page
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
    }

    async onUpdate(previousVersion) {
        console.log(`Updated from version ${previousVersion} to ${chrome.runtime.getManifest().version}`);
        
        // Migration logic jika diperlukan
        await this.migrateData(previousVersion);
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'getWatchlist':
                    const watchlist = await this.getWatchlist();
                    sendResponse({ success: true, data: watchlist });
                    break;

                case 'getFavorites':
                    const favorites = await this.getFavorites();
                    sendResponse({ success: true, data: favorites });
                    break;

                case 'getRecentEpisodes':
                    const episodes = await this.getRecentEpisodes();
                    sendResponse({ success: true, data: episodes });
                    break;

                case 'addToWatchlist':
                    await this.addToWatchlist(request.data);
                    sendResponse({ success: true });
                    break;

                case 'removeFromWatchlist':
                    await this.removeFromWatchlist(request.data.id);
                    sendResponse({ success: true });
                    break;

                case 'addToFavorites':
                    await this.addToFavorites(request.data);
                    sendResponse({ success: true });
                    break;

                case 'updateSettings':
                    await this.updateSettings(request.data);
                    sendResponse({ success: true });
                    break;

                case 'getSettings':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, data: settings });
                    break;

                case 'clearAllData':
                    await this.clearAllData();
                    sendResponse({ success: true });
                    break;

                case 'exportData':
                    const exportData = await this.exportData();
                    sendResponse({ success: true, data: exportData });
                    break;

                case 'checkForNewEpisodes':
                    await this.checkForNewEpisodes();
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async handleStorageChange(changes, namespace) {
        // Handle storage changes untuk sinkronisasi
        if (namespace === 'local') {
            if (changes.watchlist) {
                this.updateBadge();
            }
        }
    }

    async handleRijunimePageLoad(tabId, tab) {
        // Update badge dengan jumlah item di watchlist
        await this.updateBadge();
        
        // Check jika ini halaman episode baru dari watchlist
        await this.checkNewEpisodeFromWatchlist(tab.url);
    }

    async handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case 'add-to-watchlist':
                await this.addToWatchlistFromContext(tab);
                break;
            case 'mark-as-favorite':
                await this.addToFavoritesFromContext(tab);
                break;
        }
    }

    // Data management methods
    async getWatchlist() {
        const result = await chrome.storage.local.get(['watchlist']);
        return result.watchlist || [];
    }

    async getFavorites() {
        const result = await chrome.storage.local.get(['favorites']);
        return result.favorites || [];
    }

    async getRecentEpisodes() {
        const result = await chrome.storage.local.get(['episodeProgress']);
        const progress = result.episodeProgress || {};
        
        return Object.values(progress)
            .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
            .slice(0, 10);
    }

    async addToWatchlist(anime) {
        const watchlist = await this.getWatchlist();
        
        if (!watchlist.find(item => item.url === anime.url)) {
            watchlist.push({
                ...anime,
                id: Date.now().toString(),
                addedAt: new Date().toISOString()
            });
            
            await chrome.storage.local.set({ watchlist });
            await this.updateBadge();
            
            // Track analytics
            await this.analytics.trackWatchlistAdd(anime.title);
            
            // Send notification
            if (await this.isNotificationsEnabled()) {
                this.sendNotification('Watchlist Updated', `${anime.title} ditambahkan ke watchlist`);
            }
        }
    }

    async removeFromWatchlist(id) {
        const watchlist = await this.getWatchlist();
        const itemToRemove = watchlist.find(item => item.id === id);
        const filtered = watchlist.filter(item => item.id !== id);
        
        await chrome.storage.local.set({ watchlist: filtered });
        await this.updateBadge();
        
        // Track analytics
        if (itemToRemove) {
            await this.analytics.trackWatchlistRemove(itemToRemove.title);
        }
    }

    async addToFavorites(anime) {
        const favorites = await this.getFavorites();
        
        if (!favorites.find(item => item.url === anime.url)) {
            favorites.push({
                ...anime,
                id: Date.now().toString(),
                addedAt: new Date().toISOString()
            });
            
            await chrome.storage.local.set({ favorites });
            
            // Track analytics
            await this.analytics.trackFavoriteAdd(anime.title);
        }
    }

    async getSettings() {
        const result = await chrome.storage.local.get(['settings']);
        return result.settings || {
            notificationsEnabled: true,
            autoQuality: true,
            skipIntro: true,
            darkMode: false
        };
    }

    async updateSettings(newSettings) {
        const currentSettings = await this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        
        await chrome.storage.local.set({ settings: updatedSettings });
    }

    async clearAllData() {
        await chrome.storage.local.clear();
        await this.onFirstInstall(); // Reset to defaults
    }

    async exportData() {
        const data = await chrome.storage.local.get(null);
        return {
            exportedAt: new Date().toISOString(),
            version: chrome.runtime.getManifest().version,
            data: data
        };
    }

    // Utility methods
    async updateBadge() {
        const watchlist = await this.getWatchlist();
        const count = watchlist.length;
        
        chrome.action.setBadgeText({
            text: count > 0 ? count.toString() : ''
        });
        
        chrome.action.setBadgeBackgroundColor({
            color: '#667eea'
        });
    }

    async isNotificationsEnabled() {
        const settings = await this.getSettings();
        return settings.notificationsEnabled && Notification.permission === 'granted';
    }

    sendNotification(title, message) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message
        });
    }

    async addToWatchlistFromContext(tab) {
        const anime = {
            title: tab.title,
            url: tab.url
        };
        
        await this.addToWatchlist(anime);
    }

    async addToFavoritesFromContext(tab) {
        const anime = {
            title: tab.title,
            url: tab.url
        };
        
        await this.addToFavorites(anime);
    }

    async checkNewEpisodeFromWatchlist(url) {
        const watchlist = await this.getWatchlist();
        
        // Check if current page is an episode from watchlist
        const matchingAnime = watchlist.find(anime => 
            url.includes(anime.title.toLowerCase().replace(/\s+/g, '-')) ||
            url.includes(anime.url)
        );
        
        if (matchingAnime && url.includes('/episode/')) {
            if (await this.isNotificationsEnabled()) {
                this.sendNotification(
                    'Episode Baru!', 
                    `Episode baru dari ${matchingAnime.title} tersedia`
                );
            }
        }
    }

    async checkForNewEpisodes() {
        // Implementasi untuk check episode baru secara berkala
        const watchlist = await this.getWatchlist();
        
        for (const anime of watchlist) {
            // Logic untuk check episode baru
            // Ini bisa menggunakan RSS feed atau scraping
        }
    }

    async checkForUpdates() {
        // Setup periodic check for new episodes (setiap 30 menit)
        chrome.alarms.create('checkEpisodes', { periodInMinutes: 30 });
        
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'checkEpisodes') {
                this.checkForNewEpisodes();
            }
        });
    }

    async migrateData(previousVersion) {
        // Migration logic untuk versi yang berbeda
        console.log(`Migrating data from version ${previousVersion}`);
    }
}

// Initialize background script
new RijunimeBackground();
