# Batik Pools - Secure Lottery System

Batik Pools adalah sistem lottery yang aman dan terpercaya dengan brand Indonesia, menggunakan teknologi kriptografi modern untuk memastikan keadilan dan transparansi penuh.

## 🛡️ Fitur Keamanan

- **Generasi Acak Kriptografis**: Menggunakan multiple entropy sources dengan SHA-512
- **Provably Fair System**: Seed verification untuk transparansi penuh
- **Digital Signatures**: RSA-SHA256 untuk mencegah pemalsuan hasil
- **Enkripsi Data**: AES-256-GCM untuk melindungi informasi sensitif
- **Audit Trail**: Complete logging untuk semua transaksi
- **Rate Limiting**: Perlindungan dari abuse dan DDoS

## 🎮 Fitur Utama

- **Multiple Bet Types**: 2D, 3D, dan 4D betting
- **Real-time Statistics**: Dashboard analytics lengkap
- **Bet History**: Riwayat taruhan lengkap
- **Secure Transactions**: Atomic database operations
- **Verification Tools**: Alat verifikasi independen
- **Responsive Design**: Mobile-friendly interface

## 🏗️ Teknologi Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dapat diupgrade ke PostgreSQL/MySQL)
- **Security**: Node.js Crypto, RSA-2048, AES-256-GCM
- **Styling**: Tailwind CSS dengan tema batik Indonesia

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
npm run db:push
```

3. Start development server:
```bash
npm run dev
```

4. Buka [http://localhost:3000](http://localhost:3000)

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── api/lottery/          # API endpoints
│   │   ├── bet/             # Betting API
│   │   ├── draw/            # Draw generation API
│   │   ├── stats/           # Statistics API
│   │   └── verify/          # Verification API
│   ├── security/            # Security & verification page
│   └── page.tsx             # Main application
├── components/ui/           # shadcn/ui components
├── lib/
│   ├── crypto-lotto.ts      # Cryptographic utilities
│   ├── rate-limiter.ts      # Rate limiting system
│   └── db.ts               # Database connection
└── prisma/
    └── schema.prisma        # Database schema
```

## 🔐 Sistem Keamanan

### Provably Fair System
1. **Seed Generation**: Setiap undian menggunakan cryptographically secure random seed
2. **Hash Publication**: Hash seed dipublikasikan sebelum undian
3. **Result Generation**: Angka dihasilkan dari seed menggunakan SHA-512
4. **Digital Signature**: Hasil ditandatangani dengan RSA-2048
5. **Verification**: Siapa pun dapat memverifikasi keaslian hasil

### Enkripsi Data
- **Bet Data**: Dienkripsi dengan AES-256-GCM
- **User Information**: Perlindungan data sensitif
- **Audit Logs**: Complete transaction logging

## 🎯 Cara Bermain

1. **Pilih Jenis Taruhan**: 2D, 3D, atau 4D
2. **Pilih Angka**: Klik angka 0-9 sesuai jenis taruhan
3. **Masukkan Jumlah**: Minimal Rp 10.000
4. **Konfirmasi Taruhan**: Review dan konfirmasi taruhan
5. **Tunggu Hasil**: Undian dilakukan setiap jam
6. **Cek Hasil**: Lihat hasil di halaman utama atau riwayat

## 📊 API Endpoints

### Betting
- `POST /api/lottery/bet` - Pasang taruhan
- `GET /api/lottery/bet?userId=xxx` - Get riwayat taruhan

### Draw
- `POST /api/lottery/draw` - Generate hasil undian
- `GET /api/lottery/draw` - Get hasil terakhir

### Statistics
- `GET /api/lottery/stats` - Get statistik lengkap

### Verification
- `POST /api/lottery/verify` - Verifikasi hasil
- `GET /api/lottery/verify` - Get info keamanan

## 🏆 Pembayaran

- **2D**: 50x lipat taruhan
- **3D**: 400x lipat taruhan  
- **4D**: 3000x lipat taruhan

## 🛠️ Environment Variables

```env
DATABASE_URL="file:./dev.db"
ENCRYPTION_KEY="your-32-byte-hex-key"
```

## 🔒 Rate Limiting

- **Betting**: 10 requests per minute
- **Draw**: 5 requests per 5 minutes
- **Statistics**: 30 requests per minute
- **Verification**: 20 requests per minute

## 📈 Monitoring

- Real-time statistics dashboard
- Security metrics
- User activity tracking
- Performance monitoring

## 🧪 Testing

```bash
npm run lint        # Code quality check
npm run build       # Production build
npm run dev         # Development server
```

## 📝 License

MIT License - Lihat file [LICENSE](LICENSE) untuk detail

## 🤝 Kontribusi

Contributions are welcome! Silakan:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push ke branch
5. Create Pull Request

## 📞 Support

Untuk pertanyaan atau support:
- Email: support@batikpools.com
- Website: [https://batikpools.com](https://batikpools.com)

---

**⚠️ Peringatan**: Ini adalah aplikasi demo. Untuk production use, pastikan:
- Menggunakan environment variables yang aman
- Database production-grade (PostgreSQL/MySQL)
- Proper SSL certificates
- Security audit reguler
- Compliance dengan regulasi lokal