/**
 _____     _        _    ____  ____  
| ____|   | |      / \  | __ )/ ___| 
|  _| - _ | |     / _ \ |  _ \\___ \ 
| |___ | || |___ / ___ \| |_) |___) |
|_____||_||_____/_/   \_\____/|____/ 

E-LABS - Sanal Deney Laboratuvarı
Bu yazılımın kopyalanması, izinsiz çoğaltılması ve paylaşılması kesinlikle yasaktır.
© 2026 E-LabS Team. Tüm Hakları Saklıdır.
 */
/**
 * ==========================================
 * E-LABS - SIMULATION ENGINE (BACKEND LOGIC)
 * ==========================================
 * 
 * Bu dosya projenin "Backend" mantığını içerir.
 * Normalde bu kodların sunucuda (Node.js/Python) çalışması ve
 * sonuçların API ile frontend'e gönderilmesi gerekir.
 * 
 * istemci tarayıcısında (Client-Side) çalıştırılmaktadır.
 */

// --- DATA: EXPERIMENTS DATABASE ---
const experiments = [
    // 9. SINIF
    {
        id: 'liver',
        grade: 9,
        subject: 'biology',
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
* **Haşlanma:** Yüksek sıcaklık (kaynama), enzimlerin protein yapısını bozar (**Denatürasyon**). Enzim çalışmaz, reaksiyon gözlenmez.

> **Not:** Bu deneyde karaciğer **SUBSTRAT DEĞİL, ENZİM KAYNAĞIDIR.** Substrat H₂O₂'dir.
        `
    },
    {
        id: 'water_prop',
        grade: 9,
        subject: 'physics',
        title: 'Yüzey Gerilimi ve Kılcallık',
        desc: 'Sıcaklığın ve yabancı maddelerin (deterjan vb.) suyun yüzey gerilimi üzerindeki etkisini inceleyin.',
        difficulty: 1, time: '5 dk', icon: 'fa-tint',
        details: { objective: 'Sıcaklık ve yabancı maddelerin yüzey gerilimine etkisini incelemek.', independent: 'Sıcaklık / Katkı Maddesi', dependent: 'Yüzey Gerilimi (N/m)', constants: ['Sıvı Türü (Su)'] },
        impact_guide: " - **Sıcaklık:** Sıcaklık arttıkça su moleküllerinin hareketi artar, hidrojen bağları zayıflar ve yüzey gerilimi DÜŞER.\n - **Yabancı Madde:** Deterjan gibi maddeler suyun yüzey gerilimini azaltır.",
        theory: `
# Yüzey Gerilimi ve Kılcallık

### 1. Yüzey Gerilimi
Sıvı yüzeyindeki moleküllerin birbirini çekmesi sonucu oluşan gerilme kuvvetidir. Bu kuvvet suyun üzerinde bir "zar" varmış gibi davranmasına neden olur.

### 2. Sıcaklık Etkisi
Sıcaklık arttıkça moleküller arası çekim kuvveti azalır, bu da yüzey gerilimini düşürür.

### 3. Yabancı Madde Etkisi
Sıvı içine karıştırılan deterjan, sabun gibi maddeler (yüzey aktif maddeler) moleküller arası çekimi zayıflatarak yüzey gerilimini önemli ölçüde azaltır.

### 4. Kılcallık (Kapiler Etki)
Sıvıların dar borular içinde yükselmesi veya alçalması olayıdır. Adhezyon (farklı moleküller arası çekim) ve kohezyon (aynı moleküller arası çekim) kuvvetleri arasındaki ilişkiye bağlıdır.
        `
    },
    {
        id: 'prec_measure',
        grade: 9,
        subject: 'physics',
        title: 'Hassas Ölçüm Deneyi',
        desc: 'Kumpas ve mikrometre kullanarak farklı nesnelerin boyutlarını hassas bir şekilde ölçün.',
        difficulty: 2, time: '8 dk', icon: 'fa-ruler-combined',
        details: { objective: 'Hassas ölçüm aletlerinin kullanımını ve önemini kavramak.', independent: 'Ölçüm Aleti', dependent: 'Ölçüm Hassasiyeti (mm)', constants: ['Ölçülen Nesne'] },
        impact_guide: " - **Kumpas:** 0.1 mm hassasiyetle ölçüm yapar.\n - **Mikrometre:** 0.01 mm hassasiyetle çok daha küçük boyutları ölçebilir.",
        theory: `
# Fizikte Hassas Ölçümler

### 1. Ölçümün Önemi
Bilimsel çalışmalarda büyüklüklerin doğru ölçülmesi esastır. Göz kararı veya basit cetvellerle yapılamayan ölçümler için özel aletler kullanılır.

### 2. Kumpas
İç çap, dış çap ve derinlik ölçümü yapabilen aletlerdir. Verniyeli ölçeği sayesinde cetvelden çok daha hassastır.

### 3. Mikrometre
Çok daha hassas ölçümler (örneğin saç teli kalınlığı) için vida mekanizması kullanan bir alettir. 0.01 mm hassasiyete kadar inebilir.
        `
    },
    {
        id: 'density_det',
        grade: 9,
        subject: 'physics',
        title: 'Özkütle Tayini',
        desc: 'Dereceli silindir ve terazi kullanarak farklı katıların yoğunluğunu (özkütlesini) bulun.',
        difficulty: 2, time: '10 dk', icon: 'fa-balance-scale',
        details: { objective: 'Kütle ve hacim ölçerek özkütle formülünü uygulamak.', independent: 'Madde Türü', dependent: 'Özkütle (g/cm³)', constants: ['Sıcaklık'] },
        impact_guide: " - **Özkütle:** Birim hacimdeki kütle miktarıdır. $d = m / V$ formülü ile hesaplanır.\n - **Sıcaklık:** Sabit tutulmalıdır çünkü sıcaklık hacmi etkiler.",
        theory: `
# Madde ve Özellikleri: Özkütle

### 1. Özkütle Tanımı
Bir maddenin birim hacminin kütlesine **özkütle** denir. Maddeler için ayırt edici bir özelliktir.

### 2. Hesaplama Formülü
$$ d = \frac{m}{V} $$
Burada:
* $d$: Özkütle ($g/cm^3$)
* $m$: Kütle ($g$)
* $V$: Hacim ($cm^3$ veya $mL$)

### 3. Ölçüm Yöntemi
* **Kütle:** Eşit kollu terazi veya dijital terazi ile ölçülür.
* **Hacim:** Düzgün geometrisi olmayan katılar için dereceli silindir (taşırma kabı) kullanılır. Sıvıdaki yükselme miktarı cismin hacmini verir.
        `
    },
    {
        id: 'thermal_eq',
        grade: 9,
        subject: 'physics',
        title: 'Isıl Denge',
        desc: 'Farklı sıcaklıktaki suların karıştırılmasıyla oluşan son sıcaklığı ve ısı alışverişini gözlemleyin.',
        difficulty: 3, time: '12 dk', icon: 'fa-thermometer-half',
        details: { objective: 'Enerji korunumu yasasını ısı alışverişi üzerinden anlamak.', independent: 'Başlangıç Sıcaklıkları', dependent: 'Denge Sıcaklığı (°C)', constants: ['Isı Sığası'] },
        impact_guide: " - **Denge Sıcaklığı:** Sıcak maddeden soğuk maddeye ısı aktarılır. Sonuçta iki madde aynı sıcaklığa ulaşır.",
        theory: `
# Isı ve Sıcaklık: Isıl Denge

### 1. Isı ve Sıcaklık Farkı
Sıcaklık bir maddenin ortalama kinetik enerjisinin bir göstergesidir; ısı ise transfer edilen enerjidir.

### 2. Isıl Denge Koşulu
Farklı sıcaklıktaki iki madde temas ettirildiğinde, sıcak olandan soğuk olana doğru enerji (ısı) akar. Bu süreç her iki maddenin sıcaklığı eşitlenene kadar sürer. Bu duruma **ısıl denge** denir.

### 3. Isı Alışverişi Formülü
Dışarıdan yalıtılmış bir ortamda:
$$ Q_{alınan} = Q_{verilen} $$
$$ m_1 \\cdot c_1 \\cdot \\Delta T_1 = m_2 \\cdot c_2 \\cdot \\Delta T_2 $$

Burada $c$ öz ısıdır. Su için $c = 1 cal/g°C$ değerindedir.
        `
    },
    {
        id: 'dialysis',
        grade: 9,
        subject: 'biology',
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
* **İyot ve Fehling:** Küçük moleküllerdir, zardan **GEÇEBİRLER**.

### 3. Beklenen Gözlemler
* **Nişasta Deneyi:** Kapta İyot vardır (Sarı). İyot zara girer, içerisi **Morarır**. Nişasta dışarı çıkamaz, kap **Sarı kalır**.
* **Glikoz Deneyi:** Kapta Fehling vardır (Mavi). Glikoz dışarı çıkar, Fehling içeri girer. Sıcaklık etkisiyle **hem kap hem de bağırsak içi Kiremit Kırmızısına döner**.

> **Sonuç:** Difüzyon, molekül büyüklüğüne bağlıdır. ATP harcanmaz.
        `
    },
    {
        id: 'diffusion_simple',
        grade: 9,
        subject: 'biology',
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
        subject: 'biology',
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
        id: 'ohm_law',
        grade: 10,
        subject: 'physics',
        title: 'Ohm Kanunu',
        desc: 'Bir devredeki gerilim, akım ve direnç arasındaki ilişkiyi grafik üzerinde gözlemleyin.',
        difficulty: 3, time: '10 dk', icon: 'fa-bolt',
        details: { objective: 'Gerilim ve akım arasındaki doğru orantıyı doğrulamak.', independent: 'Gerilim (Volt)', dependent: 'Akım (Amper)', constants: ['Direnç'] },
        impact_guide: " - **Gerilim:** Artarsa akım doğru orantılı olarak artar ($V = I \\cdot R$).\n - **Direnç:** Sabit tutulduğunda $V/I$ oranı her zaman direnci verir.",
        theory: `
# Elektrik Devreleri: Ohm Kanunu

### 1. Temel Tanım
Alman bilim insanı Georg Ohm tarafından bulunan bu kanun, bir iletkenin uçları arasındaki potansiyel fark (gerilim) ile üzerinden geçen akım şiddeti arasındaki ilişkiyi açıklar.

### 2. Formül
$$ V = I \\cdot R $$
Burada:
* $V$: Potansiyel Fark (Volt)
* $I$: Akım Şiddeti (Amper)
* $R$: Direnç (Ohm, $\\Omega$)

### 3. Grafik Analizi
Gerilim-Akım grafiği çizildiğinde elde edilen doğrunun eğimi, devredeki direnci verir.
$$ Eğim = \\frac{V}{I} = R $$
        `
    },
    {
        id: 'magnetism',
        grade: 10,
        subject: 'physics',
        title: 'Mıknatıs ve Manyetik Alan',
        desc: 'Demir tozları kullanarak bir mıknatısın çevresinde oluşan manyetik alan çizgilerini görselleştirin.',
        difficulty: 2, time: '8 dk', icon: 'fa-magnet',
        details: { objective: 'Manyetik alan kavramını ve çizgilerin yönünü anlamak.', independent: 'Mıknatıs Türü', dependent: 'Alan Çizgileri', constants: ['Ortam'] },
        impact_guide: " - **Manyetik Alan:** Mıknatısın etki alanıdır. Çizgiler N kutbundan S kutbuna doğrudur.",
        theory: `
# Manyetizma: Manyetik Alan

### 1. Mıknatıs ve Kutuplar
Mıknatısların N (Kuzey) ve S (Güney) olmak üzere iki kutbu vardır. Aynı kutuplar birbirini iter, zıt kutuplar çeker.

### 2. Manyetik Alan Çizgileri
Mıknatıs çevresinde var olan kuvvet alanını göstermek için kullanılır.
* Çizgiler **N kutbundan çıkar, S kutbunda son bulur**.
* Çizgilerin sık olduğu yerlerde manyetik alan daha güçlüdür.

### 3. Manyetik Geçirgenlik
Mıknatıs üzerine bir kağıt koyup demir tozları döküldüğünde, tozlar alan çizgileri boyunca dizilerek alanı görünür hale getirir.
        `
    },
    {
        id: 'liq_pressure',
        grade: 10,
        subject: 'physics',
        title: 'Sıvı Basıncı Deneyi',
        desc: 'Derinlik ve yoğunluk arttıkça sıvı basıncındaki değişimi U borusu yardımıyla gözlemleyin.',
        difficulty: 3, time: '12 dk', icon: 'fa-water',
        details: { objective: 'Sıvı basıncının derinlik ve yoğunluğa bağlılığını incelemek.', independent: 'Derinlik / Yoğunluk', dependent: 'Sıvı Basıncı (P)', constants: ['Yerçekimi'] },
        impact_guide: " - **Derinlik (h):** Arttıkça basınç doğrusal olarak artar.\n - **Yoğunluk (d):** Sıvının özkütlesi arttıkça basınç artar.",
        theory: `
# Akışkan Mekaniği: Sıvı Basıncı

### 1. Tanım
Sıvıların ağırlıkları nedeniyle içinde bulundukları kabın her noktasına uyguladıkları kuvvettir.

### 2. Basınç Formülü
$$ P = h \\cdot d \\cdot g $$
Burada:
* $P$: Sıvı Basıncı
* $h$: Derinlik (Yüzeye olan mesafe)
* $d$: Sıvının Özkütlesi
* $g$: Yerçekimi İvmesi

### 3. U Borusu ile Ölçüm
U borusunun bir ucuna huni takılıp sıvıya daldırıldığında, basınç farkı nedeniyle U borusundaki sıvı seviyeleri arasında fark oluşur. Bu fark basıncın büyüklüğünü gösterir.
        `
    },
    {
        id: 'buoyancy',
        grade: 10,
        subject: 'physics',
        title: 'Kaldırma Kuvveti (Arşimet)',
        desc: 'Cismin batan hacmi ile taşıran sıvının ağırlığı arasındaki ilişkiyi keşfedin.',
        difficulty: 3, time: '15 dk', icon: 'fa-ship',
        details: { objective: 'Kaldırma kuvvetinin batan hacme ve sıvı yoğunluğuna etkisini anlamak.', independent: 'Batan Hacim', dependent: 'Kaldırma Kuvveti ($F_k$)', constants: ['Sıvı'] },
        impact_guide: " - **Batan Hacim:** Bir cisim sıvıya ne kadar çok batarsa, üzerine o kadar çok kaldırma kuvveti etki eder.",
        theory: `
# Arşimet Prensibi ve Kaldırma Kuvveti

### 1. Arşimet Prensibi
Sıvıya batan bir cisme, yerini değiştirdiği sıvının ağırlığı kadar bir kaldırma kuvveti etki eder.

### 2. Kaldırma Kuvveti Formülü
$$ F_k = V_{batan} \\cdot d_{sıvı} \\cdot g $$

### 3. Yüzme, Askıda Kalma ve Batma
* **Yüzme:** $F_k = G$ (Cismin özkütlesi < Sıvı özkütlesi)
* **Askıda Kalma:** $F_k = G$ (Cismin özkütlesi = Sıvı özkütlesi)
* **Batma:** $F_k < G$ (Cismin özkütlesi > Sıvı özkütlesi)
        `
    },
    {
        id: 'ripple_tank',
        grade: 10,
        subject: 'physics',
        title: 'Dalga Leğeni',
        desc: 'Su dalgalarında yansıma, kırılma ve engellerden geçiş olaylarını simüle edin.',
        difficulty: 4, time: '15 dk', icon: 'fa-wave-square',
        details: { objective: 'Dalga hareketinin temel özelliklerini görsel olarak incelemek.', independent: 'Engel Şekli', dependent: 'Dalga Deseni', constants: ['Frekans'] },
        impact_guide: " - **Yansıma:** Dalgalar bir engele çarptığında aynı açıyla geri döner.\n - **Kırınım:** Dalgalar dar bir aralıktan geçerken bükülür.",
        theory: `
# Dalga Mekaniği: Su Dalgaları

### 1. Dalga Leğeni Nedir?
Dalga hareketlerini, yansıma ve kırılma gibi olayları deneysel olarak incelemek için kullanılan içi su dolu cam tabanlı bir kaptır.

### 2. Yansıma
Doğrusal veya dairesel su dalgalarının bir engele çarparak geri dönmesidir. Yansıma kuralı: Gelme açısı = Yansıma açısı.

### 3. Kırınım (Difraksiyon)
Dalgaların bir engel kenarından veya dar bir yarıktan geçerken daireselleşerek yayılması olayıdır. Yarık genişliği dalga boyuna yaklaştıkça kırınım belirginleşir.
        `
    },
    {
        id: 'photosynthesis',
        grade: 10,
        subject: 'biology',
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
        subject: 'biology',
        title: 'Fermantasyon',
        desc: 'Maya hücrelerinde etil alkol fermantasyonu.',
        guide: 'Maya hücreleri fermantasyonla çıkardığı karbondioksit ile balon şişecektir. Fermantasyon hızına göre çıkardığı karbondioksitin artması ya da azalması ile balon büyüklüğü değişecektir.',
        difficulty: 2, time: '20 dk', icon: 'fa-bread-slice',
        details: { objective: 'Besin türünün fermantasyona etkisi.', independent: 'Şeker Türü', dependent: 'Gaz Çıkışı', constants: ['Maya'] },
        impact_guide: " - **Glikoz:** Maya için en kolay besindir, fermantasyon HIZLI olur.\n - **Sükroz:** Önce sindirilmesi gerekir, fermantasyon ORTA hızdadır.\n - **Nişasta:** Mayalar nişastayı sindiremez, fermantasyon OLMAZ.\n - **Sıcaklık:** 30-35°C idealdir.",
        theory: `
# Etil Alkol Fermantasyonu

### 1. Süreç
Oksijenের olmadığı durumlarda, bazı canlılar (örn: bira mayası) glikozu parçalayarak enerji üretir. Bu süreç sitoplazmada gerçekleşir.

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
        subject: 'biology',
        title: 'Hücreli Solunum',
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

### 3. Oksijen'in Rolü
Oksijen, Elektron Taşıma Sistemi'nin (ETS) son elektron alıcısıdır. Oksijen yoksa ETS durur, Krebs durur ve hücre sadece fermantasyon yapabilir (çok az enerji).
        `
    },
    {
        id: 'osmosis',
        grade: 9,
        subject: 'biology',
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
        subject: 'biology',
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
        subject: 'biology',
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
    },
    // 9. SINIF KİMYA
    {
        id: 'cozelti_hazirlama',
        grade: 9,
        subject: 'chemistry',
        title: 'Çözelti Hazırlama',
        desc: 'Temel laboratuvar cam eşyalarını kullanarak belirli bir derişimde sulu sodyum klorür (NaCl) çözeltisi hazırlayın.',
        difficulty: 1, time: '10 dk', icon: 'fa-flask',
        details: { objective: 'Hassas terazi ve balonjoje kullanarak kütlece/hacimce derişimi bilinen homojen sulu çözelti hazırlamak.', independent: 'NaCl Kütlesi (g)', dependent: 'Çözelti Derişimi (g/L)', constants: ['Sıcaklık (25°C)', 'Çözücü (Saf Su)'] },
        impact_guide: " - **Katı Miktarı (NaCl):** Çözünen kütlesi arttıkça çözeltinin derişimi ($C = m / V$) doğru orantılı olarak ARTAR.\n - **Su Hacmi:** Çözücü hacmi arttıkça çözelti seyrelir ve derişim AZALIR.\n - **Karıştırma:** Çözünme hızını artırır, son derişim değerini değiştirmez.",
        theory: `
# Kimya Bilimi ve Laboratuvar Güvenliği: Çözelti Hazırlama

### 1. Teorik Arka Plan
Çözelti; iki veya daha fazla maddenin birbiri içerisinde gözle görülemeyecek kadar küçük parçacıklar halinde homojen olarak dağılmasıyla oluşan karışımdır.
* **Çözünen:** Çözelti içerisinde miktarı genellikle daha az olan maddedir ($NaCl$).
* **Çözücü:** Çözünme ortamını sağlayan maddedir (Saf Su).

### 2. Derişim Hesaplama Formülü
Kütle/Hacim derişimi ($g/L$):
$$ C = \\frac{m_{çözünen}}{V_{çözelti}} $$

Burada:
* $m$: Tartılan katı madde kütlesi (gram)
* $V$: Çözeltinin toplam hacmi (Litre)

### 3. Çözelti Hazırlama Adımları
1. **Tartım:** Hassas terazide saat camı üzerinde istenen miktarda $NaCl$ tartılır.
2. **Ön Çözme:** Katı, beherglasa aktarılır ve az miktarda saf su eklenerek cam baget ile karıştırılır.
3. **Aktarım ve Çizgiye Tamamlama:** Çözelti huni ile balonjojeye aktarılır, menisküs çizgisine kadar saf su eklenir.
4. **Homojenleştirme:** Balonjojenin kapağı kapatılıp altüst edilir.
        `
    },
    {
        id: 'alev_testi',
        grade: 9,
        subject: 'chemistry',
        title: 'Alev Testi (Element Spektrumları)',
        desc: 'Farklı metal katyonlarının (Li⁺, Na⁺, K⁺, Cu²⁺) Bunsen beki alevinde oluşturduğu karakteristik renkleri gözlemleyin.',
        difficulty: 2, time: '8 dk', icon: 'fa-fire',
        details: { objective: 'Metal atomlarının uyarılmasıyla yayılan karakteristik alev renklerini tespit ederek element tanısı yapmak.', independent: 'Metal Katyonu', dependent: 'Alev Rengi ve Dalga Boyu (nm)', constants: ['Alev Sıcaklığı', 'Katyon Konsantrasyonu'] },
        impact_guide: " - **Li⁺ (Lityum):** Parlak Kırmızı / Koyu Pembe alev oluşturur (~670 nm).\n - **Na⁺ (Sodyum):** Yoğun Sarı alev oluşturur (~589 nm).\n - **K⁺ (Potasyum):** Menekşe / Mor alev oluşturur (~766 nm).\n - **Cu²⁺ (Bakır):** Canlı Yeşil / Turkuaz alev oluşturur (~520 nm).",
        theory: `
# Atom Yapısı ve Periyodik Sistem: Alev Testi

### 1. Uyarılma ve Emisyon Mantığı
Atomlardaki elektronlar temel halde en düşük enerji seviyesindedir. Aleve tutulduklarında dışarıdan enerji alarak daha yüksek enerji seviyelerine geçerler (**Uyarılma / Absorbsiyon**).

Uyarılan elektronlar kararsızdır ve kısa sürede temel hale geri dönerler. Bu sırada aldıkları fazla enerjiyi foton (ışık) şeklinde dışarı yayarlar (**Emisyon / Yayınma**).

### 2. Planck-Einstein İlişkisi
Yayılan ışığın enerjisi ve dalga boyu elemente özgüdür:
$$ E = h \\cdot \\nu = \\frac{h \\cdot c}{\\lambda} $$

* $h$: Planck sabiti
* $c$: Işık hızı
* $\\lambda$: Dalga boyu (nm)

### 3. Elementlerin Karakteristik Renkleri
* $Li^+$: 670 nm (Kırmızı)
* $Na^+$: 589 nm (Sarı)
* $K^+$: 766 nm (Menekşe)
* $Cu^{2+}$: 520 nm (Yeşil)
        `
    },
    {
        id: 'polar_apolar',
        grade: 9,
        subject: 'chemistry',
        title: 'Polar/Apolar Çözünürlük ve İletkenlik',
        desc: 'İyonik ve kovalent bileşiklerin polar/apolar çözücülerdeki çözünürlüğünü ve sulu çözeltilerinin elektrik iletkenliğini inceleyin.',
        difficulty: 3, time: '12 dk', icon: 'fa-bolt',
        details: { objective: 'Türler arası etkileşimler doğrultusunda çözünürlük ilkesini ve iyonik/moleküler iletkenlik farkını kavramak.', independent: 'Maddelerin Polaritesi ve İyonik Yapısı', dependent: 'Çözünürlük & İletkenlik (Akım / Ampul Parlaklığı)', constants: ['Sıcaklık (25°C)', 'Çözücü Hacmi'] },
        impact_guide: " - **Benzer Benzeri Çözer:** Polar çözücü (Su) polar ve iyonik maddeleri ($NaCl$, Şeker) çözer; apolar maddeleri (Yağ) çözmez.\n - **İyonik İletkenlik:** $NaCl$ suda iyonlarına ayrışır ($Na^+ + Cl^-$), devre kapandığında ampul parlak yanar.\n - **Moleküler İletkenlik:** Şeker suda moleküler çözünür, serbest iyon bulunmadığı için elektrik iletilmez.",
        theory: `
# Kimyasal Türler Arası Etkileşimler: Çözünürlük ve İletkenlik

### 1. "Benzer Benzeri Çözer" İlkesi
Polar maddeler polar çözücülerde (Su), apolar maddeler apolar çözücülerde (Heksan, zeytinyağı) iyi çözünür.
* **Sodyum Klorür ($NaCl$):** İyonik yapılıdır. Polar su molekülleri iyonların etrafını sararak çözer (**İyon-Dipol Etkileşimi**).
* **Şeker ($C_{12}H_{22}O_{11}$):** Polar moleküler katıdır. Su ile **Hidrojen Bağı** kurarak çözünür.
* **Yağ / İyot:** Apolar yapıdadır, suda çözünmez ancak heksanda çözünür (**London Kuvvetleri**).

### 2. İletkenlik Mekanizması
Çözeltinin elektriği iletebilmesi için ortamda **serbest hareket edebilen iyonlar** bulunmalıdır.
* **İyonik Çözünme:** $NaCl_{(k)} \\xrightarrow{H_2O} Na^+_{(aq)} + Cl^-_{(aq)}$ (Elektrolit çözelti - Işık yanar)
* **Moleküler Çözünme:** $C_{12}H_{22}O_{11(k)} \\xrightarrow{H_2O} C_{12}H_{22}O_{11(aq)}$ (Elektrolit değil - Işık yanmaz)
        `
    },
    {
        id: 'viskozite',
        grade: 9,
        subject: 'chemistry',
        title: 'Sıvılarda Viskozite',
        desc: 'Sıvı türünün (su, zeytinyağı, gliserin) ve sıcaklığın viskoziteye (akıcılığa karşı direnç) etkisini bilye düşürme yöntemiyle ölçün.',
        difficulty: 2, time: '10 dk', icon: 'fa-hourglass-half',
        details: { objective: 'Moleküller arası çekim kuvvetinin ve sıcaklığın sıvılardaki viskoziteye etkisini deneysel olarak doğrulamak.', independent: 'Sıvı Türü / Sıcaklık (°C)', dependent: 'Bilyenin Düşme Süresi (s) & Viskozite', constants: ['Bilye Çapı ve Kütlesi', 'Silindir Yüksekliği'] },
        impact_guide: " - **Moleküller Arası Çekim:** Gliserin > Zeytinyağı > Su. Viskozitesi yüksek olan sıvıda bilye en yavaş düşer.\n - **Sıcaklık Etkisi:** Sıcaklık arttıkça moleküller arası çekim zayıflar, viskozite DÜŞER ve bilye daha HIZLI batar.",
        theory: `
# Maddenin Halleri: Sıvılarda Viskozite

### 1. Viskozite ve Akıcılık
Sıvıların akmaya karşı gösterdiği dirence **viskozite** denir. Viskozitesi yüksek olan sıvının akıcılığı düşüktür.

### 2. Viskoziteye Etki Eden Faktörler
* **Moleküller Arası Çekim Kuvveti:** Çekim kuvveti ne kadar büyükse viskozite o kadar yüksektir. Gliserin molekülleri yoğun hidrojen bağları oluşturduğundan viskozitesi çok yüksektir.
* **Molekül Kütlesi ve Şekli:** Karmaşık ve büyük moleküller birbirine takılarak akmayı zorlaştırır.
* **Sıcaklık:** Sıcaklık arttıkça moleküllerin kinetik enerjisi artar ve moleküller arası çekim zayıflar. Sıcaklık arttıkça viskozite **azalır**.

### 3. Stokes Kanunu (Bilye Düşme Yöntemi)
Sıvı içindeki bilyeye etki eden sürtünme kuvveti $F_s = 6 \\pi \\eta r v$ bağıntısıyla ifade edilir. Viskozite ($\eta$) arttıkça düşme süresi ($t$) artar.
        `
    },
    // 10. SINIF KİMYA
    {
        id: 'kutle_korunumu',
        grade: 10,
        subject: 'chemistry',
        title: 'Kütlenin Korunumu Kanunu',
        desc: 'Baryum klorür ($BaCl_2$) ve Sodyum sülfat ($Na_2SO_4$) tepkimesinde çökelme öncesi ve sonrası kütlenin değişmediğini terazi ile ispatlayın.',
        difficulty: 2, time: '10 dk', icon: 'fa-balance-scale-left',
        details: { objective: 'Kimyasal tepkimelerde giren maddelerin kütleleri toplamının ürünlere eşit olduğunu (Lavoisier Kanunu) kapalı sistemde göstermek.', independent: 'Tepkime Aşaması (Karışma Öncesi/Sonrası)', dependent: 'Sistemin Toplam Kütlesi (g)', constants: ['Sıcaklık', 'Kapalı Kap Hacmi'] },
        impact_guide: " - **Kütlenin Korunumu:** Tepkime öncesinde tartılan kütle ($m_1$), tepkime gerçekleşip beyaz $BaSO_4$ çökeltisi oluştuktan sonraki kütleye ($m_2$) BİREBİR EŞİTTİR ($m_1 = m_2$).",
        theory: `
# Kimyanın Temel Kanunları: Kütlenin Korunumu (Lavoisier Kanunu)

### 1. Kütlenin Korunumu İlkesi
Antoine Lavoisier tarafından 1789'da ortaya konan kanuna göre; kapalı bir sistemde gerçekleşen kimyasal tepkimelerde yoktan madde var edilemez, var olan madde de yok edilemez.

$$ m_{girenler} = m_{ürünler} $$

### 2. Kimyasal Reaksiyon
Çözeltiler karıştırıldığında suda çözünmeyen beyaz renkli Baryum sülfat ($BaSO_4$) çökeltisi oluşur:

$$ BaCl_{2(aq)} + Na_2SO_{4(aq)} \\rightarrow BaSO_{4(k)} \\downarrow + 2NaCl_{(aq)} $$

### 3. Atom Sayısı ve Türünün Korunumu
Tepkimede atom türü ve sayısı korunduğu için kütle değişmez. Gaz çıkışı olan açık sistemlerde gaz kaçacağı için terazi eksik ölçebilir; bu yüzden kapalı kap kullanılır.
        `
    },
    {
        id: 'ayrimsal_damitma',
        grade: 10,
        subject: 'chemistry',
        title: 'Ayrımsal Damıtma',
        desc: 'Kaynama noktaları farklı iki sıvıdan (Etanol 78°C ve Su 100°C) oluşan homojen karışımı fraksiyon kolonu ile bileşenlerine ayırın.',
        difficulty: 3, time: '15 dk', icon: 'fa-filter',
        details: { objective: 'Kaynama noktası farkından yararlanarak sıvı-sıvı homojen karışımları ayırma mantığını kavratmak.', independent: 'Sıcaklık & Zaman', dependent: 'Yoğuşan Etanol Hacmi (mL) & Sıcaklık Platosu', constants: ['Isıtma Gücü', 'Soğutma Suyu Debisi'] },
        impact_guide: " - **78°C Sıcaklık Platosu:** Etanol kaynamaya başladığında sıcaklık 78°C'de sabit kalır. Bu sürede toplanan sıvı saf etanoldür.\n - **Etanol Bittiğinde:** Sıcaklık tekrar yükselmeye başlar (100°C'ye doğru).",
        theory: `
# Karışımlar ve Ayrıştırma Teknikleri: Ayrımsal Damıtma

### 1. Ayrımsal Damıtma İlkesi
Kaynama noktaları birbirine yakın veya farklı olan sıvı-sıvı homojen karışımları (çözeltileri) bileşenlerine ayırmak için kullanılır.

### 2. Etanol - Su Karışımının Ayrılması
* **Etanol Kaynama Noktası:** 78 °C
* **Su Kaynama Noktası:** 100 °C

Karışım ısıtıldığında kaynama noktası düşük olan etanol öncelikle buharlaşır. Fraksiyon kolonundan geçen etanol buharları soğutucuda (kondansatör) yoğuşarak toplama kabına damlar.

### 3. Sıcaklık-Zaman Grafiği Analizi
Hal değişimi (kaynama) sırasında saf maddelerin sıcaklığı sabit kalır. Termometre 78 °C'yi gösterdiği sürece kaynayan ve yoğuşan madde **saf etanoldür**.
        `
    },
    {
        id: 'dogal_indikator',
        grade: 10,
        subject: 'chemistry',
        title: 'Doğal İndikatör ve pH',
        desc: 'Kırmızı lahanadan elde edilen doğal indikatör ile asit, baz ve nötr maddelerin pH karakterini renk değişimleriyle tespit edin.',
        difficulty: 2, time: '10 dk', icon: 'fa-vial-circle-check',
        details: { objective: 'Doğal indikatör kullanarak maddelerin pH aralığını gözlemlemek ve asit-baz nötralleşmesini izlemek.', independent: 'Eklenen Madde (HCl / NaOH / Sirke / Sabun)', dependent: 'Lahana Suyu Rengi & pH', constants: ['İndikatör Hacmi'] },
        impact_guide: " - **Asidik Ortam (pH < 7):** Kırmızı / Pembe renk oluşur (HCl, Sirke).\n - **Nötr Ortam (pH = 7):** Mor / Mavi renk korunur (Saf Su).\n - **Bazik Ortam (pH > 7):** Yeşil / Sarı renk oluşur (NaOH, Sabunlu Su).\n - **Nötralleşme:** Asidik kırmızının üzerine baz damlatıldıkça mor ve ardından yeşile döner.",
        theory: `
# Asitler, Bazlar ve Tuzlar: Doğal İndikatörler

### 1. İndikatör (Ayraç) Tanımı
Bir çözeltinin asidik veya bazik oluşuna bağlı olarak renk değiştiren karmaşık organik maddelerdir.

### 2. Kırmızı Lahana İndikatörü (Antosiyanin)
Kırmızı lahana yapraklarında bulunan **Antosiyanin** pigmenti doğal bir pH indikatörüdür:
* **pH < 3 (Kuvvetli Asit):** Canlı Kırmızı
* **pH 4-6 (Zayıf Asit):** Pembe / Açık Kırmızı
* **pH 7 (Nötr):** Mor
* **pH 8-10 (Zayıf Baz):** Yeşil / Mavi-Yeşil
* **pH > 11 (Kuvvetli Baz):** Sarı / Sarı-Yeşil

### 3. Nötralleşme Tepkimesi
$$ H^+_{(aq)} + OH^-_{(aq)} \\rightarrow H_2O_{(s)} $$
Asit üzerine baz eklendikçe $H^+$ iyonları azalır, renk kırmızıdan mora ve ardından yeşile kayar.
        `
    },
    {
        id: 'sabun_eldesi',
        grade: 10,
        subject: 'chemistry',
        title: 'Sabun Eldesi (Saponifikasyon)',
        desc: 'Bitkisel yağ ve Güçlü Baz ($NaOH$) reaksiyonu (saponifikasyon / ester hidrolizi) ile tuzlama etkisi uygulayarak sabun elde edin.',
        difficulty: 3, time: '15 dk', icon: 'fa-soap',
        details: { objective: 'Yağ asitlerinin bazik hidroliz tepkimesini ve çöktürme (tuzlama) ilkesini laboratuvarda deneyimlemek.', independent: 'Isıtma Süresi & NaCl Ekleme', dependent: 'Sabun Kıvamı & Çökelme Miktarı', constants: ['Yağ Türü', 'NaOH Konsantrasyonu (%20)'] },
        impact_guide: " - **Kaynatma & Karıştırma:** Yağ ve NaOH ısıtıldıkça kıvam koyulaşır (macun kıvamı).\n - **Tuzlama Efekti (NaCl):** Doymuş NaCl eklenmesi sabunun sudaki çözünürlüğünü düşürür ve katı sabunun üste çıkmasını sağlar.",
        theory: `
# Kimya Her Yerde: Sabun Eldesi (Sabunlaşma)

### 1. Sabunlaşma (Saponifikasyon) Tepkimesi
Yağların (trigliseritler) sodyum hidroksit ($NaOH$) veya potasyum hidroksit ($KOH$) gibi güçlü bazlarla ısıtılarak ester hidrolizine uğraması sonucu yağ asidi tuzu (sabun) ve gliserin oluşur.

$$ Trigliserit (Yağ) + 3NaOH \\xrightarrow{Isı} 3 (Yağ\\ Asidi\\ Na\\ Tuzu - Sert\\ Sabun) + Gliserin $$

### 2. Sert Sabun vs Yumuşak Sabun
* **$NaOH$ Kullanılırsa:** Sert sabun (Beyaz sabun) elde edilir.
* **$KOH$ Kullanılırsa:** Yumuşak sabun (Arap sabunu) elde edilir.

### 3. Tuzlama (Salting-Out) Efekti
Sabunlaşma tamamlandıktan sonra karışıma doymuş $NaCl$ çözeltisi eklendiğinde, ortamdaki $Na^+$ iyonu derişimi artar (Ortak iyon etkisi). Bu da sabunun çözünürlüğünü azaltarak yüzeyde katı kütle halinde toplanmasını sağlar.
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
            duration: 15,
            liverState: 'whole', peroxide: 5, isBoiled: 'false', tempEnv: '25',
            temp: 25, additive: 'none', // Water, Enzyme, Diffusion
            bagContent: 'starch', speed: 1, 
            molecule: 'dye', 
            light: 50, co2: 'medium', 
            ph: 7, 
            sugar: 'glucose', 
            oxygen: 21, 
            salt: 0.9, 
            exercise: 0, bodyTemp: 36.5, 
            factoryLoad: 20, traffic: 20, hasFilter: 'false',
            tool: 'caliper', // Prec Measure
            mass: 100, volume: 50, // Density
            mass1: 100, temp1: 20, mass2: 100, temp2: 80, // Thermal Eq
            voltage: 10, resistance: 5, // Ohm
            magType: 'neodymium', // Magnetism
            depth: 10, density: 1, // Liq Pressure
            vBatan: 50, dLiquid: 1, // Buoyancy
            freq: 5, // Ripple Tank
            // Chemistry params
            naclMass: 5, waterVol: 250, stirring: 'false',
            metalSalt: 'LiCl', flameTemp: 1000,
            solvent: 'water', solute: 'nacl', testCircuit: 'off',
            liquid: 'water',
            bacl2Vol: 5, na2so4Vol: 20, isTilted: 'false',
            heatPower: 50, etanolRatio: 50,
            sample: 'vinegar', drops: 5,
            oilVol: 25, naohConc: 20, heatTemp: 70, addSalt: 'false'
        };

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

            if (this.timer === 4) {
                if (typeof surveySystem !== 'undefined' && typeof app !== 'undefined' && app.currentExp) {
                    surveySystem.recordExperimentRun(app.currentExp.id);
                }
            }

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

    calculateOutput: function (id, t, params) {
        let input = 0, output = 0;
        
        if (id === 'liver') {
            input = params.liverState === 'whole' ? 1 : 3;
            let surfaceFactor = params.liverState === 'ground' ? 5.0 : 1.0;
            if (params.isBoiled === 'true') surfaceFactor = 0;
            let temp = parseInt(params.tempEnv);
            let tempFactor = 0;
            if (temp < 60) {
                tempFactor = Math.exp(-Math.pow(temp - 37, 2) / 300);
                if (temp === 0) tempFactor = 0.1;
            } else tempFactor = 0;
            let substrateConc = params.peroxide; 
            let rate = (10 * substrateConc) / (3 + substrateConc);
            output = rate * surfaceFactor * tempFactor;

        } else if (id === 'water_prop') {
            input = params.temp;
            let impurityFactor = params.additive === 'detergent' ? 0.6 : (params.additive === 'salt' ? 1.1 : 1.0);
            output = (75.6 - (0.17 * input)) * impurityFactor;

        } else if (id === 'prec_measure') {
            input = params.tool === 'micrometer' ? 0.01 : 0.1;
            output = input;

        } else if (id === 'density_det') {
            let m = params.mass || 100;
            let v = params.volume || 50;
            input = m;
            output = m / v;

        } else if (id === 'thermal_eq') {
            let m1 = params.mass1 || 100, t1 = params.temp1 || 20;
            let m2 = params.mass2 || 100, t2 = params.temp2 || 80;
            input = t1;
            output = (m1 * t1 + m2 * t2) / (m1 + m2);

        } else if (id === 'ohm_law') {
            let v = params.voltage || 10;
            let r = params.resistance || 5;
            input = v;
            output = v / r;

        } else if (id === 'magnetism') {
            input = params.magType === 'neodymium' ? 2 : 1;
            output = input * 10;

        } else if (id === 'liq_pressure') {
            let h = params.depth || 10;
            let d = params.density || 1;
            input = h;
            output = h * d * 9.81 / 100; // h.d.g simplified

        } else if (id === 'buoyancy') {
            let v_bat = params.vBatan || 50;
            let d_liq = params.dLiquid || 1;
            input = v_bat;
            output = v_bat * d_liq * 9.81 / 100;

        } else if (id === 'ripple_tank') {
            input = params.freq || 5;
            output = 10 / input; // Wavelength indicator

        } else if (id === 'dialysis') {
            input = t;
            let k = params.speed * 0.05;
            output = 100 * (1 - Math.exp(-k * t));

        } else if (id === 'diffusion_simple') {
            input = params.temp;
            let T_Kelvin = input + 273;
            let radius = params.molecule === 'dye' ? 1 : 5; 
            let D = T_Kelvin / radius;
            output = (D * t) / 50;

        } else if (id === 'photosynthesis') {
            input = params.light;
            let I = params.light;
            let Pmax = 100, K_light = 30;
            let lightRate = Pmax * (I / (K_light + I));
            let co2Limit = params.co2 === 'low' ? 0.4 : (params.co2 === 'high' ? 1.0 : 0.75);
            output = Math.min(Pmax, lightRate * co2Limit);

        } else if (id === 'enzyme_kinetics') {
            input = params.temp;
            let t_val = params.temp, p = params.ph;
            let optT = 37;
            let t_act = Math.exp(-Math.pow(t_val - optT, 2) / 400); 
            if (t_val > 50) t_act *= (1 - (t_val - 50) / 10); 
            if (t_val > 60) t_act = 0;
            let optP = 7;
            let p_act = Math.exp(-Math.pow(p - optP, 2) / 2); 
            output = 100 * t_act * p_act;

        } else if (id === 'homeostasis') {
            input = params.exercise;
            output = params.bodyTemp; 

        } else if (id === 'osmosis') {
            input = params.salt;
            output = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 100;

        } else if (id === 'respiration') {
            input = params.oxygen;
            output = 50 * (input / (10 + input));

        } else if (id === 'fermentation') {
            input = params.temp;
            let sugarEff = params.sugar === 'glucose' ? 1.0 : (params.sugar === 'sucrose' ? 0.7 : 0.05);
            let tempEff = params.temp < 50 ? Math.exp(-Math.pow(params.temp - 32, 2) / 100) : 0;
            output = 10 * sugarEff * tempEff;

        } else if (id === 'acid_rain') {
            let source = params.factoryLoad + params.traffic;
            if (params.hasFilter === 'true') source *= 0.4;
            output = 5.6 - (2.6 * (source / 200));

        } else if (id === 'cozelti_hazirlama') {
            let m = params.naclMass || 5;
            let v = (params.waterVol || 250) / 1000;
            input = m;
            output = m / v;

        } else if (id === 'alev_testi') {
            let salt = params.metalSalt || 'LiCl';
            let waveLengths = { LiCl: 670, NaCl: 589, KCl: 766, CuCl2: 520 };
            input = salt;
            output = waveLengths[salt] || 670;

        } else if (id === 'polar_apolar') {
            let sol = params.solvent || 'water';
            let solute = params.solute || 'nacl';
            input = (sol === 'water' ? 'Su (Polar)' : 'Heksan (Apolar)') + ' + ' + (solute === 'nacl' ? 'NaCl' : (solute === 'sugar' ? 'Şeker' : 'Yağ'));
            if (params.testCircuit === 'on' && sol === 'water' && solute === 'nacl') {
                output = 100;
            } else {
                output = 0;
            }

        } else if (id === 'viskozite') {
            input = params.temp || 25;
            let liquid = params.liquid || 'water';
            let baseT = liquid === 'glycerin' ? 12.0 : (liquid === 'oil' ? 5.0 : 1.5);
            let tempFactor = Math.exp(-(input - 20) / 35);
            output = baseT * tempFactor;

        } else if (id === 'kutle_korunumu') {
            let v1 = params.bacl2Vol || 5;
            let v2 = params.na2so4Vol || 20;
            input = v1 + v2;
            let initialMass = 120.5 + (v1 * 1.2) + (v2 * 1.1);
            output = initialMass;

        } else if (id === 'ayrimsal_damitma') {
            input = t;
            let power = (params.heatPower || 50) / 50;
            let currentTemp = 25 + (t * 4 * power);
            if (currentTemp >= 78 && currentTemp <= 88) {
                currentTemp = 78.0 + Math.sin(t) * 0.2;
            } else if (currentTemp > 88) {
                currentTemp = Math.min(100, 78 + (t - 10) * 3 * power);
            }
            output = currentTemp;

        } else if (id === 'dogal_indikator') {
            let sample = params.sample || 'vinegar';
            let phMap = { hcl: 1.2, vinegar: 3.2, water: 7.0, soap: 9.8, naoh: 13.5 };
            input = sample;
            output = phMap[sample] || 7.0;

        } else if (id === 'sabun_eldesi') {
            input = t;
            let heatF = (params.heatTemp || 70) / 70;
            let concF = (params.naohConc || 20) / 20;
            let progress = Math.min(100, t * 7 * heatF * concF);
            if (params.addSalt === 'true') progress = Math.min(100, progress * 1.25);
            output = progress;
        }

        return { input, output };
    },

    recordData: function () {
        const id = app.currentExp.id;
        
        if (id === 'homeostasis') {
            let target = 36.5 + (this.params.exercise * 0.025); 
            let diff = target - this.params.bodyTemp;
            this.params.bodyTemp += diff * 0.1; 
        }

        let { input, output } = this.calculateOutput(id, this.timer, this.params);

        if (id === 'osmosis') {
            let C_out = Math.max(0.1, this.params.salt); 
            let targetVol = 100 * (0.9 / C_out);
            targetVol = Math.max(20, Math.min(150, targetVol));
            let currentVol = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 100;
            output = currentVol + (targetVol - currentVol) * 0.1;
        }

        if (output > 0 && id !== 'homeostasis' && id !== 'osmosis' && id !== 'acid_rain') {
            output += (Math.random() - 0.5) * (output * 0.02); 
        }
        
        output = Math.max(0, parseFloat(output.toFixed(2)));
        if (typeof input === 'number') input = parseFloat(input.toFixed(2));

        let dp = { time: this.timer, input: input, output: output };
        this.dataPoints.push(dp);
        this.updateChart(dp);
        this.updateTable(dp);

        // Rapor butonu kilidini kontrol et
        if (typeof app !== 'undefined' && app.enableReportButton) {
            app.enableReportButton();
        }
    },

    updateTable: function (dp) {
        const b = document.getElementById('data-table-body');
        const r = `<tr class="hover:bg-white/10 transition-colors"><td class="p-3 border-b border-white/5 font-mono text-[var(--secondary)]">${dp.time}s</td><td class="p-3 border-b border-white/5">${dp.input}</td><td class="p-3 border-b border-white/5 font-bold">${dp.output}</td></tr>`;
        b.insertAdjacentHTML('beforeend', r); 
        if (b.children.length > 100) b.firstElementChild.remove();
        b.parentElement.scrollTop = b.parentElement.scrollHeight;
    },

    initChart: function (id) {
        const ctx = document.getElementById('dataChart').getContext('2d');
        if (this.chart) this.chart.destroy();

        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 172, 193, 0.5)'); 
        gradient.addColorStop(1, 'rgba(0, 172, 193, 0.0)'); 

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
                    tension: 0.4, 
                    pointRadius: 4,
                    pointBackgroundColor: '#000', 
                    pointBorderColor: '#00acc1', 
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
        this.chart.update();
    },

    // --- DRAWING ---
    drawLoop: function () {
        if (!this.ctx || !app.currentExp) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const id = app.currentExp.id;
        this.ctx.clearRect(0, 0, w, h);

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
        else if (id === 'prec_measure') this.drawPrecMeasure(w, h);
        else if (id === 'density_det') this.drawDensityDet(w, h);
        else if (id === 'thermal_eq') this.drawThermalEq(w, h);
        else if (id === 'ohm_law') this.drawOhmLaw(w, h);
        else if (id === 'magnetism') this.drawMagnetism(w, h);
        else if (id === 'liq_pressure') this.drawLiqPressure(w, h);
        else if (id === 'buoyancy') this.drawBuoyancy(w, h);
        else if (id === 'ripple_tank') this.drawRippleTank(w, h);
        else if (id === 'cozelti_hazirlama') this.drawCozeltiHazirlama(w, h);
        else if (id === 'alev_testi') this.drawAlevTesti(w, h);
        else if (id === 'polar_apolar') this.drawPolarApolar(w, h);
        else if (id === 'viskozite') this.drawViskozite(w, h);
        else if (id === 'kutle_korunumu') this.drawKutleKorunumu(w, h);
        else if (id === 'ayrimsal_damitma') this.drawAyrimsalDamitma(w, h);
        else if (id === 'dogal_indikator') this.drawDogalIndikator(w, h);
        else if (id === 'sabun_eldesi') this.drawSabunEldesi(w, h);

        this.animationId = requestAnimationFrame(() => this.drawLoop());
    },

    drawLiver: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#ddd';
        ctx.fillRect(w / 2 - 40, h - 200, 80, 180); 
        ctx.beginPath(); ctx.arc(w / 2, h - 20, 40, 0, Math.PI); ctx.fill(); 

        let isBoiled = this.params.isBoiled === 'true';
        let liverColor = isBoiled ? '#D2B48C' : '#8B4513'; 

        ctx.fillStyle = liverColor;
        if (this.params.liverState === 'whole') {
            ctx.beginPath(); ctx.ellipse(w / 2, h - 40, 30, 15, 0, 0, Math.PI * 2); ctx.fill();
        } else {
            for (let i = 0; i < 40; i++) {
                ctx.beginPath(); ctx.arc(w / 2 + (Math.random() * 60 - 30), h - 30 + (Math.random() * 20), 3, 0, Math.PI * 2); ctx.fill();
            }
        }

        let tempEnv = parseInt(this.params.tempEnv);
        let liquidColor = 'rgba(200,240,255,0.4)';
        let label = "25°C";

        if (tempEnv === 0) {
            liquidColor = 'rgba(200, 250, 255, 0.6)'; 
            label = "0°C (Buzlu)";
        } else if (tempEnv >= 60) {
            liquidColor = 'rgba(255, 200, 200, 0.4)'; 
            label = "60°C (Sıcak)";
        }

        ctx.fillStyle = liquidColor;
        ctx.fillRect(w / 2 - 40, h - 180, 80, 160);

        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, w / 2, h - 185);

        let lastOut = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
        let canReact = !isBoiled && tempEnv < 60;

        if (this.isRunning && canReact) {
            // Bubble rate is now directly tied to the output (reaction speed)
            let bubbleRate = lastOut / 30; 
            if (Math.random() < bubbleRate) {
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
        ctx.fillStyle = '#555'; ctx.fillRect(0, h - 20, w, 20);
        ctx.fillStyle = '#cd7f32'; 
        ctx.beginPath(); ctx.ellipse(w / 2, h - 30, 80, 20, 0, 0, Math.PI * 2); ctx.fill();

        let lastOut = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 72;
        let height = lastOut * 1.3;
        let spread = 200 - lastOut * 1.5;
        spread = Math.max(60, Math.min(160, spread));

        ctx.fillStyle = `rgba(0, 150, 255, 0.6)`;
        ctx.beginPath();
        ctx.moveTo(w / 2 - spread / 2, h - 30);
        ctx.bezierCurveTo(w / 2 - spread / 2, h - 30 - height * 1.5, w / 2 + spread / 2, h - 30 - height * 1.5, w / 2 + spread / 2, h - 30);
        ctx.fill();

        ctx.fillStyle = '#fff'; ctx.font = '14px Arial'; ctx.textAlign = 'center';
        let additive = this.params.additive === 'none' ? 'Saf Su' : (this.params.additive === 'detergent' ? 'Deterjanlı Su' : 'Tuzlu Su');
        ctx.fillText(`${additive} (${this.params.temp}°C)`, w / 2, h - 200);
    },

    drawPrecMeasure: function (w, h) {
        const ctx = this.ctx;
        const tool = this.params.tool;
        const animT = Date.now() / 1000;
        const measVal = 10 + 8 * Math.sin(animT * 0.35);

        ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#161b22'; ctx.fillRect(0, h * 0.68, w, h * 0.32);

        const cx = w / 2, cy = h * 0.44;
        const sc = Math.min(w, h) / 420;

        if (tool === 'caliper') {
            const mainL = 240 * sc, jOpen = measVal * 3.5 * sc;
            const bY = cy, bX = cx - mainL / 2;
            // Gövde
            ctx.fillStyle = '#8892a4'; ctx.fillRect(bX, bY - 11 * sc, mainL, 22 * sc);
            // Sabit çene
            ctx.fillStyle = '#6e7a8a'; ctx.fillRect(bX, bY + 11 * sc, 18 * sc, 50 * sc);
            // Hareketli çene
            const movX = bX + 18 * sc + jOpen;
            ctx.fillStyle = '#778899'; ctx.fillRect(movX, bY + 11 * sc, 16 * sc, 50 * sc);
            // Ölçülen nesne
            ctx.fillStyle = '#b87333';
            ctx.beginPath(); ctx.ellipse(bX + 18 * sc + jOpen / 2, bY + 38 * sc, jOpen / 2, 8 * sc, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillRect(bX + 18 * sc, bY + 20 * sc, jOpen, 36 * sc);
            ctx.fillStyle = '#cd7f32';
            ctx.beginPath(); ctx.ellipse(bX + 18 * sc + jOpen / 2, bY + 56 * sc, jOpen / 2, 8 * sc, 0, 0, Math.PI * 2); ctx.fill();
            // Skala
            for (let i = 0; i <= 28; i++) {
                const mx = bX + i * 8 * sc;
                const th = i % 5 === 0 ? 10 * sc : 5 * sc;
                ctx.strokeStyle = '#aab'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(mx, bY - 11 * sc); ctx.lineTo(mx, bY - 11 * sc - th); ctx.stroke();
                if (i % 5 === 0) {
                    ctx.fillStyle = '#cdd'; ctx.font = `${9 * sc}px Inter, Arial`; ctx.textAlign = 'center';
                    ctx.fillText(i, mx, bY - 11 * sc - 14 * sc);
                }
            }
            // Ölçüm kutusu
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(cx + 30, cy - 78, 120, 36);
            ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${measVal.toFixed(1)} mm`, cx + 90, cy - 53);
            ctx.fillStyle = '#80deea'; ctx.font = '11px Inter, Arial'; ctx.textAlign = 'center';
            ctx.fillText('KUMPAS — Hassasiyet: 0.1 mm', cx, h - 20);
        } else {
            // Mikrometre
            ctx.strokeStyle = '#778899'; ctx.lineWidth = 12 * sc; ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(cx - 55 * sc, cy + 35 * sc); ctx.lineTo(cx - 55 * sc, cy - 25 * sc);
            ctx.arc(cx - 25 * sc, cy - 25 * sc, 30 * sc, Math.PI, 0);
            ctx.lineTo(cx + 55 * sc, cy - 25 * sc); ctx.lineTo(cx + 55 * sc, cy + 35 * sc);
            ctx.stroke(); ctx.lineCap = 'butt';
            // Anvil
            ctx.fillStyle = '#9aa'; ctx.fillRect(cx - 72 * sc, cy - 4 * sc, 18 * sc, 8 * sc);
            // Spindle
            const spX = cx + 55 * sc - measVal * 2.2 * sc;
            ctx.fillStyle = '#aab'; ctx.fillRect(spX, cy - 4 * sc, cx + 38 * sc - spX, 8 * sc);
            // Tambur
            ctx.fillStyle = '#667'; ctx.fillRect(spX - 10 * sc, cy - 18 * sc, 24 * sc, 36 * sc);
            // Cisim
            const objW2 = spX - (cx - 53 * sc);
            ctx.fillStyle = '#b87333';
            if (objW2 > 0) ctx.fillRect(cx - 53 * sc, cy - 5 * sc, objW2, 10 * sc);
            // Ölçüm
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(cx + 40, cy - 75, 120, 36);
            ctx.fillStyle = '#00ff88'; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
            ctx.fillText(`${measVal.toFixed(2)} mm`, cx + 100, cy - 50);
            ctx.fillStyle = '#80deea'; ctx.font = '11px Inter, Arial'; ctx.textAlign = 'center';
            ctx.fillText('MİKROMETRE — Hassasiyet: 0.01 mm', cx, h - 20);
        }
    },

    drawDensityDet: function (w, h) {
        const ctx = this.ctx;
        const m = this.params.mass || 100;
        const V = this.params.volume || 50;
        const d = m / V;

        ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#161b22'; ctx.fillRect(0, h * 0.68, w, h * 0.32);

        // --- Dereceli Silindir (sağ) ---
        const cylX = w * 0.57, cylY = h * 0.08, cylW = 54, cylH = h * 0.52;
        ctx.strokeStyle = '#4a9fd4'; ctx.lineWidth = 3;
        ctx.strokeRect(cylX, cylY, cylW, cylH);

        const baseWH = cylH * 0.38;
        const objExtra = Math.min(cylH * 0.28, (V / 200) * cylH * 0.5);

        // Su (baz)
        ctx.fillStyle = 'rgba(0,120,255,0.32)';
        ctx.fillRect(cylX + 3, cylY + cylH - baseWH, cylW - 6, baseWH);
        // Ek su (cisim eklendikten sonra)
        ctx.fillStyle = 'rgba(0,150,255,0.5)';
        ctx.fillRect(cylX + 3, cylY + cylH - baseWH - objExtra, cylW - 6, objExtra);

        // Cisim
        const objS = Math.max(10, Math.min(28, Math.sqrt(V) * 2.2));
        ctx.fillStyle = d > 5 ? '#b8860b' : d > 2 ? '#888' : '#cd7f32';
        ctx.fillRect(cylX + cylW / 2 - objS / 2, cylY + cylH - baseWH - objExtra - objS, objS, objS);

        // Skala çizgileri
        for (let i = 0; i <= 10; i++) {
            const my = cylY + cylH - (i / 10) * cylH;
            ctx.strokeStyle = '#4a9fd4'; ctx.lineWidth = i % 5 === 0 ? 2 : 1;
            ctx.beginPath(); ctx.moveTo(cylX + cylW, my); ctx.lineTo(cylX + cylW + (i % 5 === 0 ? 12 : 6), my); ctx.stroke();
            if (i % 5 === 0) {
                ctx.fillStyle = '#80deea'; ctx.font = '10px Inter, Arial'; ctx.textAlign = 'left';
                ctx.fillText(`${i * 20}mL`, cylX + cylW + 14, my + 4);
            }
        }
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 10px Inter, Arial'; ctx.textAlign = 'center';
        ctx.fillText(`+${V}mL`, cylX + cylW / 2, cylY + cylH - baseWH - objExtra - 8);

        // --- Terazi (sol) ---
        const bx = w * 0.26, by = h * 0.5;
        ctx.fillStyle = '#5d6a76';
        ctx.fillRect(bx - 3, by - 65, 6, 80);
        ctx.fillRect(bx - 30, by + 14, 60, 8);
        ctx.save(); ctx.translate(bx, by - 65);
        ctx.fillStyle = '#778'; ctx.fillRect(-60, -3, 120, 6);
        // Sol pan (ağırlık)
        ctx.strokeStyle = '#778'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(-50, 24); ctx.stroke();
        ctx.fillStyle = '#9aa';
        ctx.beginPath(); ctx.ellipse(-50, 30, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Inter, Arial'; ctx.textAlign = 'center';
        ctx.fillText(`${m}g`, -50, 34);
        // Sağ pan (cisim)
        ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(50, 24); ctx.stroke();
        ctx.fillStyle = '#9aa';
        ctx.beginPath(); ctx.ellipse(50, 30, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = d > 5 ? '#b8860b' : '#888';
        ctx.fillRect(38, 18, 24, 12);
        ctx.restore();

        // Formül
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(6, h - 60, w - 12, 54);
        ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 13px Inter, Arial'; ctx.textAlign = 'center';
        ctx.fillText(`d = m / V = ${m}g / ${V}cm³ = ${d.toFixed(2)} g/cm³`, w / 2, h - 36);
        const mat = d > 7 ? 'Demir/Çelik' : d > 2.5 ? 'Alüminyum' : d > 1.2 ? 'Mermer' : 'Tahta';
        ctx.fillStyle = '#80deea'; ctx.font = '11px Inter, Arial';
        ctx.fillText(`Tahmini Madde: ${mat}`, w / 2, h - 14);
    },

    drawThermalEq: function (w, h) {
        const ctx = this.ctx;
        const m1 = this.params.mass1 || 100, T1i = this.params.temp1 || 20;
        const m2 = this.params.mass2 || 100, T2i = this.params.temp2 || 80;
        const Teq = (m1 * T1i + m2 * T2i) / (m1 + m2);
        const progress = this.isRunning ? Math.min(1, this.timer / (this.params.duration || 15)) : 0;
        const T1 = T1i + (Teq - T1i) * progress;
        const T2 = T2i + (Teq - T2i) * progress;
        const animT = Date.now() / 1000;

        ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#161b22'; ctx.fillRect(0, h * 0.72, w, h * 0.28);

        const tempToRGB = (t) => {
            const n = Math.max(0, Math.min(1, (t - 0) / 100));
            return `rgba(${Math.round(30 + n * 225)},${Math.round(80 - n * 50)},${Math.round(255 - n * 235)},0.85)`;
        };
        const drawBeaker = (bx, by, bw, bh, temp, label) => {
            // Sıvı
            ctx.fillStyle = tempToRGB(temp);
            ctx.fillRect(bx + 4, by + bh * 0.25, bw - 8, bh * 0.65);
            // Termometre çubuğu
            const thermH = bh * 0.6;
            const bulbY = by + bh * 0.82;
            const mercH = Math.max(4, (temp / 100) * thermH);
            ctx.fillStyle = '#333'; ctx.fillRect(bx + bw - 18, by + bh * 0.2, 8, thermH);
            ctx.fillStyle = temp > 50 ? '#ef5350' : '#42a5f5';
            ctx.fillRect(bx + bw - 17, bulbY - mercH, 6, mercH);
            ctx.beginPath(); ctx.arc(bx + bw - 14, bulbY + 5, 7, 0, Math.PI * 2);
            ctx.fillStyle = temp > 50 ? '#ef5350' : '#42a5f5'; ctx.fill();
            // Cam
            ctx.strokeStyle = '#4a9fd4'; ctx.lineWidth = 3;
            ctx.strokeRect(bx, by, bw, bh);
            // Sıcaklık etiketi
            ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${temp.toFixed(1)}°C`, bx + bw / 2, by - 10);
            ctx.fillStyle = '#80deea'; ctx.font = '10px Inter, Arial';
            ctx.fillText(label, bx + bw / 2, by + bh + 16);
        };

        const bw = 80, bh = 130;
        const leftX = w / 2 - 130, rightX = w / 2 + 50, topY = h * 0.2;
        drawBeaker(leftX, topY, bw, bh, T1, `${m1}g / Soğuk`);
        drawBeaker(rightX, topY, bw, bh, T2, `${m2}g / Sıcak`);

        // Isı akışı oku
        if (this.isRunning && T2 - T1 > 1) {
            const arrowY = topY + bh * 0.5;
            const numArrows = 3;
            for (let i = 0; i < numArrows; i++) {
                const offset = ((animT * 60 + i * 40) % 120) - 20;
                const ax = leftX + bw + 8 + offset;
                if (ax < rightX - 8) {
                    ctx.fillStyle = `rgba(255,${Math.round(100 + (T2 - T1))},50,0.8)`;
                    ctx.beginPath();
                    ctx.moveTo(ax + 8, arrowY);
                    ctx.lineTo(ax, arrowY - 5);
                    ctx.lineTo(ax, arrowY + 5);
                    ctx.fill();
                }
            }
            ctx.fillStyle = '#ff7043'; ctx.font = 'bold 10px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Isı Akışı →', w / 2, arrowY - 12);
        }

        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(6, h - 58, w - 12, 52);
        ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 12px Inter, Arial'; ctx.textAlign = 'center';
        ctx.fillText(`Q_alınan = Q_verilen  →  Denge Sıcaklığı = ${Teq.toFixed(1)}°C`, w / 2, h - 36);
        ctx.fillStyle = '#80deea'; ctx.font = '11px Inter, Arial';
        ctx.fillText(`T_denge = (m₁T₁+m₂T₂)/(m₁+m₂) = ${Teq.toFixed(1)}°C`, w / 2, h - 14);
    },

    drawOhmLaw: function (w, h) {
        const ctx = this.ctx;
        const V = this.params.voltage || 10;
        const R = this.params.resistance || 5;
        const I = V / R;
        const animT = Date.now() / 1000;

        // Arka plan
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, w, h);

        // Devre kenarları (kapalı dikdörtgen)
        const cx = w / 2, cy = h / 2;
        const cL = cx - 130, cR = cx + 130;
        const cT = cy - 75, cB = cy + 75;

        // Tel çizgileri
        ctx.strokeStyle = '#1a6090';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(cL, cT); ctx.lineTo(cR, cT);
        ctx.moveTo(cR, cT); ctx.lineTo(cR, cB);
        ctx.moveTo(cR, cB); ctx.lineTo(cL, cB);
        ctx.moveTo(cL, cB); ctx.lineTo(cL, cT);
        ctx.stroke();

        // Pil (sol kenar alt kısım)
        const batCy = (cT + cB) / 2;
        ctx.fillStyle = '#444';
        ctx.fillRect(cL - 14, batCy - 28, 28, 56);
        // Artı plaka (uzun)
        ctx.fillStyle = '#e53935';
        ctx.fillRect(cL - 8, batCy - 28, 16, 20);
        // Eksi plaka (kısa)
        ctx.fillStyle = '#1565c0';
        ctx.fillRect(cL - 5, batCy + 12, 10, 16);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+', cL, batCy - 10);
        ctx.fillText('−', cL, batCy + 28);
        ctx.fillStyle = '#ffcc02';
        ctx.font = 'bold 11px Inter, Arial';
        ctx.fillText(`${V}V`, cL - 28, batCy + 5);

        // Direnç (üst kenar orta — zigzag)
        const rzx = cx, rzy = cT;
        const rzW = 70, rzH = 14;
        ctx.fillStyle = '#c62828';
        ctx.fillRect(rzx - rzW / 2, rzy - rzH / 2 - 3, rzW, rzH);
        // Zigzag çizgileri
        ctx.strokeStyle = '#ff8a80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
            const xz = rzx - rzW / 2 + (i / steps) * rzW;
            const yz = rzy + (i % 2 === 0 ? -5 : 5);
            i === 0 ? ctx.moveTo(xz, yz) : ctx.lineTo(xz, yz);
        }
        ctx.stroke();
        ctx.fillStyle = '#ff8a80';
        ctx.font = 'bold 11px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`R = ${R}Ω`, cx, cT - 18);

        // Ampermetre (sağ kenar orta)
        const amCx = cR, amCy = (cT + cB) / 2;
        ctx.beginPath();
        ctx.arc(amCx, amCy, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#1b5e20';
        ctx.fill();
        ctx.strokeStyle = '#66bb6a';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('A', amCx, amCy + 4);
        ctx.fillStyle = '#66bb6a';
        ctx.font = 'bold 10px Inter, Arial';
        ctx.fillText(`${I.toFixed(2)}A`, amCx + 30, amCy + 4);

        // Elektronlar (kapalı döngü boyunca hareket)
        if (this.isRunning) {
            const speed = I * 0.04; // akımla orantılı hız
            const perimeter = 2 * ((cR - cL) + (cB - cT));
            const numE = Math.max(3, Math.round(I * 3));
            ctx.fillStyle = '#fff';
            for (let i = 0; i < numE; i++) {
                let pos = ((animT * speed * perimeter + (i / numE) * perimeter)) % perimeter;
                let ex, ey;
                // Üst kenar: cL→cR
                if (pos < cR - cL) { ex = cL + pos; ey = cT; }
                // Sağ kenar: cT→cB
                else if (pos < cR - cL + cB - cT) { ex = cR; ey = cT + (pos - (cR - cL)); }
                // Alt kenar: cR→cL
                else if (pos < 2 * (cR - cL) + cB - cT) { ex = cR - (pos - (cR - cL + cB - cT)); ey = cB; }
                // Sol kenar: cB→cT
                else { ex = cL; ey = cB - (pos - (2 * (cR - cL) + cB - cT)); }
                ctx.beginPath();
                ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = '#ffe082';
                ctx.fill();
            }
        }

        // Formül
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(6, h - 58, w - 12, 52);
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 13px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`V = I × R  →  ${V}V = ${I.toFixed(2)}A × ${R}Ω`, w / 2, h - 33);
        ctx.fillStyle = '#80deea';
        ctx.font = '11px Inter, Arial';
        ctx.fillText('Ohm Kanunu — Gerilim, Akım ve Direncin İlişkisi', w / 2, h - 12);
    },

    drawMagnetism: function (w, h) {
        const ctx = this.ctx;
        const magType = this.params.magType || 'neodymium';
        const fieldStrength = magType === 'neodymium' ? 1.0 : 0.55;
        const animT = Date.now() / 1000;
        const cx = w / 2, cy = h / 2;

        ctx.fillStyle = '#080c14';
        ctx.fillRect(0, 0, w, h);

        // Alan çizgileri (N→S kavisli)
        const numLines = magType === 'neodymium' ? 10 : 6;
        const magHW = 55, magHH = 16;
        const nCx = cx - magHW - 10, sCx = cx + magHW + 10;

        for (let i = 0; i < numLines; i++) {
            const t2 = i / (numLines - 1); // 0..1
            const spread = (0.15 + t2 * 0.85) * fieldStrength;
            const opacity = (1 - t2 * 0.6) * fieldStrength;
            const ctrlY = cy - (50 + t2 * 140) * spread;
            ctx.beginPath();
            ctx.moveTo(nCx, cy);
            ctx.bezierCurveTo(nCx + 30, ctrlY, sCx - 30, ctrlY, sCx, cy);
            ctx.strokeStyle = `rgba(0,${Math.round(180 + spread * 75)},255,${opacity.toFixed(2)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // Alt taraf (simetri)
            const ctrlY2 = cy + (50 + t2 * 140) * spread;
            ctx.beginPath();
            ctx.moveTo(nCx, cy);
            ctx.bezierCurveTo(nCx + 30, ctrlY2, sCx - 30, ctrlY2, sCx, cy);
            ctx.strokeStyle = `rgba(0,${Math.round(180 + spread * 75)},255,${opacity.toFixed(2)})`;
            ctx.stroke();

            // Yön oku (orta noktada)
            const arrowT = 0.5 + Math.sin(animT * 0.4) * 0.05;
            const ax = nCx + (sCx - nCx) * arrowT;
            const ay = cy + (ctrlY - cy) * 4 * arrowT * (1 - arrowT);
            const dx = (sCx - nCx) * 0.01;
            const angle = Math.atan2((ctrlY - cy) * (1 - 2 * arrowT) * 4, dx * 100);
            ctx.save();
            ctx.translate(ax, ay);
            ctx.rotate(angle);
            ctx.fillStyle = `rgba(100,200,255,${opacity.toFixed(2)})`;
            ctx.beginPath();
            ctx.moveTo(5, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4);
            ctx.fill();
            ctx.restore();
        }

        // Demir tozu parçacıkları
        const dustCount = magType === 'neodymium' ? 120 : 60;
        for (let i = 0; i < dustCount; i++) {
            const r = 20 + (i / dustCount) * 180;
            const angle2 = ((i * 137.5) + animT * 8) * Math.PI / 180;
            const px = cx + Math.cos(angle2) * r * (1 + 0.3 * Math.sin(angle2 * 3));
            const py = cy + Math.sin(angle2) * r * 0.45;
            const distN = Math.hypot(px - nCx, py - cy);
            const distS = Math.hypot(px - sCx, py - cy);
            if (distN > 12 && distS > 12) {
                ctx.fillStyle = `rgba(180,190,210,${(0.6 * fieldStrength).toFixed(2)})`;
                ctx.beginPath();
                ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Mıknatıs gövdesi — N (kırmızı)
        const grad = ctx.createLinearGradient(nCx - magHW, cy - magHH, nCx - magHW, cy + magHH);
        grad.addColorStop(0, '#c62828'); grad.addColorStop(1, '#8b0000');
        ctx.fillStyle = grad;
        ctx.fillRect(nCx - magHW, cy - magHH, magHW * 2, magHH * 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText('N', nCx, cy + 6);

        // S (mavi)
        const grad2 = ctx.createLinearGradient(sCx - magHW, cy - magHH, sCx - magHW, cy + magHH);
        grad2.addColorStop(0, '#1565c0'); grad2.addColorStop(1, '#0d47a1');
        ctx.fillStyle = grad2;
        ctx.fillRect(sCx - magHW, cy - magHH, magHW * 2, magHH * 2);
        ctx.fillStyle = '#fff';
        ctx.fillText('S', sCx, cy + 6);

        // Etiket
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(6, h - 40, w - 12, 34);
        ctx.fillStyle = '#80deea';
        ctx.font = '11px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Mıknatıs Türü: ${magType === 'neodymium' ? 'Neodymium (güçlü)' : 'Ferrit (zayıf)'}  |  Alan Gücü: ${(fieldStrength * 100).toFixed(0)}%`, w / 2, h - 18);
    },

    drawLiqPressure: function (w, h) {
        const ctx = this.ctx;
        const depth = this.params.depth || 10;
        const density = this.params.density || 1;
        const P = depth * density * 9.81 / 100;

        // Arka plan
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#161b22';
        ctx.fillRect(0, h * 0.72, w, h * 0.28);

        // -- Ana su tankı (sol üst) --
        const tankX = w * 0.05, tankY = h * 0.08;
        const tankW = w * 0.42, tankH = h * 0.55;
        ctx.strokeStyle = '#1a6090';
        ctx.lineWidth = 3;
        ctx.strokeRect(tankX, tankY, tankW, tankH);
        ctx.fillStyle = 'rgba(0,100,200,0.35)';
        ctx.fillRect(tankX + 2, tankY + 2, tankW - 4, tankH - 4);

        // Su içinde probe (huni) — derinliğe göre konum
        const maxDepth = tankH - 20;
        const probeY = tankY + 10 + Math.min(maxDepth, (depth / 30) * maxDepth);
        const probeCx = tankX + tankW * 0.5;
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(probeCx, tankY - 10);
        ctx.lineTo(probeCx, probeY);
        ctx.stroke();
        // Huni kafası
        ctx.beginPath();
        ctx.moveTo(probeCx - 14, probeY);
        ctx.lineTo(probeCx + 14, probeY);
        ctx.lineTo(probeCx + 8, probeY + 18);
        ctx.lineTo(probeCx - 8, probeY + 18);
        ctx.closePath();
        ctx.fillStyle = '#aaa';
        ctx.fill();
        // Derinlik etiketi
        ctx.strokeStyle = 'rgba(255,200,0,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(tankX, tankY + 10);
        ctx.lineTo(tankX - 8, tankY + 10);
        ctx.moveTo(tankX, probeY + 9);
        ctx.lineTo(tankX - 8, probeY + 9);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 11px Inter, Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`h = ${depth} m`, tankX - 10, tankY + 10 + (probeY - tankY) / 2 + 4);

        // -- U Borusu (sağ taraf) --
        const ux = w * 0.62;
        const uBot = h * 0.68;
        const uH = h * 0.48;
        const uArm = 30;
        // Basınç farkından sıvı seviye farkı: ΔP = ρgΔh → Δh = P / (ρg) * 100 (scaled)
        const deltaH = Math.min(uH * 0.4, P * 18);

        // Sol kol (yüksek basınç → sıvı alçalır)
        ctx.strokeStyle = '#4a9fd4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ux, uBot - uH);
        ctx.lineTo(ux, uBot);
        ctx.lineTo(ux + uArm * 2, uBot);
        ctx.lineTo(ux + uArm * 2, uBot - uH);
        ctx.stroke();

        // Sıvı sol kol (basınç etkisiyle alçalmış)
        const leftLiqTop = uBot - uH * 0.55 + deltaH;
        ctx.fillStyle = 'rgba(0,140,255,0.55)';
        ctx.fillRect(ux + 3, leftLiqTop, uArm * 2 - 26, uBot - leftLiqTop - 2);
        // Sıvı köprü
        ctx.fillRect(ux + 3, uBot - 20, uArm * 2 - 6, 18);
        // Sıvı sağ kol (basınçla yükseliyor)
        const rightLiqTop = uBot - uH * 0.55 - deltaH;
        ctx.fillRect(ux + uArm * 2 - 23 + 6, rightLiqTop, uArm * 2 - 26, uBot - rightLiqTop - 2);

        // Seviye fark oku
        if (deltaH > 4) {
            const midX = ux + uArm * 2 + 18;
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(midX, leftLiqTop);
            ctx.lineTo(midX, rightLiqTop);
            ctx.stroke();
            ctx.fillStyle = '#00e5ff';
            ctx.font = 'bold 10px Inter, Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Δh`, midX + 3, (leftLiqTop + rightLiqTop) / 2 + 4);
        }

        // Formül paneli
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(6, h - 62, w - 12, 56);
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 12px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`P = h × d × g = ${depth} m × ${density} kg/m³ × 9.81 = ${P.toFixed(2)} kPa`, w / 2, h - 40);
        ctx.fillStyle = '#80deea';
        ctx.font = '11px Inter, Arial';
        ctx.fillText('Sıvı basıncı derinlik ve yoğunlukla artar', w / 2, h - 18);
    },

    drawBuoyancy: function (w, h) {
        const ctx = this.ctx;
        const vBatan = this.params.vBatan || 50;
        const dLiq = this.params.dLiquid || 1;
        const fk = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
        const g = 9.81;
        const objMass = 200; // sabit cisim kütlesi (g)
        const objWeight = objMass * g / 1000;
        const buoyForce = fk;
        // Cisim pozisyonu: kaldırma = ağırlığa eşitse yüzer, küçükse batar
        const netForce = buoyForce - objWeight;
        const tankTop = h * 0.18;
        const tankBot = h * 0.78;
        const tankL = w / 2 - 90;
        const tankR = w / 2 + 90;
        const waterTop = tankTop + 30;
        // Cisim merkezi — netForce > 0 ise yukarı çıkar
        const objNeutral = (tankBot + waterTop) / 2;
        const objY = Math.max(waterTop + 25, Math.min(tankBot - 25, objNeutral - netForce * 18));

        // Arka plan
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, w, h);

        // Su tankı
        ctx.fillStyle = '#0a1e3a';
        ctx.fillRect(tankL, waterTop, tankR - tankL, tankBot - waterTop);

        // Sıvı rengi (yoğunluğa göre)
        const liqColors = { 1: 'rgba(0,140,255,0.45)', 1.025: 'rgba(0,150,200,0.5)', 13.6: 'rgba(160,160,180,0.6)' };
        let liqColor = 'rgba(0,140,255,0.45)';
        if (dLiq > 10) liqColor = 'rgba(160,160,180,0.6)';
        else if (dLiq > 1) liqColor = 'rgba(0,150,200,0.5)';
        ctx.fillStyle = liqColor;
        ctx.fillRect(tankL + 2, waterTop, tankR - tankL - 4, tankBot - waterTop - 2);

        // Yüzey dalgası
        ctx.strokeStyle = 'rgba(100,200,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = tankL; x <= tankR; x += 4) {
            const wave = Math.sin(x * 0.08 + Date.now() * 0.003) * 2;
            x === tankL ? ctx.moveTo(x, waterTop + wave) : ctx.lineTo(x, waterTop + wave);
        }
        ctx.stroke();

        // Tank çerçevesi
        ctx.strokeStyle = '#1a6090';
        ctx.lineWidth = 4;
        ctx.strokeRect(tankL, tankTop, tankR - tankL, tankBot - tankTop);

        // Cisim (küre)
        const objR = 22;
        const objCx = w / 2;
        const gradObj = ctx.createRadialGradient(objCx - 6, objY - 6, 3, objCx, objY, objR);
        gradObj.addColorStop(0, '#d4956a');
        gradObj.addColorStop(1, '#7b4a2a');
        ctx.beginPath();
        ctx.arc(objCx, objY, objR, 0, Math.PI * 2);
        ctx.fillStyle = gradObj;
        ctx.fill();
        ctx.strokeStyle = '#5a3520';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Kaldırma kuvveti oku (yukarı — mavi)
        const arrowScale = 3;
        const fkPx = Math.min(60, buoyForce * arrowScale);
        ctx.strokeStyle = '#00e5ff';
        ctx.fillStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objCx + 36, objY);
        ctx.lineTo(objCx + 36, objY - fkPx);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(objCx + 36, objY - fkPx);
        ctx.lineTo(objCx + 30, objY - fkPx + 10);
        ctx.lineTo(objCx + 42, objY - fkPx + 10);
        ctx.fill();
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 11px Inter, Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Fk=${buoyForce.toFixed(1)}N`, objCx + 44, objY - fkPx / 2 + 4);

        // Ağırlık oku (aşağı — kırmızı)
        const wPx = Math.min(55, objWeight * arrowScale);
        ctx.strokeStyle = '#ff4444';
        ctx.fillStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objCx - 36, objY);
        ctx.lineTo(objCx - 36, objY + wPx);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(objCx - 36, objY + wPx);
        ctx.lineTo(objCx - 42, objY + wPx - 10);
        ctx.lineTo(objCx - 30, objY + wPx - 10);
        ctx.fill();
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 11px Inter, Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`G=${objWeight.toFixed(1)}N`, objCx - 44, objY + wPx / 2 + 4);

        // Formül + durum
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(6, h - 60, w - 12, 54);
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 12px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Fk = Vbatan × d × g = ${vBatan}cm³ × ${dLiq} × 9.81 = ${buoyForce.toFixed(2)} N`, w / 2, h - 40);
        const durum = buoyForce >= objWeight ? (buoyForce > objWeight ? '🔵 Yüzüyor' : '⚪ Askıda') : '🔴 Batıyor';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Inter, Arial';
        ctx.fillText(durum, w / 2, h - 18);
    },

    drawRippleTank: function (w, h) {
        const ctx = this.ctx;
        const freq = this.params.freq || 5;
        const waveLen = Math.max(18, 120 / freq);
        const animT = Date.now() / 1000;
        const speed = freq * waveLen;
        const cx = w / 2, cy = h / 2;
        const maxR = Math.hypot(w, h) / 2;

        // Arka plan — koyu su rengi
        ctx.fillStyle = '#061525';
        ctx.fillRect(0, 0, w, h);

        // Su içi gradient
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        bg.addColorStop(0, 'rgba(0,80,160,0.4)');
        bg.addColorStop(1, 'rgba(0,20,60,0.0)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Dalga halkaları (sinüzoidal opaklık)
        ctx.save();
        ctx.beginPath();
        ctx.rect(4, 4, w - 8, h - 8);
        ctx.clip();
        const numRings = Math.ceil(maxR / waveLen) + 2;
        for (let i = 0; i < numRings; i++) {
            const r = ((animT * speed) + i * waveLen) % (maxR + waveLen);
            const fade = Math.max(0, 1 - r / maxR);
            const bright = Math.sin(i * Math.PI) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0,${Math.round(160 + bright * 95)},255,${(fade * 0.75).toFixed(2)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        ctx.restore();

        // Tank çerçevesi
        ctx.strokeStyle = '#1a6090';
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, w - 8, h - 8);

        // Kaynak noktası
        const pulse = 0.5 + 0.5 * Math.sin(animT * freq * Math.PI * 2);
        ctx.beginPath();
        ctx.arc(cx, cy, 4 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,120,40,${0.5 + pulse * 0.5})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff4500';
        ctx.fill();

        // Bilgi paneli
        ctx.fillStyle = 'rgba(4,16,30,0.88)';
        ctx.fillRect(0, 0, w, 40);
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 12px Inter, Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`f = ${freq} Hz  |  λ ≈ ${waveLen.toFixed(0)} px  |  v = f·λ = ${speed.toFixed(0)} px/s`, 12, 26);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#80deea';
        ctx.font = '10px Inter, Arial';
        ctx.fillText('Kaynak', cx, cy + 22);
    },

    drawDialysis: function (w, h) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#aaa'; ctx.lineWidth = 4;
        ctx.strokeRect(w / 2 - 100, 100, 200, 300);

        let content = this.params.bagContent;
        let lastOut = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
        let progress = lastOut / 100;

        let beakerColor;
        if (content === 'starch') {
            beakerColor = 'rgba(255, 180, 50, 0.4)';
        } else {
            let r = 50 + (150 * progress);
            let g = 100 - (50 * progress);
            let b = 255 - (205 * progress);
            beakerColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        }

        ctx.fillStyle = beakerColor;
        ctx.fillRect(w / 2 - 98, 150, 196, 248);

        let bagColor;
        if (content === 'starch') {
            let r = 255 - (235 * progress);
            let g = 255 - (235 * progress);
            let b = 255 - (100 * progress);
            bagColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
        } else {
            let r = 240 + (15 * progress);
            let g = 240 - (190 * progress);
            let b = 255 - (205 * progress);
            bagColor = `rgba(${r}, ${g}, ${b}, 0.85)`;
        }

        ctx.fillStyle = bagColor;
        ctx.beginPath();
        ctx.ellipse(w / 2, 250, 40, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath(); ctx.moveTo(w / 2, 170); ctx.lineTo(w / 2, 100); ctx.stroke();

        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = 'bold 12px sans-serif';
        let bagLabel = content === 'starch' ? "Nişasta" : "Glikoz";
        ctx.fillText(bagLabel, w / 2, 250);
    },

    drawDiffusion: function (w, h) {
        const ctx = this.ctx;
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 150, 0, Math.PI * 2);
        ctx.fillStyle = '#eee'; ctx.fill(); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 5; ctx.stroke();

        let radius = 0;
        if (this.isRunning) {
            let lastOut = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
            radius = Math.min(140, lastOut * 10); // Spreading area to radius mapping
        }
        ctx.beginPath(); ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.params.molecule === 'dye' ? 'rgba(0,0,255,0.6)' : 'rgba(255,0,0,0.6)';
        ctx.fill();
    },

    drawPhoto: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, w, h); 
        let sunOpacity = this.params.light / 100;
        ctx.fillStyle = `rgba(255, 255, 0, ${sunOpacity})`;
        ctx.beginPath(); ctx.arc(w - 50, 50, 40, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#228B22';
        ctx.fillRect(w / 2 - 5, h - 100, 10, 100); 
        ctx.beginPath(); ctx.ellipse(w / 2 + 20, h - 80, 30, 10, -0.5, 0, Math.PI * 2); ctx.fill(); 
        ctx.beginPath(); ctx.ellipse(w / 2 - 20, h - 60, 30, 10, 0.5, 0, Math.PI * 2); ctx.fill(); 

        let lastOut = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
        if (this.isRunning) {
            if (Math.random() < lastOut / 100) {
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
        let lastOut = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
        let visualSpeed = lastOut / 10;

        for (let i = 0; i < 10; i++) {
            let x = (Date.now() / 10 * visualSpeed + i * 50) % w;
            let y = h / 2 + Math.sin(x / 50) * 30;

            ctx.fillStyle = denatured ? '#555' : '#FFD700'; 
            ctx.beginPath();
            if (denatured) {
                ctx.moveTo(x, y); ctx.lineTo(x + 20, y); 
            } else {
                ctx.arc(x, y, 10, 0.2, Math.PI * 1.8); 
            }
            ctx.fill();
        }
    },

    drawOsmosis: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#E0F7FA'; ctx.fillRect(0, 0, w, h);

        let currentVol = 100;
        if (this.dataPoints.length > 0) {
            currentVol = this.dataPoints[this.dataPoints.length - 1].output;
        }
        let size = 35 + ((currentVol - 20) / 130) * 80;
        size = Math.max(30, Math.min(115, size));

        let sizeRatio = (size - 30) / 85; 
        let r = Math.round(200 + sizeRatio * 44);
        let g = Math.round(100 + sizeRatio * 43);
        let b2 = Math.round(180 - sizeRatio * 60);
        ctx.fillStyle = `rgb(${r},${g},${b2})`;
        ctx.beginPath(); ctx.arc(w / 2, h / 2, size, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#AD1457'; ctx.lineWidth = 3; ctx.stroke();
    },

    drawFerm: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFF3E0'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.strokeStyle = '#aaa';
        ctx.fillRect(w / 2 - 50, h - 150, 100, 150); ctx.strokeRect(w / 2 - 50, h - 150, 100, 150);
        ctx.fillStyle = '#EF5350';
        let vol = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
        let r = 20 + vol * 2;
        ctx.beginPath(); ctx.arc(w / 2, h - 170 - r, r, 0, Math.PI * 2); ctx.fill();
    },

    drawResp: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#263238'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FF7043';
        ctx.beginPath(); ctx.ellipse(w / 2, h / 2, 100, 50, 0, 0, Math.PI * 2); ctx.fill();
        let lastOut = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
        if (this.isRunning) {
            let count = lastOut / 5; // Tied to ATP output
            for (let i = 0; i < count; i++) {
                ctx.fillStyle = '#FFEB3B';
                ctx.fillRect(w / 2 + (Math.random() * 100 - 50), h / 2 + (Math.random() * 40 - 20), 4, 4);
            }
        }
    },

    drawHomeo: function (w, h) {
        const ctx = this.ctx;
        let lastOut = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 36.5;
        let r = Math.min(255, (lastOut - 36.5) * 50);
        ctx.fillStyle = `rgba(${r}, 100, 100, 0.2)`; ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2 - 50, 30, 0, Math.PI * 2); 
        ctx.moveTo(w / 2, h / 2 - 20); ctx.lineTo(w / 2, h / 2 + 50); 
        ctx.moveTo(w / 2, h / 2); ctx.lineTo(w / 2 - 30, h / 2 + 30); 
        ctx.moveTo(w / 2, h / 2); ctx.lineTo(w / 2 + 30, h / 2 + 30);
        ctx.stroke();

        ctx.fillStyle = '#fff'; ctx.font = "20px Arial"; ctx.fillText(lastOut.toFixed(1) + "°C", w / 2 + 50, h / 2);
    },

    drawAcidRain: function (w, h) {
        const ctx = this.ctx;
        let pollution = 0;
        if (this.dataPoints.length > 0) {
            let pH = this.dataPoints[this.dataPoints.length - 1].output;
            pollution = (5.6 - pH) / 1.6; 
        }

        let skyR = 135 + (pollution * 50);
        let skyG = 206 + (pollution * 0);
        let skyB = 235 - (pollution * 100);
        ctx.fillStyle = `rgb(${skyR}, ${skyG}, ${skyB})`;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#3e2723';
        ctx.fillRect(0, h - 50, w, 50);

        ctx.fillStyle = '#555';
        ctx.fillRect(20, h - 150, 80, 100);
        ctx.fillRect(30, h - 200, 20, 50); 

        let treeR = 34 + (pollution * 150); 
        let treeG = 139 - (pollution * 100);
        let treeB = 34;
        ctx.fillStyle = '#8D6E63'; 
        ctx.fillRect(w / 2 - 10, h - 150, 20, 100);

        ctx.fillStyle = `rgb(${treeR}, ${treeG}, ${treeB})`; 
        ctx.beginPath();
        ctx.arc(w / 2, h - 180, 50, 0, Math.PI * 2);
        ctx.fill();

        if (this.isRunning) {
            for (let i = 0; i < 10; i++) {
                let rx = Math.random() * w;
                let ry = Math.random() * h;
                ctx.fillStyle = pollution > 0.5 ? 'rgba(200, 200, 150, 0.6)' : 'rgba(150, 150, 255, 0.6)';
                ctx.fillRect(rx, ry, 1, 10);
            }
        }

        this.objects.forEach((p, i) => {
            if (p.type === 'smoke' || p.type === 'exhaust') {
                ctx.fillStyle = p.type === 'smoke' ? 'rgba(50,50,50,0.5)' : 'rgba(100,100,100,0.4)';
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
                p.y -= p.v;
                p.x += (Math.random() - 0.5) * 2; 
                p.r += 0.2; 
                if (p.y < 0 || p.r > 30) this.objects.splice(i, 1);
            }
        });

        ctx.fillStyle = '#000'; ctx.font = '16px bold sans-serif'; ctx.textAlign = 'right';
        let currentPH = 5.6;
        if (this.dataPoints.length > 0) currentPH = this.dataPoints[this.dataPoints.length - 1].output;
        ctx.fillText(`Yağmur pH: ${currentPH.toFixed(2)}`, w - 20, 50);
    },

    drawCozeltiHazirlama: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a2e'; ctx.fillRect(0, 0, w, h);
        
        // Bench
        ctx.fillStyle = '#1e293b'; ctx.fillRect(0, h - 60, w, 60);
        ctx.fillStyle = '#00acc1'; ctx.fillRect(0, h - 62, w, 2);

        // Terazi
        let m = this.params.naclMass || 5;
        let v = this.params.waterVol || 250;
        let conc = (m / (v / 1000)).toFixed(1);

        let scaleX = w * 0.25;
        ctx.fillStyle = '#334155'; ctx.fillRect(scaleX - 50, h - 110, 100, 50);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(scaleX - 40, h - 95, 80, 25);
        ctx.fillStyle = '#38bdf8'; ctx.font = '14px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`${m.toFixed(2)} g`, scaleX, h - 78);

        // Terazi üstü saat camı ve tuz
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(scaleX, h - 115, 30, 0, Math.PI); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(scaleX, h - 115, Math.min(25, m * 1.5), 0.2, Math.PI - 0.2); ctx.fill();

        // Balonjoje (Volumetric flask)
        let flaskX = w * 0.7;
        let fillHeight = (v / 500) * 120;
        
        // Sıvı
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(flaskX, h - 110, 55, 0.2, Math.PI - 0.2);
        ctx.rect(flaskX - 15, h - 220 + (120 - fillHeight), 30, fillHeight);
        ctx.fill();

        // Cam gövde
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(flaskX, h - 110, 60, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillRect(flaskX - 15, h - 230, 30, 80);

        // Menisküs çizgisi
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(flaskX - 20, h - 190); ctx.lineTo(flaskX + 20, h - 190); ctx.stroke();

        // Karıştırma efekti
        if (this.params.stirring === 'true' && this.isRunning) {
            ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(flaskX + Math.sin(Date.now()/100)*10, h - 240); ctx.lineTo(flaskX, h - 110); ctx.stroke();
        }

        // HUD Text
        ctx.fillStyle = '#00acc1'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`Çözelti Derişimi: ${conc} g/L`, 20, 40);
        ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';
        ctx.fillText(`Hacim: ${v} mL | NaCl: ${m} g`, 20, 60);
    },

    drawAlevTesti: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#050515'; ctx.fillRect(0, 0, w, h);

        // Bunsen Beki
        let bx = w / 2;
        ctx.fillStyle = '#475569'; ctx.fillRect(bx - 35, h - 40, 70, 15);
        ctx.fillStyle = '#64748b'; ctx.fillRect(bx - 12, h - 140, 24, 100);
        ctx.fillStyle = '#334155'; ctx.fillRect(bx - 18, h - 70, 36, 15);

        // Metal tuzu renkleri & dalga boyları
        let salt = this.params.metalSalt || 'LiCl';
        let colors = {
            LiCl: { main: '#ff1744', glow: 'rgba(255, 23, 68, 0.4)', name: 'Lityum (Li⁺)', wave: '670 nm' },
            NaCl: { main: '#ffea00', glow: 'rgba(255, 234, 0, 0.4)', name: 'Sodyum (Na⁺)', wave: '589 nm' },
            KCl:  { main: '#d500f9', glow: 'rgba(213, 0, 249, 0.4)', name: 'Potasyum (K⁺)', wave: '766 nm' },
            CuCl2:{ main: '#00e676', glow: 'rgba(0, 230, 118, 0.4)', name: 'Bakır(II) (Cu²⁺)', wave: '520 nm' }
        };
        let c = colors[salt] || colors.LiCl;

        // Alev Parlaması (Glow)
        let flicker = Math.sin(Date.now() / 80) * 5;
        let grad = ctx.createRadialGradient(bx, h - 160, 5, bx, h - 160, 70 + flicker);
        grad.addColorStop(0, c.main);
        grad.addColorStop(0.5, c.glow);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(bx, h - 160, 80 + flicker, 0, Math.PI * 2); ctx.fill();

        // Alev Çekirdeği
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(bx - 10, h - 140);
        ctx.quadraticCurveTo(bx, h - 210 - flicker, bx + 10, h - 140);
        ctx.fill();

        // Nikrom Tel Loop
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(bx + 120, h - 80); ctx.lineTo(bx + 5, h - 175); ctx.stroke();
        ctx.beginPath(); ctx.arc(bx, h - 175, 6, 0, Math.PI * 2); ctx.stroke();

        // HUD & Spectrum Bar
        ctx.fillStyle = c.main; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`Element: ${c.name}`, 20, 40);
        ctx.fillStyle = '#94a3b8'; ctx.font = '14px monospace';
        ctx.fillText(`Karakteristik Emisyon: ${c.wave}`, 20, 65);

        // Spektrum çubuğu
        let specGrad = ctx.createLinearGradient(20, h - 30, 300, h - 30);
        specGrad.addColorStop(0, '#d500f9');
        specGrad.addColorStop(0.3, '#00e676');
        specGrad.addColorStop(0.6, '#ffea00');
        specGrad.addColorStop(1, '#ff1744');
        ctx.fillStyle = specGrad; ctx.fillRect(20, h - 30, 280, 10);
    },

    drawPolarApolar: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h);

        let sol = this.params.solvent || 'water';
        let solute = this.params.solute || 'nacl';
        let isConductive = (this.params.testCircuit === 'on' && sol === 'water' && solute === 'nacl');

        // İki Beherglas
        let b1X = w * 0.3, b2X = w * 0.7;

        // Beher 1 (Polar Su)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'; ctx.fillRect(b1X - 50, h - 150, 100, 110);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(b1X - 50, h - 160, 100, 120);
        ctx.fillStyle = '#38bdf8'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Saf Su (Polar)', b1X, h - 20);

        // Beher 2 (Apolar Heksan)
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)'; ctx.fillRect(b2X - 50, h - 150, 100, 110);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(b2X - 50, h - 160, 100, 120);
        ctx.fillStyle = '#eab308'; ctx.fillText('Heksan / Yağ (Apolar)', b2X, h - 20);

        // İletkenlik Devresi (Elektrotlar + Ampul)
        let activeX = sol === 'water' ? b1X : b2X;
        if (this.params.testCircuit === 'on') {
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(activeX - 20, h - 180, 8, 100);
            ctx.fillRect(activeX + 12, h - 180, 8, 100);

            // Ampul
            let bulbY = h - 230;
            ctx.fillStyle = isConductive ? '#ffea00' : '#475569';
            ctx.beginPath(); ctx.arc(activeX, bulbY, 20, 0, Math.PI * 2); ctx.fill();
            if (isConductive) {
                let glow = ctx.createRadialGradient(activeX, bulbY, 2, activeX, bulbY, 40);
                glow.addColorStop(0, 'rgba(255, 234, 0, 0.8)');
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(activeX, bulbY, 40, 0, Math.PI * 2); ctx.fill();
            }
        }

        // HUD Readout
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`İletkenlik Durumu: ${isConductive ? '⚡ Elektrolit (Ampul Yanıyor)' : '❌ İletken Değil (Işık Yok)'}`, 20, 35);
    },

    drawViskozite: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, w, h);

        let liquid = this.params.liquid || 'water';
        let temp = this.params.temp || 25;
        let lastOut = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 3.0;

        let liquids = [
            { id: 'water', name: 'Su', color: 'rgba(56, 189, 248, 0.3)', x: w * 0.25 },
            { id: 'oil', name: 'Zeytinyağı', color: 'rgba(234, 179, 8, 0.4)', x: w * 0.5 },
            { id: 'glycerin', name: 'Gliserin', color: 'rgba(168, 85, 247, 0.4)', x: w * 0.75 }
        ];

        liquids.forEach(l => {
            let isSelected = l.id === liquid;
            ctx.fillStyle = l.color; ctx.fillRect(l.x - 30, h - 220, 60, 170);
            ctx.strokeStyle = isSelected ? '#00acc1' : 'rgba(255,255,255,0.4)';
            ctx.lineWidth = isSelected ? 4 : 2;
            ctx.strokeRect(l.x - 30, h - 230, 60, 180);

            // Bilye
            let ballY = h - 210;
            if (isSelected && this.isRunning) {
                let progress = Math.min(1, this.timer / Math.max(1, lastOut));
                ballY = (h - 210) + progress * 150;
            } else if (isSelected && this.timer >= this.params.duration) {
                ballY = h - 60;
            }
            ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(l.x, ballY, 10, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#ffffff'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(l.name, l.x, h - 25);
        });

        ctx.fillStyle = '#00acc1'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`Sıcaklık: ${temp}°C | Akış Süresi: ${lastOut.toFixed(2)} s`, 20, 35);
    },

    drawKutleKorunumu: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h);

        let isTilted = this.params.isTilted === 'true';
        let v1 = this.params.bacl2Vol || 5;
        let v2 = this.params.na2so4Vol || 20;
        let totalMass = (120.5 + (v1 * 1.2) + (v2 * 1.1)).toFixed(2);

        // Terazi
        ctx.fillStyle = '#1e293b'; ctx.fillRect(w / 2 - 100, h - 70, 200, 45);
        ctx.fillStyle = '#0284c7'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`${totalMass} g`, w / 2, h - 42);

        // Erlenmeyer ve İç Tüp
        let ex = w / 2;
        let ey = h - 140;

        ctx.save();
        if (isTilted) {
            ctx.translate(ex, ey); ctx.rotate(Math.PI / 4); ctx.translate(-ex, -ey);
        }

        // Erlenmeyer sıvısı (Çökelme varsa beyaz bağıntı)
        ctx.fillStyle = isTilted ? 'rgba(255, 255, 255, 0.95)' : 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.moveTo(ex - 45, ey + 60); ctx.lineTo(ex + 45, ey + 60); ctx.lineTo(ex + 15, ey - 20); ctx.lineTo(ex - 15, ey - 20);
        ctx.closePath(); ctx.fill();

        // Cam Çerçeve
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ex - 50, ey + 70); ctx.lineTo(ex + 50, ey + 70); ctx.lineTo(ex + 18, ey - 40); ctx.lineTo(ex - 18, ey - 40);
        ctx.closePath(); ctx.stroke();

        ctx.restore();

        // HUD Badge
        ctx.fillStyle = '#4ade80'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`Kütlenin Korunumu: m₁ = m₂ (${totalMass} g)`, 20, 35);
    },

    drawAyrimsalDamitma: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#0b132b'; ctx.fillRect(0, 0, w, h);

        let temp = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 25;

        // Mantolu Isıtıcı & Damıtma Balonu
        let bx = w * 0.35, by = h - 130;
        ctx.fillStyle = '#ef4444'; ctx.fillRect(bx - 40, by + 20, 80, 40);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)'; ctx.beginPath(); ctx.arc(bx, by, 35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();

        // Fraksiyon Kolonu & Termometre
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(bx - 8, by - 120, 16, 90);
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(bx - 3, by - 140, 6, 30);

        // Soğutucu (Kondansatör)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)'; ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(bx, by - 100); ctx.lineTo(bx + 150, by - 20); ctx.stroke();

        // Damla ve Toplama Kabı
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(bx + 135, h - 100, 40, 60);
        if (temp >= 75 && this.isRunning) {
            ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(bx + 150, by - 10 + (this.timer % 3) * 15, 4, 0, Math.PI * 2); ctx.fill();
        }

        // HUD Readout
        ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'left';
        ctx.fillText(`Sıcaklık: ${temp.toFixed(1)} °C`, 20, 40);
        ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';
        ctx.fillText(temp >= 77 && temp <= 79 ? '🔥 ETANOL KAYNIYOR VE YOĞUŞUYOR (78°C Plato)' : 'Isınma Aşaması', 20, 65);
    },

    drawDogalIndikator: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, w, h);

        let sample = this.params.sample || 'vinegar';
        let phMap = { hcl: { ph: 1.2, color: '#ff2a4b', label: 'HCl (Asit)' }, vinegar: { ph: 3.2, color: '#ff6b8b', label: 'Sirke (Asit)' }, water: { ph: 7.0, color: '#8a2be2', label: 'Saf Su (Nötr)' }, soap: { ph: 9.8, color: '#2ecc71', label: 'Sabun (Baz)' }, naoh: { ph: 13.5, color: '#f1c40f', label: 'NaOH (Kuvvetli Baz)' } };
        let cur = phMap[sample] || phMap.vinegar;

        // Test Tüpü
        let tx = w / 2, ty = h - 130;
        ctx.fillStyle = cur.color; ctx.fillRect(tx - 25, ty - 30, 50, 110);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(tx, ty + 80, 25, 0, Math.PI); ctx.stroke();
        ctx.strokeRect(tx - 25, ty - 60, 50, 140);

        // Damlalık efekti
        if (this.isRunning) {
            ctx.fillStyle = cur.color; ctx.beginPath(); ctx.arc(tx, ty - 80 + (this.timer % 2) * 20, 5, 0, Math.PI * 2); ctx.fill();
        }

        // pH Renk Skalası
        let grad = ctx.createLinearGradient(50, h - 30, w - 50, h - 30);
        grad.addColorStop(0, '#ff2a4b'); grad.addColorStop(0.5, '#8a2be2'); grad.addColorStop(1, '#f1c40f');
        ctx.fillStyle = grad; ctx.fillRect(50, h - 30, w - 100, 12);

        // HUD Readout
        ctx.fillStyle = cur.color; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`Madde: ${cur.label} | pH: ${cur.ph}`, 20, 40);
    },

    drawSabunEldesi: function (w, h) {
        const ctx = this.ctx;
        ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, w, h);

        let progress = this.dataPoints.length > 0 ? this.dataPoints[this.dataPoints.length - 1].output : 0;
        let addSalt = this.params.addSalt === 'true';

        // Isıtıcı & Beherglas
        let bx = w / 2, by = h - 120;
        ctx.fillStyle = '#334155'; ctx.fillRect(bx - 60, by + 40, 120, 20);

        // Reaksiyon Karışımı (Sarımsı yağdan beyaz macuna)
        let alpha = Math.min(1, progress / 100);
        ctx.fillStyle = addSalt ? '#f8fafc' : `rgba(234, 179, 8, ${1 - alpha * 0.5})`;
        ctx.fillRect(bx - 45, by - 40, 90, 80);

        if (addSalt) {
            // Sabun tabakası (Üste çıkmış katı sabun)
            ctx.fillStyle = '#ffffff'; ctx.fillRect(bx - 45, by - 40, 90, 25);
            ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('Katı Sabun Tabakası', bx, by - 25);
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
        ctx.strokeRect(bx - 50, by - 50, 100, 90);

        // Cam baget karıştırma
        if (this.isRunning) {
            ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(bx + Math.sin(Date.now()/150)*20, by - 90); ctx.lineTo(bx, by + 10); ctx.stroke();
        }

        // HUD Readout
        ctx.fillStyle = '#00acc1'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`Sabunlaşma Reaksiyonu: %${progress.toFixed(0)}`, 20, 35);
        ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';
        ctx.fillText(addSalt ? 'Tuzlama Efekti (NaCl): Sabun Sudayken Üste Ayrıştı' : 'Kaynatma ve Karıştırma Aşaması', 20, 60);
    }
};
