// Content script untuk rijunime.com
class RijunimeHelper {
    constructor() {
        this.analytics = new RijunimeAnalytics();
        this.init();
    }

    init() {
        this.addCustomStyles();
        this.addWatchlistButton();
        this.addEpisodeTracker();
        this.addQualitySelector();
        this.addSkipIntroButton();
        this.observePageChanges();
        this.loadUserSettings();
    }

    addCustomStyles() {
        if (!document.getElementById('rijunime-helper-styles')) {
            const styles = document.createElement('style');
            styles.id = 'rijunime-helper-styles';
            styles.textContent = `
                .rijunime-helper-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white !important;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    margin: 4px;
                    transition: all 0.3s ease;
                    text-decoration: none !important;
                    display: inline-block;
                }
                
                .rijunime-helper-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }
                
                .rijunime-helper-watchlist {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    background: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    max-width: 300px;
                }
                
                .rijunime-helper-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    background: #4CAF50;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    animation: slideInRight 0.3s ease;
                }
                
                .rijunime-helper-skip-intro {
                    position: absolute;
                    bottom: 80px;
                    right: 20px;
                    z-index: 1000;
                }
                
                .rijunime-helper-quality-selector {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                    background: rgba(0, 0, 0, 0.8);
                    padding: 10px;
                    border-radius: 6px;
                }
                
                .rijunime-helper-quality-selector select {
                    background: transparent;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .rijunime-helper-progress {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: rgba(102, 126, 234, 0.3);
                    z-index: 9999;
                }
                
                .rijunime-helper-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    transition: width 0.3s ease;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    addWatchlistButton() {
        // Tambahkan tombol watchlist ke halaman anime
        const animeTitle = this.getAnimeTitle();
        if (animeTitle) {
            const button = document.createElement('button');
            button.className = 'rijunime-helper-button';
            button.textContent = '+ Tambah ke Watchlist';
            button.onclick = () => this.addToWatchlist(animeTitle);
            
            // Cari tempat yang cocok untuk menempatkan tombol
            const targetElement = document.querySelector('.anime-info') || 
                                 document.querySelector('.entry-content') ||
                                 document.querySelector('.content');
            
            if (targetElement) {
                targetElement.appendChild(button);
            }
        }
    }

    addEpisodeTracker() {
        // Track episode yang sedang ditonton
        if (this.isEpisodePage()) {
            const episodeInfo = this.getEpisodeInfo();
            if (episodeInfo) {
                this.trackEpisodeProgress(episodeInfo);
                this.addProgressBar();
            }
        }
    }

    addQualitySelector() {
        // Tambahkan selector kualitas video
        const videoElement = document.querySelector('video');
        if (videoElement) {
            const qualitySelector = document.createElement('div');
            qualitySelector.className = 'rijunime-helper-quality-selector';
            qualitySelector.innerHTML = `
                <select id="quality-selector">
                    <option value="auto">Auto</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                    <option value="360p">360p</option>
                </select>
            `;
            
            videoElement.parentElement.appendChild(qualitySelector);
            
            // Event listener untuk perubahan kualitas
            document.getElementById('quality-selector').addEventListener('change', (e) => {
                this.changeVideoQuality(e.target.value);
            });
        }
    }

    addSkipIntroButton() {
        const videoElement = document.querySelector('video');
        if (videoElement) {
            const skipButton = document.createElement('button');
            skipButton.className = 'rijunime-helper-button rijunime-helper-skip-intro';
            skipButton.textContent = 'Lewati Intro';
            skipButton.style.display = 'none';
            skipButton.onclick = () => this.skipIntro();
            
            videoElement.parentElement.appendChild(skipButton);
            
            // Tampilkan tombol skip intro pada detik 10-90 (biasanya durasi intro)
            videoElement.addEventListener('timeupdate', () => {
                const currentTime = videoElement.currentTime;
                if (currentTime >= 10 && currentTime <= 90) {
                    skipButton.style.display = 'block';
                } else {
                    skipButton.style.display = 'none';
                }
            });
        }
    }

    addProgressBar() {
        if (!document.querySelector('.rijunime-helper-progress')) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'rijunime-helper-progress';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'rijunime-helper-progress-bar';
            progressBar.style.width = '0%';
            
            progressContainer.appendChild(progressBar);
            document.body.appendChild(progressContainer);
            
            // Update progress bar berdasarkan video
            const video = document.querySelector('video');
            if (video) {
                video.addEventListener('timeupdate', () => {
                    const progress = (video.currentTime / video.duration) * 100;
                    progressBar.style.width = `${progress}%`;
                });
            }
        }
    }

    observePageChanges() {
        // Observer untuk perubahan halaman (SPA)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Re-initialize jika ada perubahan besar pada DOM
                    setTimeout(() => this.init(), 1000);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Helper methods
    getAnimeTitle() {
        return document.querySelector('h1.entry-title')?.textContent?.trim() ||
               document.querySelector('.anime-title')?.textContent?.trim() ||
               document.title;
    }

    isEpisodePage() {
        return window.location.href.includes('/episode/') || 
               document.querySelector('video') !== null;
    }

    getEpisodeInfo() {
        const title = this.getAnimeTitle();
        const episode = this.extractEpisodeNumber();
        return title && episode ? { title, episode } : null;
    }

    extractEpisodeNumber() {
        const url = window.location.href;
        const episodeMatch = url.match(/episode[/-](\d+)/i);
        return episodeMatch ? episodeMatch[1] : null;
    }

    async addToWatchlist(animeTitle) {
        try {
            // Simpan ke storage
            const result = await chrome.storage.local.get(['watchlist']);
            const watchlist = result.watchlist || [];
            
            if (!watchlist.find(item => item.title === animeTitle)) {
                watchlist.push({
                    title: animeTitle,
                    url: window.location.href,
                    addedAt: new Date().toISOString()
                });
                
                await chrome.storage.local.set({ watchlist });
                this.showNotification('Berhasil ditambahkan ke watchlist!');
            } else {
                this.showNotification('Anime sudah ada di watchlist!');
            }
        } catch (error) {
            console.error('Error adding to watchlist:', error);
        }
    }

    async trackEpisodeProgress(episodeInfo) {
        try {
            const result = await chrome.storage.local.get(['episodeProgress']);
            const progress = result.episodeProgress || {};
            
            const key = `${episodeInfo.title}_${episodeInfo.episode}`;
            progress[key] = {
                ...episodeInfo,
                watchedAt: new Date().toISOString(),
                url: window.location.href
            };
            
            await chrome.storage.local.set({ episodeProgress: progress });
        } catch (error) {
            console.error('Error tracking episode:', error);
        }
    }

    async changeVideoQuality(quality) {
        // Implementasi perubahan kualitas video
        // Ini akan bergantung pada player video yang digunakan rijunime.com
        console.log(`Changing quality to: ${quality}`);
        this.showNotification(`Kualitas diubah ke: ${quality}`);
        
        // Track analytics
        await this.analytics.trackVideoControl('quality_change');
    }

    async skipIntro() {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime = 90; // Skip ke detik 90
            this.showNotification('Intro dilewati!');
            
            // Track analytics
            await this.analytics.trackVideoControl('skip_intro');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'rijunime-helper-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async loadUserSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            const settings = result.settings || {};
            
            // Apply dark mode if enabled
            if (settings.darkMode) {
                document.body.classList.add('dark-mode');
            }
            
            // Apply other settings
            this.settings = settings;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
}

// Initialize the helper when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new RijunimeHelper());
} else {
    new RijunimeHelper();
}
