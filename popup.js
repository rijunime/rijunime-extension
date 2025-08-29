// Popup script untuk Rijunime Helper
class RijunimePopup {
    constructor() {
        this.currentTab = 'watchlist';
        this.analytics = new RijunimeAnalytics();
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupTabs();
        await this.loadData();
        await this.loadSettings();
        
        // Track popup open
        await this.analytics.trackPopupOpen(this.currentTab);
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Settings checkboxes
        document.getElementById('notifications-enabled').addEventListener('change', (e) => {
            this.updateSetting('notificationsEnabled', e.target.checked);
        });

        document.getElementById('auto-quality').addEventListener('change', (e) => {
            this.updateSetting('autoQuality', e.target.checked);
        });

        document.getElementById('skip-intro').addEventListener('change', (e) => {
            this.updateSetting('skipIntro', e.target.checked);
        });

        document.getElementById('dark-mode').addEventListener('change', (e) => {
            this.updateSetting('darkMode', e.target.checked);
            this.toggleDarkMode(e.target.checked);
        });

        document.getElementById('analytics-enabled').addEventListener('change', async (e) => {
            await this.updateSetting('analyticsEnabled', e.target.checked);
            if (e.target.checked) {
                await this.analytics.enableAnalytics();
            } else {
                await this.analytics.disableAnalytics();
            }
        });

        // Action buttons
        document.getElementById('clear-data').addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('visit-site').addEventListener('click', () => {
            this.visitSite();
        });
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.style.display = 'none');

                // Add active class to clicked button and show corresponding content
                button.classList.add('active');
                const targetTab = button.dataset.tab;
                document.getElementById(targetTab).style.display = 'block';
                
                this.currentTab = targetTab;
            });
        });
    }

    async switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update UI
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = content.id === tabName ? 'block' : 'none';
        });

        // Track tab switch
        await this.analytics.trackPopupOpen(tabName);

        // Load data for the selected tab
        this.loadTabData(tabName);
    }

    async loadData() {
        await this.loadTabData(this.currentTab);
    }

    async loadTabData(tabName) {
        try {
            switch (tabName) {
                case 'watchlist':
                    await this.loadWatchlist();
                    await this.loadRecentEpisodes();
                    break;
                case 'favorites':
                    await this.loadFavorites();
                    break;
                case 'settings':
                    // Settings are loaded in loadSettings()
                    break;
            }
        } catch (error) {
            console.error('Error loading tab data:', error);
        }
    }

    async loadWatchlist() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getWatchlist' });
            if (response.success) {
                this.renderWatchlist(response.data);
            }
        } catch (error) {
            console.error('Error loading watchlist:', error);
            this.showError('watching-list', 'Gagal memuat watchlist');
        }
    }

    async loadRecentEpisodes() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getRecentEpisodes' });
            if (response.success) {
                this.renderRecentEpisodes(response.data);
            }
        } catch (error) {
            console.error('Error loading recent episodes:', error);
            this.showError('recent-episodes', 'Gagal memuat episode terbaru');
        }
    }

    async loadFavorites() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getFavorites' });
            if (response.success) {
                this.renderFavorites(response.data);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            this.showError('favorites-list', 'Gagal memuat favorit');
        }
    }

    async loadSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
            if (response.success) {
                const settings = response.data;
                
                document.getElementById('notifications-enabled').checked = settings.notificationsEnabled;
                document.getElementById('auto-quality').checked = settings.autoQuality;
                document.getElementById('skip-intro').checked = settings.skipIntro;
                document.getElementById('dark-mode').checked = settings.darkMode;
                document.getElementById('analytics-enabled').checked = settings.analyticsEnabled !== false;
                
                if (settings.darkMode) {
                    this.toggleDarkMode(true);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    renderWatchlist(watchlist) {
        const container = document.getElementById('watching-list');
        
        if (watchlist.length === 0) {
            container.innerHTML = '<div class="empty-state">Belum ada anime yang sedang ditonton</div>';
            return;
        }

        container.innerHTML = watchlist.map(anime => `
            <div class="anime-item" data-id="${anime.id}">
                <div class="anime-title">${anime.title}</div>
                <div class="anime-info">
                    Ditambahkan: ${this.formatDate(anime.addedAt)}
                    <button class="remove-btn" onclick="removeFromWatchlist('${anime.id}')">×</button>
                </div>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.anime-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-btn')) {
                    const anime = watchlist.find(a => a.id === item.dataset.id);
                    if (anime) {
                        chrome.tabs.create({ url: anime.url });
                    }
                }
            });
        });
    }

    renderRecentEpisodes(episodes) {
        const container = document.getElementById('recent-episodes');
        
        if (episodes.length === 0) {
            container.innerHTML = '<div class="empty-state">Belum ada episode yang ditonton</div>';
            return;
        }

        container.innerHTML = episodes.map(episode => `
            <div class="episode-item">
                <div class="episode-title">${episode.title} - Episode ${episode.episode}</div>
                <div class="episode-info">Ditonton: ${this.formatDate(episode.watchedAt)}</div>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.episode-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                chrome.tabs.create({ url: episodes[index].url });
            });
        });
    }

    renderFavorites(favorites) {
        const container = document.getElementById('favorites-list');
        
        if (favorites.length === 0) {
            container.innerHTML = '<div class="empty-state">Belum ada anime favorit</div>';
            return;
        }

        container.innerHTML = favorites.map(anime => `
            <div class="anime-item" data-id="${anime.id}">
                <div class="anime-title">${anime.title}</div>
                <div class="anime-info">
                    Ditambahkan: ${this.formatDate(anime.addedAt)}
                    <button class="remove-btn" onclick="removeFromFavorites('${anime.id}')">×</button>
                </div>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.anime-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('remove-btn')) {
                    const anime = favorites.find(a => a.id === item.dataset.id);
                    if (anime) {
                        chrome.tabs.create({ url: anime.url });
                    }
                }
            });
        });
    }

    async updateSetting(key, value) {
        try {
            await chrome.runtime.sendMessage({
                action: 'updateSettings',
                data: { [key]: value }
            });
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    }

    toggleDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    async clearAllData() {
        if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
            try {
                await chrome.runtime.sendMessage({ action: 'clearAllData' });
                await this.loadData();
                this.showNotification('Data berhasil dihapus');
            } catch (error) {
                console.error('Error clearing data:', error);
                this.showNotification('Gagal menghapus data');
            }
        }
    }

    async exportData() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'exportData' });
            if (response.success) {
                const dataStr = JSON.stringify(response.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `rijunime-helper-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('Data berhasil diekspor');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Gagal mengekspor data');
        }
    }

    visitSite() {
        chrome.tabs.create({ url: 'https://rijunime.com' });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        container.innerHTML = `<div class="empty-state">${message}</div>`;
    }

    showNotification(message) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 12px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for remove buttons
window.removeFromWatchlist = async function(id) {
    try {
        await chrome.runtime.sendMessage({
            action: 'removeFromWatchlist',
            data: { id }
        });
        
        // Reload watchlist
        const popup = window.rijunimePopup;
        if (popup) {
            await popup.loadWatchlist();
        }
    } catch (error) {
        console.error('Error removing from watchlist:', error);
    }
};

window.removeFromFavorites = async function(id) {
    try {
        await chrome.runtime.sendMessage({
            action: 'removeFromFavorites',
            data: { id }
        });
        
        // Reload favorites
        const popup = window.rijunimePopup;
        if (popup) {
            await popup.loadFavorites();
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
    }
};

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.rijunimePopup = new RijunimePopup();
});
