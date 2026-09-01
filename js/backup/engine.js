/**
 * ==========================================
 * BIO LAB - SIMULATION ENGINE (BACKEND LOGIC)
 * ==========================================
 * 
 * Bu dosya projenin "Backend" mantığını içerir.
 * Normalde bu kodların sunucuda (Node.js/Python) çalışması ve
 * sonuçların API ile frontend'e gönderilmesi gerekir.
 * 
 * Ancak "Node kullanma" kısıtlaması nedeniyle, bu mantık
 * istemci tarayıcısında (Client-Side) çalıştırılmaktadır.
 * 
 * GÜVENLİK UYARISI:
 * Bu kodlar tarayıcıda çalıştığı için "View Source" ile görülebilir.
 * Tam koruma için bu dosyanın içeriği bir sunucuya taşınmalıdır.
 */

// --- DATA: EXPERIMENTS DATABASE ---
const experiments = [
    // 9. SINIF
    {
        id: 'liver',
        grade: 9,
        title: 'Karaciğerde Enzim Aktivitesi',
        desc: 'Farklı yüzey alanlarına sahip karaciğer parçalarının H₂O₂ üzerindeki etkisini inceleyin.',
        difficulty: 2, time: '10 dk', icon: 'fa-lungs-virus',
        details: { objective: 'Enzim etkinliğine substrat yüzey alanının etkisini gözlemlemek.', independent: 'Yüzey Alanı', dependent: 'Reaksiyon Hızı (Köpük)', constants: ['Sıcaklık', 'H₂O₂ Miktarı'] },
        impact_guide: " - **Yüzey Alanı:** Karaciğer parçalandıkça (Kıyılmış) yüzey alanı artar, daha fazla enzim serbest kalır ve reaksiyon hızlanır.\n - **Sıcaklık:** 37°C'de en hızlıdır. 0°C'de yavaşlar, 60°C'de enzim bozulur (durur).\n - **Haşlanma:** Pişirme işlemi enzimi öldürür (denatürasyon), hiç tepkime olmaz.",
        theory: `
# Karaciğer ve Katalaz Enzimi

### 1. Teorik Arka Plan
Canlılarda metabolik faaliyetler sonucu oluşan zehirli maddelerden biri **Hidrojen Peroksit (H₂O₂)**'tir. Bu madde hücreler için toksiktir ve hızla parçalanması gerekir. Karaciğer hücrelerinde bol miktarda bulunan **Katalaz** enzimi, bu görevi üstlenir.

### 2. Kimyasal Reaksiyon
Katalaz enzimi, hidrojen peroksiti su ve oksijene parçalar. Deney tüpünde gözlenen köpürme, açığa çıkan oksijen gazıdır.

$$ 2H_2O_2 \\xrightarrow{Katalaz} 2H_2O + O_2 + Isı $$

### 3. Değişkenlerin Analizi
Bu deneyde enzim miktarı değil, **enzimin serbest kaldığı yüzey alanı** değiştirilmektedir.
* **Bütün Karaciğer:** Enzimler sadece dış yüzeydedir. Reaksiyon yavaştır.
* **Kıyılmış Karaciğer:** Hücreler parçalandığı için enzimler serbest kalır. Yüzey alanı çok geniştir. Reaksiyon çok hızlıdır.
* **Haşlanmış Karaciğer:** Yüksek sıcaklık (kaynama), enzimlerin protein yapısını bozar (**Denatürasyon**). Enzim çalışmaz, reaksiyon gözlenmez.

> **Not:** Bu deneyde karaciğer **SUBSTRAT DEĞİL, ENZİM KAYNAĞIDIR.** Substrat H₂O₂'dir.
        `
    },
    {
        id: 'water_prop',
        grade: 9,
        title: 'Suyun Kohezyon Özelliği',
        desc: 'Sıcaklığın suyun yüzey gerilimi üzerindeki etkisini simüle edin.',
        difficulty: 1, time: '5 dk', icon: 'fa-tint',
        details: { objective: 'Sıcaklık artışının kohezyon kuvvetine ve yüzey gerilimine etkisini incelemek.', independent: 'Sıcaklık (°C)', dependent: 'Yüzey Gerilimi (N/m)', constants: ['Sıvı Türü (Su)'] },
        impact_guide: " - **Sıcaklık:** Sıcaklık arttıkça su moleküllerinin hareketi artar, hidrojen bağları zayıflar ve yüzey gerilimi DÜŞER.",
        theory: `
# Suyun Büyülü Dünyası: Kohezyon ve Adhezyon

### 1. Kohezyon Kuvveti
Su molekülleri polar yapıdadır. Bir su molekülünün oksijen atomu (-), diğerinin hidrojen atomunu (+) çeker. Bu çekim kuvvetine **Hidrojen Bağı** denir. Su moleküllerinin birbirini tutmasına **Kohezyon** denir.

### 2. Yüzey Gerilimi
Suyun en üst katmanındaki moleküller, alttaki moleküller tarafından çekilir ancak üstte onları çeken su molekülü yoktur. Bu durum, su yüzeyinde esnek bir zar tabakası oluşturur. Böceklerin su üzerinde yürümesi bu sayede mümkündür.

### 3. Sıcaklık Etkisi
Sıcaklık arttıkça su moleküllerinin **kinetik enerjisi** artar. Moleküller daha hızlı hareket eder ve aralarındaki hidrojen bağları zayıflar/kopar.
* **Düşük Sıcaklık:** Güçlü kohezyon, yüksek yüzey gerilimi (Su damlası daha küresel durur).
* **Yüksek Sıcaklık:** Zayıf kohezyon, düşük yüzey gerilimi (Su daha yayvan durur).

$$ \\gamma = F / L $$
*(Yüzey gerilimi formülü)*
        `
    },
    {
        id: 'dialysis',
        grade: 9,
        title: 'Bağırsak Simülasyonu',
        desc: 'Bağırsak zarından (diyaliz tüpü) hangi moleküllerin geçebildiğini ayraçlarla gözlemleyin.',
        difficulty: 3, time: '20 dk', icon: 'fa-bacon',
        details: { objective: 'Monomer ve polimer maddelerin yarı geçirgen zardan geçişini ayırt etmek.', independent: 'Zaman', dependent: 'Renk Değişimi', constants: ['Sıcaklık', 'Zar Yapısı'] },
        impact_guide: " - **Nişasta:** Polimerdir, zardan GEÇEMEZ. Kapta renk değişimi olmaz.\n - **Glikoz:** Monomerdir, zardan GEÇER. Hem kapta hem bağırsakta renk değişimi olur.\n - **Ayraçlar (İyot/Fehling):** Küçük moleküllerdir, zardan her iki yöne geçebilirler.",
        theory: `
# Hücre Zarından Madde Geçişleri

### 1. Yarı Geçirgen Zar
Hücre zarı (ve modeldeki diyaliz tüpü), seçici geçirgen özelliktedir. Küçük moleküller (monomerler) porlardan geçebilirken, büyük moleküller (polimerler) geçemez.

### 2. Deney Bileşenleri ve Ayraçlar
* **Nişasta (Polimer):** Çok sayıda glikozdan oluşur. Zardan **GEÇEMEZ**. Ayıracı **İyot (Lügol)** çözeltisidir. Nişasta ile karşılaşınca Mavi-Mor renk verir.
* **Glikoz (Monomer):** Basit şekerdir. Zardan **GEÇEBİLİR**. Ayıracı **Fehling** çözeltisidir (Mavidir, ısıtılınca kiremit kırmızısı olur).
* **İyot ve Fehling:** Küçük moleküllerdir, zardan **GEÇEBİLİRLER**.

### 3. Beklenen Gözlemler
* **Nişasta Deneyi:** Kapta İyot vardır (Sarı). İyot zara girer, içerisi **Morarır**. Nişasta dışarı çıkamaz, kap **Sarı kalır**.
* **Glikoz Deneyi:** Kapta Fehling vardır (Mavi). Glikoz dışarı çıkar, Fehling içeri girer. Sıcaklık etkisiyle **hem kap hem de bağırsak içi Kiremit Kırmızısına döner**.

> **Sonuç:** Difüzyon, molekül büyüklüğüne bağlıdır. ATP harcanmaz.
        `
    },
    {
        id: 'diffusion_simple',
        grade: 9,
        title: 'Basit Difüzyon Hızı',
        desc: 'Sıcaklık ve molekül büyüklüğünün difüzyon hızına etkisini inceleyin.',
        difficulty: 2, time: '10 dk', icon: 'fa-wind',
        details: { objective: 'Difüzyon hızına etki eden faktörleri analiz etmek.', independent: 'Sıcaklık / Molekül', dependent: 'Yayılma Alanı (cm²)', constants: ['Ortam Yoğunluğu'] },
        impact_guide: " - **Sıcaklık:** Artarsa moleküller hızlanır, difüzyon HIZLANIR.\n - **Molekül Büyüklüğü:** Büyük moleküller (Boya) daha yavaş, küçük moleküller daha hızlı yayılır.",
        theory: `
# Difüzyon Kinetiği

### 1. Difüzyon Nedir?
Maddelerin çok yoğun oldukları ortamdan az yoğun oldukları ortama doğru, kendi kinetik enerjileriyle yayılmasıdır. Enerji (ATP) harcanmaz.

### 2. Hıza Etki Eden Faktörler
Bu simülasyonda iki temel faktör incelenmektedir:

#### A. Sıcaklık
Sıcaklık artışı, moleküllerin kinetik enerjisini artırır. Moleküller birbirine daha sık ve hızlı çarpar.
* **Sonuç:** Sıcaklık ile difüzyon hızı **doğru orantılıdır**.

#### B. Molekül Büyüklüğü
Büyük moleküllerin hareket etmesi ve ortamdaki diğer moleküllerin arasından geçmesi daha zordur (Sürtünme etkisi).
* **Sonuç:** Molekül büyüklüğü ile difüzyon hızı **ters orantılıdır**.

$$ Hız \\propto \frac{T}{\\sqrt{MA}} $$
*(T: Sıcaklık, MA: Molekül Ağırlığı)*
        `
    },
    {
        id: 'enzyme_kinetics',
        grade: 9,
        title: 'Enzim Kinetiği',
        desc: 'pH ve Sıcaklığın enzim hızına etkisi.',
        difficulty: 4, time: '15 dk', icon: 'fa-vial',
        details: { objective: 'Optimum koşulları belirlemek.', independent: 'pH / Sıcaklık', dependent: 'Reaksiyon Hızı', constants: ['Substrat'] },
        impact_guide: " - **Sıcaklık:** Optimum 37°C'dir. Düşükte yavaşlar, çok yüksekte (>55°C) durur (Denatürasyon).\n - **pH:** Her enzimin optimum pH'ı vardır (Genellikle 7). Aşırı asidik veya bazik ortamda enzim çalışmaz.",
        theory: `
# Enzimlerin Çalışma Mekanizması

### 1. Enzim-Substrat İlişkisi
Enzimler biyolojik katalizörlerdir. Reaksiyonun başlaması için gereken aktivasyon enerjisini düşürürler. Enzimin **aktif bölgesi** ile substrat, anahtar-kilit gibi uyumludur.

### 2. Çevresel Faktörlerin Etkisi

#### A. Sıcaklık
* **Düşük Sıcaklık (0°C):** Enzim inaktiftir (durur) ama yapısı bozulmaz. Isıtılırsa çalışır.
* **Optimum Sıcaklık (35-37°C):** Reaksiyon en hızlıdır.
* **Yüksek Sıcaklık (>55°C):** Enzimin protein yapısı bozulur (**Denatürasyon**). Geri dönüşü yoktur.

#### B. pH Değeri
Her enzimin çalıştığı özel bir pH aralığı vardır.
* **Pepsin (Mide):** Asidik ortamda (pH 2) çalışır.
* **Amilaz (Ağız):** Nötr/Hafif bazik (pH 7) çalışır.
* **Tripsin (Bağırsak):** Bazik (pH 8.5) çalışır.
        `
    },

    // 10. SINIF
    {
        id: 'photosynthesis',
        grade: 10,
        title: 'Fotosentez Fabrikası',
        desc: 'Işık şiddeti ve CO₂ miktarının fotosentez hızına etkisi.',
        difficulty: 3, time: '15 dk', icon: 'fa-leaf',
        details: { objective: 'Fotosentez hızını etkileyen faktörler.', independent: 'Işık / CO₂', dependent: 'O₂ Çıkışı', constants: ['Sıcaklık'] },
        impact_guide: " - **Işık Şiddeti:** Arttıkça fotosentez hızlanır, ancak bir noktadan sonra sabit kalır (Doygunluk).\n - **CO₂:** Arttıkça hız artar, ancak aşırı CO₂ ortamı asitleştirip enzimleri durdurabilir.",
        theory: `
# Fotosentez: Işıktan Besine

### 1. Genel Denklem
Bitkiler, algler ve bazı bakteriler ışık enerjisini kimyasal bağ enerjisine dönüştürür.

$$ 6CO_2 + 6H_2O \\xrightarrow{Işık, Klorofil} C_6H_{12}O_6 + 6O_2 $$

### 2. Sınırlayıcı Faktörler (Minimum Yasası)
Fotosentez hızı, miktarı en az olan faktöre göre belirlenir.
* **Işık Şiddeti:** Belirli bir noktaya kadar hızı artırır, sonra hız sabit kalır (Klorofil doygunluğu).
* **CO₂ Miktarı:** Işıktan bağımsız tepkimeler (Calvin Döngüsü) için gereklidir. Artışı hızı artırır ancak çok aşırı CO₂ ortam asitliğini artırarak enzimleri durdurabilir.

### 3. Kloroplast Yapısı
Reaksiyonlar kloroplastta gerçekleşir.
* **Tilakoit Zar:** Işığa bağımlı reaksiyonlar (ATP ve NADPH üretimi).
* **Stroma:** Işıktan bağımsız reaksiyonlar (Glikoz üretimi).
        `
    },
    {
        id: 'fermentation',
        grade: 10,
        title: 'Fermantasyon',
        desc: 'Maya hücrelerinde etil alkol fermantasyonu.',
        guide: 'Maya hücreleri fermantasyonla çıkardığı karbondioksit ile balon şişecektir. Fermantasyon hızına göre çıkardığı karbondioksitin artması ya da azalması ile balon büyüklüğü değişecektir.',
        difficulty: 2, time: '20 dk', icon: 'fa-bread-slice',
        details: { objective: 'Besin türünün fermantasyona etkisi.', independent: 'Şeker Türü', dependent: 'Gaz Çıkışı', constants: ['Maya'] },
        impact_guide: " - **Glikoz:** Maya için en kolay besindir, fermantasyon HIZLI olur.\n - **Sükroz:** Önce sindirilmesi gerekir, fermantasyon ORTA hızdadır.\n - **Nişasta:** Mayalar nişastayı sindiremez, fermantasyon OLMAZ.\n - **Sıcaklık:** 30-35°C idealdir.",
        theory: `
# Etil Alkol Fermantasyonu

### 1. Süreç
Oksijenin olmadığı durumlarda, bazı canlılar (örn: bira mayası) glikozu parçalayarak enerji üretir. Bu süreç sitoplazmada gerçekleşir.

### 2. Reaksiyon Denklemi
$$ C_6H_{12}O_6 \\rightarrow 2C_2H_5OH (Etil Alkol) + 2CO_2 + 2ATP + Isı $$

### 3. Şeker Türünün Önemi
Maya hücreleri her şekeri aynı hızda kullanamaz.
* **Glikoz (Monosakkarit):** Hücre zarından direkt geçer, en hızlı fermantasyon.
* **Sükroz (Disakkarit):** Önce enzimlerle sindirilmelidir (Glikoz + Fruktoz), bu yüzden süreç biraz daha yavaştır.
* **Nişasta (Polisakkarit):** Çok büyüktür. Maya hücresinde nişastayı sindirecek enzimler sınırlıdır/yoktur. Fermantasyon çok zordur.
        `
    },
    {
        id: 'respiration',
        grade: 10,
        title: 'Hücresel Solunum',
        desc: 'Aerobik solunum ve ATP üretimi.',
        difficulty: 4, time: '15 dk', icon: 'fa-lungs',
        details: { objective: 'Oksijenin ATP üretimine etkisi.', independent: 'O₂ Seviyesi', dependent: 'ATP Miktarı', constants: ['Glikoz'] },
        impact_guide: " - **Oksijen:** Oksijen arttıkça Oksijenli Solunum (ETS) hızlanır ve ATP üretimi DOĞRUSAL olarak artar. Oksijen yoksa üretim durur veya azalır (fermantasyon).",
        theory: `
# Oksijenli (Aerobik) Solunum

### 1. Genel Bakış
Besin monomerlerinin (glikoz) oksijen varlığında inorganik maddelere kadar parçalanarak maksimum enerjinin üretildiği süreçtir.

$$ C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 30-32 ATP $$

### 2. Evreler
1.  **Glikoliz (Sitoplazma):** Glikozun pirüvata yıkımı. (2 ATP)
2.  **Krebs Döngüsü (Mitokondri Matriksi):** CO₂ çıkışı ve NADH/FADH₂ üretimi. (2 ATP)
3.  **ETS (Mitokondri Kristası):** Elektronların oksijene aktarımı. En fazla ATP burada üretilir (Oksidatif Fosforilasyon).

### 3. Oksijenin Rolü
Oksijen, Elektron Taşıma Sistemi'nin (ETS) son elektron alıcısıdır. Oksijen yoksa ETS durur, Krebs durur ve hücre sadece fermantasyon yapabilir (çok az enerji).
        `
    },
    {
        id: 'osmosis',
        grade: 9,
        title: 'Hücrede Ozmos', desc: 'Tuzlu suyun hücre hacmine etkisi.',
        difficulty: 2, time: '10 dk', icon: 'fa-compress-arrows-alt',
        details: { objective: 'Hipertonik/Hipotonik ortam etkileri.', independent: 'Tuz %', dependent: 'Hücre Hacmi', constants: ['Süre'] },
        impact_guide: " - **İzotonik (%0.9):** Denge halidir, hacim değişmez.\n - **Hipertonik (>%0.9):** Hücre su kaybeder ve BÜZÜLÜR.\n - **Hipotonik (<%0.9):** Hücre su alır ve ŞİŞER.",
        theory: `
# Ozmos ve Toniklik

### 1. Ozmos Nedir?
Suyun, yarı geçirgen zardan az yoğun ortamdan (su çok), çok yoğun ortama (su az) doğru geçişidir.

### 2. Ortam Çeşitleri
* **İzotonik Ortam (%0.9 Tuz):** Hücre içi ile eş yoğunlukta. Hücre hacmi değişmez. Denge halidir.
* **Hipertonik Ortam (Çok Tuzlu):** Hücreden daha yoğun. Hücre su kaybeder ve büzülür. Bu olaya **Plazmoliz** denir.
* **Hipotonik Ortam (Saf Su):** Hücreden daha az yoğun. Hücre su alır ve şişer. Bu olaya **Deplazmoliz** (veya Turgor) denir. Hayvan hücreleri aşırı su alırsa patlar (**Hemoliz**).

$$ \\Psi_{hücre} = \\Psi_{ortam} $$
*(Denge durumu)*
        `
    },
    {
        id: 'homeostasis',
        grade: 9,
        title: 'Homeostazi',
        desc: 'Vücut ısısı ve denge.',
        difficulty: 3, time: '10 dk', icon: 'fa-heartbeat',
        details: { objective: 'Negatif geri bildirim mekanizması.', independent: 'Egzersiz', dependent: 'Vücut Isısı', constants: ['Ortam'] },
        impact_guide: " - **Egzersiz:** Kaslar çalıştıkça ısı üretir, vücut ısısı artar.\n - **Tepki:** Vücut terleyerek ısıyı 38°C civarında tutmaya çalışır (Negatif Geri Bildirim). Sonsuz artış olmaz.",
        theory: `
# Homeostasi: İç Denge

### 1. Tanım
Değişen çevre şartlarına rağmen, vücut iç ortamının (sıcaklık, pH, su dengesi vb.) sabit ve kararlı tutulmasıdır.

### 2. Termoregülasyon (Sıcaklık Dengesi)
İnsan vücudu yaklaşık 36.5°C - 37°C'de çalışır.
* **Egzersiz Sırasında:** Kaslar çalışır ve ısı üretir. Vücut sıcaklığı artmaya başlar.
* **Tepki (Negatif Geri Bildirim):**
    1.  Hipotalamus (beyin) artışı algılar.
    2.  Damarlar genişler (ısı kaybını artırmak için).
    3.  Ter bezleri çalışır (buharlaşma ile soğuma sağlar).
    4.  Soluk alıp verme hızlanır.

Bu sayede vücut sıcaklığı ölümcül seviyelere çıkmadan dengelenir.
        `
    },
    {
        id: 'acid_rain',
        grade: 10,
        title: 'Asit Yağmurları',
        desc: 'Fosil yakıtların ve gaz salınımının yağmur pH\'ı ve ekosistem üzerindeki yıkıcı etkisini inceleyin.',
        difficulty: 2, time: '10 dk', icon: 'fa-cloud-showers-heavy',
        details: { objective: 'Hava kirliliğinin asit yağmurlarına dönüşümünü ve canlılara etkisini gözlemlemek.', independent: 'Fosil Yakıt ve NOₓ', dependent: 'Yağmur pH Değeri', constants: ['Rüzgar', 'Nem'] },
        impact_guide: " - **Fosil Yakıt / Trafik:** Artarsa havaya SO₂ ve NOₓ salınır, bu da yağmurun pH'ını DÜŞÜRÜR (Asitleştirir).\n - **Filtre:** Filtre kullanımı asitlenmeyi %80 oranında engeller.\n - **pH Etkisi:** pH düştükçe bitkiler ölür (kahverengileşir).",
        theory: `
# Asit Yağmurları ve Çevre

### 1. Nasıl Oluşur?
Fabrikalardan, termik santrallerden ve araç egzozlarından çıkan zehirli gazlar atmosferdeki su buharı ile tepkimeye girer.
* **Kükürt Dioksit ($SO_2$):** Genellikle kömür ve petrol kullanımıyla açığa çıkar. Suyla birleşince **Sülfürik Asit ($H_2SO_4$)** oluşturur.
* **Azot Oksitler ($NO_x$):** Araç egzozlarından çıkar. Suyla birleşince **Nitrik Asit ($HNO_3$)** oluşturur.

### 2. Kimyasal Denklemler
Sülfür dioksit önce oksitlenir, ardından su ile birleşir:
$$ SO_2 + \\frac{1}{2}O_2 \\xrightarrow{Kataliz} SO_3 $$
$$ SO_3 + H_2O \\rightarrow H_2SO_4 \\quad (Sülfürik Asit) $$
Azot dioksitten nitrik asit oluşumu:
$$ 3NO_2 + H_2O \\rightarrow 2HNO_3 + NO \\quad (Nitrik Asit) $$

### 3. pH ve Etkileri
Normal yağmur suyu, havadaki karbondioksit nedeniyle hafif asidiktir (pH 5.6). Ancak asit yağmurlarında bu değer **pH 4.0** ve altına düşebilir.
* **Bitkiler:** Yapraklardaki klorofil yapısını bozar, topraktaki mineralleri (Ca, Mg) yıkar. Ağaçlar kurur.
* **Sular:** Göl ve nehirlerin pH'ı düşerse balık yumurtaları gelişemez ve toplu balık ölümleri görülür.
* **Yapılar:** Tarihi eserler (mermer/kireçtaşı) aşınır.
        `
    }
];

// --- SIMULATION ENGINE ---
const simulation = {
    canvas: null, ctx: null, chart: null,
    timer: 0, timerInterval: null, animationId: null, isRunning: false,
    params: {}, // Will be reset on init
    dataPoints: [], objects: [],

    init: function (id) {
        this.canvas = document.getElementById('simCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Defaults
        this.params = {
            duration: 15, // Default duration
            liverState: 'whole', peroxide: 5, isBoiled: 'false', tempEnv: '25', // Liver
            temp: 25, // Water, Enzyme, Diffusion
            bagContent: 'starch', speed: 1, // Dialysis
            molecule: 'dye', // Diffusion
            light: 50, co2: 'medium', // Photo
            ph: 7, // Enzyme
            sugar: 'glucose', // Ferm
            oxygen: 21, // Resp
            salt: 0.9, // Osmosis
            exercise: 0, bodyTemp: 36.5, // Homeo
            factoryLoad: 20, traffic: 20, hasFilter: 'false' // Acid Rain
        };

        // Reset duration input UI
        const dDisplay = document.getElementById('duration-display');
        if (dDisplay) dDisplay.value = 15;

        this.reset();
        this.initChart(id);
        this.drawLoop();
    },

    resize: function () {
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.clientWidth;
            this.canvas.height = this.canvas.parentElement.clientHeight;
        }
    },

    updateParams: function (k, v) {
        if (this.isRunning) return;
        this.params[k] = v;
    },

    adjustDuration: function (delta) {
        if (this.isRunning) return;
        let newVal = this.params.duration + delta;
        newVal = Math.max(15, Math.min(60, newVal));
        this.params.duration = newVal;
        document.getElementById('duration-display').value = newVal;
    },

    updateDurationInput: function (val) {
        if (this.isRunning) {
            document.getElementById('duration-display').value = this.params.duration; // Geri al
            return;
        }
        let v = parseInt(val);
        if (isNaN(v)) v = 15;
        v = Math.max(15, Math.min(60, v));
        this.params.duration = v;
        document.getElementById('duration-display').value = v;
    },

    setInputsDisabled: function (state) {
        const inputs = document.querySelectorAll('#controls-container input, #controls-container select');
        const container = document.getElementById('controls-container');
        inputs.forEach(el => el.disabled = state);
        if (state) {
            container.classList.add('opacity-50', 'pointer-events-none');
        } else {
            container.classList.remove('opacity-50', 'pointer-events-none');
        }
    },

    toggle: function () {
        const btn = document.getElementById('btn-start');

        // Eğer süre dolduysa ve tekrar basıldıysa resetle
        if (this.timer >= this.params.duration) {
            this.reset();
            return;
        }

        if (this.isRunning) {
            this.stop();
            btn.innerHTML = '<i class="fas fa-play"></i> Devam Et';
        } else {
            this.start();
            btn.innerHTML = '<i class="fas fa-pause"></i> Duraklat';
        }
    },

    start: function () {
        this.isRunning = true;
        this.setInputsDisabled(true); // Kilitle

        this.timerInterval = setInterval(() => {
            this.timer++;

            // Format Timer
            let m = Math.floor(this.timer / 60).toString().padStart(2, '0');
            let s = (this.timer % 60).toString().padStart(2, '0');
            document.getElementById('timer-display').innerText = `${m}:${s}`;

            // Auto Stop Check
            if (this.timer >= this.params.duration) {
                this.stop();
                this.setInputsDisabled(false); // Kilidi aç (değerleri değiştirebilsin diye)
                document.getElementById('btn-start').innerHTML = '<i class="fas fa-undo"></i> Tekrar Başlat';
                return;
            }

            if (this.timer % 1 === 0) this.recordData();
        }, 1000);
    },

    stop: function () {
        this.isRunning = false;
        this.setInputsDisabled(false); // Durdurulunca kilidi aç
        clearInterval(this.timerInterval);
    },

    reset: function () {
        this.stop();
        this.timer = 0;
        this.dataPoints = [];
        this.objects = [];
        this.params.bodyTemp = 36.5;
        this.setInputsDisabled(false);

        document.getElementById('timer-display').innerText = "00:00";
        document.getElementById('data-table-body').innerHTML = '';
        document.getElementById('btn-start').innerHTML = '<i class="fas fa-play"></i> Başlat';

        if (this.chart) {
            this.chart.data.labels = [];
            this.chart.data.datasets[0].data = [];
            this.chart.update();
        }

        // 3D diyaliz sahnesi aktifse glikozları başlangıç konumuna geri gönder
        if (typeof simulation3D !== 'undefined' && simulation3D.is3DActive &&
            simulation3D.currentExperiment === 'dialysis' && simulation3D.models.glucoseGroup) {
            simulation3D.models.glucoseGroup.children.forEach(g => {
                if (g.userData.startPos) {
                    g.position.set(g.userData.startPos.x, g.userData.startPos.y, g.userData.startPos.z);
                }
                g.userData.escaped = false;
                g.material.opacity = 1;
                // Hızı da sıfırla
                if (g.userData.startVelocity) {
                    g.userData.velocity.copy(g.userData.startVelocity);
                }
            });
        }
    },

    recordData: function () {
        const id = app.currentExp.id;
        let input = 0, output = 0;
        // Time factor (0 to 1 based on duration) to simulate progression if needed
        let tFactor = this.timer / this.params.duration;

        if (id === 'liver') {
            // --- REALISTIC ENZYME KINETICS ---
            input = this.params.liverState === 'whole' ? 1 : 3;

            // 1. Surface Area: Ground (High SA) vs Whole (Low SA)
            // Reaction rate is proportional to surface area.
            let surfaceFactor = this.params.liverState === 'ground' ? 5.0 : 1.0;

            // 2. State & Denaturation
            if (this.params.isBoiled === 'true') surfaceFactor = 0;

            // 3. Temperature (Bell Curve)
            // Optimum ~37°C. Q10 rule roughly applies until denaturation.
            // Falls off sharply after 45°C, zero by 60°C.
            let temp = parseInt(this.params.tempEnv);
            let tempFactor = 0;
            if (temp < 60) {
                // Gaussian-like curve peaked at 37
                // e^(-(x-37)^2 / 2*sigma^2)
                tempFactor = Math.exp(-Math.pow(temp - 37, 2) / 300);
                // Reduce significantly at 0°C (enzyme doesn't stop, just slow)
                if (temp === 0) tempFactor = 0.1;
            } else {
                tempFactor = 0; // Denatured
            }

            let substrateConc = this.params.peroxide; // 1-10
            // Michaelis-Menten: V = (Vmax * [S]) / (Km + [S])
            // Assume Km = 3
            let rate = (10 * substrateConc) / (3 + substrateConc);

            output = rate * surfaceFactor * tempFactor;

        } else if (id === 'water_prop') {
            // --- SURFACE TENSION (Linear-ish descent) ---
            input = this.params.temp;
            // Real data: 0°C -> 75.6, 100°C -> 58.9
            output = 75.6 - (0.17 * input);

        } else if (id === 'dialysis') {
            // --- DIFFUSION (Exponential Approach) ---
            input = this.timer;
            // Concentration difference drives diffusion.
            // C(t) = C_max * (1 - e^(-k*t))
            let k = this.params.speed * 0.05;
            output = 100 * (1 - Math.exp(-k * this.timer));

            if (this.params.bagContent === 'starch') {
                // Starch can't exit. Output (color intensity outside) should be 0.
                // But wait, the experiment measures "Color Change" which might be inside or outside depending on context.
                // Let's assume output tracks the reaction progress we visualize.
                // For starch (Iodine enters), reaction happens inside.
                // For glucose (Glucose exits), reaction happens outside.
                // Rate is same for small molecules (Iodine/Glucose).
            }

        } else if (id === 'diffusion_simple') {
            // --- DIFFUSION AREA (Einstein Relation) ---
            // Mean squared displacement <x^2> = 2Dt
            // D is proportional to Temperature (Kelvin) / Radius (Stokes-Einstein)
            input = this.params.temp;
            let T_Kelvin = input + 273;
            let radius = this.params.molecule === 'dye' ? 1 : 5; // Dye small, Oil big

            let D = T_Kelvin / radius;
            // Area ~ r^2 ~ t * D
            output = (D * this.timer) / 50;

        } else if (id === 'photosynthesis') {
            // --- PHOTOSYNTHESIS (Limiting Factors) ---
            input = this.params.light;

            // Light Saturation Curve
            // Rate = Pmax * (I / (K + I))
            let I = this.params.light;
            let Pmax = 100;
            let K_light = 30; // Half-saturation point
            let lightRate = Pmax * (I / (K_light + I));

            // CO2 sınırlayıcı faktördür — asla Pmax'ı aşamaz.
            // Yüksek CO₂ Calvin döngüsünü hızlandırır ama mutlak üst sınır Pmax'tır.
            let co2Limit = this.params.co2 === 'low' ? 0.4 : (this.params.co2 === 'high' ? 1.0 : 0.75);

            output = Math.min(Pmax, lightRate * co2Limit);

        } else if (id === 'enzyme_kinetics') {
            // --- ENZYME (Temp & pH) ---
            input = this.params.temp;
            let t = this.params.temp;
            let p = this.params.ph;

            // Temp: Skewed bell curve (denaturation is fast)
            let optT = 37;
            let t_act = Math.exp(-Math.pow(t - optT, 2) / 400); // Broad curve
            if (t > 50) t_act *= (1 - (t - 50) / 10); // Rapid drop after 50
            if (t > 60) t_act = 0;

            // pH: Bell curve
            let optP = 7;
            let p_act = Math.exp(-Math.pow(p - optP, 2) / 2); // Narrower

            output = 100 * t_act * p_act;

        } else if (id === 'homeostasis') {
            // --- THERMOREGULATION (Damped) ---
            input = this.params.exercise;

            // Body generates heat proportional to exercise
            // Cooling mechanisms (sweating) fight back
            // Equilibrium temp = Base + (Load / CoolingPower)

            let target = 36.5 + (this.params.exercise * 0.025); // Max ~39.0 at 100%

            // Approach target with lag
            let diff = target - this.params.bodyTemp;
            this.params.bodyTemp += diff * 0.1; // 10% approach per sec

            output = this.params.bodyTemp;

        } else if (id === 'osmosis') {
            // --- OSMOSIS (Volume Change) ---
            input = this.params.salt;

            // Equilibrium Volume depends on tonicity
            // V_eq = V_0 * (C_in / C_out)
            // C_in = 0.9, C_out = salt
            let C_out = Math.max(0.1, this.params.salt); // avoid div by 0
            let targetVol = 100 * (0.9 / C_out);

            // Limit physical swelling/shrinking (e.g., cell wall limits or lysis)
            targetVol = Math.max(20, Math.min(150, targetVol));

            // Exponential approach
            let currentVol = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 100;
            let change = (targetVol - currentVol) * 0.1;

            output = currentVol + change;

        } else if (id === 'respiration') {
            // --- RESPIRATION (Saturation) ---
            input = this.params.oxygen;
            // Monod Equation style: Rate = Vmax * (O2 / (K + O2))
            output = 50 * (input / (10 + input));

        } else if (id === 'fermentation') {
            input = this.params.temp;
            let t = this.params.temp;

            // Sugar efficiency
            let sugarEff = this.params.sugar === 'glucose' ? 1.0 : (this.params.sugar === 'sucrose' ? 0.7 : 0.05);

            // Yeast Temp Curve (Mesophilic)
            // Peak ~32°C, Die >50°C
            let tempEff = 0;
            if (t < 50) {
                tempEff = Math.exp(-Math.pow(t - 32, 2) / 100);
            }

            // Rate is cumulative gas production? No, graph shows Rate usually.
            // If graph shows Volume, we accumulate.
            // Let's output Rate.
            output = 10 * sugarEff * tempEff;

        } else if (id === 'acid_rain') {
            // --- PH (Logarithmic) ---
            // Pollution source
            let source = this.params.factoryLoad + this.params.traffic;
            if (this.params.hasFilter === 'true') source *= 0.4;

            // H+ concentration roughly proportional to source
            // pH = -log[H+]
            // Base pH 5.6 (clean). Min pH 3.0 (very dirty).
            // Map source (0-200) to pH drop.

            let maxDrop = 2.6; // 5.6 - 3.0
            let drop = maxDrop * (source / 200);

            output = 5.6 - drop;
        }

        // Noise
        if (output > 0) output += (Math.random() - 0.5) * (output * 0.02); // Reduced noise

        // Format decimal places (Max 2)
        output = Math.max(0, parseFloat(output.toFixed(2)));
        if (typeof input === 'number') input = parseFloat(input.toFixed(2));

        let dp = { time: this.timer, input: input, output: output };
        this.dataPoints.push(dp);
        this.updateChart(dp);
        this.updateTable(dp);
    },

    updateTable: function (dp) {
        const b = document.getElementById('data-table-body');
        const r = `<tr class="hover:bg-white/10 transition-colors"><td class="p-3 border-b border-white/5 font-mono text-[var(--secondary)]">${dp.time}s</td><td class="p-3 border-b border-white/5">${dp.input}</td><td class="p-3 border-b border-white/5 font-bold">${dp.output}</td></tr>`;
        b.insertAdjacentHTML('beforeend', r); // Bilimsel konvansiyon: yeni veri alta eklenir
        if (b.children.length > 100) b.firstElementChild.remove();
        // Otomatik scroll - en son veriye git
        b.parentElement.scrollTop = b.parentElement.scrollHeight;
    },

    initChart: function (id) {
        const ctx = document.getElementById('dataChart').getContext('2d');
        if (this.chart) this.chart.destroy();

        // Modern Gradyan Dolgu
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 172, 193, 0.5)'); // Üst: Belirgin
        gradient.addColorStop(1, 'rgba(0, 172, 193, 0.0)'); // Alt: Saydam

        let yLabel = app.currentExp.details.dependent;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: yLabel,
                    data: [],
                    borderColor: '#00acc1',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4, // Yumuşak kıvrımlar
                    pointRadius: 4,
                    pointBackgroundColor: '#000', // Siyah nokta içi
                    pointBorderColor: '#00acc1', // Renkli nokta çerçevesi
                    pointBorderWidth: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 46, 0.9)',
                        titleColor: '#00acc1',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            title: (items) => `Zaman: ${items[0].label}s`,
                            label: (item) => `${yLabel}: ${item.raw}`
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Zaman (saniye)',
                            color: '#607d8b',
                            font: { size: 11, weight: 'bold' }
                        },
                        grid: { color: 'rgba(255,255,255,0.02)', borderColor: 'transparent' },
                        ticks: { color: '#607d8b', maxRotation: 0, font: { size: 10 } }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: yLabel,
                            color: '#00acc1',
                            font: { size: 11, weight: 'bold' }
                        },
                        grid: { color: 'rgba(255,255,255,0.05)', borderDash: [5, 5], borderColor: 'transparent' },
                        ticks: { color: '#607d8b', font: { size: 10 } }
                    }
                }
            }
        });
    },
    updateChart: function (dp) {
        this.chart.data.labels.push(dp.time);
        this.chart.data.datasets[0].data.push(dp.output);
        // Tüm veriyi göster — kayan pencere kaldırıldı
        this.chart.update();
    },

    // --- DRAWING ---
    drawLoop: function () {
        if (!this.ctx || !app.currentExp) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const id = app.currentExp.id;
        this.ctx.clearRect(0, 0, w, h);

        // Common background
        // this.ctx.fillStyle = '#111'; this.ctx.fillRect(0,0,w,h);

        if (id === 'liver') this.drawLiver(w, h);
        else if (id === 'water_prop') this.drawWater(w, h);
        else if (id === 'dialysis') this.drawDialysis(w, h);
        else if (id === 'diffusion_simple') this.drawDiffusion(w, h);
        else if (id === 'photosynthesis') this.drawPhoto(w, h);
        else if (id === 'enzyme_kinetics') this.drawEnzyme(w, h);
        else if (id === 'osmosis') this.drawOsmosis(w, h);
        else if (id === 'fermentation') this.drawFerm(w, h);
        else if (id === 'homeostasis') this.drawHomeo(w, h);
        else if (id === 'respiration') this.drawResp(w, h);
        else if (id === 'acid_rain') this.drawAcidRain(w, h);

        this.animationId = requestAnimationFrame(() => this.drawLoop());
    },

    drawLiver: function (w, h) {
        const ctx = this.ctx;
        // Test Tube
        ctx.fillStyle = '#ddd';
        ctx.fillRect(w / 2 - 40, h - 200, 80, 180); // tube body
        ctx.beginPath(); ctx.arc(w / 2, h - 20, 40, 0, Math.PI); ctx.fill(); // bottom

        // Liver Color Logic
        let isBoiled = this.params.isBoiled === 'true';
        let liverColor = isBoiled ? '#D2B48C' : '#8B4513'; // Tan if boiled, Brown if raw

        ctx.fillStyle = liverColor;
        if (this.params.liverState === 'whole') {
            // Whole
            ctx.beginPath(); ctx.ellipse(w / 2, h - 40, 30, 15, 0, 0, Math.PI * 2); ctx.fill();
        } else {
            // Ground (Kıyılmış)
            for (let i = 0; i < 40; i++) {
                ctx.beginPath(); ctx.arc(w / 2 + (Math.random() * 60 - 30), h - 30 + (Math.random() * 20), 3, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Liquid (Temp effect)
        let tempEnv = parseInt(this.params.tempEnv);
        let liquidColor = 'rgba(200,240,255,0.4)';
        let label = "25°C";

        if (tempEnv === 0) {
            liquidColor = 'rgba(200, 250, 255, 0.6)'; // Icy
            label = "0°C (Buzlu)";
        } else if (tempEnv >= 60) {
            liquidColor = 'rgba(255, 200, 200, 0.4)'; // Hot
            label = "60°C (Sıcak)";
        }

        ctx.fillStyle = liquidColor;
        ctx.fillRect(w / 2 - 40, h - 180, 80, 160);

        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, w / 2, h - 185);

        // Bubbles
        // Reaction requires: Not Boiled AND Not Super Hot AND Not Freezing (slows down)
        // In simulation, boiled = 0 rate. High temp = 0 rate. 
        // We trust "isRunning" and the rate calculation in recordData, but for visuals we do a quick check.

        let canReact = !isBoiled && tempEnv < 60;

        if (this.isRunning && canReact) {
            let rate = this.params.liverState === 'ground' ? 0.9 : 0.3;
            if (tempEnv === 0) rate *= 0.2; // Very few bubbles in cold

            if (Math.random() < rate) {
                this.objects.push({ x: w / 2 + (Math.random() * 60 - 30), y: h - 50, r: Math.random() * 4 + 2 });
            }
        }
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        this.objects.forEach((b, i) => {
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
            b.y -= 2;
            if (b.y < h - 180) this.objects.splice(i, 1);
        });
    },

    drawWater: function (w, h) {
        const ctx = this.ctx;
        // Table
        ctx.fillStyle = '#555'; ctx.fillRect(0, h - 20, w, 20);
        // Coin
        ctx.fillStyle = '#cd7f32'; // Bronze
        ctx.beginPath(); ctx.ellipse(w / 2, h - 30, 80, 20, 0, 0, Math.PI * 2); ctx.fill();

        // recordData ile aynı formül: output = 75.6 - (0.17 * temp)
        let tension = 75.6 - (0.17 * this.params.temp);
        // Yüksek gerilim = daha küresel (yüksek/dar), düşük gerilim = daha yayvan (alçak/geniş)
        let height = tension * 1.3;
        let spread = 200 - tension * 1.5;
        spread = Math.max(60, Math.min(160, spread));

        ctx.fillStyle = `rgba(0, 150, 255, 0.6)`;
        ctx.beginPath();
        ctx.moveTo(w / 2 - spread / 2, h - 30);
        ctx.bezierCurveTo(w / 2 - spread / 2, h - 30 - height * 1.5, w / 2 + spread / 2, h - 30 - height * 1.5, w / 2 + spread / 2, h - 30);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial'; ctx.textAlign = 'center';
        ctx.fillText(`Sıcaklık: ${this.params.temp}°C`, w / 2, h - 100);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#aaddff';
        ctx.fillText(`Yüzey Gerilimi: ${tension.toFixed(1)} mN/m`, w / 2, h - 80);
    },

    drawDialysis: function (w, h) {
        const ctx = this.ctx;
        // Beaker
        ctx.strokeStyle = '#aaa'; ctx.lineWidth = 4;
        ctx.strokeRect(w / 2 - 100, 100, 200, 300);

        let content = this.params.bagContent;
        // Progress: 0 to 1 based on time (Max reaction at 20s)
        let progress = Math.min(1, this.timer / 20);

        // 1. BEAKER LIQUID (DIŞ SIVI)
        let beakerColor;
        if (content === 'starch') {
            // İyot Çözeltisi (Sarı/Kehribar) - Değişmez çünkü Nişasta dışarı çıkamaz.
            beakerColor = 'rgba(255, 180, 50, 0.4)';
        } else {
            // Fehling Çözeltisi (Mavi -> Kırmızı)
            // Başlangıç: Mavi (Fehling Rengi)
            // Bitiş: Kiremit Kırmızısı (Glikoz dışarı sızar ve tepkime verir)

            // R: 50 -> 200
            // G: 100 -> 50
            // B: 255 -> 50
            let r = 50 + (150 * progress);
            let g = 100 - (50 * progress);
            let b = 255 - (205 * progress);
            beakerColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        }

        ctx.fillStyle = beakerColor;
        ctx.fillRect(w / 2 - 98, 150, 196, 248);

        // 2. BAG (BAĞIRSAK)
        let bagColor;
        if (content === 'starch') {
            // İçeride Nişasta var. İyot içeri girer -> Mavi/Mor olur.
            // Start: White/Clear -> End: Dark Blue/Purple
            let r = 255 - (235 * progress);
            let g = 255 - (235 * progress);
            let b = 255 - (100 * progress);
            bagColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
        } else {
            // İçeride Glikoz var. Fehling içeri girer -> Kırmızı olur.
            // Çünkü Glikoz dışarı çıkar, Fehling içeri girer. Her yer dengelenir.
            let r = 240 + (15 * progress);
            let g = 240 - (190 * progress);
            let b = 255 - (205 * progress);
            // Hafif şeffaftan kırmızıya
            bagColor = `rgba(${r}, ${g}, ${b}, 0.85)`;
        }

        ctx.fillStyle = bagColor;
        ctx.beginPath();
        ctx.ellipse(w / 2, 250, 40, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // String
        ctx.beginPath(); ctx.moveTo(w / 2, 170); ctx.lineTo(w / 2, 100); ctx.stroke();

        // LABELS
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 12px sans-serif';
        let bagLabel = content === 'starch' ? "Nişasta" : "Glikoz";
        let beakerLabel = content === 'starch' ? "Kap: İyot (Sarı)" : "Kap: Fehling (Mavi)";

        // Dynamic labels for color change
        if (progress > 0.5) {
            if (content === 'starch') bagLabel += " (Mor)";
            else {
                bagLabel += " (Kırmızı)";
                beakerLabel = "Kap: Fehling + Glikoz (Kırmızı)";
            }
        }

        ctx.fillText(bagLabel, w / 2, 250);

        ctx.fillStyle = '#ccc'; ctx.font = '12px sans-serif';
        ctx.fillText(beakerLabel, w / 2, 420); // Below liquid

        if (content === 'starch') {
            ctx.fillText("Nişasta dışarı çıkamaz (Kap sarı kalır).", w / 2, 440);
        } else {
            ctx.fillText("Glikoz difüzyonla kaba geçer (Her yer kızarır).", w / 2, 440);
        }
    },

    drawDiffusion: function (w, h) {
        const ctx = this.ctx;
        // Petri dish
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 150, 0, Math.PI * 2);
        ctx.fillStyle = '#eee'; ctx.fill(); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 5; ctx.stroke();

        // Dye
        let radius = 0;
        if (this.isRunning) {
            let molFactor = this.params.molecule === 'dye' ? 1 : 0.5;
            radius = Math.min(140, this.timer * (this.params.temp / 10) * molFactor);
        }
        ctx.beginPath(); ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.params.molecule === 'dye' ? 'rgba(0,0,255,0.6)' : 'rgba(255,0,0,0.6)';
        ctx.fill();
    },

    drawPhoto: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, w, h); // Sky
        // Sun
        let sunOpacity = this.params.light / 100;
        ctx.fillStyle = `rgba(255, 255, 0, ${sunOpacity})`;
        ctx.beginPath(); ctx.arc(w - 50, 50, 40, 0, Math.PI * 2); ctx.fill();

        // Plant
        ctx.fillStyle = '#228B22';
        ctx.fillRect(w / 2 - 5, h - 100, 10, 100); // Stem
        ctx.beginPath(); ctx.ellipse(w / 2 + 20, h - 80, 30, 10, -0.5, 0, Math.PI * 2); ctx.fill(); // Leaf
        ctx.beginPath(); ctx.ellipse(w / 2 - 20, h - 60, 30, 10, 0.5, 0, Math.PI * 2); ctx.fill(); // Leaf

        // Bubbles
        if (this.isRunning) {
            if (Math.random() < (this.params.light / 100) * 0.5) {
                this.objects.push({ x: w / 2 + (Math.random() * 40 - 20), y: h - 50 });
            }
        }
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.objects.forEach((b, i) => {
            ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
            b.y -= 1;
            if (b.y < h - 200) this.objects.splice(i, 1);
        });
    },

    drawEnzyme: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#333'; ctx.fillRect(0, 0, w, h);

        let denatured = this.params.temp > 55;
        let speed = denatured ? 0 : (this.params.temp / 10);

        // Enzymes
        for (let i = 0; i < 10; i++) {
            let x = (Date.now() / 10 * speed + i * 50) % w;
            let y = h / 2 + Math.sin(x / 50) * 30;

            ctx.fillStyle = denatured ? '#555' : '#FFD700'; // Gray if denatured
            ctx.beginPath();
            if (denatured) {
                ctx.moveTo(x, y); ctx.lineTo(x + 20, y); // Flat
            } else {
                ctx.arc(x, y, 10, 0.2, Math.PI * 1.8); // Pacman
            }
            ctx.fill();
        }
    },

    drawOsmosis: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#E0F7FA'; ctx.fillRect(0, 0, w, h);

        // Simülasyon verisindeki smooth değeri kullan (exponential approach)
        let currentVol = 100;
        if (this.dataPoints.length > 0) {
            currentVol = this.dataPoints[this.dataPoints.length - 1].output;
        }
        // Hacmi piksel boyutuna map et: vol 20-150 → size 35-115
        let size = 35 + ((currentVol - 20) / 130) * 80;
        size = Math.max(30, Math.min(115, size));

        // Hücre rengi: büyüyünce açık pembe (şişme), küçülünce koyu mor (büzülme)
        let sizeRatio = (size - 30) / 85; // 0=küçük, 1=büyük
        let r = Math.round(200 + sizeRatio * 44);
        let g = Math.round(100 + sizeRatio * 43);
        let b2 = Math.round(180 - sizeRatio * 60);
        ctx.fillStyle = `rgb(${r},${g},${b2})`;
        ctx.beginPath(); ctx.arc(w / 2, h / 2, size, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#AD1457'; ctx.lineWidth = 3; ctx.stroke();

        // Durum etiketi
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 13px Arial';
        let label = '';
        let salt = this.params.salt;
        if (Math.abs(salt - 0.9) < 0.05) label = 'İzotonik — Denge';
        else if (salt > 0.9) label = 'Hipertonik — Büzülüyor (Plazmoliz)';
        else label = 'Hipotonik — Şişiyor (Turgor)';
        ctx.fillText(label, w / 2, h / 2 + size + 20);
        ctx.font = '11px Arial';
        ctx.fillStyle = '#aaddff';
        ctx.fillText(`Hacim: ${currentVol.toFixed(1)} birim`, w / 2, h / 2 + size + 36);

        // Dış ortamda tuz noktaları (yoğunluğa göre)
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        let dots = Math.round(this.params.salt * 40);
        for (let i = 0; i < dots; i++) {
            let angle = Math.random() * Math.PI * 2;
            let dist = size + 10 + Math.random() * (Math.min(w, h) / 2 - size - 10);
            let px = w / 2 + Math.cos(angle) * dist;
            let py = h / 2 + Math.sin(angle) * dist;
            if (px > 5 && px < w - 5 && py > 5 && py < h - 5) {
                ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
            }
        }
    },

    drawFerm: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFF3E0'; ctx.fillRect(0, 0, w, h);
        // Bottle
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.strokeStyle = '#aaa';
        ctx.fillRect(w / 2 - 50, h - 150, 100, 150); ctx.strokeRect(w / 2 - 50, h - 150, 100, 150);
        // Balloon
        ctx.fillStyle = '#EF5350';
        let vol = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
        let r = 20 + vol * 2;
        ctx.beginPath(); ctx.arc(w / 2, h - 170 - r, r, 0, Math.PI * 2); ctx.fill();
    },

    drawResp: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#263238'; ctx.fillRect(0, 0, w, h);
        // Mitochondria
        ctx.fillStyle = '#FF7043';
        ctx.beginPath(); ctx.ellipse(w / 2, h / 2, 100, 50, 0, 0, Math.PI * 2); ctx.fill();
        // ATP Sparks
        if (this.isRunning) {
            let count = this.params.oxygen / 10;
            for (let i = 0; i < count; i++) {
                ctx.fillStyle = '#FFEB3B';
                ctx.fillRect(w / 2 + (Math.random() * 100 - 50), h / 2 + (Math.random() * 40 - 20), 4, 4);
            }
        }
    },

    drawHomeo: function (w, h) {
        const ctx = this.ctx;
        let t = this.params.bodyTemp;
        // BG Color shifts red if hot
        let r = Math.min(255, (t - 36.5) * 50);
        ctx.fillStyle = `rgba(${r}, 100, 100, 0.2)`; ctx.fillRect(0, 0, w, h);

        // Stickman
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 - 50, 30, 0, Math.PI * 2); // Head
        ctx.moveTo(w / 2, h / 2 - 20); ctx.lineTo(w / 2, h / 2 + 50); // Body
        ctx.moveTo(w / 2, h / 2); ctx.lineTo(w / 2 - 30, h / 2 + 30); // Arms
        ctx.moveTo(w / 2, h / 2); ctx.lineTo(w / 2 + 30, h / 2 + 30);
        ctx.stroke();

        // Sweat
        if (t > 37) {
            ctx.fillStyle = '#03A9F4';
            for (let i = 0; i < 5; i++) {
                ctx.beginPath(); ctx.arc(w / 2 + (Math.random() * 40 - 20), h / 2 - 60 + (Math.random() * 10), 2, 0, Math.PI * 2); ctx.fill();
            }
        }

        ctx.fillStyle = '#fff'; ctx.font = "20px Arial"; ctx.fillText(t.toFixed(1) + "°C", w / 2 + 50, h / 2);
    },

    drawAcidRain: function (w, h) {
        const ctx = this.ctx;

        // Sky Color (Pollution makes it gray/yellow)
        let pollution = 0;
        if (this.dataPoints.length > 0) {
            let pH = this.dataPoints[this.dataPoints.length - 1].output;
            pollution = (5.6 - pH) / 1.6; // 0 to 1
        }

        let skyR = 135 + (pollution * 50);
        let skyG = 206 + (pollution * 0);
        let skyB = 235 - (pollution * 100);
        ctx.fillStyle = `rgb(${skyR}, ${skyG}, ${skyB})`;
        ctx.fillRect(0, 0, w, h);

        // Ground
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, h - 50, w, 50);

        // Factory (Left)
        ctx.fillStyle = '#555';
        ctx.fillRect(20, h - 150, 80, 100);
        ctx.fillRect(30, h - 200, 20, 50); // Chimney

        // Smoke (Factory)
        let smokeDensity = this.params.factoryLoad / 100;
        if (this.params.hasFilter === 'true') smokeDensity *= 0.2;

        if (this.isRunning && smokeDensity > 0.1) {
            if (Math.random() < smokeDensity) {
                this.objects.push({
                    type: 'smoke', x: 40, y: h - 210,
                    r: 5 + Math.random() * 10, v: 1 + Math.random()
                });
            }
        }

        // Cars (Right Road)
        ctx.fillStyle = '#333';
        ctx.fillRect(w - 150, h - 40, 150, 10);
        // Draw a simple car moving
        let carX = w - 150 + (Date.now() / 10) % 150;
        ctx.fillStyle = 'red';
        ctx.fillRect(carX, h - 60, 30, 15);

        // Car Exhaust (NOx)
        if (this.isRunning && this.params.traffic > 10) {
            if (Math.random() < this.params.traffic / 200) {
                this.objects.push({
                    type: 'exhaust', x: carX, y: h - 50,
                    r: 2 + Math.random() * 3, v: 0.5
                });
            }
        }

        // Tree (Center) - Visual Indicator of Health
        // Health depends on pH. pH 5.6 = Green, pH 4.0 = Brown/Dead
        let treeR = 34 + (pollution * 150); // Green -> Brown
        let treeG = 139 - (pollution * 100);
        let treeB = 34;
        ctx.fillStyle = '#8D6E63'; // Trunk
        ctx.fillRect(w / 2 - 10, h - 150, 20, 100);

        ctx.fillStyle = `rgb(${treeR}, ${treeG}, ${treeB})`; // Leaves
        ctx.beginPath();
        ctx.arc(w / 2, h - 180, 50, 0, Math.PI * 2);
        ctx.fill();

        // Rain (Acidic rain looks yellowish/dirty if high pollution)
        if (this.isRunning) {
            for (let i = 0; i < 10; i++) {
                let rx = Math.random() * w;
                let ry = Math.random() * h;
                ctx.fillStyle = pollution > 0.5 ? 'rgba(200, 200, 150, 0.6)' : 'rgba(150, 150, 255, 0.6)';
                ctx.fillRect(rx, ry, 1, 10);
            }
        }

        // Render Particles (Smoke/Exhaust)
        this.objects.forEach((p, i) => {
            if (p.type === 'smoke' || p.type === 'exhaust') {
                ctx.fillStyle = p.type === 'smoke' ? 'rgba(50,50,50,0.5)' : 'rgba(100,100,100,0.4)';
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
                p.y -= p.v;
                p.x += (Math.random() - 0.5) * 2; // Wind spread
                p.r += 0.2; // Expand
                if (p.y < 0 || p.r > 30) this.objects.splice(i, 1);
            }
        });

        // Labels
        ctx.fillStyle = '#000'; ctx.font = '16px bold sans-serif'; ctx.textAlign = 'right';
        let currentPH = 5.6;
        if (this.dataPoints.length > 0) currentPH = this.dataPoints[this.dataPoints.length - 1].output;

        ctx.fillText(`Yağmur pH: ${currentPH.toFixed(2)}`, w - 20, 50);
        if (currentPH < 4.5) {
            ctx.fillStyle = 'red';
            ctx.fillText("TEHLİKE: ASİT YAĞMURU!", w - 20, 80);
        } else if (currentPH < 5.0) {
            ctx.fillStyle = 'orange';
            ctx.fillText("Uyarı: Asidite Artıyor", w - 20, 80);
        }
    }
};
