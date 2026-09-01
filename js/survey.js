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
 * E-LabS — Kapsamlı Anket Sistemi
 * ==========================================
 * Rol bazlı sorular, akıllı tetikleme ve Firebase entegrasyonu.
 */

const surveySystem = {
    // --- SAFE LOCALSTORAGE (Brave Shield uyumlu) ---
    _ls: {
        get: function(k) { try { return localStorage.getItem(k); } catch(e) { return null; } },
        set: function(k,v) { try { localStorage.setItem(k,v); } catch(e) {} }
    },

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

    validRuns: null,

    init: function () {
        if (this._isDone()) return;
        this.neverAsk = !!this._ls.get('elabs_survey_never_ask') || !!this._ls.get('elabs_survey_shown');
        
        // Restore completed experiments count from local storage
        try {
            let savedRuns = this._ls.get('elabs_valid_runs');
            this.validRuns = savedRuns ? JSON.parse(savedRuns) : [];
        } catch(e) {
            this.validRuns = [];
        }
        this.experimentsCompleted = this.validRuns.length;
    },

    // Deneyde 3 sn zaman geçirildiğinde çağrılır
    recordExperimentRun: function (expId) {
        if (this._isDone()) return;
        
        if (!this.validRuns) this.validRuns = [];
        
        this.validRuns.push(expId + '_' + Date.now());
        try { this._ls.set('elabs_valid_runs', JSON.stringify(this.validRuns)); } catch(e){}
        
        this.experimentsCompleted = this.validRuns.length;
        try { this._ls.set('elabs_experiments_completed', this.experimentsCompleted); } catch(e){}

        console.log(`[Survey] Geçerli deney süresi (3sn) aşıldı. Toplam geçerli deney: ${this.experimentsCompleted}`);

        // 2 farklı veya aynı deneyde 3sn geçirdiyse yalnızca 1 defa tetikle
        if (this.experimentsCompleted >= 2) {
            if (this.state === 'IDLE') {
                console.log('[Survey] Anket yalnızca 1 defalık tetikleniyor...');
                this._trigger(true);
            }
        }
    },

    // --- ALIAS FOR TRIGGER ---
    triggerSurvey: function() {
        if (this._isDone()) return;
        this.show();
    },

    _checkTimeBased: function () {
        // Ziyaretçiyi tekrar tekrar rahatsız etmemek için zaman bazlı re-trigger devre dışı
    },

    _trigger: function (showNeverAsk) {
        if (this._isDone()) return;
        this.showNeverAskBtn = showNeverAsk;
        this.state = 'TRIGGERED_1';
        this.show();
        // Bir defa gösterildiği an kaydedilsin
        this._ls.set('elabs_survey_shown', '1');
        this._ls.set('elabs_survey_never_ask', '1');
        this.neverAsk = true;
    },

    _isDone: function () {
        return this.neverAsk ||
               !!this._ls.get('elabs_survey_shown') ||
               !!this._ls.get('elabs_survey_never_ask') ||
               !!this._ls.get('elabs_survey_submitted') ||
               this.state === 'SUBMITTED' ||
               this.state === 'DISMISSED';
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
        const modal = document.getElementById('survey-modal-v2');
        if (modal) modal.classList.remove('hidden');
    },

    close: function () {
        this._hardClose();
    },

    _hardClose: function () {
        const modal = document.getElementById('survey-modal-v2');
        const persu = document.getElementById('survey-persuade');
        if (modal) modal.classList.add('hidden');
        if (persu) persu.classList.add('hidden');

        this.state = 'DISMISSED';
        this.neverAsk = true;
        this._ls.set('elabs_survey_shown', '1');
        this._ls.set('elabs_survey_never_ask', '1');
    },

    neverAskAgain: function () {
        this.neverAsk = true;
        this._ls.set('elabs_survey_never_ask', '1');
        const modal = document.getElementById('survey-modal-v2');
        const persu = document.getElementById('survey-persuade');
        if (modal) modal.classList.add('hidden');
        if (persu) persu.classList.add('hidden');
    },

    // İkna popup'ından "Geri Dön" tıklandı
    persuadeBack: function () {
        const persu = document.getElementById('survey-persuade');
        if (persu) persu.classList.add('hidden');
    },

    // İkna popup'ından "Hayır, Geç" tıklandı
    persuadeSkip: function () {
        const persu = document.getElementById('survey-persuade');
        if (persu) persu.classList.add('hidden');
        this._hardClose();
    },

    // --- ADIM RENDER ---
    _renderStep: function () {
        const modal = document.getElementById('survey-modal-v2');
        const body = document.getElementById('survey-body');
        const progress = document.getElementById('survey-progress');
        if (!body) return;
        
        const totalSteps = 4;

        // Progress bar
        if (progress) {
            const pct = Math.round(((this.currentStep - 1) / totalSteps) * 100);
            progress.style.width = pct + '%';
        }

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
        const roles = [
            { id: 'student', emoji: '🎓', label: 'Öğrenci', desc: 'Deneyleri öğrenmek için kullanıyorum' },
            { id: 'teacher', emoji: '📚', label: 'Öğretmen', desc: 'Eğitim materyali olarak inceliyorum' },
            { id: 'visitor', emoji: '👁️', label: 'Ziyaretçi', desc: 'Platformu genel olarak merak ediyorum' }
        ];
        return `
        <div class="sv-animate" style="margin-bottom:20px;">
            <h3 style="font-size:1rem;font-weight:800;color:#fff;margin:0 0 6px;">Sizi en iyi tanımlayan hangisi?</h3>
            <p style="font-size:0.75rem;color:rgba(255,255,255,0.38);margin:0;">Size uygun soruları hazırlayalım.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
            ${roles.map(r => `
            <button class="sv-role-card" id="role-btn-${r.id}" onclick="surveySystem._selectRole('${r.id}')">
                <div style="font-size:1.6rem;flex-shrink:0;">${r.emoji}</div>
                <div>
                    <div style="font-size:0.9rem;font-weight:700;color:#fff;">${r.label}</div>
                    <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:2px;">${r.desc}</div>
                </div>
                <div class="sv-role-check"><i class="fas fa-check"></i></div>
            </button>`).join('')}
        </div>
        <div class="sv-nav" style="justify-content:flex-end;">
            <button onclick="surveySystem._nextStep()" class="sv-btn-next" id="survey-next-btn" disabled style="opacity:0.38;cursor:not-allowed;">
                İlerle <i class="fas fa-arrow-right" style="font-size:11px;"></i>
            </button>
        </div>`;
    },

    _selectRole: function (role) {
        this.selectedRole = role;
        document.querySelectorAll('.sv-role-card').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('role-btn-' + role);
        if (btn) btn.classList.add('active');
        const nextBtn = document.getElementById('survey-next-btn');
        if (nextBtn) { nextBtn.disabled = false; nextBtn.style.opacity = '1'; nextBtn.style.cursor = 'pointer'; }
    },

    // ADIM 2: Ortak Sorular
    _stepCommonHTML: function () {
        return `
        <div class="sv-animate" style="margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:1rem;">⭐</span>
                <h3 style="font-size:0.9rem;font-weight:800;color:#00bcd4;margin:0;text-transform:uppercase;letter-spacing:0.05em;">Genel Deneyim</h3>
            </div>
            <p style="font-size:0.72rem;color:rgba(255,255,255,0.35);margin:0;">1 = Çok Zayıf &nbsp;·&nbsp; 5 = Mükemmel</p>
        </div>
        ${this._ratingQ('common_visual', '🎨 Görsel Kalite', '3D modeller ve arayüz tasarımı')}
        ${this._ratingQ('common_ease', '🖱 Kullanım Kolaylığı', 'Kontroller ve navigasyon')}
        ${this._ratingQ('common_education', '📖 Eğitici Değer', 'Konu anlatımı ve deney içeriği')}
        <div class="sv-nav">
            <button onclick="surveySystem._prevStep()" class="sv-btn-back">← Geri</button>
            <button onclick="surveySystem._nextStep()" class="sv-btn-next">Devam <i class="fas fa-arrow-right" style="font-size:10px;"></i></button>
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
        <div style="margin-bottom:14px;"><h3 style="font-size:0.9rem;font-weight:800;color:#a78bfa;margin:0;display:flex;align-items:center;gap:8px;"><i class="fas fa-chalkboard-teacher"></i> Eğitimsel Öngörü</h3></div>
        ${this._ratingQ('t_learning_ease', '📈 Anlamayı Kolaylaştırma', 'Bu sistemin konuyu anlamayı kolaylaştıracağını düşünüyorum.')}
        ${this._ratingQ('t_interest', '🔥 Derse İlgi Artışı', 'Öğrencilerin derse olan ilgisini artırır.')}
        ${this._ratingQ('t_curriculum', '📋 Müfredat Uyumu', 'Müfredata uygun ve ders hazırlığını hızlandırır.')}
        <div style="margin-top:12px;">
            <label style="display:block;font-size:0.8rem;font-weight:700;color:#c4b5fd;margin-bottom:8px;"><i class="fas fa-flask" style="margin-right:5px;"></i>Görmek istediğiniz deneyler?</label>
            <textarea id="t_desired_exp" rows="2" placeholder="Örn: Mitoz bölünme, DNA ekstraksiyonu..." class="sv-input" style="resize:none;"></textarea>
        </div>
        <div class="sv-nav">
            <button onclick="surveySystem._prevStep()" class="sv-btn-back">← Geri</button>
            <button onclick="surveySystem._nextStep()" class="sv-btn-next">Devam <i class="fas fa-arrow-right" style="font-size:10px;"></i></button>
        </div>`;
    },

    _studentQHTML: function () {
        return `
        <div style="margin-bottom:14px;"><h3 style="font-size:0.9rem;font-weight:800;color:#34d399;margin:0;display:flex;align-items:center;gap:8px;"><i class="fas fa-graduation-cap"></i> Deneyim Değerlendirmesi</h3></div>
        ${this._ratingQ('s_before', '📊 Simülasyon Öncesi Bilgi', '')}
        ${this._ratingQ('s_after', '📈 Simülasyon Sonrası Bilgi', '')}
        <p style="font-size:0.78rem;font-weight:700;color:#6ee7b7;margin:12px 0 4px;">Geleneksel yöntemle kıyasla:</p>
        ${this._ratingQ('s_no_fear', '🧪 Hata yapma korkusu olmadan özgürlük', '')}
        ${this._ratingQ('s_3d_better', '🔬 3D görsellerin etkisi', '')}
        ${this._ratingQ('s_more_fun', '🎮 Eğlence ve akılda kalıcılık', '')}
        ${this._ratingQ('s_ai_helpful', '🤖 AI asistan desteği', '')}
        <div class="sv-nav">
            <button onclick="surveySystem._prevStep()" class="sv-btn-back">← Geri</button>
            <button onclick="surveySystem._nextStep()" class="sv-btn-next">Devam <i class="fas fa-arrow-right" style="font-size:10px;"></i></button>
        </div>`;
    },

    _visitorQHTML: function () {
        return `
        <div style="margin-bottom:14px;"><h3 style="font-size:0.9rem;font-weight:800;color:#fbbf24;margin:0;display:flex;align-items:center;gap:8px;"><i class="fas fa-eye"></i> Vizyon & Değerlendirme</h3></div>
        ${this._ratingQ('v_engagement', '🎯 Öğrenci İlgisine Etkisi', 'Bu ortamlarda ders işlemek ilgiyi artırır.')}
        ${this._ratingQ('v_equality', '⚖️ Fırsat Eşitliği', 'Laboratuvarı olmayan okullar için kritik çözüm.')}
        ${this._ratingQ('v_professional', '💼 Genel Profesyonellik', 'Platforma ne kadar profesyonel buldunuz?')}
        ${this._ratingQ('v_standardize', '🏫 Standart Hale Gelmeli Mi?', 'Bu teknoloji standart eğitim aracı olmalı mı?')}
        <div class="sv-nav">
            <button onclick="surveySystem._prevStep()" class="sv-btn-back">← Geri</button>
            <button onclick="surveySystem._nextStep()" class="sv-btn-next">Devam <i class="fas fa-arrow-right" style="font-size:10px;"></i></button>
        </div>`;
    },

    // ADIM 4: İletişim İzni
    _stepContactHTML: function () {
        return `
        <div class="sv-animate" style="text-align:center;margin-bottom:18px;">
            <div style="font-size:2.2rem;margin-bottom:8px;">💌</div>
            <h3 style="font-size:0.95rem;font-weight:800;color:#fff;margin:0 0 5px;">Neredeyse bitti!</h3>
            <p style="font-size:0.75rem;color:rgba(255,255,255,0.38);margin:0;">Sonuçlar ve güncellemelerden haberdar olmak ister misiniz?</p>
        </div>
        <div style="margin-bottom:12px;">
            <label style="display:block;font-size:0.78rem;font-weight:700;color:#00bcd4;margin-bottom:7px;"><i class="fas fa-envelope" style="margin-right:5px;"></i>E-posta <span style="font-weight:400;color:rgba(255,255,255,0.3);">(isteğe bağlı)</span></label>
            <input type="email" id="survey-email" placeholder="ornek@email.com" class="sv-input">
        </div>
        <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.78rem;font-weight:700;color:#00bcd4;margin-bottom:7px;">Genel görüş / öneri <span style="font-weight:400;color:rgba(255,255,255,0.3);">(isteğe bağlı)</span></label>
            <textarea id="survey-general-comment" rows="3" placeholder="Beğendikleriniz, eksik gördükleriniz, önerileriniz..." class="sv-input" style="resize:none;"></textarea>
        </div>
        <div class="sv-nav">
            <button onclick="surveySystem._prevStep()" class="sv-btn-back">← Geri</button>
            <button onclick="surveySystem.submit()" class="sv-btn-submit"><i class="fas fa-paper-plane"></i> Gönder</button>
        </div>`;
    },

    // --- YARDIMCI: Rating sorusu HTML ---
    _ratingQ: function (key, label, hint) {
        return `
        <div class="sv-q-card" id="qcard-${key}">
            <p style="font-size:0.82rem;font-weight:700;color:#fff;margin:0 0 2px;">${label}</p>
            ${hint ? `<p style="font-size:0.7rem;color:rgba(255,255,255,0.38);margin:0 0 4px;">${hint}</p>` : ''}
            <div class="sv-stars" data-key="${key}">
                ${[1,2,3,4,5].map(v => `<button class="sv-star-btn" data-key="${key}" data-val="${v}" title="${v} puan">⭐</button>`).join('')}
                <span class="sv-star-label" id="lbl-${key}"></span>
            </div>
        </div>`;
    },

    // --- STAR CLICK BINDING ---
    _bindStarClicks: function () {
        document.querySelectorAll('.sv-star-btn').forEach(btn => {
            btn.onclick = () => {
                const key = btn.dataset.key;
                const val = parseInt(btn.dataset.val);
                this.answers[key] = val;
                document.querySelectorAll(`.sv-star-btn[data-key="${key}"]`).forEach(s => {
                    s.classList.toggle('lit', parseInt(s.dataset.val) <= val);
                });
                const labels = ['','Çok Zayıf','Zayıf','Orta','İyi','Mükemmel'];
                const lbl = document.getElementById('lbl-' + key);
                if (lbl) lbl.textContent = labels[val] || '';
                const card = document.getElementById('qcard-' + key);
                if (card) card.classList.add('rated');
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
                emailEl.placeholder = 'Geçerli bir e-posta girin';
                emailEl.focus();
                return;
            }
            emailEl.classList.remove('border-red-500');
            this.answers['contact_email'] = emailVal.substring(0, 200);
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
                language: navigator.language
            }
        };

        // Firebase'e kaydet (Hata olsa bile devam et)
        try {
            if (typeof saveToFirestore !== 'undefined') {
                await saveToFirestore('surveys', payload);
            }
        } catch (e) { console.error('Survey save error:', e); }

        this._ls.set('elabs_survey_submitted', '1');
        this.state = 'SUBMITTED';

        // Teşekkür ekranı
        const body = document.getElementById('survey-body');
        if (body) {
            body.innerHTML = `
            <div class="sv-animate" style="text-align:center;padding:32px 0;">
                <div style="font-size:3.5rem;margin-bottom:12px;">🎉</div>
                <h3 style="font-size:1.3rem;font-weight:800;color:#fff;margin:0 0 8px;">Teşekkürler!</h3>
                <p style="color:rgba(255,255,255,0.45);font-size:0.85rem;margin:0 0 24px;">Değerli görüşleriniz bizim için çok kıymetli.</p>
                <button onclick="surveySystem._finalClose()" class="sv-btn-next" style="padding:12px 32px;font-size:0.9rem;">
                    Devam Et 🚀
                </button>
            </div>`;
        }
        
        const progress = document.getElementById('survey-progress');
        if (progress) progress.style.width = '100%';
        
        const closeBtn = document.getElementById('survey-close-btn');
        if (closeBtn) closeBtn.classList.add('hidden');
    },

    _finalClose: function () {
        const modal = document.getElementById('survey-modal-v2');
        if (modal) modal.classList.add('hidden');
    }
};
