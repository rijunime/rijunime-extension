# 📊 Google Analytics 4 Setup Guide - Rijunime Helper

Panduan lengkap untuk mengintegrasikan Google Analytics 4 dengan extension Rijunime Helper.

## 🎯 Mengapa Google Analytics?

Google Analytics membantu Anda memahami:
- 📈 **Usage Patterns**: Bagaimana user menggunakan extension
- 🎬 **Popular Features**: Fitur mana yang paling sering digunakan  
- 🐛 **Error Tracking**: Masalah yang dialami user
- 📱 **User Journey**: Flow penggunaan extension
- 📊 **Performance Metrics**: Engagement dan retention

## 🚀 Quick Setup (5 Menit)

### Step 1: Buat Google Analytics 4 Property
1. Kunjungi [Google Analytics](https://analytics.google.com/)
2. Klik "Create Account" atau gunakan account existing
3. Buat Property baru dengan nama "Rijunime Helper"
4. Pilih timezone dan currency
5. Pilih "Web" sebagai platform

### Step 2: Dapatkan Credentials
1. **Measurement ID**:
   - Pergi ke Admin → Data Streams
   - Klik stream Anda
   - Copy "Measurement ID" (format: `G-XXXXXXXXXX`)

2. **API Secret**:
   - Di halaman stream yang sama
   - Scroll ke "Measurement Protocol API secrets"
   - Klik "Create" dan beri nama "Rijunime Extension"
   - Copy secret value

### Step 3: Update Configuration
Edit file `analytics-config.js`:

```javascript
const ANALYTICS_CONFIG = {
    MEASUREMENT_ID: 'G-XXXXXXXXXX', // Ganti dengan ID Anda
    API_SECRET: 'your-api-secret',   // Ganti dengan secret Anda
    // ... rest of config
};
```

### Step 4: Test Integration
1. Load extension dalam developer mode
2. Buka Chrome DevTools → Network tab
3. Gunakan extension (tambah ke watchlist, dll)
4. Cek request ke `google-analytics.com`
5. Verify di GA4 Realtime reports

## 📋 Events Yang Ditrack

### 🎬 User Actions
- **`watchlist_add`**: Anime ditambah ke watchlist
- **`watchlist_remove`**: Anime dihapus dari watchlist  
- **`favorite_add`**: Anime ditambah ke favorit
- **`episode_watch`**: Episode ditonton/dilacak

### 🎮 Video Controls
- **`video_control`**: Skip intro, ganti kualitas video
- **`skip_intro`**: Spesifik untuk skip intro
- **`quality_change`**: Ganti kualitas video

### 🖱️ UI Interactions
- **`popup_open`**: Popup extension dibuka
- **`tab_switch`**: Ganti tab di popup
- **`settings_change`**: Pengaturan diubah

### 💾 Data Management  
- **`data_export`**: Data di-export
- **`data_clear`**: Data dihapus
- **`analytics_enabled/disabled`**: Analytics diaktifkan/nonaktifkan

### 🚀 System Events
- **`extension_startup`**: Extension dimulai
- **`extension_error`**: Error terjadi

## 📊 Custom Dimensions & Metrics

### Dimensions
- **`anime_title`**: Judul anime (dapat dianonimkan)
- **`episode_number`**: Nomor episode
- **`control_type`**: Jenis kontrol video
- **`tab_name`**: Tab yang dibuka
- **`setting_name`**: Pengaturan yang diubah
- **`error_type`**: Jenis error

### Metrics
- **`engagement_time_msec`**: Waktu engagement
- **`session_id`**: ID sesi unik
- **`extension_version`**: Versi extension

## 🔒 Privacy & Compliance

### Privacy Features
✅ **User Control**: User dapat disable analytics  
✅ **Anonymous Data**: Tidak track informasi personal  
✅ **Do Not Track**: Respect DNT header  
✅ **Local Storage**: Client ID tersimpan lokal  
✅ **No Cookies**: Tidak menggunakan cookies  

### GDPR Compliance
- User consent melalui settings
- Data dapat dihapus kapan saja
- Transparent tentang data yang dikumpulkan
- Opt-out tersedia

### Data Anonymization
```javascript
// Contoh: Anonymize anime titles jika diperlukan
PRIVACY: {
    ANONYMIZE_CONTENT: true, // Hash anime titles
    ANONYMIZE_IP: true,      // Anonymize IP addresses
    RESPECT_DNT: true        // Respect Do Not Track
}
```

## 📈 Dashboard & Reports

### Recommended GA4 Reports
1. **Realtime**: Monitor activity langsung
2. **Events**: Lihat semua tracked events
3. **User Engagement**: Session duration, page views
4. **Conversions**: Setup goals untuk key actions

### Custom Reports
Buat custom reports untuk:
- Most watched anime
- Feature usage frequency  
- Error rates by version
- User retention metrics

### Sample Queries (GA4 Explore)
```sql
-- Top anime yang ditambah ke watchlist
SELECT anime_title, COUNT(*) as adds
FROM events 
WHERE event_name = 'watchlist_add'
GROUP BY anime_title
ORDER BY adds DESC
LIMIT 10

-- Feature usage breakdown
SELECT control_type, COUNT(*) as usage
FROM events
WHERE event_name = 'video_control' 
GROUP BY control_type
```

## 🛠️ Advanced Configuration

### Environment-based Config
```javascript
// Production
const PROD_CONFIG = {
    MEASUREMENT_ID: 'G-PROD12345',
    API_SECRET: 'prod-secret'
};

// Development  
const DEV_CONFIG = {
    MEASUREMENT_ID: 'G-DEV12345', 
    API_SECRET: 'dev-secret'
};

const ANALYTICS_CONFIG = isDevelopment ? DEV_CONFIG : PROD_CONFIG;
```

### Custom Event Parameters
```javascript
// Tambah parameter custom
await analytics.trackEvent('custom_action', {
    custom_param_1: 'value1',
    custom_param_2: 123,
    user_properties: {
        user_type: 'premium',
        install_date: '2024-01-01'
    }
});
```

### Error Tracking Enhanced
```javascript
// Track JavaScript errors
window.addEventListener('error', async (e) => {
    await analytics.trackError('javascript_error', {
        error_message: e.message,
        filename: e.filename,
        line_number: e.lineno,
        stack_trace: e.error?.stack
    });
});
```

## 🔧 Troubleshooting

### Common Issues

**1. Events tidak muncul di GA4**
- Cek Measurement ID dan API Secret
- Verify network requests di DevTools
- Pastikan tidak ada ad blocker
- Cek GA4 Realtime (delay 24-48 jam untuk standard reports)

**2. CORS Errors**
- Pastikan host permissions sudah benar di manifest.json
- Cek apakah analytics.google.com accessible

**3. Analytics Disabled**
- User bisa disable via settings
- Do Not Track browser setting
- Check console untuk error messages

### Debug Mode
```javascript
// Enable debug logging
const analytics = new RijunimeAnalytics();
analytics.debugMode = true; // Log semua events ke console
```

### Testing Checklist
- [ ] Measurement ID dan API Secret benar
- [ ] Network requests berhasil (200 status)
- [ ] Events muncul di GA4 Realtime
- [ ] User dapat disable analytics
- [ ] Privacy settings berfungsi
- [ ] Error tracking bekerja

## 📚 Resources

- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Chrome Extension Analytics Best Practices](https://developer.chrome.com/docs/extensions/mv3/analytics/)
- [Privacy Policy Template](https://www.termsfeed.com/privacy-policy-generator/)

## 🎯 Next Steps

Setelah setup:
1. Monitor analytics untuk 1-2 minggu
2. Buat custom dashboards
3. Setup alerts untuk errors
4. Analyze user behavior patterns
5. Optimize features berdasarkan data

---

**🔒 Remember**: Selalu prioritaskan privacy user dan comply dengan regulations yang berlaku!
