# 🔑 Cara Mendapatkan API Secret untuk GA4

## ✅ Status Saat Ini
- **✅ Measurement ID**: `G-1NRCQGMJH3` (sudah dikonfigurasi)
- **⚠️ API Secret**: Perlu dikonfigurasi

## 🚀 Langkah Cepat (2 Menit)

### Step 1: Buka GA4 Dashboard
1. Kunjungi [Google Analytics](https://analytics.google.com/)
2. Pastikan Anda di property "Rijunime" yang benar

### Step 2: Navigate ke Data Stream
1. Klik **Admin** (ikon gear di kiri bawah)
2. Di kolom **Property**, klik **Data Streams**
3. Klik stream **"Rijunime"** (https://rijunime.com)

### Step 3: Buat API Secret
1. Scroll ke bagian **"Measurement Protocol API secrets"**
2. Klik tombol **"Create"**
3. Masukkan nickname: **"Rijunime Extension"**
4. Klik **"Create"**
5. **Copy secret value** yang muncul

### Step 4: Update Configuration
Edit file `analytics-config.js`:

```javascript
API_SECRET: 'paste-your-secret-here', // Ganti dengan secret yang di-copy
```

## 🧪 Test Analytics

Setelah update API Secret:

1. **Load Extension**:
   ```
   chrome://extensions/ → Load unpacked → pilih folder rijunime-extension
   ```

2. **Test Events**:
   - Klik icon extension
   - Tambah anime ke watchlist
   - Ganti tab di popup

3. **Verify di Network**:
   - Buka DevTools → Network tab
   - Cari request ke `google-analytics.com`
   - Status harus 200/204 (success)

4. **Check GA4 Realtime**:
   - Buka GA4 → Reports → Realtime
   - Dalam 1-2 menit events akan muncul

## 🎯 Events Yang Akan Ditrack

Setelah setup selesai, events berikut akan otomatis ditrack:
- `extension_startup` - Extension dimulai
- `watchlist_add` - Anime ditambah ke watchlist  
- `popup_open` - Popup dibuka
- `video_control` - Skip intro, ganti kualitas
- `settings_change` - Pengaturan diubah

## 🔒 Privacy Note

Analytics ini:
- ✅ **Anonim** - Tidak track data personal
- ✅ **User Control** - Bisa dimatikan di settings
- ✅ **Local Storage** - Client ID tersimpan lokal
- ✅ **No Cookies** - Tidak menggunakan cookies

## 📞 Troubleshooting

### API Secret Tidak Bekerja?
- Pastikan copy/paste benar (no extra spaces)
- Cek di GA4 apakah secret masih aktif
- Verify Measurement ID masih `G-1NRCQGMJH3`

### Events Tidak Muncul?
- Wait 1-2 minutes untuk realtime
- Check browser console untuk errors
- Verify network requests berhasil
- Pastikan analytics tidak disabled di settings

### CORS Errors?
- Pastikan host permissions benar di manifest.json
- Check apakah ad blocker memblock requests

---

**🎉 Setelah setup selesai, Anda akan punya analytics dashboard lengkap untuk Rijunime Helper extension!**
