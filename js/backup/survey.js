/**
 * ==========================================
 * E-LabS — Kapsamlı Anket Sistemi
 * ==========================================
 * Rol bazlı sorular, akıllı tetikleme ve Firebase entegrasyonu.
 */

const surveySystem = {
    // --- DURUM ---
    selectedRole: null,          // 'student' | 'teacher' | 'visitor'
    currentStep: 1,              // 1=Rol seçimi, 2=Ortak sorular, 3=Rol sorular, 4=İletişim
    answers: {},
    sessionStartTime: Date.now(),
    experimentsCompleted: 0,

    // Tetikleme durumu
    state: 'IDLE',
    showNeverAskBtn: false,
    neverAsk: false,
    _dismissedAt: null,   // İlk reddin zamanı
    _dismissedAt2: null,  // İkinci reddin zamanı

    timers: [],

    // --- BAŞLATMA ---
    init: function () {
        if (localStorage.getItem('elabs_survey_submitted')) return;
        this.neverAsk = !!localStorage.getItem('elabs_survey_never_ask');
        const interval = setInterval(() => this._checkTimeBased(), 30000);
        this.timers.push(interval);
    },

    // Deney tamamlandığında çağrılır
    onExperimentComplete: function () {
        this.experimentsCompleted++;
        // 2 deney şartı — zaman şartı YOK
        if (this.experimentsCompleted >= 2 && this.state === 'IDLE') {
            this._trigger(false);
        }
    },

    // Reddettikten sonra 10. ve 20. dakika kontrol
    _checkTimeBased: function () {
        if (this._isDone()) return;
        const now = Date.now();

        if (this.state === 'DISMISSED_1' && this._dismissedAt) {
            if ((now - this._dismissedAt) / 60000 >= 10) {
                this._trigger(true);
            }
        }

        if (this.state === 'DISMISSED_2' && this._dismissedAt2 && !this.neverAsk) {
            if ((now - this._dismissedAt2) / 60000 >= 20) {
                this._trigger(false);
            }
        }
    },

    _trigger: function (showNeverAsk) {
        this.showNeverAskBtn = showNeverAsk;
        this.state = this.state === 'DISMISSED_1' ? 'TRIGGERED_2' :
                     this.state === 'DISMISSED_2' ? 'TRIGGERED_3' : 'TRIGGERED_1';
        this.show();
    },

    _isDone: function () {
        return this.neverAsk ||
               localStorage.getItem('elabs_survey_submitted') ||
               this.state === 'SUBMITTED';
    },

    _elapsedMin: function () {
        return (Date.now() - this.sessionStartTime) / 60000;
    },

    // --- GÖSTER / GİZLE ---
    show: function () {
        this.currentStep = 1;
        this.selectedRole = null;
        this.answers = {};
        this._renderStep();
        document.getElementById('survey-modal-v2').classList.remove('hidden');
    },

    close: function () {
        // İkna popup'ı göster (sadece ilk kapatmada)
        if (this.state === 'TRIGGERED_1' || this.state === 'TRIGGERED_3') {
            document.getElementById('survey-persuade').classList.remove('hidden');
        } else {
            // İkinci tetiklemede doğrudan kapat
            this._hardClose();
        }
    },

    _hardClose: function () {
        document.getElementById('survey-modal-v2').classList.add('hidden');
        document.getElementById('survey-persuade').classList.add('hidden');

        if (this.state === 'TRIGGERED_1') {
            this.state = 'DISMISSED_1';
            this._dismissedAt = Date.now(); // 10 dakika sayacı başlasın
        } else if (this.state === 'TRIGGERED_2') {
            this.state = 'DISMISSED_2';
            this._dismissedAt2 = Date.now(); // 20 dakika sayacı başlasın
        }
        // TRIGGERED_3 → artık gösterme (son deneme)
    },

    neverAskAgain: function () {
        this.neverAsk = true;
        localStorage.setItem('elabs_survey_never_ask', '1');
        document.getElementById('survey-modal-v2').classList.add('hidden');
        document.getElementById('survey-persuade').classList.add('hidden');
    },

    // İkna popup'ından "Geri Dön" tıklandı
    persuadeBack: function () {
        document.getElementById('survey-persuade').classList.add('hidden');
    },

    // İkna popup'ından "Hayır, Geç" tıklandı
    persuadeSkip: function () {
        document.getElementById('survey-persuade').classList.add('hidden');
        this._hardClose();
    },

    // --- ADIM RENDER ---
    _renderStep: function () {
        const modal = document.getElementById('survey-modal-v2');
        const body = document.getElementById('survey-body');
        const progress = document.getElementById('survey-progress');
        const totalSteps = 4;

        // Progress bar
        const pct = Math.round(((this.currentStep - 1) / totalSteps) * 100);
        progress.style.width = pct + '%';

        // "Bir Daha Sorma" butonu
        const neverBtn = document.getElementById('survey-never-ask-btn');
        if (neverBtn) neverBtn.style.display = this.showNeverAskBtn ? 'block' : 'none';

        if (this.currentStep === 1) body.innerHTML = this._stepRoleHTML();
        else if (this.currentStep === 2) body.innerHTML = this._stepCommonHTML();
        else if (this.currentStep === 3) body.innerHTML = this._stepRoleSpecificHTML();
        else if (this.currentStep === 4) body.innerHTML = this._stepContactHTML();

        this._bindStarClicks();
        this._bindCheckboxes();
    },

    // ADIM 1: Rol Seçimi
    _stepRoleHTML: function () {
        return `
        <div class="text-center mb-6">
            <div class="text-4xl mb-3">👋</div>
            <h3 class="text-xl font-bold text-white mb-2">Hoş Geldiniz!</h3>
            <p class="text-gray-400 text-sm leading-relaxed">E-LabS'ı daha iyi hale getirmemize yardım etmek ister misiniz? Sadece 1-2 dakikanızı alacak. Lütfen rolünüzü seçin:</p>
        </div>
        <div class="grid grid-cols-3 gap-3 mb-6">
            <button class="role-btn flex flex-col items-center gap-2 p-4 rounded-xl border border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all group" data-role="student">
                <span class="text-3xl group-hover:scale-110 transition-transform">🎓</span>
                <span class="text-sm font-semibold text-white">Öğrenci</span>
            </button>
            <button class="role-btn flex flex-col items-center gap-2 p-4 rounded-xl border border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all group" data-role="teacher">
                <span class="text-3xl group-hover:scale-110 transition-transform">📚</span>
                <span class="text-sm font-semibold text-white">Öğretmen</span>
            </button>
            <button class="role-btn flex flex-col items-center gap-2 p-4 rounded-xl border border-white/20 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all group" data-role="visitor">
                <span class="text-3xl group-hover:scale-110 transition-transform">👁️</span>
                <span class="text-sm font-semibold text-white">Ziyaretçi</span>
            </button>
        </div>
        <div class="flex justify-end">
            <button onclick="surveySystem._nextStep()" class="btn-glow px-6 py-2 rounded-lg font-bold text-black text-sm opacity-50 cursor-not-allowed" id="survey-next-btn" disabled>Devam →</button>
        </div>`;
    },

    // ADIM 2: Ortak Sorular
    _stepCommonHTML: function () {
        return `
        <h3 class="text-base font-bold text-[var(--secondary)] mb-4 flex items-center gap-2">
            <i class="fas fa-star"></i> Genel Değerlendirme
        </h3>
        ${this._ratingQ('common_visual', 'Görsel Gerçekçilik ve 3D Kalitesi', '3D ortam ve animasyonlar ne kadar gerçekçi ve etkileyiciydi?')}
        ${this._ratingQ('common_ease', 'Sistemin Kullanım Kolaylığı', 'Deneyleri başlatmak, kontrolleri kullanmak ne kadar koldu?')}
        ${this._ratingQ('common_education', 'Eğitici İçerik ve Anlaşılırlık', 'Konu anlatımı ve deney içerikleri ne kadar anlaşılırdı?')}
        <div class="flex justify-between mt-6">
            <button onclick="surveySystem._prevStep()" class="px-4 py-2 text-gray-400 hover:text-white text-sm transition">← Geri</button>
            <button onclick="surveySystem._nextStep()" class="btn-glow px-6 py-2 rounded-lg font-bold text-black text-sm">Devam →</button>
        </div>`;
    },

    // ADIM 3: Rol Bazlı Sorular
    _stepRoleSpecificHTML: function () {
        if (this.selectedRole === 'teacher') return this._teacherQHTML();
        if (this.selectedRole === 'student') return this._studentQHTML();
        return this._visitorQHTML();
    },

    _teacherQHTML: function () {
        return `
        <h3 class="text-base font-bold text-purple-400 mb-4 flex items-center gap-2">
            <i class="fas fa-chalkboard-teacher"></i> Eğitimsel Öngörü
        </h3>
        ${this._ratingQ('t_learning_ease', 'Anlamayı Kolaylaştırma', 'Öğrencilerin dersi anlamasının bu sistemle kolaylaşacağını düşünüyorum.')}
        ${this._ratingQ('t_interest', 'Derse İlgi Artışı', 'Öğrencilerin derse olan ilgisinin bu sistemle artacağını düşünüyorum.')}
        ${this._ratingQ('t_curriculum', 'Müfredat Uyumu & Ders Hazırlık', 'Müfredata uygunluk ve ders hazırlığında tasarruf sağladığını düşünüyorum.')}
        <div class="mt-4">
            <label class="block text-sm font-semibold text-purple-300 mb-2">
                <i class="fas fa-flask mr-1"></i> Görmek istediğiniz başka deneyler var mı?
            </label>
            <textarea id="t_desired_exp" rows="2" placeholder="Örn: Mitoz bölünme, DNA ekstraksiyonu..." class="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-sm text-white focus:border-purple-400 outline-none resize-none placeholder-gray-500"></textarea>
        </div>
        <div class="flex justify-between mt-6">
            <button onclick="surveySystem._prevStep()" class="px-4 py-2 text-gray-400 hover:text-white text-sm transition">← Geri</button>
            <button onclick="surveySystem._nextStep()" class="btn-glow px-6 py-2 rounded-lg font-bold text-black text-sm">Devam →</button>
        </div>`;
    },

    _studentQHTML: function () {
        return `
        <h3 class="text-base font-bold text-green-400 mb-4 flex items-center gap-2">
            <i class="fas fa-graduation-cap"></i> Deneyim Değerlendirmesi
        </h3>
        <div class="grid grid-cols-2 gap-3 mb-2">
            <div>${this._ratingQ('s_before', 'Simülasyon Öncesi Bilgi Seviyem', '')}</div>
            <div>${this._ratingQ('s_after', 'Simülasyon Sonrası Bilgi Seviyem', '')}</div>
        </div>
        <p class="text-sm font-semibold text-green-300 mb-2 mt-1">Geleneksel yöntemle kıyaslandığında:</p>
        ${this._ratingQ('s_no_fear', '🧪 Hata yapma korkusu olmadan özgür hissettim', '')}
        ${this._ratingQ('s_3d_better', '🔬 3D görseller kitaptan daha iyi anlamamı sağladı', '')}
        ${this._ratingQ('s_more_fun', '🎮 Daha eğlenceli ve akılda kalıcıydı', '')}
        ${this._ratingQ('s_repeat', '🔄 Tekrar deneyimi yaşamak isterdim', '')}
        ${this._ratingQ('s_ai_helpful', '🤖 AI asistan soruları anlamama yardımcı oldu', '')}
        <div class="flex justify-between mt-4">
            <button onclick="surveySystem._prevStep()" class="px-4 py-2 text-gray-400 hover:text-white text-sm transition">← Geri</button>
            <button onclick="surveySystem._nextStep()" class="btn-glow px-6 py-2 rounded-lg font-bold text-black text-sm">Devam →</button>
        </div>`;
    },

    _visitorQHTML: function () {
        return `
        <h3 class="text-base font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <i class="fas fa-eye"></i> Vizyon & Değerlendirme
        </h3>
        ${this._ratingQ('v_engagement', 'Öğrenci İlgisine Etkisi', 'Böyle ortamlarda ders işlemek öğrencilerin derse olan ilgisini artırır.')}
        ${this._ratingQ('v_equality', 'Fırsat Eşitliği', 'Dijital platformlar, laboratuvarı olmayan okullar için kritik bir çözümdür.')}
        ${this._ratingQ('v_professional', 'Genel Profesyonellik Algısı', 'Bu platforma genel olarak ne kadar profesyonel/etkileyici buldunuz?')}
        ${this._ratingQ('v_standardize', 'Standart Hale Gelmeli Mi?', 'Bu teknoloji standart eğitim aracı haline getirilmeli mi?')}
        <div class="flex justify-between mt-6">
            <button onclick="surveySystem._prevStep()" class="px-4 py-2 text-gray-400 hover:text-white text-sm transition">← Geri</button>
            <button onclick="surveySystem._nextStep()" class="btn-glow px-6 py-2 rounded-lg font-bold text-black text-sm">Devam →</button>
        </div>`;
    },

    // ADIM 4: İletişim İzni
    _stepContactHTML: function () {
        return `
        <div class="text-center mb-5">
            <div class="text-4xl mb-3">💌</div>
            <h3 class="text-base font-bold text-white mb-1">Neredeyse bitti!</h3>
            <p class="text-gray-400 text-sm">Sonuçlar ve güncellemelerden haberdar olmak ister misiniz?</p>
        </div>
        <div class="mb-4">
            <label class="block text-sm font-semibold text-[var(--secondary)] mb-2">
                <i class="fas fa-envelope mr-1"></i> E-posta adresiniz <span class="font-normal text-gray-500">(isteğe bağlı)</span>
            </label>
            <input type="email" id="survey-email" placeholder="ornek@email.com"
                class="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:border-[var(--secondary)] outline-none placeholder-gray-500 transition">
        </div>
        <div class="mb-4">
            <label class="block text-sm font-semibold text-[var(--accent)] mb-2">
                Genel görüş / öneri <span class="font-normal text-gray-500">(isteğe bağlı)</span>
            </label>
            <textarea id="survey-general-comment" rows="3" placeholder="Beğendikleriniz, eksik gördükleriniz, önerileriniz..."
                class="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-sm text-white focus:border-[var(--accent)] outline-none resize-none placeholder-gray-500 transition"></textarea>
        </div>
        <div class="flex justify-between mt-4">
            <button onclick="surveySystem._prevStep()" class="px-4 py-2 text-gray-400 hover:text-white text-sm transition">← Geri</button>
            <button onclick="surveySystem.submit()" class="bg-gradient-to-r from-green-500 to-emerald-400 hover:brightness-110 text-black font-bold px-8 py-2 rounded-lg text-sm transition flex items-center gap-2">
                <i class="fas fa-paper-plane"></i> Gönder
            </button>
        </div>`;
    },

    // --- YARDIMCI: Rating sorusu HTML ---
    _ratingQ: function (key, label, hint) {
        return `
        <div class="mb-4 p-3 bg-black/20 rounded-xl border border-white/5">
            <p class="text-sm font-semibold text-white mb-1">${label}</p>
            ${hint ? `<p class="text-xs text-gray-500 mb-2">${hint}</p>` : ''}
            <div class="flex items-center gap-1" data-key="${key}">
                ${[1,2,3,4,5].map(v => `
                <button class="star-btn text-xl transition-transform hover:scale-110 text-gray-600" data-key="${key}" data-val="${v}" title="${v} puan">★</button>
                `).join('')}
                <span class="ml-2 text-xs text-gray-500 star-label" id="lbl-${key}"></span>
            </div>
        </div>`;
    },

    // --- STAR CLICK BINDING ---
    _bindStarClicks: function () {
        document.querySelectorAll('.star-btn').forEach(btn => {
            btn.onclick = () => {
                const key = btn.dataset.key;
                const val = parseInt(btn.dataset.val);
                this.answers[key] = val;

                // Renk güncelle
                document.querySelectorAll(`.star-btn[data-key="${key}"]`).forEach(s => {
                    const sv = parseInt(s.dataset.val);
                    s.style.color = sv <= val ? '#facc15' : '#4b5563';
                });

                // Etiket
                const labels = ['', 'Çok Zayıf', 'Zayıf', 'Orta', 'İyi', 'Mükemmel'];
                const lbl = document.getElementById('lbl-' + key);
                if (lbl) lbl.textContent = labels[val] || '';
            };
        });

        // Rol seçimi
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.onclick = () => {
                this.selectedRole = btn.dataset.role;
                document.querySelectorAll('.role-btn').forEach(b => {
                    b.classList.remove('border-cyan-400', 'bg-cyan-500/20', 'scale-105');
                });
                btn.classList.add('border-cyan-400', 'bg-cyan-500/20', 'scale-105');

                const nextBtn = document.getElementById('survey-next-btn');
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            };
        });
    },

    _bindCheckboxes: function () {
        // Checkbox değerlerini topla
        document.querySelectorAll('.survey-check').forEach(cb => {
            cb.onchange = () => {
                const checked = [...document.querySelectorAll('.survey-check:checked')].map(c => c.value);
                this.answers['s_comparisons'] = checked;
            };
        });
    },

    _toggleContact: function (wantsContact) {
        this.answers['contact_allowed'] = wantsContact;
        const wrap = document.getElementById('email-input-wrap');
        const yesBtn = document.getElementById('contact-yes-btn');
        const noBtn = document.getElementById('contact-no-btn');

        if (wrap) wrap.classList.toggle('hidden', !wantsContact);

        if (yesBtn) yesBtn.className = yesBtn.className.replace('border-cyan-400 bg-cyan-500/20', 'border-white/20');
        if (noBtn) noBtn.className = noBtn.className.replace('border-gray-500 bg-white/10', 'border-white/20');

        if (wantsContact && yesBtn) yesBtn.classList.add('border-cyan-400', 'bg-cyan-500/20');
        if (!wantsContact && noBtn) noBtn.classList.add('border-gray-500', 'bg-white/10');
    },

    // --- ADIM GEZİNME ---
    _nextStep: function () {
        // Adım 1: rol seçildi mi?
        if (this.currentStep === 1 && !this.selectedRole) return;

        // Öğretmen alanını kaydet
        if (this.currentStep === 3 && this.selectedRole === 'teacher') {
            const ta = document.getElementById('t_desired_exp');
            if (ta) this.answers['t_desired_experiments'] = ta.value.trim().substring(0, 500);
        }

        this.currentStep++;
        this._renderStep();
    },

    _prevStep: function () {
        if (this.currentStep > 1) {
            this.currentStep--;
            this._renderStep();
        }
    },

    // --- GÖNDERİM ---
    submit: async function () {
        // Email validasyonu — @ içermeli
        const emailEl = document.getElementById('survey-email');
        const commentEl = document.getElementById('survey-general-comment');

        if (emailEl && emailEl.value.trim()) {
            const emailVal = emailEl.value.trim();
            if (!emailVal.includes('@') || emailVal.indexOf('@') === 0 || emailVal.indexOf('@') === emailVal.length - 1) {
                emailEl.classList.add('border-red-500');
                emailEl.placeholder = 'Geçerli bir e-posta girin (örn: ad@mail.com)';
                emailEl.focus();
                return; // Gönderimi durdur
            }
            emailEl.classList.remove('border-red-500');
            this.answers['contact_email'] = emailVal.substring(0, 200);
            this.answers['contact_allowed'] = true;
        }

        if (commentEl) {
            this.answers['general_comment'] = commentEl.value.trim().substring(0, 1000);
        }

        // Gönder butonunu devre dışı bırak
        const submitBtn = document.querySelector('#survey-body button[onclick="surveySystem.submit()"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
        }

        const payload = {
            role: this.selectedRole,
            answers: { ...this.answers },
            meta: {
                sessionDurationMin: Math.round(this._elapsedMin()),
                experimentsCompleted: this.experimentsCompleted,
                currentExperiment: (typeof app !== 'undefined' && app.currentExp) ? app.currentExp.id : null,
                userAgent: navigator.userAgent.substring(0, 200),
                language: navigator.language,
                screenW: screen.width,
                screenH: screen.height
            }
        };

        // Firebase'e kaydet
        const docId = await saveToFirestore('surveys', payload);

        // LocalStorage'a da yaz (offline fallback)
        try {
            const existing = JSON.parse(localStorage.getItem('elabs_survey_local') || '[]');
            existing.push({ ...payload, _localTime: new Date().toISOString() });
            localStorage.setItem('elabs_survey_local', JSON.stringify(existing));
        } catch (e) { /* quota exceeded */ }

        localStorage.setItem('elabs_survey_submitted', '1');
        this.state = 'SUBMITTED';

        // Teşekkür ekranı
        document.getElementById('survey-body').innerHTML = `
        <div class="text-center py-8">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-2xl font-bold text-white mb-2">Teşekkürler!</h3>
            <p class="text-gray-400 mb-2">Değerli görüşleriniz E-LabS'ı geliştirmemize büyük katkı sağlıyor.</p>
            <button onclick="surveySystem._finalClose()" class="mt-6 btn-glow px-8 py-3 rounded-xl font-bold text-black">
                Devam Et 🚀
            </button>
        </div>`;
        document.getElementById('survey-progress').style.width = '100%';
        document.getElementById('survey-close-btn').classList.add('hidden');

        // Analytics
        if (typeof analyticsManager !== 'undefined') {
            analyticsManager.logEvent('survey_submitted', { role: this.selectedRole });
        }
    },

    _finalClose: function () {
        document.getElementById('survey-modal-v2').classList.add('hidden');
    }
};
