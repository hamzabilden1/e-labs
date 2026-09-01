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
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Obfuscate edilecek dosyalar
const files = [
    'js/engine.js',
    'js/simulation3d.js',
    'js/ui.js',
    'js/survey.js',
    'js/firebase-config.js'
];

// Güvenli obfuscation ayarları
// renameGlobals: false — app, simulation3D, surveySystem gibi global değişkenler korunur
const options = {
    compact: true,
    controlFlowFlattening: false,   // true yapınca bazen kod bozulur
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,    // console.log'lar kalsın (debug için)
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,           // ÖNEMLİ: cross-file global değişkenler korunsun
    selfDefending: false,           // true yapınca DevTools açınca donabilir
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.8,
    transformObjectKeys: false,     // Firebase API çağrıları bozulmasın
    unicodeEscapeSequence: false
};

// Önce backup klasörü oluştur
if (!fs.existsSync('js/backup')) {
    fs.mkdirSync('js/backup');
}

let success = 0;
files.forEach(file => {
    try {
        const original = fs.readFileSync(file, 'utf8');

        // Orijinali yedekle (sadece ilk seferde)
        const backupPath = 'js/backup/' + path.basename(file);
        if (!fs.existsSync(backupPath)) {
            fs.writeFileSync(backupPath, original);
            console.log('  Yedeklendi:', backupPath);
        }

        const result = JavaScriptObfuscator.obfuscate(original, options);
        fs.writeFileSync(file, result.getObfuscatedCode());

        const before = (original.length / 1024).toFixed(1);
        const after = (result.getObfuscatedCode().length / 1024).toFixed(1);
        console.log(`✓ ${file}  ${before}KB → ${after}KB`);
        success++;
    } catch (e) {
        console.error(`✗ ${file} HATA:`, e.message);
    }
});

console.log(`\nTamamlandı: ${success}/${files.length} dosya obfuscate edildi.`);
console.log('Orijinal dosyalar js/backup/ klasöründe yedekli.');
