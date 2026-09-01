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

const simulation3D = {
    scene: null,
    camera: null,
    renderer: null,
    is3DActive: false,
    isFullscreen: false,
    isImmersiveMode: false,
    currentExperiment: null,
    models: {},
    lights: {},
    keys: {},
    isCanvasFocused: false,
    touch: { startX: 0, startY: 0, moveX: 0, moveY: 0, joystickActive: false },
    ui3D: { controlsPanel: null, chartPanel: null, dataPanel: null, isInitialized: false },
    animationFrameId: null,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

    init: function(experimentId) {
        const container = document.getElementById('sim3DCanvas');
        if (!container) return;

        this.currentExperiment = experimentId;
        this.scene = new THREE.Scene();
        
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera = new THREE.PerspectiveCamera(85, width / height, 0.1, 1000);
        this.camera.position.set(0, 2.5, 6);
        this.camera.lookAt(0, 1.2, -2);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            precision: 'highp'
        });
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);

        this.setupEnvironment(experimentId);
        this.addLights();
        
        const physicsIds = ['prec_measure','density_det','thermal_eq','ohm_law','magnetism','liq_pressure','buoyancy','ripple_tank'];
        if (physicsIds.includes(experimentId)) {
            // Fizik için yakın kamera + sade zemin
            this.camera.position.set(0, 2.8, 5.5);
            this.camera.lookAt(0, 1.0, -5);
            this.addPhysicsGround();
            this.addPhysicsOverlay(experimentId);
        } else {
            this.addGround();
            this.addLabEnvironment();
        }
        
        this.setupControls();
        this.createScene(experimentId);
        this.create3DUI();

        if (this.isMobile) this.setupMobileControls();

        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('fullscreenchange', () => this.onWindowResize());
        document.addEventListener('webkitfullscreenchange', () => this.onWindowResize());
        setTimeout(() => this.onWindowResize(), 100);
    },

    addPhysicsGround: function() {
        // Izgara zemin — labaratuvar tarzı
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshPhongMaterial({ color: 0x0d1825, shininess: 60 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        this.scene.add(ground);
        // Izgara çizgileri
        const grid = new THREE.GridHelper(20, 20, 0x1a3a5a, 0x112233);
        grid.position.y = 0.01;
        this.scene.add(grid);
        // Duvar aksant şeritleri (arka duvar)
        const bw = new THREE.Mesh(new THREE.PlaneGeometry(22, 10), new THREE.MeshPhongMaterial({color:0x0a0f18}));
        bw.position.set(0, 4, -9); this.scene.add(bw);
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(22, 0.08), new THREE.MeshBasicMaterial({color:0x00bcd4}));
        stripe.position.set(0, 0.12, -8.98); this.scene.add(stripe);
    },

    addPhysicsOverlay: function(id) {
        const container = document.getElementById('sim3DCanvas');
        if (!container) return;
        // Varsa eski overlay kaldır
        const old = container.querySelector('.physics-3d-overlay');
        if (old) old.remove();
        // Formül paneli
        const overlay = document.createElement('div');
        overlay.className = 'physics-3d-overlay';
        overlay.style.cssText = [
            'position:absolute', 'bottom:0', 'left:0', 'right:0',
            'background:rgba(4,16,30,0.88)', 'border-top:1px solid rgba(0,180,212,0.35)',
            'padding:8px 16px', 'z-index:50',
            'display:flex', 'align-items:center', 'justify-content:space-between',
            'pointer-events:none'
        ].join(';');
        const formulas = {
            prec_measure: 'Kumpas: Δ = 0.1 mm &nbsp;|&nbsp; Mikrometre: Δ = 0.01 mm',
            density_det:  'd = m / V &nbsp;(g/cm³)',
            thermal_eq:   'T<sub>denge</sub> = (m₁T₁ + m₂T₂) / (m₁ + m₂)',
            ohm_law:      'V = I × R &nbsp;(Ohm Kanunu)',
            magnetism:    'Alan çizgileri N &rarr; S &nbsp;|&nbsp; B &prop; 1/r²',
            liq_pressure: 'P = h × d × g &nbsp;(kPa)',
            buoyancy:     'F<sub>k</sub> = V<sub>batan</sub> × d × g &nbsp;(N)',
            ripple_tank:  'v = f × λ &nbsp;|&nbsp; Dalga Hızı'
        };
        overlay.innerHTML = `
            <span style="color:#00e5ff;font:bold 13px Inter,Arial;">${formulas[id] || ''}</span>
            <span style="color:#607d8b;font:11px Inter,Arial;">3D Görünüm &mdash; E-Labs</span>
        `;
        container.style.position = 'relative';
        container.appendChild(overlay);
    },

    setupEnvironment: function(id) {
        const physicsIds = ['prec_measure','density_det','thermal_eq','ohm_law','magnetism','liq_pressure','buoyancy','ripple_tank'];
        let sky = 0x1a1c23;
        if (id === 'photosynthesis') sky = 0x1a211c;
        if (id === 'acid_rain')      sky = 0x1c1e26;
        if (id === 'homeostasis')    sky = 0x211a1c;
        if (physicsIds.includes(id)) sky = 0x0d1117;
        this.scene.background = new THREE.Color(sky);
        if (physicsIds.includes(id)) {
            this.scene.fog = null; // Fizik deneyleri için sis yok — netlik
        } else {
            this.scene.fog = new THREE.FogExp2(sky, 0.012);
        }
    },

    addLights: function() {
        const physicsIds = ['prec_measure','density_det','thermal_eq','ohm_law','magnetism','liq_pressure','buoyancy','ripple_tank'];
        const isPhysics = physicsIds.includes(this.currentExperiment);
        
        if (isPhysics) {
            // Fizik deneyleri: dramatik, yönlü ışık
            this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
            const key = new THREE.DirectionalLight(0xffffff, 1.4);
            key.position.set(3, 8, 4);
            this.scene.add(key);
            const fill = new THREE.DirectionalLight(0x80c8ff, 0.5);
            fill.position.set(-4, 5, 2);
            this.scene.add(fill);
            // Üstten mavi-beyaz
            const top = new THREE.PointLight(0x9ecfff, 1.2, 18);
            top.position.set(0, 6, -4);
            this.scene.add(top);
            // Cyan aksent
            const accent = new THREE.PointLight(0x00bcd4, 0.8, 12);
            accent.position.set(0, 2, -3);
            this.scene.add(accent);
        } else {
            this.scene.add(new THREE.AmbientLight(0xffffff, 1.0));
            const fill = new THREE.DirectionalLight(0xffffff, 0.7);
            fill.position.set(3, 10, 5);
            this.scene.add(fill);
            [[-4,7,-5],[4,7,-5],[-4,7,-1],[4,7,-1],[0,7,-3]].forEach(([x,y,z]) => {
                const pl = new THREE.PointLight(0xfff9e8, 1.0, 20);
                pl.position.set(x, y, z);
                this.scene.add(pl);
            });
        }
    },

    addGround: function() {
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.MeshPhongMaterial({ color: 0x1e222a, shininess: 40 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        this.scene.add(ground);
    },

    addLabEnvironment: function() {
        const M = (c, sh=20) => new THREE.MeshPhongMaterial({ color:c, shininess:sh });
        // Bench
        const bench = new THREE.Mesh(new THREE.BoxGeometry(12,0.18,4), M(0x22272e,80));
        bench.position.set(0, 0.0, -5); this.scene.add(bench);
        [[-5.5,-5.8],[5.5,-5.8],[-5.5,-4.2],[5.5,-4.2]].forEach(([x,z]) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12,1.2,0.12), M(0x888898,60));
            leg.position.set(x,-0.61,z); this.scene.add(leg);
        });
        // Walls
        const bw = new THREE.Mesh(new THREE.PlaneGeometry(22,12), M(0x16181d)); bw.position.set(0,4,-8.5); this.scene.add(bw);
        const lw = new THREE.Mesh(new THREE.PlaneGeometry(16,12), M(0x1a1c23)); lw.position.set(-8,4,-2); lw.rotation.y=Math.PI/2; this.scene.add(lw);
        const rw = new THREE.Mesh(new THREE.PlaneGeometry(16,12), M(0x1a1c23)); rw.position.set(8,4,-2);  rw.rotation.y=-Math.PI/2; this.scene.add(rw);
        // Cyan accent stripe
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(22,0.1), new THREE.MeshBasicMaterial({color:0x00bcd4}));
        stripe.position.set(0,1.25,-8.48); this.scene.add(stripe);
        // Ceiling
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(22,16), M(0x16181d)); ceil.rotation.x=Math.PI/2; ceil.position.set(0,7,-2); this.scene.add(ceil);
        // Ceiling light fixtures
        [[-4,-5],[4,-5],[-4,-1],[4,-1],[0,-3]].forEach(([x,z]) => {
            const f = new THREE.Mesh(new THREE.BoxGeometry(2.4,0.04,0.5), new THREE.MeshBasicMaterial({color:0xfffde8}));
            f.position.set(x,6.96,z); this.scene.add(f);
        });
        // Wall cabinets
        for (let cx=-5.5; cx<=5.5; cx+=2.5) {
            const body = new THREE.Mesh(new THREE.BoxGeometry(2.2,1.6,0.45), M(0xcfd4db,10));
            body.position.set(cx,5.6,-8.3); this.scene.add(body);
            const door = new THREE.Mesh(new THREE.BoxGeometry(2.15,1.55,0.06), M(0xe8eaed,60));
            door.position.set(cx,5.6,-8.06); this.scene.add(door);
            const hdl = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.28), M(0x9fa4ad,120));
            hdl.rotation.z=Math.PI/2; hdl.position.set(cx+0.75,5.6,-8.02); this.scene.add(hdl);
        }
        // Decorative beakers
        [[3.4,0x2196f3],[3.9,0xf44336],[4.4,0x4caf50],[-3.4,0xff9800],[-3.9,0x9c27b0],[-4.4,0x00bcd4]].forEach(([dx,col]) => {
            const g = new THREE.Group();
            const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.10,0.44,14,1,true), new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:0.25,shininess:120,side:THREE.DoubleSide}));
            glass.position.y=0.22;
            const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.10,0.09,0.24,14), new THREE.MeshPhongMaterial({color:col,transparent:true,opacity:0.85,shininess:60}));
            liq.position.y=0.12;
            g.add(glass,liq); g.position.set(dx, 0.07, -5.5); this.scene.add(g);
        });
    },

    setupControls: function() {
        const container = document.getElementById('sim3DCanvas');
        let mouseDown = false;
        let lastX = 0, lastY = 0;

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            this.isCanvasFocused = true;
            mouseDown = true; 
            lastX = e.clientX; lastY = e.clientY;
            e.stopPropagation();
        });

        document.addEventListener('mousedown', (e) => {
            if (!container.contains(e.target)) {
                this.isCanvasFocused = false;
                this.keys = {};
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!this.is3DActive || !this.isCanvasFocused) return;
            this.keys[e.code] = true;
            if (e.key === 'e' || e.key === 'E') {
                this.toggleFullscreen();
            }
        });

        document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
        document.addEventListener('mouseup', () => mouseDown = false);
        
        document.addEventListener('mousemove', (e) => {
            if (!mouseDown || !this.is3DActive || !this.isCanvasFocused) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            lastX = e.clientX; lastY = e.clientY;
            
            const euler = new THREE.Euler(0, 0, 0, 'YXZ');
            euler.setFromQuaternion(this.camera.quaternion);
            euler.y -= dx * 0.002;
            euler.x -= dy * 0.002;
            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
            this.camera.quaternion.setFromEuler(euler);
        });
    },

    createScene: function(id) {
        this.models = {};
        this.basePos = new THREE.Vector3(0, 0.35, -5); 
        const basePos = this.basePos;
        
        // Helper to create materials with proper depth sorting
        const safeMat = (color, opacity = 1, transparent = false) => new THREE.MeshPhongMaterial({ 
            color: color, 
            transparent: transparent || opacity < 1, 
            opacity: opacity,
            side: THREE.DoubleSide,
            shininess: 35
        });

        if (id === 'liver') {
            // OUTER TUBE
            const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 16, 1, true), safeMat(0xffffff, 0.2, true));
            tube.position.copy(basePos).add(new THREE.Vector3(0, 1.5, 0));
            tube.material.depthWrite = false;
            tube.renderOrder = 10;
            
            // Liver variations
            this.models.liverGroup = new THREE.Group();
            
            // Whole liver
            const liverWhole = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.6), safeMat(0x8B4513));
            liverWhole.position.set(0, 0.2, 0);
            this.models.liverWhole = liverWhole;

            // Ground liver (many small pieces)
            const liverGround = new THREE.Group();
            for(let i=0; i<15; i++) {
                const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), safeMat(0x8B4513));
                const rx = (Math.random()-0.5)*0.4;
                const rz = (Math.random()-0.5)*0.4;
                p.position.set(rx, 0.05, rz);
                p.rotation.set(Math.random(), Math.random(), Math.random());
                p.userData.baseX = rx;
                p.userData.baseZ = rz;
                liverGround.add(p);
            }
            this.models.liverGround = liverGround;
            this.models.liverGroup.add(liverWhole, liverGround);
            this.models.liverGroup.position.copy(basePos);

            this.scene.add(tube, this.models.liverGroup);
            this.models.bubbles = new THREE.Group(); 
            this.scene.add(this.models.bubbles);

        } else if (id === 'water_prop') {
            const plate = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.1, 32), safeMat(0xc0a060));
            plate.position.copy(basePos);
            const drop = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), safeMat(0x00aaff, 0.8, true));
            drop.position.copy(basePos).add(new THREE.Vector3(0, 0.8, 0));
            this.scene.add(plate, drop);
            this.models.drop = drop;

        } else if (id === 'dialysis') {
            const beaker = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 3, 16, 1, true), safeMat(0xffffff, 0.15, true));
            beaker.position.copy(basePos).add(new THREE.Vector3(0, 1.5, 0));
            beaker.material.depthWrite = false;
            beaker.renderOrder = 20;

            const tube = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.2, 4, 8), safeMat(0xffcc88, 0.7, true));
            tube.position.copy(basePos).add(new THREE.Vector3(0, 1.5, 0));
            tube.material.depthWrite = false;
            tube.renderOrder = 10;
            
            this.scene.add(beaker, tube);
            this.models.tube = tube;
            this.models.moleculesInner = new THREE.Group();
            this.models.moleculesOuter = new THREE.Group();
            this.scene.add(this.models.moleculesInner, this.models.moleculesOuter);

            const isStarch = simulation.params.bagContent === 'starch';
            const size = isStarch ? 0.12 : 0.04;
            const count = isStarch ? 15 : 40;

            for(let i=0; i<count; i++) {
                const m = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), safeMat(0xffee55));
                m.position.set((Math.random()-0.5)*0.4, 0.5 + Math.random()*2, 0);
                m.userData.vel = new THREE.Vector3((Math.random()-0.5)*0.04, (Math.random()-0.5)*0.04, (Math.random()-0.5)*0.04);
                this.models.moleculesInner.add(m);
            }
            this.models.moleculesInner.position.copy(basePos);

        } else if (id === 'diffusion_simple') {
            const container = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 4), safeMat(0xffffff, 0.1, true));
            container.position.copy(basePos);
            const dye = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32), safeMat(0x0000ff, 0.8));
            dye.position.copy(basePos).add(new THREE.Vector3(0, 0.1, 0));
            this.scene.add(container, dye);
            this.models.dye = dye;

        } else if (id === 'enzyme_kinetics') {
            const enzyme = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.3, 16, 32, Math.PI * 1.6), safeMat(0xffd700));
            enzyme.position.copy(basePos).add(new THREE.Vector3(0, 1.5, 0));
            this.scene.add(enzyme);
            this.models.enzyme = enzyme;
            this.models.particles = new THREE.Group();
            this.scene.add(this.models.particles);

        } else if (id === 'photosynthesis') {
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2), safeMat(0x2d5a27));
            stem.position.copy(basePos).add(new THREE.Vector3(0, 1, 0));
            const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), safeMat(0x228b22));
            leaves.position.copy(basePos).add(new THREE.Vector3(0, 2, 0));
            this.scene.add(stem, leaves);
            this.models.leaves = leaves; 
            this.models.bubbles = new THREE.Group(); 
            this.scene.add(this.models.bubbles);

        } else if (id === 'osmosis') {
            const cell = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), safeMat(0xff69b4, 0.6, true));
            cell.position.copy(basePos).add(new THREE.Vector3(0, 1.5, 0));
            this.scene.add(cell);
            this.models.cell = cell;

        } else if (id === 'fermentation') {
            const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2, 16, 1, true), safeMat(0xcccccc, 0.2, true));
            bottle.position.copy(basePos).add(new THREE.Vector3(0, 1, 0));
            bottle.material.depthWrite = false;
            const balloon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), safeMat(0xff4444));
            balloon.position.copy(basePos).add(new THREE.Vector3(0, 2.2, 0));
            this.scene.add(bottle, balloon);
            this.models.balloon = balloon;

        } else if (id === 'respiration') {
            const cell = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), safeMat(0x3366ff, 0.2, true));
            cell.position.copy(basePos).add(new THREE.Vector3(0, 1.5, 0));
            const mito = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.8, 4, 8), safeMat(0xff6600));
            mito.position.copy(basePos).add(new THREE.Vector3(0, 1.5, 0));
            this.scene.add(cell, mito);
            this.models.mito = mito;
            this.models.atp = new THREE.Group();
            this.scene.add(this.models.atp);

        } else if (id === 'homeostasis') {
            // --- Full humanoid figure ---
            const human = new THREE.Group();
            const skinMat  = new THREE.MeshPhongMaterial({ color: 0xffcba4, shininess: 15 });
            const shirtMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6, shininess: 40 });
            const pantsMat = new THREE.MeshPhongMaterial({ color: 0x374151, shininess: 20 });
            const hairMat  = new THREE.MeshPhongMaterial({ color: 0x3d2b1f, shininess: 5 });
            const eyeMat   = new THREE.MeshBasicMaterial({ color: 0x0d0d1a });
            const shoeMat  = new THREE.MeshPhongMaterial({ color: 0x1a1212, shininess: 60 });

            const mk = (geo, mat, x=0, y=0, z=0, rx=0, rz=0) => {
                const m = new THREE.Mesh(geo, mat);
                m.position.set(x, y, z);
                m.rotation.x = rx; m.rotation.z = rz;
                human.add(m); return m;
            };

            // HEAD
            const head = mk(new THREE.SphereGeometry(0.19, 16, 16), skinMat, 0, 1.60, 0);
            head.scale.set(1, 1.08, 0.92);
            // Hair (dome on top half)
            mk(new THREE.SphereGeometry(0.196, 16, 8, 0, Math.PI*2, 0, Math.PI*0.52), hairMat, 0, 1.73, 0);
            // Eyes
            mk(new THREE.SphereGeometry(0.038, 8, 8), eyeMat, -0.075, 1.63, 0.163);
            mk(new THREE.SphereGeometry(0.038, 8, 8), eyeMat,  0.075, 1.63, 0.163);
            // Nose (tiny bump)
            mk(new THREE.SphereGeometry(0.025, 6, 6), skinMat, 0, 1.57, 0.175);

            // NECK
            mk(new THREE.CylinderGeometry(0.075, 0.08, 0.14, 8), skinMat, 0, 1.35, 0);

            // TORSO (shirt)
            const torso = mk(new THREE.BoxGeometry(0.44, 0.60, 0.26), shirtMat, 0, 1.01, 0);

            // HIPS
            mk(new THREE.BoxGeometry(0.40, 0.22, 0.24), pantsMat, 0, 0.69, 0);

            // THIGHS
            mk(new THREE.BoxGeometry(0.17, 0.40, 0.19), pantsMat, -0.105, 0.38, 0);
            mk(new THREE.BoxGeometry(0.17, 0.40, 0.19), pantsMat,  0.105, 0.38, 0);

            // SHINS
            mk(new THREE.BoxGeometry(0.13, 0.42, 0.16), pantsMat, -0.10, 0.04, 0);
            mk(new THREE.BoxGeometry(0.13, 0.42, 0.16), pantsMat,  0.10, 0.04, 0);

            // FEET  — bottom at y = -0.175 - 0.035 = -0.21
            mk(new THREE.BoxGeometry(0.14, 0.08, 0.24), shoeMat, -0.10, -0.175, 0.03);
            mk(new THREE.BoxGeometry(0.14, 0.08, 0.24), shoeMat,  0.10, -0.175, 0.03);

            // UPPER ARMS (shirt)
            mk(new THREE.CylinderGeometry(0.075, 0.065, 0.40, 8), shirtMat, -0.28, 1.06, 0, 0,  0.24);
            mk(new THREE.CylinderGeometry(0.075, 0.065, 0.40, 8), shirtMat,  0.28, 1.06, 0, 0, -0.24);

            // FOREARMS (skin)
            mk(new THREE.CylinderGeometry(0.058, 0.050, 0.36, 8), skinMat, -0.355, 0.74, 0, 0,  0.12);
            mk(new THREE.CylinderGeometry(0.058, 0.050, 0.36, 8), skinMat,  0.355, 0.74, 0, 0, -0.12);

            // Hands
            mk(new THREE.SphereGeometry(0.07, 8, 8), skinMat, -0.385, 0.54, 0);
            mk(new THREE.SphereGeometry(0.07, 8, 8), skinMat,  0.385, 0.54, 0);

            // Foot bottom is at relative y = -0.175 - 0.04 = -0.215
            // Lift group so feet sit on bench (basePos.y = 0.35)
            human.position.copy(basePos).add(new THREE.Vector3(0, 0.215, 0));
            this.scene.add(human);
            this.models.human    = human;
            this.models.skinMat  = skinMat;
            this.models.torsoRef = torso;
            this.models.sweat = new THREE.Group();
            this.scene.add(this.models.sweat);

        } else if (id === 'acid_rain') {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), safeMat(0x4d2926));
            trunk.position.copy(basePos).add(new THREE.Vector3(0, 0.5, 0));
            const tree = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 16), safeMat(0x228b22));
            tree.position.copy(basePos).add(new THREE.Vector3(0, 2, 0));
            
            // Filter visual
            const filter = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 8, 16), safeMat(0xaaaaaa));
            filter.position.copy(basePos).add(new THREE.Vector3(0, 3.5, 0));
            filter.rotation.x = Math.PI / 2;
            this.models.filter = filter;

            this.scene.add(trunk, tree, filter);
            this.models.tree = tree; 
            this.models.rain = new THREE.Group(); 
            this.scene.add(this.models.rain);
        } else if (id === 'prec_measure') {
            // Kumpas + nesne
            const S = (c, sh=40) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: sh/120 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 0.5), S(0x8892a4));
            body.position.copy(basePos).add(new THREE.Vector3(0, 1.0, 0));
            const fixJaw = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 0.4), S(0x6e7a8a));
            fixJaw.position.copy(basePos).add(new THREE.Vector3(-1.5, 0.55, 0));
            const movJaw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.8, 0.4), S(0x778899));
            movJaw.position.copy(basePos).add(new THREE.Vector3(-0.5, 0.55, 0));
            const obj = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 16), S(0xb87333));
            obj.rotation.z = Math.PI / 2;
            obj.position.copy(basePos).add(new THREE.Vector3(-1.0, 0.55, 0));
            this.scene.add(body, fixJaw, movJaw, obj);
            this.models.movJaw = movJaw; this.models.obj = obj;

        } else if (id === 'density_det') {
            const S = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.1 });
            // Dereceli silindir
            const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 16, 1, true), new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:0.18,side:THREE.DoubleSide}));
            cyl.position.copy(basePos).add(new THREE.Vector3(1.2, 1.5, 0));
            const water = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.2, 16), new THREE.MeshPhongMaterial({color:0x1565c0,transparent:true,opacity:0.55}));
            water.position.copy(basePos).add(new THREE.Vector3(1.2, 0.6, 0));
            // Terazi kolu
            const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.15), S(0x778899));
            arm.position.copy(basePos).add(new THREE.Vector3(-1.0, 2.2, 0));
            const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), S(0x556677));
            stand.position.copy(basePos).add(new THREE.Vector3(-1.0, 1.1, 0));
            // Cisim
            const stone = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), S(0x888888));
            stone.position.copy(basePos).add(new THREE.Vector3(1.2, 1.0, 0));
            this.scene.add(cyl, water, arm, stand, stone);
            this.models.water = water; this.models.stone = stone;

        } else if (id === 'thermal_eq') {
            const S = (c, op=1) => new THREE.MeshPhongMaterial({color:c, transparent:op<1, opacity:op, shininess:40});
            // Sol beher (soğuk - mavi)
            const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 16, 1, true), S(0xffffff, 0.18));
            b1.material.side = THREE.DoubleSide;
            b1.position.copy(basePos).add(new THREE.Vector3(-1.4, 0.9, 0));
            const liq1 = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 1.0, 16), S(0x1565c0, 0.75));
            liq1.position.copy(basePos).add(new THREE.Vector3(-1.4, 0.5, 0));
            // Sağ beher (sıcak - kırmızı)
            const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.8, 16, 1, true), S(0xffffff, 0.18));
            b2.material.side = THREE.DoubleSide;
            b2.position.copy(basePos).add(new THREE.Vector3(1.4, 0.9, 0));
            const liq2 = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 1.0, 16), S(0xc62828, 0.75));
            liq2.position.copy(basePos).add(new THREE.Vector3(1.4, 0.5, 0));
            // Termometre sol
            const th1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), S(0xeeeeee));
            th1.position.copy(basePos).add(new THREE.Vector3(-1.05, 0.9, 0));
            // Termometre sağ
            const th2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), S(0xeeeeee));
            th2.position.copy(basePos).add(new THREE.Vector3(1.75, 0.9, 0));
            this.scene.add(b1, liq1, b2, liq2, th1, th2);
            this.models.liq1 = liq1; this.models.liq2 = liq2;
            this.models.particles = new THREE.Group(); this.scene.add(this.models.particles);

        } else if (id === 'ohm_law') {
            const W = (c) => new THREE.MeshPhongMaterial({color:c, shininess:60});
            // Devre tahtası
            const board = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.12, 3.0), W(0x1b4d1b));
            board.position.copy(basePos).add(new THREE.Vector3(0, 0.06, 0));
            // Pil
            const bat = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 12), W(0x222222));
            bat.rotation.z = Math.PI / 2;
            bat.position.copy(basePos).add(new THREE.Vector3(-1.8, 0.55, 0));
            const batPos = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8), W(0xe53935));
            batPos.rotation.z = Math.PI / 2; batPos.position.copy(bat.position).add(new THREE.Vector3(0.65, 0, 0));
            const batNeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), W(0x1565c0));
            batNeg.rotation.z = Math.PI / 2; batNeg.position.copy(bat.position).add(new THREE.Vector3(-0.65, 0, 0));
            // Direnç
            const res = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.22), W(0xc62828));
            res.position.copy(basePos).add(new THREE.Vector3(0.8, 0.55, 0));
            // Teller
            const wireM = W(0xddaa00);
            [[- 1.2, 0.55, 0, 1.2, 0.07, 0], [0.35, 0.55, 0, 0.9, 0.07, 0]].forEach(([x,y,z,lx,ly,lz]) => {
                const wire = new THREE.Mesh(new THREE.BoxGeometry(lx, 0.05, 0.05), wireM);
                wire.position.copy(basePos).add(new THREE.Vector3(x, y, z)); this.scene.add(wire);
            });
            this.scene.add(board, bat, batPos, batNeg, res);
            this.models.electrons = new THREE.Group(); this.scene.add(this.models.electrons);
            // Elektron şablonu
            for (let i = 0; i < 8; i++) {
                const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({color:0xffe082}));
                e.userData.phase = i / 8;
                this.models.electrons.add(e);
            }

        } else if (id === 'magnetism') {
            const W = (c) => new THREE.MeshPhongMaterial({color:c, shininess:50});
            // N kutbu (kırmızı)
            const nPole = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.38, 0.38), W(0xc62828));
            nPole.position.copy(basePos).add(new THREE.Vector3(-0.8, 0.8, 0));
            // S kutbu (mavi)
            const sPole = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.38, 0.38), W(0x1565c0));
            sPole.position.copy(basePos).add(new THREE.Vector3(0.8, 0.8, 0));
            this.scene.add(nPole, sPole);
            // Alan çizgileri (THREE.Line)
            const lineMat = new THREE.LineBasicMaterial({color:0x00aaff, transparent:true, opacity:0.6});
            for (let i = 0; i < 7; i++) {
                const spread = 0.15 + i * 0.12;
                const pts = [];
                for (let t = 0; t <= 30; t++) {
                    const u = t / 30;
                    const x = -1.4 + u * 2.8;
                    const y = 0.8 + Math.sin(u * Math.PI) * spread * 2.5;
                    pts.push(new THREE.Vector3(x, y, 0));
                }
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                const line = new THREE.Line(geo, lineMat.clone());
                this.scene.add(line);
                // Alt simetri
                const pts2 = pts.map(p => new THREE.Vector3(p.x, 0.8 - (p.y - 0.8), p.z));
                const geo2 = new THREE.BufferGeometry().setFromPoints(pts2);
                this.scene.add(new THREE.Line(geo2, lineMat.clone()));
            }
            this.models.nPole = nPole; this.models.sPole = sPole;
            this.models.dust = new THREE.Group(); this.scene.add(this.models.dust);

        } else if (id === 'liq_pressure') {
            const W = (c, op=1) => new THREE.MeshPhongMaterial({color:c, transparent:op<1, opacity:op, shininess:30});
            // Ana tank
            const tank = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.5, 0.12), W(0x1a6090, 0.3));
            tank.material.side = THREE.DoubleSide;
            tank.position.copy(basePos).add(new THREE.Vector3(-1.0, 1.75, 0));
            const tankWater = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 0.1), W(0x1565c0, 0.45));
            tankWater.position.copy(basePos).add(new THREE.Vector3(-1.0, 1.4, 0));
            // Prob
            const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8), W(0xaaaaaa));
            probe.position.copy(basePos).add(new THREE.Vector3(-1.0, 1.8, 0.1));
            // U borusu
            const uLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), W(0x4a9fd4));
            uLeft.position.copy(basePos).add(new THREE.Vector3(0.8, 0.9, 0));
            const uRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.12), W(0x4a9fd4));
            uRight.position.copy(basePos).add(new THREE.Vector3(1.4, 0.9, 0));
            const uBot = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.12, 0.12), W(0x4a9fd4));
            uBot.position.copy(basePos).add(new THREE.Vector3(1.1, 0.0, 0));
            this.scene.add(tank, tankWater, probe, uLeft, uRight, uBot);
            this.models.probe = probe;
            this.models.uLiqL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), W(0x1565c0, 0.7));
            this.models.uLiqL.position.copy(basePos).add(new THREE.Vector3(0.8, 0.4, 0));
            this.models.uLiqR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.1), W(0x1565c0, 0.7));
            this.models.uLiqR.position.copy(basePos).add(new THREE.Vector3(1.4, 0.4, 0));
            this.scene.add(this.models.uLiqL, this.models.uLiqR);

        } else if (id === 'buoyancy') {
            const W = (c, op=1) => new THREE.MeshPhongMaterial({color:c, transparent:op<1, opacity:op, shininess:40});
            // Tank
            const tankB = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 0.12), W(0x1a6090, 0.22));
            tankB.material.side = THREE.DoubleSide;
            tankB.position.copy(basePos).add(new THREE.Vector3(0, 1.6, 0));
            const waterB = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.0, 0.1), W(0x1565c0, 0.45));
            waterB.position.copy(basePos).add(new THREE.Vector3(0, 1.0, 0));
            // Cisim
            const objB = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), W(0xb87333));
            objB.position.copy(basePos).add(new THREE.Vector3(0, 1.4, 0.05));
            this.scene.add(tankB, waterB, objB);
            this.models.objB = objB;
            // Kuvvet okları (ArrowHelper)
            const fkArrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), objB.position.clone(), 1.0, 0x00e5ff, 0.2, 0.12);
            const gArrow = new THREE.ArrowHelper(new THREE.Vector3(0,-1,0), objB.position.clone(), 0.8, 0xff4444, 0.2, 0.12);
            this.scene.add(fkArrow, gArrow);
            this.models.fkArrow = fkArrow; this.models.gArrow = gArrow;

        } else if (id === 'ripple_tank') {
            // Su yüzeyi — animasyonlu dalga
            const geo = new THREE.PlaneGeometry(6, 6, 80, 80);
            const mat = new THREE.MeshPhongMaterial({color:0x1565c0, transparent:true, opacity:0.78, shininess:80, side:THREE.DoubleSide});
            const plane = new THREE.Mesh(geo, mat);
            plane.rotation.x = -Math.PI / 2;
            plane.position.copy(basePos).add(new THREE.Vector3(0, 0.5, 0));
            this.scene.add(plane);
            this.models.wavePlane = plane;
            this.models.waveGeo = geo;
            // Kaynak noktası
            const src = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({color:0xff4500}));
            src.position.copy(basePos).add(new THREE.Vector3(0, 0.6, 0));
            this.scene.add(src);

        } else if (id === 'cozelti_hazirlama') {
            const flask = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.2, 16, 1, true), safeMat(0xffffff, 0.25, true));
            flask.position.copy(basePos).add(new THREE.Vector3(0.8, 1.1, 0));
            flask.material.side = THREE.DoubleSide;
            
            const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.4, 16), safeMat(0x00acc1, 0.6, true));
            liquid.position.copy(basePos).add(new THREE.Vector3(0.8, 0.7, 0));

            const scale = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.6), safeMat(0x334155));
            scale.position.copy(basePos).add(new THREE.Vector3(-1.2, 0.2, 0));

            this.scene.add(flask, liquid, scale);
            this.models.liquid = liquid;

        } else if (id === 'alev_testi') {
            const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 1.6, 16), safeMat(0x64748b));
            burner.position.copy(basePos).add(new THREE.Vector3(0, 0.8, 0));

            const flameMat = new THREE.MeshBasicMaterial({ color: 0xff1744, transparent: true, opacity: 0.85 });
            const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 16), flameMat);
            flame.position.copy(basePos).add(new THREE.Vector3(0, 2.2, 0));

            const light = new THREE.PointLight(0xff1744, 2, 8);
            light.position.copy(flame.position);

            this.scene.add(burner, flame, light);
            this.models.flame = flame;
            this.models.flameLight = light;
            this.models.flameMat = flameMat;

        } else if (id === 'polar_apolar') {
            const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2, 16, 1, true), safeMat(0xffffff, 0.2, true));
            b1.position.copy(basePos).add(new THREE.Vector3(-1.2, 1, 0));
            b1.material.side = THREE.DoubleSide;

            const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2, 16, 1, true), safeMat(0xffffff, 0.2, true));
            b2.position.copy(basePos).add(new THREE.Vector3(1.2, 1, 0));
            b2.material.side = THREE.DoubleSide;

            const bulbMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), bulbMat);
            bulb.position.copy(basePos).add(new THREE.Vector3(0, 2.5, 0));

            const bulbLight = new THREE.PointLight(0xffea00, 0, 10);
            bulbLight.position.copy(bulb.position);

            this.scene.add(b1, b2, bulb, bulbLight);
            this.models.bulb = bulb;
            this.models.bulbMat = bulbMat;
            this.models.bulbLight = bulbLight;

        } else if (id === 'viskozite') {
            const xPositions = [-1.6, 0, 1.6];
            const colors = [0x38bdf8, 0xeab308, 0xa855f7];

            xPositions.forEach((x, i) => {
                const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2.6, 16, 1, true), safeMat(0xffffff, 0.2, true));
                cyl.position.copy(basePos).add(new THREE.Vector3(x, 1.3, 0));
                cyl.material.side = THREE.DoubleSide;

                const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.4, 16), safeMat(colors[i], 0.5, true));
                liq.position.copy(basePos).add(new THREE.Vector3(x, 1.2, 0));

                this.scene.add(cyl, liq);
            });

            const ball = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), safeMat(0xcbd5e1, 1));
            ball.position.copy(basePos).add(new THREE.Vector3(0, 2.2, 0));
            this.scene.add(ball);
            this.models.viscosityBall = ball;

        } else if (id === 'kutle_korunumu') {
            const flask = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.2, 16), safeMat(0xffffff, 0.2, true));
            flask.position.copy(basePos).add(new THREE.Vector3(0, 1.1, 0));
            flask.material.side = THREE.DoubleSide;

            const prec = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.2, 16), safeMat(0x38bdf8, 0.6, true));
            prec.position.copy(basePos).add(new THREE.Vector3(0, 0.6, 0));

            const scale = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.4), safeMat(0x1e293b));
            scale.position.copy(basePos).add(new THREE.Vector3(0, 0.2, 0));

            this.scene.add(flask, prec, scale);
            this.models.precipitate = prec;

        } else if (id === 'ayrimsal_damitma') {
            const heaterMat = safeMat(0xef4444);
            const heater = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.8), heaterMat);
            heater.position.copy(basePos).add(new THREE.Vector3(-1.2, 0.3, 0));

            const flask = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), safeMat(0xffffff, 0.25, true));
            flask.position.copy(basePos).add(new THREE.Vector3(-1.2, 1.2, 0));
            flask.material.side = THREE.DoubleSide;

            const flaskLiq = new THREE.Mesh(new THREE.SphereGeometry(0.72, 16, 16), safeMat(0x38bdf8, 0.6, true));
            flaskLiq.position.copy(flask.position);

            const column = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 16), safeMat(0x94a3b8, 0.6, true));
            column.position.copy(basePos).add(new THREE.Vector3(-1.2, 2.1, 0));

            const receiver = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16), safeMat(0xffffff, 0.2, true));
            receiver.position.copy(basePos).add(new THREE.Vector3(1.2, 0.6, 0));
            receiver.material.side = THREE.DoubleSide;

            const receiverLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 16), safeMat(0x38bdf8, 0.6, true));
            receiverLiq.position.copy(basePos).add(new THREE.Vector3(1.2, 0.4, 0));

            this.scene.add(heater, flask, flaskLiq, column, receiver, receiverLiq);
            this.models.distillHeaterMat = heaterMat;
            this.models.flaskLiq = flaskLiq;
            this.models.receiverLiq = receiverLiq;

        } else if (id === 'dogal_indikator') {
            const xPos = [-1.6, -0.8, 0, 0.8, 1.6];
            const colors = [0xff2a4b, 0xff6b8b, 0x8a2be2, 0x2ecc71, 0xf1c40f];
            this.models.tubes = [];

            xPos.forEach((x, i) => {
                const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16, 1, true), safeMat(0xffffff, 0.2, true));
                tube.position.copy(basePos).add(new THREE.Vector3(x, 1.1, 0));
                tube.material.side = THREE.DoubleSide;

                const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16), safeMat(colors[i], 0.7, true));
                liquid.position.copy(basePos).add(new THREE.Vector3(x, 0.8, 0));

                this.scene.add(tube, liquid);
                this.models.tubes.push(liquid);
            });

        } else if (id === 'sabun_eldesi') {
            const beaker = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.0, 16, 1, true), safeMat(0xffffff, 0.2, true));
            beaker.position.copy(basePos).add(new THREE.Vector3(0, 1.0, 0));
            beaker.material.side = THREE.DoubleSide;

            const soap = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.4, 16), safeMat(0xeab308, 0.7, true));
            soap.position.copy(basePos).add(new THREE.Vector3(0, 0.7, 0));

            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), safeMat(0x94a3b8));
            rod.position.copy(basePos).add(new THREE.Vector3(0, 1.5, 0));
            rod.rotation.z = 0.2;

            this.scene.add(beaker, soap, rod);
            this.models.soapMat = soap.material;
            this.models.stirRod = rod;

        } else {
            const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), safeMat(0x00acc1));
            cube.position.copy(basePos).add(new THREE.Vector3(0, 1, 0));
            this.scene.add(cube);
            this.models.main = cube;
        }
    },

    updateDynamicEnvironment: function() {
        if (!this.is3DActive) return;
        const id = this.currentExperiment;
        
        // Get the latest data point
        const latestDP = simulation.dataPoints[simulation.dataPoints.length - 1] || { output: 100, input: 0 };
        
        // CALCULATE LIVE VALUE: 
        // Instead of waiting for the 1s update, we calculate the "ideal" value for the current frame
        // and then overlay the "noise" that the user sees in the interface.
        const live = simulation.calculateOutput(id, simulation.timer, simulation.params);
        let lastOut = live.output;

        // Apply "Premium Waviness": match the interface's random noise exactly or even amplify it for visual flair
        if (simulation.isRunning && id !== 'homeostasis' && id !== 'osmosis' && id !== 'acid_rain') {
            // We use a coherent noise-like fluctuation for "premium" feel instead of pure random
            const noise = (Math.sin(Date.now() / 100) * 0.5 + Math.random() * 0.5);
            lastOut *= (0.97 + noise * 0.06); 
        }

        if (id === 'liver') {
            const isGround = simulation.params.liverState === 'ground';
            const isBoiled = simulation.params.isBoiled === 'true';
            
            if (this.models.liverWhole) this.models.liverWhole.visible = !isGround;
            if (this.models.liverGround) this.models.liverGround.visible = isGround;

            const bubbleRate = simulation.isRunning ? (lastOut / 20) : 0; 
            if (Math.random() < bubbleRate) {
                const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.6}));
                b.position.set(latestDP.input === 3 ? (Math.random()-0.5)*0.8 : (Math.random()-0.5)*0.4, 0.1, -5 + (Math.random()-0.5)*0.4);
                this.models.bubbles.add(b);
            }
            this.models.bubbles.children.forEach(b => { 
                b.position.y += 0.06; 
                if(b.position.y > 4) this.models.bubbles.remove(b); 
            });
            
            const color = isBoiled ? 0xaaaaaa : 0x8B4513;
            if (this.models.liverWhole) this.models.liverWhole.material.color.set(color);
            if (this.models.liverGround) {
                this.models.liverGround.children.forEach(p => p.material.color.set(color));
            }

            if (simulation.isRunning && lastOut > 2) {
                const shakeIntensity = lastOut / 100;
                // Vibrate the whole group
                this.models.liverGroup.position.x = this.basePos.x + (Math.random()-0.5) * shakeIntensity;
                this.models.liverGroup.position.z = this.basePos.z + (Math.random()-0.5) * shakeIntensity;

                // If ground, vibrate each piece individually for "premium" effect
                if (isGround && this.models.liverGround) {
                    this.models.liverGround.children.forEach(p => {
                        p.position.x = p.userData.baseX + (Math.random()-0.5) * 0.05;
                        p.position.z = p.userData.baseZ + (Math.random()-0.5) * 0.05;
                        p.rotation.y += 0.1;
                    });
                }
            } else {
                // Reset position when not running or low reaction
                this.models.liverGroup.position.copy(this.basePos);
            }

        } else if (id === 'water_prop') {
            // EXTREME SCALE: Height and spread changes are much more dramatic
            const s = (lastOut / 75.6); // Surface tension 75.6 -> 0
            const heightFactor = (1.1 - s) * 5; // Amplified
            const spreadFactor = s * 2;
            if (this.models.drop) {
                this.models.drop.scale.lerp(new THREE.Vector3(spreadFactor, 0.2 + heightFactor, spreadFactor), 0.1);
            }

        } else if (id === 'dialysis') {
            const progress = lastOut / 100;
            const isStarch = simulation.params.bagContent === 'starch';

            if (this.models.tube) {
                if (isStarch) {
                    this.models.tube.material.color.setRGB(1 - 0.95*progress, 1 - 0.95*progress, 1 - 0.3*progress);
                } else {
                    this.models.tube.material.color.setRGB(1, 1 - 0.8*progress, 1 - 1*progress);
                }
                const pulse = 1.0 + Math.sin(Date.now()/300) * 0.05 * progress;
                this.models.tube.scale.set(pulse, 1, pulse);
            }

            if (simulation.isRunning) {
                const speedMult = 1 + progress * 2;
                this.models.moleculesInner.children.forEach(m => {
                    m.position.addScaledVector(m.userData.vel, speedMult);
                    // Bounce inside bag
                    if (Math.abs(m.position.x) > 0.35 || m.position.y < 0.5 || m.position.y > 2.5 || Math.abs(m.position.z) > 0.35) {
                        m.userData.vel.multiplyScalar(-1);
                    }
                    
                    // If glucose, some escape to outer group
                    if (!isStarch && Math.random() < 0.01 && this.models.moleculesOuter.children.length < 50) {
                        const clone = m.clone();
                        clone.position.copy(m.position).add(this.models.moleculesInner.position);
                        clone.userData.vel = m.userData.vel.clone().multiplyScalar(1.5);
                        this.models.moleculesOuter.add(clone);
                        this.models.moleculesInner.remove(m);
                    }
                });

                this.models.moleculesOuter.children.forEach(m => {
                    m.position.addScaledVector(m.userData.vel, speedMult);
                    // Bounce inside beaker
                    const relPos = m.position.clone().sub(this.models.moleculesInner.position);
                    if (Math.abs(relPos.x) > 1.3 || m.position.y < 0 || m.position.y > 3 || Math.abs(relPos.z) > 1.3) {
                        m.userData.vel.multiplyScalar(-1);
                    }
                });
            }

        } else if (id === 'diffusion_simple') {
            // MASSIVE SCALE: 
            const s = (lastOut * 4); // Amplified multiplier
            if (this.models.dye) {
                this.models.dye.scale.lerp(new THREE.Vector3(s, 1.2, s), 0.1);
                this.models.dye.material.opacity = Math.max(0.05, 0.9 - (s * 0.015));
            }

        } else if (id === 'enzyme_kinetics') {
            const t = simulation.params.temp;
            const p = simulation.params.ph;
            const isDenatured = t > 55 || p < 3 || p > 11;
            
            const visualSpeed = lastOut / 8;
            if (simulation.isRunning) {
                this.models.enzyme.rotation.z += (isDenatured ? 0.01 : 0.08) * visualSpeed;
                
                if (isDenatured) {
                    this.models.enzyme.material.color.set(0x444444);
                    this.models.enzyme.scale.lerp(new THREE.Vector3(1.2, 0.5, 1.2), 0.05);
                } else {
                    this.models.enzyme.material.color.set(0xffd700);
                    this.models.enzyme.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
                }

                if (!isDenatured && Math.random() < lastOut / 40) {
                    const part = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({color: 0x00ff00, emissive: 0x004400}));
                    part.position.set((Math.random()-0.5)*6, 1.5 + (Math.random()-0.5)*4, -5 + (Math.random()-0.5)*6);
                    part.userData.vel = new THREE.Vector3().subVectors(this.models.enzyme.position, part.position).normalize().multiplyScalar(0.12 * visualSpeed);
                    this.models.particles.add(part);
                }
                this.models.particles.children.forEach(part => {
                    part.position.add(part.userData.vel);
                    if (part.position.distanceTo(this.models.enzyme.position) < 0.7) {
                        part.material.color.set(0xff0000);
                        part.userData.vel.multiplyScalar(-1.8);
                    }
                    if (part.position.distanceTo(this.models.enzyme.position) > 12) this.models.particles.remove(part);
                });
            }

        } else if (id === 'osmosis') {
            // MEGA SCALE: 
            const diff = (lastOut - 100);
            const s = 1.0 + (diff / 40); // 40 means 40 units change = double size
            if (this.models.cell) {
                this.models.cell.scale.lerp(new THREE.Vector3(s, s, s), 0.15);
                // Color mapping is also more aggressive
                if (s < 0.8) this.models.cell.material.color.setRGB(1, 0, 0); 
                else if (s > 1.2) this.models.cell.material.color.setRGB(0, 0.6, 1); 
                else this.models.cell.material.color.setRGB(1, 0.4, 0.7); 
            }

        } else if (id === 'fermentation') {
            const s = 0.4 + (lastOut / 4); // More dramatic inflation
            if (this.models.balloon) {
                this.models.balloon.scale.lerp(new THREE.Vector3(s, s * 1.1, s), 0.1);
                this.models.balloon.position.y = 2.4 + (s * 0.5);
            }

        } else if (id === 'respiration') {
            const visualRate = lastOut / 30;
            if (simulation.isRunning) {
                this.models.mito.rotation.y += 0.08 + visualRate;
                if (Math.random() < visualRate * 1.5) {
                    const atp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({color: 0xffff00, emissive: 0xffff00}));
                    atp.position.copy(this.models.mito.position).add(new THREE.Vector3((Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3));
                    atp.userData.vel = new THREE.Vector3((Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2);
                    this.models.atp.add(atp);
                }
                this.models.atp.children.forEach(a => {
                    a.position.add(a.userData.vel);
                    if(a.position.distanceTo(this.models.mito.position) > 4) this.models.atp.remove(a);
                });
            }

        } else if (id === 'homeostasis') {
            const heat     = (lastOut - 36.5) / 1.5;
            const exercise = simulation.params.exercise / 100;

            if (this.models.human) {
                // Temperature → skin turns red
                if (this.models.skinMat) {
                    this.models.skinMat.color.setRGB(
                        1.0,
                        Math.max(0.38, 0.79 - heat * 0.55),
                        Math.max(0.28, 0.63 - heat * 0.70)
                    );
                }
                // Heartbeat pulse on torso
                const pulse = 1.0 + Math.sin(Date.now() / 220) * (0.018 + exercise * 0.04);
                if (this.models.torsoRef) this.models.torsoRef.scale.set(pulse, 1, pulse);
                // Exercise lean + breathing bob
                this.models.human.rotation.x = exercise * 0.18;
                const breathY = (this.basePos.y + 0.215) + Math.sin(Date.now() / 700) * 0.012;
                this.models.human.position.y = breathY;
            }
            // Sweat drops
            if (simulation.isRunning && heat > 0.1 && Math.random() < (heat + exercise) * 0.5) {
                const s = new THREE.Mesh(
                    new THREE.SphereGeometry(0.04, 6, 6),
                    new THREE.MeshBasicMaterial({ color: 0x00cfef, transparent: true, opacity: 0.85 })
                );
                s.position.set(
                    this.basePos.x + (Math.random() - 0.5) * 0.5,
                    this.basePos.y + 0.215 + 1.4 + Math.random() * 0.3,
                    this.basePos.z + (Math.random() - 0.5) * 0.3
                );
                this.models.sweat.add(s);
            }
            this.models.sweat.children.forEach(s => {
                s.position.y -= 0.09 + exercise * 0.07;
                if (s.position.y < this.basePos.y) this.models.sweat.remove(s);
            });

        } else if (id === 'photosynthesis') {
            const light = simulation.params.light / 100;
            if (this.models.leaves) {
                // Leaf color shifts from dark green to bright vibrant green
                this.models.leaves.material.color.setRGB(0.1 + light * 0.2, 0.4 + light * 0.5, 0.1);
                this.models.leaves.material.emissive.setRGB(0, light * 0.2, 0);
            }

            const bubbleChance = simulation.isRunning ? lastOut / 60 : 0;
            if (Math.random() < bubbleChance) {
                const b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.7}));
                b.position.set((Math.random()-0.5)*3, 1.5 + Math.random()*2, -5 + (Math.random()-0.5)*3);
                this.models.bubbles.add(b);
            }
            this.models.bubbles.children.forEach(b => { b.position.y += 0.05; if(b.position.y > 7) this.models.bubbles.remove(b); });

        } else if (id === 'acid_rain') {
            const hasFilter = simulation.params.hasFilter === 'true';
            if (this.models.filter) this.models.filter.visible = hasFilter;

            const pollution = (5.6 - lastOut) / 1.5;
            if (this.models.tree) {
                this.models.tree.material.color.setRGB(0.1 + pollution, 0.6 - pollution, 0.1);
                this.models.tree.scale.set(1-pollution*0.3, 1-pollution*0.3, 1-pollution*0.3);
            }
            if (simulation.isRunning && Math.random() < 0.8) {
                const r = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4), new THREE.MeshBasicMaterial({color: 0x6688cc}));
                r.position.set((Math.random()-0.5)*15, 12, -5 + (Math.random()-0.5)*15);
                this.models.rain.add(r);
            }
            this.models.rain.children.forEach(r => { r.position.y -= 0.4; if(r.position.y < -1) this.models.rain.remove(r); });

        } else if (id === 'prec_measure') {
            const measValpm = 10 + 8 * Math.sin(Date.now() / 1000 * 0.35);
            if (this.models.movJaw) this.models.movJaw.position.x = this.basePos.x - 1.5 + 0.15 + measValpm * 0.065;

        } else if (id === 'density_det') {
            const Vdd = simulation.params.volume || 50, mdd = simulation.params.mass || 100;
            const ddd = mdd / Vdd;
            if (this.models.water) this.models.water.scale.y = Math.max(0.1, 0.5 + (Vdd / 200) * 1.2);
            if (this.models.stone) this.models.stone.material.color.setHex(ddd > 5 ? 0xb8860b : ddd > 2 ? 0x888888 : 0xcd7f32);

        } else if (id === 'thermal_eq') {
            const m1te=simulation.params.mass1||100, T1ite=simulation.params.temp1||20;
            const m2te=simulation.params.mass2||100, T2ite=simulation.params.temp2||80;
            const Teqte=(m1te*T1ite+m2te*T2ite)/(m1te+m2te);
            const progte=simulation.isRunning ? Math.min(1,simulation.timer/(simulation.params.duration||15)) : 0;
            const T1c2=T1ite+(Teqte-T1ite)*progte, T2c2=T2ite+(Teqte-T2ite)*progte;
            if(this.models.liq1){const n1=T1c2/100; this.models.liq1.material.color.setRGB(0.12+n1*0.88,0.3-n1*0.2,1-n1*0.9);}
            if(this.models.liq2){const n2=T2c2/100; this.models.liq2.material.color.setRGB(0.12+n2*0.88,0.3-n2*0.2,1-n2*0.9);}
            if(simulation.isRunning && this.models.particles && Math.random()<0.12){
                const p=new THREE.Mesh(new THREE.SphereGeometry(0.04,5,5),new THREE.MeshBasicMaterial({color:0xff7043,transparent:true,opacity:0.7}));
                p.position.set(this.basePos.x+(Math.random()-0.5)*0.5,this.basePos.y+0.5,this.basePos.z);
                p.userData.vel=new THREE.Vector3((Math.random()-0.5)*0.015,0.025,0);
                this.models.particles.add(p);
            }
            if(this.models.particles) this.models.particles.children.forEach(p=>{p.position.add(p.userData.vel);if(p.position.y>this.basePos.y+2.2)this.models.particles.remove(p);});

        } else if (id === 'ohm_law') {
            const I3d=(simulation.params.voltage||10)/(simulation.params.resistance||5);
            const animT3d=Date.now()/1000;
            if(this.models.electrons) this.models.electrons.children.forEach(e=>{
                const phase=(e.userData.phase+animT3d*I3d*0.055)%1;
                const bx=this.basePos.x, by=this.basePos.y+0.55, bz=this.basePos.z;
                const pos=phase*6.0;
                if(pos<1.5){e.position.set(bx-1.8+pos*1.8,by,bz);}
                else if(pos<3.0){e.position.set(bx+0.9,by,bz);}
                else if(pos<4.5){e.position.set(bx+0.9-(pos-3.0)*1.8,by,bz);}
                else{e.position.set(bx-1.8,by,bz);}
            });

        } else if (id === 'magnetism') {
            const fieldStr2=simulation.params.magType==='neodymium'?1.0:0.55;
            if(this.models.dust){
                while(this.models.dust.children.length<Math.round(fieldStr2*40)){
                    const dm=new THREE.Mesh(new THREE.SphereGeometry(0.025,4,4),new THREE.MeshBasicMaterial({color:0xaabbcc,transparent:true,opacity:0.7}));
                    const r2=0.5+Math.random()*1.6, a2=Math.random()*Math.PI*2;
                    dm.position.set(this.basePos.x+Math.cos(a2)*r2,this.basePos.y+0.8+Math.sin(a2)*r2*0.5,this.basePos.z);
                    dm.userData.angle=a2; dm.userData.r=r2; this.models.dust.add(dm);
                }
                this.models.dust.children.forEach(d=>{
                    d.userData.angle+=0.004*fieldStr2;
                    d.position.x=this.basePos.x+Math.cos(d.userData.angle)*d.userData.r;
                    d.position.y=this.basePos.y+0.8+Math.sin(d.userData.angle)*d.userData.r*0.45;
                });
            }

        } else if (id === 'liq_pressure') {
            const depth3=simulation.params.depth||10, P3=depth3*(simulation.params.density||1)*9.81/100;
            const delta3=Math.min(0.55,P3*0.11);
            if(this.models.probe){const ty3=this.basePos.y+2.5-(depth3/30)*1.4; this.models.probe.position.y+=(ty3-this.models.probe.position.y)*0.1;}
            if(this.models.uLiqL) this.models.uLiqL.scale.y=Math.max(0.05,1.0-delta3*2);
            if(this.models.uLiqR) this.models.uLiqR.scale.y=Math.max(0.05,1.0+delta3*2);

        } else if (id === 'buoyancy') {
            if(this.models.objB){
                const ty3b=this.basePos.y+1.4+Math.max(-0.65,Math.min(0.75,(lastOut-1.962)*0.38));
                this.models.objB.position.y+=(ty3b-this.models.objB.position.y)*0.08;
                if(this.models.fkArrow){this.models.fkArrow.position.copy(this.models.objB.position);this.models.fkArrow.setLength(Math.max(0.12,lastOut*0.35),0.18,0.10);}
                if(this.models.gArrow) this.models.gArrow.position.copy(this.models.objB.position);
            }

        } else if (id === 'ripple_tank') {
            const freq3=simulation.params.freq||5, animT5=Date.now()/1000;
            if(this.models.waveGeo){
                const pos3=this.models.waveGeo.attributes.position;
                for(let i=0;i<pos3.count;i++){
                    const x3=pos3.getX(i),z3=pos3.getZ(i),dist3=Math.sqrt(x3*x3+z3*z3);
                    pos3.setY(i,Math.sin(dist3*freq3*1.4-animT5*freq3*3.0)*Math.exp(-dist3*0.28)*0.20);
                }
                pos3.needsUpdate=true; this.models.waveGeo.computeVertexNormals();
            }
        } else if (id === 'cozelti_hazirlama') {
            const m = simulation.params.naclMass || 5;
            const v = simulation.params.waterVol || 250;
            if (this.models.liquid) {
                const fillHeight = (v / 500);
                this.models.liquid.scale.y = fillHeight;
                const conc = m / (v / 1000);
                const opacity = Math.min(0.95, 0.35 + (conc / 80) * 0.55);
                this.models.liquid.material.opacity = opacity;
            }

        } else if (id === 'alev_testi') {
            const salt = simulation.params.metalSalt || 'LiCl';
            const colors = { LiCl: 0xff1744, NaCl: 0xffea00, KCl: 0xd500f9, CuCl2: 0x00e676 };
            const hexColor = colors[salt] || 0xff1744;
            if (this.models.flameMat) this.models.flameMat.color.setHex(hexColor);
            if (this.models.flameLight) this.models.flameLight.color.setHex(hexColor);

        } else if (id === 'polar_apolar') {
            const isConductive = (simulation.params.testCircuit === 'on' && simulation.params.solvent === 'water' && simulation.params.solute === 'nacl');
            if (this.models.bulbMat) this.models.bulbMat.color.setHex(isConductive ? 0xffea00 : 0x475569);
            if (this.models.bulbLight) this.models.bulbLight.intensity = isConductive ? 2.5 : 0;

        } else if (id === 'viskozite') {
            if (this.models.viscosityBall) {
                const targetY = simulation.isRunning ? Math.max(0.35, 2.2 - (simulation.timer / Math.max(1, lastOut)) * 1.8) : (simulation.timer >= simulation.params.duration ? 0.35 : 2.2);
                this.models.viscosityBall.position.y += (targetY - this.models.viscosityBall.position.y) * 0.1;
            }

        } else if (id === 'kutle_korunumu') {
            const isTilted = simulation.params.isTilted === 'true';
            if (this.models.precipitate) {
                this.models.precipitate.material.color.setHex(isTilted ? 0xffffff : 0x38bdf8);
                this.models.precipitate.material.opacity = isTilted ? 0.95 : 0.6;
            }

        } else if (id === 'ayrimsal_damitma') {
            if (this.models.flaskLiq) {
                const tempRatio = Math.min(1, Math.max(0, (lastOut - 25) / 75));
                if (this.models.distillHeaterMat) {
                    this.models.distillHeaterMat.color.setRGB(0.9 + tempRatio * 0.1, 0.2 * (1 - tempRatio), 0.2 * (1 - tempRatio));
                }
                const distProgress = lastOut >= 75 ? Math.min(1, (lastOut - 75) / 25) : 0;
                if (this.models.receiverLiq) {
                    this.models.receiverLiq.scale.y = Math.max(0.05, distProgress);
                    this.models.receiverLiq.visible = distProgress > 0.01;
                }
            }

        } else if (id === 'dogal_indikator') {
            const sample = simulation.params.sample || 'vinegar';
            const sampleIndex = { hcl: 0, vinegar: 1, water: 2, soap: 3, naoh: 4 }[sample] ?? 1;
            if (this.models.tubes) {
                this.models.tubes.forEach((t, idx) => {
                    if (idx === sampleIndex) {
                        t.scale.set(1.25, 1.1, 1.25);
                        t.material.opacity = 0.95;
                    } else {
                        t.scale.set(1.0, 1.0, 1.0);
                        t.material.opacity = 0.4;
                    }
                });
            }

        } else if (id === 'sabun_eldesi') {
            if (this.models.stirRod && simulation.isRunning) {
                this.models.stirRod.rotation.y += 0.15;
            }
            if (this.models.soapMat) {
                const addSalt = simulation.params.addSalt === 'true';
                this.models.soapMat.color.setHex(addSalt ? 0xf8fafc : 0xeab308);
            }
        }

        // --- UPDATE 3D OVERLAY PANEL DYNAMICALLY ---
        const overlay = document.querySelector('.physics-3d-overlay span:first-child');
        if (overlay) {
            let txt = '';
            if (id === 'prec_measure') {
                const tool = simulation.params.tool || 'caliper';
                const toolName = tool === 'micrometer' ? 'Mikrometre' : 'Kumpas';
                const prec = tool === 'micrometer' ? '0.01 mm' : '0.1 mm';
                const measValpm = 10 + 8 * Math.sin(Date.now() / 1000 * 0.35);
                txt = `${toolName} (Hassasiyet: ${prec}) — Ölçüm: <b>${measValpm.toFixed(tool === 'micrometer' ? 2 : 1)} mm</b>`;
            } else if (id === 'density_det') {
                const v = simulation.params.volume||50, m = simulation.params.mass||100;
                txt = `d = ${m} / ${v} = <b>${(m/v).toFixed(2)} g/cm³</b>`;
            } else if (id === 'thermal_eq') {
                const m1=simulation.params.mass1||100, T1=simulation.params.temp1||20;
                const m2=simulation.params.mass2||100, T2=simulation.params.temp2||80;
                const Teq = (m1*T1+m2*T2)/(m1+m2);
                txt = `Hedef Denge: <b>${Teq.toFixed(1)} °C</b>`;
            } else if (id === 'ohm_law') {
                const v = simulation.params.voltage||10, r = simulation.params.resistance||5;
                txt = `I = ${v} / ${r} = <b>${(v/r).toFixed(2)} A</b>`;
            } else if (id === 'magnetism') {
                const p = simulation.params.magType === 'neodymium' ? '100%' : '55%';
                txt = `Mıknatıs Türü: <b>${simulation.params.magType||'standart'}</b> | Güç: <b>${p}</b>`;
            } else if (id === 'liq_pressure') {
                const h = simulation.params.depth||10, d = simulation.params.density||1;
                txt = `P = ${h} × ${d} × 9.81 = <b>${(h*d*9.81/100).toFixed(2)} kPa</b>`;
            } else if (id === 'buoyancy') {
                const v = simulation.params.vBatan||50, d = simulation.params.dLiquid||1;
                txt = `F<sub>k</sub> = ${v} × ${d} × 9.81 = <b>${(v*d*9.81/100).toFixed(2)} N</b>`;
            } else if (id === 'ripple_tank') {
                const f = simulation.params.freq||5;
                txt = `Frekans: <b>${f} Hz</b> | Hız sabittir`;
            }
            if (txt) overlay.innerHTML = txt;
        }
    },

    animate: function() {
        if (!this.is3DActive) return;
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        this.updateMovement();
        this.updateDynamicEnvironment();
        this.update3DUIPanels();
        this.renderer.render(this.scene, this.camera);
    },

    updateMovement: function() {
        if (!this.isCanvasFocused) return;
        const speed = this.isMobile ? 0.05 : 0.1;
        const move = new THREE.Vector3();
        if (this.keys['KeyW']) move.z -= 1;
        if (this.keys['KeyS']) move.z += 1;
        if (this.keys['KeyA']) move.x -= 1;
        if (this.keys['KeyD']) move.x += 1;

        if (this.touch && this.touch.joystickActive) {
            move.x += this.touch.moveX / 40;
            move.z += this.touch.moveY / 40;
        }

        if (move.length() > 0) {
            const length = move.length();
            if (length > 1) move.normalize();
            const camDir = new THREE.Vector3();
            this.camera.getWorldDirection(camDir);
            camDir.y = 0; camDir.normalize();
            const right = new THREE.Vector3().crossVectors(this.camera.up, camDir).normalize();
            const vec = new THREE.Vector3().addScaledVector(camDir, -move.z).addScaledVector(right, -move.x);
            this.camera.position.addScaledVector(vec.normalize(), speed * (length > 1 ? 1 : length));
        }
    },

    create3DUI: function() {
        const screenMat = () => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
        const bezelMat  = new THREE.MeshPhongMaterial({ color: 0x1a1d24, shininess: 40 });
        const armMat    = new THREE.MeshPhongMaterial({ color: 0x2a2d34, shininess: 60 });
        const glowMat   = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

        const makeMonitor = (w, h, pos, ry) => {
            const g = new THREE.Group();
            // Bezel frame
            const bezel = new THREE.Mesh(new THREE.BoxGeometry(w+0.14, h+0.12, 0.07), bezelMat);
            // Cyan glow border
            const border = new THREE.Mesh(new THREE.BoxGeometry(w+0.06, h+0.04, 0.02), glowMat);
            border.position.z = 0.04;
            // Screen surface — pushed forward from bezel
            const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMat());
            screen.position.z = 0.15;
            // Wall bracket arm (horizontal rod from wall to back of monitor)
            const armLen = Math.abs(pos.z - (-8.3)) + 0.1;
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, armLen, 10), armMat);
            arm.rotation.x = Math.PI / 2;
            arm.position.set(0, 0, -(0.05 + armLen / 2));
            // Wall anchor plate
            const anchor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.06), armMat);
            anchor.position.set(0, 0, -(0.05 + armLen));
            g.add(bezel, border, screen, arm, anchor);
            g.position.copy(pos);
            g.rotation.y = ry;
            return { group: g, screen };
        };

        const ctrl  = makeMonitor(2.8, 3.8, new THREE.Vector3(-5.2, 4.8, -6.2), 0.22);
        const chart = makeMonitor(3.8, 2.8, new THREE.Vector3( 4.8, 4.2, -6.2), -0.22);
        const data  = makeMonitor(2.5, 1.0, new THREE.Vector3( 0,   4.8, -6.5), 0);

        this.ui3D.controlsPanel = ctrl.screen;
        this.ui3D.chartPanel    = chart.screen;
        this.ui3D.dataPanel     = data.screen;

        this.scene.add(ctrl.group, chart.group, data.group);
        this.ui3D.isInitialized = true;
    },

    update3DUIPanels: function() {
        if (!this.ui3D.isInitialized || !this.is3DActive) return;
        
        // Throttling UI updates to 10 FPS to save performance and allow smooth fluctuations
        const now = Date.now();
        if (this.ui3D.lastUpdate && now - this.ui3D.lastUpdate < 100) return;
        this.ui3D.lastUpdate = now;

        const updatePanel = (mesh, w, h, drawFn) => {
            if (!mesh.userData.canvas) {
                mesh.userData.canvas = document.createElement('canvas');
                mesh.userData.canvas.width = w;
                mesh.userData.canvas.height = h;
                mesh.material.map = new THREE.CanvasTexture(mesh.userData.canvas);
            }
            const canvas = mesh.userData.canvas;
            drawFn(canvas.getContext('2d'));
            mesh.material.map.needsUpdate = true;
        };

        updatePanel(this.ui3D.controlsPanel, 768, 1024, (ctx) => {
            ctx.fillStyle='#060c18'; ctx.fillRect(0,0,768,1024);
            // Header
            ctx.fillStyle='#00bcd4'; ctx.fillRect(0,0,768,72);
            ctx.fillStyle='#001a20'; ctx.font='bold 42px Inter, Arial'; ctx.textAlign='center';
            ctx.fillText('⚗ DENEY PARAMETRELERİ', 384, 50);
            ctx.textAlign='left';

            const labelMap = {
                temp:'🌡 Sıcaklık',ph:'⚗ pH Değeri',duration:'⏱ Süre',
                light:'☀ Işık Yoğunluğu',concentration:'💧 Konsantrasyon',
                liverState:'🫀 Karaciğer',isBoiled:'🔥 Kaynatılmış',
                bagContent:'🧪 Torba İçeriği',solution:'🧫 Çözelti',
                exercise:'🏃 Egzersiz',glucose:'🍬 Glikoz',yeast:'🦠 Maya',
                filterOn:'🌿 Filtre',hasFilter:'🌿 Filtre',pollution:'🏭 Kirlilik',
                substrateConc:'📊 Substrat',inhibitor:'🚫 İnhibitör',
                solute:'⚗ Çözünen'
            };

            let y = 120;
            for(let [k,v] of Object.entries(simulation.params)) {
                if (y < 980) {
                    // Row background
                    ctx.fillStyle = y % 104 < 52 ? 'rgba(0,188,212,0.06)' : 'rgba(255,255,255,0.03)';
                    ctx.fillRect(16, y-42, 736, 52);
                    // Label
                    const lbl = labelMap[k] || ('• ' + k);
                    ctx.fillStyle='#90caf9'; ctx.font='bold 28px Inter, Arial';
                    ctx.fillText(lbl, 24, y);
                    // Value
                    ctx.fillStyle='#ffffff'; ctx.font='bold 32px Inter, Arial';
                    ctx.textAlign='right';
                    ctx.fillText(String(v), 748, y);
                    ctx.textAlign='left';
                    y += 60;
                }
            }
            // Status indicator
            ctx.fillStyle = simulation.isRunning ? '#22c55e' : '#ef4444';
            ctx.beginPath(); ctx.arc(730, 44, 14, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle='#000'; ctx.font='bold 16px Inter,Arial'; ctx.textAlign='center';
            ctx.fillText(simulation.isRunning ? 'ON' : 'OFF', 730, 50);
            ctx.textAlign='left';
        });

        updatePanel(this.ui3D.chartPanel, 1024, 768, (ctx) => {
            const padL = 80, padR = 24, padT = 60, padB = 50;
            const PW = 1024 - padL - padR;
            const PH = 768 - padT - padB;

            // Background — same deep navy as the main chart area
            ctx.fillStyle = '#0a0a2e';
            ctx.fillRect(0, 0, 1024, 768);

            const data = simulation.dataPoints;

            // ── Title ──
            ctx.fillStyle = '#00acc1';
            ctx.font = 'bold 30px Inter, Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Canlı Grafik', padL, 44);

            // ── Y-axis label (rotated) ──
            const yLabel = (typeof app !== 'undefined' && app.currentExp)
                ? app.currentExp.details.dependent : 'Çıktı';
            ctx.save();
            ctx.translate(13, padT + PH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = '#00acc1';
            ctx.font = 'bold 20px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText(yLabel, 0, 0);
            ctx.restore();

            // ── X-axis label ──
            ctx.fillStyle = '#607d8b';
            ctx.font = '18px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Zaman (saniye)', padL + PW / 2, 768 - 10);

            // ── No-data hint ──
            if (data.length < 2) {
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.font = '18px Inter, Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Deney başlatıldığında grafik görünür', padL + PW / 2, padT + PH / 2);
                return;
            }

            // Y-axis — zero buffer, tightest possible scale (matches Chart.js auto)
            const rawMax = Math.max(...data.map(d => d.output));
            const rawMin = Math.min(...data.map(d => d.output));
            const spread = rawMax - rawMin;
            // Only add buffer when data is completely flat (avoid division by zero)
            const tinyBuf = spread > 0.001 ? spread * 0.04 : rawMax * 0.01;
            const maxOut = rawMax + tinyBuf;
            const minOut = rawMin - tinyBuf;
            const range  = maxOut - minOut;

            const toX = (i) => padL + (i / (data.length - 1)) * PW;
            const toY = (v) => padT + PH - ((v - minOut) / range * PH);

            // ── Y grid (dashed, like main chart) ──
            for (let i = 0; i <= 4; i++) {
                const gy = padT + (i / 4) * PH;
                ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + PW, gy); ctx.stroke();
                ctx.setLineDash([]);

                const tickVal = maxOut - (i / 4) * range;
                ctx.fillStyle = '#607d8b';
                ctx.font = '16px Inter, Arial';
                ctx.textAlign = 'right';
                ctx.fillText(tickVal.toFixed(1), padL - 6, gy + 5);
            }

            // ── X grid (very faint) ──
            const xSteps = Math.min(4, data.length - 1);
            for (let i = 0; i <= xSteps; i++) {
                const gx = padL + (i / xSteps) * PW;
                ctx.strokeStyle = 'rgba(255,255,255,0.02)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + PH); ctx.stroke();

                const timeVal = Math.round((i / xSteps) * data[data.length - 1].time);
                ctx.fillStyle = '#607d8b';
                ctx.font = '16px Inter, Arial';
                ctx.textAlign = 'center';
                ctx.fillText(timeVal + 's', gx, padT + PH + 22);
            }

            // ── Axes ──
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1; ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + PH); ctx.lineTo(padL + PW, padT + PH);
            ctx.stroke();

            // ── Smooth line (Catmull-Rom → Bezier, tension 0.4) ──
            ctx.beginPath();
            ctx.moveTo(toX(0), toY(data[0].output));
            const T = 0.4;
            for (let i = 0; i < data.length - 1; i++) {
                const x0 = toX(Math.max(0, i - 1)), y0 = toY(data[Math.max(0, i - 1)].output);
                const x1 = toX(i),                  y1 = toY(data[i].output);
                const x2 = toX(i + 1),              y2 = toY(data[i + 1].output);
                const x3 = toX(Math.min(data.length - 1, i + 2)), y3 = toY(data[Math.min(data.length - 1, i + 2)].output);
                ctx.bezierCurveTo(
                    x1 + (x2 - x0) * T / 2, y1 + (y2 - y0) * T / 2,
                    x2 - (x3 - x1) * T / 2, y2 - (y3 - y1) * T / 2,
                    x2, y2
                );
            }
            // Glow + stroke
            ctx.shadowBlur = 8; ctx.shadowColor = '#00acc1';
            ctx.strokeStyle = '#00acc1'; ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // ── Gradient area fill ──
            ctx.lineTo(toX(data.length - 1), padT + PH);
            ctx.lineTo(padL, padT + PH);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, padT, 0, padT + PH);
            grad.addColorStop(0, 'rgba(0,172,193,0.2)');
            grad.addColorStop(1, 'rgba(0,172,193,0.0)');
            ctx.fillStyle = grad;
            ctx.fill();

            // ── Data points (like Chart.js: black fill, cyan border) ──
            ctx.setLineDash([]);
            data.forEach((d, i) => {
                ctx.beginPath();
                ctx.arc(toX(i), toY(d.output), 3.5, 0, Math.PI * 2);
                ctx.fillStyle = '#000';
                ctx.fill();
                ctx.strokeStyle = '#00acc1';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        });


        updatePanel(this.ui3D.dataPanel, 1024, 512, (ctx) => {
            ctx.fillStyle='#0a0e1a'; ctx.fillRect(0,0,1024,512);
            // Header
            ctx.fillStyle='#00bcd4'; ctx.fillRect(0,0,1024,72);
            ctx.fillStyle='#000d14'; ctx.font='bold 38px monospace'; ctx.textAlign='center';
            ctx.fillText('CANLI VERİ', 512, 50);
            ctx.textAlign='left';

            const latest = simulation.dataPoints[simulation.dataPoints.length-1] || {input:0, output:0, time:0};
            const expDetails = (typeof app !== 'undefined' && app.currentExp && app.currentExp.details) ? app.currentExp.details : {};
            const indepLabel = expDetails.independent || 'Girdi';
            const depLabel   = expDetails.dependent   || 'Çıktı';

            // Timer row
            ctx.fillStyle='#90caf9'; ctx.font='bold 28px Inter, Arial';
            ctx.fillText('⏱ ZAMAN', 60, 140);
            ctx.fillStyle='#ffffff'; ctx.font='bold 52px monospace';
            ctx.fillText(`${latest.time} s`, 400, 145);

            // Divider
            ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(40,165); ctx.lineTo(984,165); ctx.stroke();

            // Input row
            ctx.fillStyle='#38bdf8'; ctx.font='bold 24px Inter, Arial';
            ctx.fillText(`↑ ${indepLabel.toUpperCase()}`, 60, 230);
            ctx.fillStyle='#ffffff'; ctx.font='bold 44px monospace';
            ctx.fillText(String(latest.input), 400, 235);

            // Divider
            ctx.beginPath(); ctx.moveTo(40,255); ctx.lineTo(984,255); ctx.stroke();

            // Output row
            ctx.fillStyle='#fb7185'; ctx.font='bold 24px Inter, Arial';
            ctx.fillText(`↓ ${depLabel.toUpperCase()}`, 60, 325);
            ctx.fillStyle='#ffffff'; ctx.font='bold 44px monospace';
            ctx.fillText(Number(latest.output).toFixed(2), 400, 330);

            // Progress bar background
            ctx.fillStyle='rgba(34,197,94,0.15)'; ctx.fillRect(40,380,944,36);
            // Progress fill (output as % of expected max)
            const pct = Math.min(1, Math.max(0, latest.output / 200));
            const wave = Math.sin(Date.now() / 200) * 1;
            ctx.fillStyle='#22c55e';
            ctx.fillRect(40, 380, Math.round(944 * pct + wave), 36);
        });
    },

    onWindowResize: function() {
        const c = document.getElementById('sim3DCanvas');
        if(!c || !this.renderer) return;
        // Fullscreen modunda pencere boyutunu, normal modda container boyutunu kullan
        const w = document.fullscreenElement === c || document.webkitFullscreenElement === c
            ? window.innerWidth : c.clientWidth;
        const h = document.fullscreenElement === c || document.webkitFullscreenElement === c
            ? window.innerHeight : c.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    },

    toggleFullscreen: function() {
        const container = document.getElementById('sim3DCanvas');
        if (!container) return;
        const fsBtn = document.getElementById('fs-3d-btn');

        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (!isFs) {
            // Tam ekrana gir
            const req = container.requestFullscreen || container.webkitRequestFullscreen;
            if (req) req.call(container);
            if (fsBtn) fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            // Tam ekrandan çık
            const exit = document.exitFullscreen || document.webkitExitFullscreen;
            if (exit) exit.call(document);
            if (fsBtn) fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    },

    setupMobileControls: function() {
        const container = document.getElementById('sim3DCanvas');
        if (!container) return;

        const joystick = document.createElement('div');
        joystick.id = 'mobile-joystick';
        joystick.style.cssText = 'position:absolute;bottom:40px;left:40px;width:80px;height:80px;background:rgba(255,255,255,0.1);border-radius:50%;z-index:1000;border:1px solid rgba(255,255,255,0.2);touch-action:none;';
        const stick = document.createElement('div');
        stick.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:30px;height:30px;background:rgba(255,255,255,0.3);border-radius:50%;pointer-events:none;';
        joystick.appendChild(stick);
        container.appendChild(joystick);

        joystick.addEventListener('touchstart', (e) => { 
            this.touch.joystickActive = true;
            this.isCanvasFocused = true;
        });
        
        joystick.addEventListener('touchmove', (e) => {
            if (!this.touch.joystickActive) return;
            const rect = joystick.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            this.touch.moveX = (e.touches[0].clientX - cx);
            this.touch.moveY = (e.touches[0].clientY - cy);
            
            const limit = 40;
            const dist = Math.sqrt(this.touch.moveX**2 + this.touch.moveY**2);
            if (dist > limit) {
                this.touch.moveX *= limit / dist;
                this.touch.moveY *= limit / dist;
            }
            
            stick.style.transform = `translate(calc(-50% + ${this.touch.moveX}px), calc(-50% + ${this.touch.moveY}px))`;
        });
        
        joystick.addEventListener('touchend', () => {
            this.touch.joystickActive = false;
            this.touch.moveX = 0; this.touch.moveY = 0;
            stick.style.transform = 'translate(-50%, -50%)';
        });

        this.renderer.domElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && !this.touch.joystickActive) {
                this.touch.startX = e.touches[0].clientX;
                this.touch.startY = e.touches[0].clientY;
                this.isCanvasFocused = true;
            }
        });

        this.renderer.domElement.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && !this.touch.joystickActive) {
                const dx = e.touches[0].clientX - this.touch.startX;
                const dy = e.touches[0].clientY - this.touch.startY;
                const euler = new THREE.Euler(0, 0, 0, 'YXZ');
                euler.setFromQuaternion(this.camera.quaternion);
                euler.y -= dx * 0.005;
                euler.x -= dy * 0.005;
                euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, euler.x));
                this.camera.quaternion.setFromEuler(euler);
                this.touch.startX = e.touches[0].clientX;
                this.touch.startY = e.touches[0].clientY;
            }
        });
    },

    destroy: function() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            if (this.renderer.domElement) this.renderer.domElement.remove();
        }
        const joy = document.getElementById('mobile-joystick'); 
        if(joy) joy.remove();
        this.scene = null; 
        this.camera = null; 
        this.renderer = null; 
        this.is3DActive = false;
        this.isCanvasFocused = false;
    }
};

function toggleView3D() {
    const canvas2D = document.getElementById('simCanvas');
    const canvas3D = document.getElementById('sim3DCanvas');
    const toggleBtn = document.getElementById('toggle-3d-btn');
    const fsBtn = document.getElementById('fs-3d-btn');
    if (!simulation3D.is3DActive) {
        canvas2D.style.display = 'none'; canvas3D.classList.remove('hidden'); canvas3D.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-square"></i> 2D Görünüm';
        if (fsBtn) fsBtn.classList.remove('hidden');
        simulation3D.is3DActive = true;
        simulation3D.init(app.currentExp.id);
        simulation3D.animate();
    } else {
        canvas2D.style.display = 'block'; canvas3D.classList.add('hidden'); canvas3D.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-cube"></i> 3D Görünüm';
        if (fsBtn) { fsBtn.classList.add('hidden'); fsBtn.innerHTML = '<i class="fas fa-expand"></i>'; }
        simulation3D.is3DActive = false;
        simulation3D.destroy();
    }
}

// ESC tuşuyla tam ekrandan çıkılınca butonu sıfırla
document.addEventListener('fullscreenchange', () => {
    const fsBtn = document.getElementById('fs-3d-btn');
    if (fsBtn && !document.fullscreenElement) {
        fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
});
document.addEventListener('webkitfullscreenchange', () => {
    const fsBtn = document.getElementById('fs-3d-btn');
    if (fsBtn && !document.webkitFullscreenElement) {
        fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
});
