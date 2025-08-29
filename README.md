# 🦊 Rijunime Helper - Chrome Extension

Extension Chrome bergaya anime untuk meningkatkan pengalaman menonton di rijunime.com dengan berbagai fitur keren!

## 🚀 Fitur Utama

### 📺 Watchlist & Episode Tracker
- Tambah anime ke watchlist dengan mudah
- Lacak episode yang sudah ditonton
- Notifikasi episode baru
- Sinkronisasi progress antar device

### ⭐ Sistem Favorit
- Tandai anime favorit
- Akses cepat ke anime yang disukai
- Kategori dan filter khusus

### 🎮 Kontrol Video Enhanced
- Selector kualitas otomatis
- Tombol skip intro
- Progress bar yang ditingkatkan
- Kontrol keyboard tambahan

### 🌙 Pengaturan Personal
- Mode gelap
- Notifikasi yang dapat disesuaikan
- Export/import data
- Pengaturan kualitas otomatis

### 📱 Interface Modern
- Design responsif dan modern
- Animasi yang halus
- Accessibility support
- Mobile-friendly

### 📊 Analytics & Insights
- Google Analytics 4 integration
- Usage tracking (anonim & privacy-compliant)
- Error monitoring
- User dapat disable kapan saja

## 📦 Instalasi

### Metode 1: Developer Mode (Recommended)
1. Download atau clone repository ini
2. Buka Chrome dan navigasi ke `chrome://extensions/`
3. Aktifkan "Developer mode" di kanan atas
4. Klik "Load unpacked" dan pilih folder `rijunime-extension`
5. Extension akan terinstal dan siap digunakan

### Metode 2: Manual Installation
1. Download file `.crx` dari releases
2. Drag and drop file ke halaman `chrome://extensions/`
3. Konfirmasi instalasi

## 🎯 Cara Penggunaan

### Menambah ke Watchlist
1. Kunjungi halaman anime di rijunime.com
2. Klik tombol "Tambah ke Watchlist" yang muncul
3. Anime akan tersimpan di watchlist Anda

### Menggunakan Popup
1. Klik icon extension di toolbar Chrome
2. Navigasi antar tab: Watchlist, Favorit, Pengaturan
3. Klik item untuk membuka halaman anime

### Kontrol Video
- **Skip Intro**: Tombol muncul otomatis saat intro (detik 10-90)
- **Quality Selector**: Pilih kualitas video di pojok kanan atas player
- **Progress Bar**: Lihat progress di bagian bawah halaman

### Context Menu
- Klik kanan pada halaman rijunime.com
- Pilih "Tambah ke Watchlist" atau "Tandai sebagai Favorit"

## ⚙️ Pengaturan

Akses pengaturan melalui popup extension:

- **Notifikasi Episode Baru**: Aktif/nonaktifkan notifikasi
- **Pilih Kualitas Otomatis**: Otomatis pilih kualitas terbaik
- **Lewati Intro Otomatis**: Skip intro secara otomatis
- **Mode Gelap**: Aktifkan tema gelap
- **Analytics & Usage Data**: Kontrol tracking data (anonim)

## 📊 Data Management

### Export Data
1. Buka popup extension
2. Pergi ke tab "Pengaturan"
3. Klik "Export Data"
4. File JSON akan didownload

### Import Data
1. Install extension di device baru
2. Gunakan file backup untuk restore data

### Hapus Data
1. Buka tab "Pengaturan"
2. Klik "Hapus Data"
3. Konfirmasi untuk menghapus semua data

## 🔧 Pengembangan

### Struktur File
```
rijunime-extension/
├── manifest.json          # Extension manifest
├── popup.html             # Popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── content.js             # Content script (main features)
├── content.css            # Content styling
├── background.js          # Background service worker
├── icons/                 # Extension icons
└── README.md              # Documentation
```

### Tech Stack
- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: No external dependencies
- **CSS3**: Modern styling with animations
- **Chrome Storage API**: Data persistence
- **Chrome Notifications API**: System notifications

### Development Setup
1. Clone repository
2. Load extension in developer mode
3. Make changes and reload extension
4. Test on rijunime.com

## 🐛 Troubleshooting

### Extension tidak muncul
- Pastikan rijunime.com sudah dibuka
- Refresh halaman setelah install extension
- Check console untuk error messages

### Watchlist tidak tersimpan
- Pastikan permission storage diaktifkan
- Check Chrome storage quota
- Try clear extension data dan setup ulang

### Video controls tidak muncul
- Pastikan content script ter-inject
- Check CSP policy website
- Disable other video extensions

## 📝 Changelog

### v1.0.0 (Initial Release)
- ✅ Watchlist functionality
- ✅ Episode tracking
- ✅ Favorites system
- ✅ Video controls enhancement
- ✅ Dark mode support
- ✅ Notifications
- ✅ Data export/import

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail lengkap.

## 🙏 Acknowledgments

- Terima kasih kepada komunitas anime Indonesia
- Inspired by MAL-Sync dan anime tracking extensions lainnya
- Icons dari Feather Icons dan Heroicons

## 📞 Support

Jika mengalami masalah atau punya saran:
- Create issue di GitHub
- Email: support@rijunime-helper.com
- Discord: RijunimeHelper#1234

---

**Selamat menonton anime! 🍿✨**
