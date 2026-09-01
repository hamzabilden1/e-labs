/**
 * ==========================================
 * E-LabS — Firebase Yapılandırması
 * ==========================================
 *
 * KURULUM ADIMLARI (İlk Kez Firebase Kullanıyorsanız):
 *
 * 1. https://console.firebase.google.com adresine gidin
 * 2. "Add project" → Proje adı: "elabs-3d" → Continue
 * 3. Google Analytics için "Enable" seçin → Create project
 *
 * 4. Sol menü → "Build" → "Firestore Database"
 *    - "Create database" → "Start in production mode" → Bölge: "eur3 (europe-west)" → Enable
 *
 * 5. Firestore Rules — "Rules" sekmesine tıklayın, şunu yapıştırın:
 *    rules_version = '2';
 *    service cloud.firestore {
 *      match /databases/{database}/documents {
 *        match /surveys/{docId} {
 *          allow create: if true;
 *          allow read, update, delete: if false;
 *        }
 *        match /events/{docId} {
 *          allow create: if true;
 *          allow read, update, delete: if false;
 *        }
 *      }
 *    }
 *    "Publish" butonuna basın.
 *
 * 6. Sol menü → "Project settings" (dişli simgesi) → "General" sekmesi
 *    → "Your apps" bölümü → "</>" (Web) simgesine tıklayın
 *    → App nickname: "elabs-web" → Register app
 *    → firebaseConfig nesnesini kopyalayın, aşağıya yapıştırın.
 *
 * 7. Sonuçları görmek için:
 *    - Firestore → "surveys" koleksiyonuna bakın
 *    - Her anket yanıtı ayrı bir döküman olarak kaydedilir
 *    - Verileri dışa aktarmak için: Firestore → "Export" (sağ üst menü)
 */

// ↓↓↓ Firebase Console'dan kopyaladığınız config'i buraya yapıştırın ↓↓↓
const firebaseConfig = {
    apiKey: "AIzaSyBck7QDmBTPpFKltp59MQyS-5JF2VcXZrw",
    authDomain: "project-660aa30b-85ff-401a-a2e.firebaseapp.com",
    projectId: "project-660aa30b-85ff-401a-a2e",
    storageBucket: "project-660aa30b-85ff-401a-a2e.firebasestorage.app",
    messagingSenderId: "53616158151",
    appId: "1:53616158151:web:d26bfada2c30e08ba4a5e2",
    measurementId: "G-NVTK535FGP"
};
// ↑↑↑ Buraya kadar ↑↑↑

// Firebase başlatma
let db = null;
let fbAnalytics = null;
let fbApp = null;

try {
    fbApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();

    // Firestore offline persistence — bağlantı kesilse bile veri kaybolmaz
    db.enablePersistence({ synchronizeTabs: true }).catch(() => {});

    // Google Analytics — measurementId varsa başlat
    if (firebaseConfig.measurementId) {
        fbAnalytics = firebase.analytics();
        // İlk açılış olayı
        fbAnalytics.logEvent('app_open', {
            app_name: 'E-LabS 3D',
            app_version: '2.0'
        });
        console.log('[E-LabS] Firebase Analytics aktif:', firebaseConfig.measurementId);
    }

    console.log('[E-LabS] Firebase bağlantısı başarılı. Project:', firebaseConfig.projectId);
} catch (e) {
    console.error('[E-LabS] Firebase başlatma hatası:', e.code, e.message);
}

/**
 * Firestore'a veri yazan yardımcı fonksiyon.
 * @param {string} collection - Koleksiyon adı ('surveys' | 'events')
 * @param {object} data - Kaydedilecek veri
 * @returns {Promise<string|null>} - Döküman ID'si veya null
 */
async function saveToFirestore(collection, data) {
    if (!db) return null;
    try {
        const ref = await db.collection(collection).add({
            ...data,
            _timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            _sessionId: getSessionId()
        });
        return ref.id;
    } catch (e) {
        console.error('[E-LabS] Firestore yazma hatası:', e);
        return null;
    }
}

/**
 * Oturum ID'si — tarayıcı sekmesi başına benzersiz.
 */
function getSessionId() {
    if (!window._blSessionId) {
        window._blSessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    return window._blSessionId;
}

/**
 * analyticsManager — ui.js ve survey.js genelinde kullanılan
 * Google Analytics + Firestore olay kayıt arayüzü.
 */
const analyticsManager = {
    logEvent: function (eventName, params = {}) {
        // Firebase Analytics (Google Analytics 4)
        if (fbAnalytics) {
            try {
                fbAnalytics.logEvent(eventName, {
                    ...params,
                    timestamp: Date.now(),
                    session_id: getSessionId()
                });
            } catch (e) {
                console.warn('[Analytics] logEvent hatası:', eventName, e.message);
            }
        }
        // Firestore'a da yaz — kendi admin paneliniz için
        saveToFirestore('events', { event: eventName, params, session: getSessionId() });
    },

    // Deney başlatıldı
    logExperimentStart: function (expId, expTitle) {
        this._expStartTime = Date.now();
        if (fbAnalytics) {
            fbAnalytics.logEvent('select_content', {
                content_type: 'experiment',
                item_id: expId,
                content_id: expTitle
            });
        }
        this.logEvent('experiment_start', { expId, expTitle });
    },

    // Deney durduruldu
    logExperimentStop: function (expId, durationSec) {
        if (fbAnalytics) {
            fbAnalytics.logEvent('experiment_complete', {
                content_type: 'experiment',
                item_id: expId,
                value: durationSec
            });
        }
        this.logEvent('experiment_stop', { expId, durationSec });
    },

    // Anket gönderildi
    logSurvey: function (experimentId, answers) {
        if (fbAnalytics) {
            fbAnalytics.logEvent('survey_submit', { experimentId });
        }
        this.logEvent('survey_quick', { experimentId, ...answers });
    },

    // Rapor oluşturuldu
    logReportGenerate: function (expId) {
        if (fbAnalytics) {
            fbAnalytics.logEvent('share', {
                content_type: 'report',
                item_id: expId
            });
        }
        this.logEvent('generate_report', { expId });
    },

    // Chat mesajı
    logChatMessage: function (expId, role) {
        this.logEvent('chat_message', { expId, role });
    },

    // Sayfa görünümü
    logPageView: function (pageName) {
        if (fbAnalytics) {
            fbAnalytics.logEvent('page_view', {
                page_title: pageName,
                page_location: window.location.href
            });
        }
    },

    _expStartTime: null
};

