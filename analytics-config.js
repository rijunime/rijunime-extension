// Analytics Configuration for Rijunime Helper
// Replace these values with your actual Google Analytics 4 credentials

const ANALYTICS_CONFIG = {
    // Your Google Analytics 4 Measurement ID
    // Get this from: https://analytics.google.com/ -> Admin -> Data Streams
    MEASUREMENT_ID: 'G-1NRCQGMJH3', // ✅ Updated with real GA4 Measurement ID
    
               // Your Measurement Protocol API Secret
           // Get this from: GA4 -> Admin -> Data Streams -> [Your Stream] -> Measurement Protocol -> Create
           API_SECRET: 'MzESr9KJSz-1JvTUzbk5wg', // ✅ Updated with real API Secret
    
    // Extension information
    EXTENSION_NAME: 'Rijunime.Com',
    EXTENSION_VERSION: '1.0.0',
    STREAM_NAME: 'Rijunime',
    STREAM_URL: 'https://rijunime.com',
    STREAM_ID: '12076443265',
    
    // Analytics settings
    SETTINGS: {
        // Enable/disable analytics by default
        DEFAULT_ENABLED: true,
        
        // Session timeout in minutes
        SESSION_TIMEOUT: 30,
        
        // Events to track
        TRACK_EVENTS: {
            EXTENSION_STARTUP: true,
            WATCHLIST_ACTIONS: true,
            FAVORITES_ACTIONS: true,
            VIDEO_CONTROLS: true,
            SETTINGS_CHANGES: true,
            UI_INTERACTIONS: true,
            ERRORS: true
        },
        
        // Privacy settings
        PRIVACY: {
            // Don't track personal information
            ANONYMIZE_IP: true,
            
            // Don't track anime titles (for privacy)
            ANONYMIZE_CONTENT: false,
            
            // Respect Do Not Track header
            RESPECT_DNT: true
        }
    }
};

// Setup instructions for developers
const SETUP_INSTRUCTIONS = `
🔧 SETUP GOOGLE ANALYTICS 4 untuk Rijunime Helper:

1. Buat Google Analytics 4 Property:
   - Kunjungi https://analytics.google.com/
   - Buat property baru untuk extension
   - Pilih "Web" sebagai platform

2. Dapatkan Measurement ID:
   - Pergi ke Admin -> Data Streams
   - Klik stream Anda
   - Copy "Measurement ID" (format: G-XXXXXXXXXX)

3. Buat API Secret:
   - Di halaman stream yang sama
   - Scroll ke "Measurement Protocol API secrets"
   - Klik "Create" dan beri nama
   - Copy secret value

4. Update Configuration:
   - Ganti MEASUREMENT_ID di file ini
   - Ganti API_SECRET di file ini

5. Test Analytics:
   - Install extension dalam developer mode
   - Buka Chrome DevTools -> Network
   - Gunakan extension dan cek request ke google-analytics.com

6. Verify Data:
   - Buka GA4 dashboard
   - Pergi ke Reports -> Realtime
   - Cek apakah events muncul

📊 EVENTS YANG DITRACK:
- extension_startup: Extension dimulai
- watchlist_add/remove: Aksi watchlist
- favorite_add: Tambah favorit
- episode_watch: Menonton episode
- video_control: Skip intro, ganti kualitas
- popup_open: Buka popup extension
- settings_change: Ubah pengaturan
- data_export/clear: Manajemen data
- extension_error: Error tracking

🔒 PRIVACY COMPLIANCE:
- Semua data bersifat anonim
- User dapat disable analytics
- Respect Do Not Track
- Tidak track informasi personal
- Data disimpan sesuai kebijakan Google

⚠️  PENTING:
- Jangan commit file ini dengan credentials asli
- Gunakan environment variables untuk production
- Test di development environment dulu
- Pastikan comply dengan privacy laws
`;

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ANALYTICS_CONFIG, SETUP_INSTRUCTIONS };
} else if (typeof window !== 'undefined') {
    window.ANALYTICS_CONFIG = ANALYTICS_CONFIG;
    window.SETUP_INSTRUCTIONS = SETUP_INSTRUCTIONS;
}

// Log setup instructions in development
if (ANALYTICS_CONFIG.API_SECRET === 'your-api-secret-here') {
    console.log('⚠️  GA4 Measurement ID configured: ' + ANALYTICS_CONFIG.MEASUREMENT_ID);
    console.log('🔑 Next step: Configure API_SECRET in analytics-config.js');
    console.log('📖 See ANALYTICS_SETUP.md for detailed instructions');
}
