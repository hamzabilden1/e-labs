# E-LabS - Sanal Deney Laboratuvarı 🔬

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web-orange.svg)
![Status](https://img.shields.io/badge/status-Active-green.svg)

**E-LabS**, lise öğrencileri için tasarlanmış, biyolojik ve fiziksel süreçleri 3D/2D simüle eden, değişkenleri gerçek zamanlı manipüle etmenize ve sonuçları anlık gözlemlemenize olanak tanıyan interaktif bir web platformudur.

Bu proje, öğrencilerin teorik bilgilerini pratik simülasyonlarla pekiştirmelerini sağlamak amacıyla geliştirilmiştir. Google AI Studio tabanlı AI entegrasyonu ile sanal bir laboratuvar asistanı, otomatik rapor üretimi ve kapsamlı anket sistemi sunar.

## 🌟 Özellikler

* **İnteraktif 2D & 3D Simülasyonlar:** Değişkenleri (sıcaklık, pH, ışık vb.) değiştirerek deney sonuçlarını anlık izleyin.
* **Gerçek Zamanlı Veri Analizi:** Deney sırasında oluşan verileri anlık grafikler ve tablolar halinde görüntüleyin.
* **Yapay Zeka Asistanı (Google AI Studio):** Deneyler hakkında sorular sorun, kavramları öğrenin. Google Gemma 4 31B (`gemma-4-31b-it`) modeli kullanılır.
* **Otomatik Raporlama:** Deney sonuçlarını Markdown formatında raporlayın ve indirin veya AI Prompt olarak dışa aktarın.
* **KVKK Uyumlu Anket Sistemi:** Rol bazlı akıllı tetikleyici anket; veriler Firebase Firestore'a kaydedilir.
* **Firebase Analytics:** Deney ve kullanıcı etkileşimleri anonim olarak izlenir.
* **Güvenlik & Obfüskasyon:** Çekirdek motorlar (`engine.js`, `simulation3d.js`) JavaScript Obfuscator ile korunmaktadır.
* **Modern Arayüz:** Glassmorphism tasarımı, Tailwind CSS, Canvas ve Three.js animasyonları ile görsel zenginlik.
* **Hız Modu:** Yavaş (animasyonlu) ve hızlı (anlık geçiş) mod desteği.

## 🧪 Mevcut Deneyler

Sistem içerisinde şu an **11 farklı** deney modülü bulunmaktadır:

| # | Deney | Konu |
|---|-------|------|
| 1 | 🫀 Karaciğer Katalizörü | Enzim Aktivitesi |
| 2 | 💧 Suyun Özellikleri | Temel Kimya |
| 3 | 🧫 Diyaliz Torbası | Madde Geçişleri |
| 4 | 🫧 Difüzyon | Madde Geçişleri |
| 5 | 🌿 Fotosentez Fabrikası | Biyo-enerjetik |
| 6 | 🧪 Enzim Kinetiği | Enzimler |
| 7 | 🍞 Fermantasyon | Biyo-enerjetik |
| 8 | 🔬 Hücresel Solunum | Biyo-enerjetik |
| 9 | 🌊 Osmosis & Difüzyon | Madde Geçişleri |
| 10 | ❤️ Homeostasi | Sistemler & Denge |
| 11 | 🌧️ Asit Yağmuru | Ekoloji & Çevre |

## 🛠️ Teknolojiler

| Teknoloji | Amaç |
|-----------|------|
| HTML5 & CSS3 | Yapı ve stil |
| JavaScript (Vanilla) | Uygulama mantığı |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first stil |
| [Three.js](https://threejs.org/) | 3D simülasyon motoru |
| [Chart.js](https://www.chartjs.org/) | Gerçek zamanlı grafikler |
| [KaTeX](https://katex.org/) | Matematiksel formüller |
| [Marked.js](https://marked.js.org/) | Markdown render |
| [Google AI Studio API](https://aistudio.google.com/) | AI asistanı & Rapor üretici (`gemma-4-31b-it`) |
| [Firebase / Firestore](https://firebase.google.com/) | Anket & analytics verisi |
| [JavaScript Obfuscator](https://obfuscator.io/) | Kaynak kod koruması |

## 🚀 Kurulum ve Kullanım

Proje herhangi bir sunucu kurulumu gerektirmez, doğrudan tarayıcı üzerinde çalışır.

1. Bu depoyu klonlayın:
    ```bash
    git clone https://github.com/hamzabilden1/e-labs.git
    cd e-labs
    ```
2. `index.html` dosyasını tarayıcınızda açın **ya da** yerel sunucu başlatın:
    ```bash
    npm install
    npm run dev
    ```

### 🔒 Güvenlik Notu

Çekirdek motor dosyaları (`js/engine.js`, `js/simulation3d.js`) obfüske edilmiş haldedir. Kaynak dosyalar `js/backup/` dizininde tutulmaktadır. Yeniden obfüskleme için:

```bash
node obfuscate.js
```

## 📁 Proje Yapısı

```
E-Labs/
├── index.html          # Ana uygulama
├── iletisim.html       # İletişim sayfası
├── kvkk.html           # Gizlilik politikası
├── dashboard.html      # Admin paneli (yetkili e-posta gerektirir)
├── css/style.css       # Global stiller
├── js/
│   ├── engine.js       # Simülasyon motoru (obfüske)
│   ├── simulation3d.js # 3D motor (obfüske)
│   ├── ui.js           # Arayüz & chat sistemi
│   ├── survey.js       # Anket sistemi
│   ├── security.js     # Güvenlik katmanı
│   ├── firebase-config.js  # Firebase bağlantısı (obfüske)
│   └── backup/         # Kaynak (obfüske edilmemiş) dosyalar
├── data/kvkk.md        # KVKK metni
└── obfuscate.js        # Derleme scripti
```

## 👥 Ekip

* **Hamza Bilden** — Tasarım, Geliştirme & Proje Yönetimi
* **Mücahit Çaykara** — Yazılım Geliştirme & Tasarım

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
