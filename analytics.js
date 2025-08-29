// Google Analytics 4 Integration for Rijunime.Com
// Privacy-compliant analytics tracking

// Load configuration
if (typeof ANALYTICS_CONFIG === 'undefined') {
    // Fallback config if analytics-config.js not loaded
    var ANALYTICS_CONFIG = {
        MEASUREMENT_ID: 'G-XXXXXXXXXX',
        API_SECRET: 'your-api-secret-here',
        SETTINGS: { DEFAULT_ENABLED: true, PRIVACY: { RESPECT_DNT: true } }
    };
}

class RijunimeAnalytics {
    constructor() {
        this.measurementId = ANALYTICS_CONFIG.MEASUREMENT_ID;
        this.apiSecret = ANALYTICS_CONFIG.API_SECRET;
        this.clientId = null;
        this.sessionId = null;
        this.isEnabled = ANALYTICS_CONFIG.SETTINGS.DEFAULT_ENABLED;
        
        // Check Do Not Track
        if (ANALYTICS_CONFIG.SETTINGS.PRIVACY.RESPECT_DNT && 
            navigator.doNotTrack === '1') {
            this.isEnabled = false;
            console.log('Analytics disabled: Do Not Track enabled');
        }
        
        this.init();
    }

    async init() {
        // Check if analytics is enabled in user settings
        const settings = await this.getSettings();
        this.isEnabled = settings.analyticsEnabled !== false; // Default to true
        
        if (!this.isEnabled) {
            console.log('Analytics disabled by user preference');
            return;
        }

        // Generate or retrieve client ID
        await this.initializeClientId();
        
        // Generate session ID
        this.sessionId = this.generateSessionId();
        
        // Track extension installation/startup
        this.trackEvent('extension_startup', {
            version: chrome.runtime.getManifest().version,
            install_type: 'extension'
        });
    }

    async initializeClientId() {
        try {
            const result = await chrome.storage.local.get(['analytics_client_id']);
            
            if (result.analytics_client_id) {
                this.clientId = result.analytics_client_id;
            } else {
                // Generate new client ID
                this.clientId = this.generateClientId();
                await chrome.storage.local.set({ 
                    analytics_client_id: this.clientId 
                });
            }
        } catch (error) {
            console.error('Error initializing client ID:', error);
            this.clientId = this.generateClientId();
        }
    }

    generateClientId() {
        // Generate UUID v4 for client ID
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    generateSessionId() {
        return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    }

    async getSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            return result.settings || {};
        } catch (error) {
            return {};
        }
    }

    // Track events using GA4 Measurement Protocol
    async trackEvent(eventName, parameters = {}) {
        if (!this.isEnabled || !this.clientId) {
            return;
        }

        try {
            const payload = {
                client_id: this.clientId,
                events: [{
                    name: eventName,
                    params: {
                        session_id: this.sessionId,
                        engagement_time_msec: '1000',
                        ...parameters
                    }
                }]
            };

            // Use Measurement Protocol API
            const url = `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`;
            
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            console.log(`Analytics event tracked: ${eventName}`, parameters);
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }

    // Predefined tracking methods for common actions
    async trackWatchlistAdd(animeTitle) {
        await this.trackEvent('watchlist_add', {
            anime_title: animeTitle,
            action_type: 'add_to_watchlist'
        });
    }

    async trackWatchlistRemove(animeTitle) {
        await this.trackEvent('watchlist_remove', {
            anime_title: animeTitle,
            action_type: 'remove_from_watchlist'
        });
    }

    async trackFavoriteAdd(animeTitle) {
        await this.trackEvent('favorite_add', {
            anime_title: animeTitle,
            action_type: 'add_to_favorites'
        });
    }

    async trackEpisodeWatch(animeTitle, episodeNumber) {
        await this.trackEvent('episode_watch', {
            anime_title: animeTitle,
            episode_number: episodeNumber,
            action_type: 'watch_episode'
        });
    }

    async trackVideoControl(controlType) {
        await this.trackEvent('video_control', {
            control_type: controlType, // 'skip_intro', 'quality_change', etc.
            action_type: 'video_interaction'
        });
    }

    async trackPopupOpen(tabName = 'watchlist') {
        await this.trackEvent('popup_open', {
            tab_name: tabName,
            action_type: 'ui_interaction'
        });
    }

    async trackSettingsChange(settingName, settingValue) {
        await this.trackEvent('settings_change', {
            setting_name: settingName,
            setting_value: settingValue.toString(),
            action_type: 'settings_update'
        });
    }

    async trackDataExport() {
        await this.trackEvent('data_export', {
            action_type: 'data_management'
        });
    }

    async trackDataClear() {
        await this.trackEvent('data_clear', {
            action_type: 'data_management'
        });
    }

    async trackError(errorType, errorMessage) {
        await this.trackEvent('extension_error', {
            error_type: errorType,
            error_message: errorMessage,
            action_type: 'error'
        });
    }

    async trackPageView(pageName) {
        await this.trackEvent('page_view', {
            page_name: pageName,
            action_type: 'navigation'
        });
    }

    // Privacy methods
    async enableAnalytics() {
        this.isEnabled = true;
        const settings = await this.getSettings();
        settings.analyticsEnabled = true;
        await chrome.storage.local.set({ settings });
        
        await this.trackEvent('analytics_enabled', {
            action_type: 'privacy_setting'
        });
    }

    async disableAnalytics() {
        await this.trackEvent('analytics_disabled', {
            action_type: 'privacy_setting'
        });
        
        this.isEnabled = false;
        const settings = await this.getSettings();
        settings.analyticsEnabled = false;
        await chrome.storage.local.set({ settings });
    }

    async clearAnalyticsData() {
        try {
            // Clear client ID
            await chrome.storage.local.remove(['analytics_client_id']);
            this.clientId = null;
            
            // Generate new client ID if analytics is still enabled
            if (this.isEnabled) {
                await this.initializeClientId();
            }
            
            console.log('Analytics data cleared');
        } catch (error) {
            console.error('Error clearing analytics data:', error);
        }
    }

    // Get analytics status
    getStatus() {
        return {
            enabled: this.isEnabled,
            clientId: this.clientId ? this.clientId.substr(0, 8) + '...' : null,
            sessionId: this.sessionId ? this.sessionId.substr(0, 8) + '...' : null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RijunimeAnalytics;
} else if (typeof window !== 'undefined') {
    window.RijunimeAnalytics = RijunimeAnalytics;
}
