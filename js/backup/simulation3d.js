const simulation3D = {
    scene: null,
    camera: null,
    renderer: null,
    is3DActive: false,
    isFullscreen: false,
    isVRMode: false,
    vrSession: null,
    currentExperiment: null,
    models: {},
    lights: {},
    controls: {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        canJump: false,
        velocity: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        raycaster: new THREE.Raycaster(),
        interactionDistance: 3
    },
    keys: {},
    touch: {
        startX: 0,
        startY: 0,
        moveX: 0,
        moveY: 0,
        joystickActive: false
    },
    interactionUI: null,
    animationFrameId: null,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

    // 3D UI Elements
    ui3D: {
        mainPanel: null,
        controlsPanel: null,
        chartPanel: null,
        dataPanel: null,
        isInitialized: false
    },

    init: function(experimentId) {
        const container = document.getElementById('sim3DCanvas');
        if (!container) return;

        this.currentExperiment = experimentId;
        this.scene = new THREE.Scene();
        
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Check for WebXR support
        this.checkVRSupport();

        // Setup fullscreen listener
        this.setupFullscreenListener();

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(0, 1.6, 5);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: !this.isMobile,
            alpha: true,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.shadowMap.enabled = !this.isMobile;
        this.renderer.xr.enabled = true; // Enable WebXR
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        if (!this.isMobile) {
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);

        // Setup VR Button
        this.setupVRButton();

        this.setupEnvironment(experimentId);
        this.addLights(experimentId);
        this.addGround(experimentId);
        this.setupControls();
        this.createScene(experimentId);
        this.setupInteractionUI();
        
        // Initialize 3D UI
        this.create3DUI();

        // Setup advanced interaction system
        this.setupAdvancedInteraction();

        if (this.isMobile) {
            this.setupMobileControls();
        }

        window.addEventListener('resize', () => this.onWindowResize());
    },

    checkVRSupport: function() {
        if ('xr' in navigator) {
            navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
                if (supported) {
                    this.vrSupported = true;
                    console.log('VR supported!');
                } else {
                    this.vrSupported = false;
                }
            }).catch(() => {
                this.vrSupported = false;
            });
        } else {
            this.vrSupported = false;
        }
    },

    setupVRButton: function() {
        const container = document.getElementById('sim3DCanvas');
        let vrButton = document.getElementById('vr-toggle-btn');
        
        if (!vrButton) {
            vrButton = document.createElement('button');
            vrButton.id = 'vr-toggle-btn';
            vrButton.innerHTML = '<i class="fas fa-vr-cardboard"></i> VR Modu';
            vrButton.style.cssText = `
                position: absolute;
                top: 50px;
                left: 3px;
                z-index: 100;
                background: rgba(76, 29, 149, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                border: 1px solid rgba(139, 92, 246, 0.5);
                font-size: 12px;
                cursor: pointer;
                display: none;
                transition: all 0.3s;
            `;
            container.appendChild(vrButton);
        }

        if (this.vrSupported) {
            vrButton.style.display = 'flex';
            vrButton.style.alignItems = 'center';
            vrButton.style.gap = '5px';
            vrButton.onclick = () => this.toggleVR();
        }
    },

    toggleVR: async function() {
        const vrButton = document.getElementById('vr-toggle-btn');
        
        if (!this.vrSupported) {
            alert('VR cihazı bulunamadı veya desteklenmiyor!');
            return;
        }

        try {
            if (this.isVRMode) {
                if (this.vrSession) {
                    await this.vrSession.end();
                }
            } else {
                this.vrSession = await navigator.xr.requestSession('immersive-vr', {
                    optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
                });
                
                await this.renderer.xr.setSession(this.vrSession);
                this.isVRMode = true;
                vrButton.innerHTML = '<i class="fas fa-vr-cardboard"></i> VR Kapat';
                vrButton.style.background = 'rgba(239, 68, 68, 0.9)';
                
                this.vrSession.addEventListener('end', () => {
                    this.isVRMode = false;
                    vrButton.innerHTML = '<i class="fas fa-vr-cardboard"></i> VR Modu';
                    vrButton.style.background = 'rgba(76, 29, 149, 0.9)';
                });
            }
        } catch (e) {
            console.error('VR Error:', e);
            alert('VR başlatılamadı: ' + e.message);
        }
    },

    toggleFullscreen: function() {
        const container = document.getElementById('sim3DCanvas');
        
        if (!this.isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            this.isFullscreen = true;
            container.classList.add('fullscreen-mode');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.isFullscreen = false;
            container.classList.remove('fullscreen-mode');
        }
    },

    setupFullscreenListener: function() {
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            const container = document.getElementById('sim3DCanvas');
            if (container) {
                if (this.isFullscreen) {
                    container.classList.add('fullscreen-mode');
                } else {
                    container.classList.remove('fullscreen-mode');
                }
            }
            this.onWindowResize();
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            this.isFullscreen = !!document.webkitFullscreenElement;
            const container = document.getElementById('sim3DCanvas');
            if (container) {
                if (this.isFullscreen) {
                    container.classList.add('fullscreen-mode');
                } else {
                    container.classList.remove('fullscreen-mode');
                }
            }
            this.onWindowResize();
        });
    },

    // Hide UI panels when entering 3D immersive mode
    hideUIPanels: function() {
        // Hide main info panel (top) - ONLY experiment view
        const viewExp = document.getElementById('view-experiment');
        if (viewExp) {
            const panels = viewExp.querySelectorAll('.glass-panel');
            panels.forEach((panel, index) => {
                // Keep the middle canvas panel visible, hide only side panels
                if (index === 0) {
                    // Top info panel
                    panel.style.display = 'none';
                }
            });
        }

        // Hide left controls panel
        const gridContainer = document.querySelector('#view-experiment .grid');
        if (gridContainer) {
            const children = gridContainer.children;
            if (children.length >= 3) {
                // Left panel (controls)
                children[0].style.display = 'none';
                // Right panel (data/chart) 
                children[2].style.display = 'none';
            }
        }

        // DO NOT hide navbar - keep it visible
        // const navbar = document.querySelector('nav');
        // if (navbar) navbar.style.display = 'none';

        // Make canvas full width and centered
        const canvasContainer = document.querySelector('#view-experiment .grid > div:nth-child(2)');
        if (canvasContainer) {
            canvasContainer.classList.remove('lg:col-span-6');
            canvasContainer.classList.add('col-span-12');
            canvasContainer.style.marginLeft = '0';
            canvasContainer.style.marginRight = '0';
        }

        // Mark as immersive mode
        this.isImmersiveMode = true;
        
        // Show 3D UI panels
        this.show3DUI();
    },

    showUIPanels: function() {
        // Show main info panel (top)
        const viewExp = document.getElementById('view-experiment');
        if (viewExp) {
            const panels = viewExp.querySelectorAll('.glass-panel');
            panels.forEach((panel, index) => {
                if (index === 0) {
                    panel.style.display = 'block';
                }
            });
        }

        // Show left panel
        const gridContainer = document.querySelector('#view-experiment .grid');
        if (gridContainer) {
            const children = gridContainer.children;
            if (children.length >= 3) {
                children[0].style.display = 'flex';
                children[2].style.display = 'flex';
            }
        }

        // Canvas container back to normal
        const canvasContainer = document.querySelector('#view-experiment .grid > div:nth-child(2)');
        if (canvasContainer) {
            canvasContainer.classList.add('lg:col-span-6');
            canvasContainer.classList.remove('col-span-12');
        }

        // Mark immersive mode as off
        this.isImmersiveMode = false;
        
        // Hide 3D UI
        this.hide3DUI();
    },

    create3DUI: function() {
        if (this.ui3D.isInitialized) return;
        
        // Create main floating UI panel (glass-like)
        const panelGeometry = new THREE.PlaneGeometry(3, 2);
        const panelMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x0a0a2e,
            transparent: true,
            opacity: 0.85,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.2,
            thickness: 0.5,
            side: THREE.DoubleSide
        });

        // Main info panel in 3D
        this.ui3D.mainPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        this.ui3D.mainPanel.position.set(0, 2, -3);
        this.ui3D.mainPanel.visible = false;
        this.scene.add(this.ui3D.mainPanel);

        // Create 3D text labels using canvas textures
        this.update3DUIText();

        // Create mini control panel
        const controlGeom = new THREE.PlaneGeometry(1.5, 2.5);
        this.ui3D.controlsPanel = new THREE.Mesh(controlGeom, panelMaterial.clone());
        this.ui3D.controlsPanel.position.set(-3, 1.5, -2);
        this.ui3D.controlsPanel.rotation.y = 0.3;
        this.ui3D.controlsPanel.visible = false;
        this.scene.add(this.ui3D.controlsPanel);

        // Create mini chart panel
        const chartGeom = new THREE.PlaneGeometry(2, 1.5);
        this.ui3D.chartPanel = new THREE.Mesh(chartGeom, panelMaterial.clone());
        this.ui3D.chartPanel.position.set(3, 2, -2);
        this.ui3D.chartPanel.rotation.y = -0.3;
        this.ui3D.chartPanel.visible = false;
        this.scene.add(this.ui3D.chartPanel);

        // Create data panel
        const dataGeom = new THREE.PlaneGeometry(2.5, 1);
        this.ui3D.dataPanel = new THREE.Mesh(dataGeom, panelMaterial.clone());
        this.ui3D.dataPanel.position.set(0, 0.5, -2.5);
        this.ui3D.dataPanel.visible = false;
        this.scene.add(this.ui3D.dataPanel);

        this.ui3D.isInitialized = true;
    },

    update3DUIText: function() {
        if (!this.ui3D.mainPanel) return;

        // Create texture with experiment info
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 512, 256);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(1, '#1a1a4e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 256);

        // Border
        ctx.strokeStyle = '#00acc1';
        ctx.lineWidth = 3;
        ctx.strokeRect(5, 5, 502, 246);

        // Title
        ctx.fillStyle = '#00acc1';
        ctx.font = 'bold 28px Exo 2';
        ctx.textAlign = 'center';
        const title = app.currentExp ? app.currentExp.title : 'Deney';
        ctx.fillText(title.substring(0, 25), 256, 50);

        // Info text
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Exo 2';
        ctx.fillText('3D İmmersif Mod', 256, 90);

        ctx.font = '14px Exo 2';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('WASD: Hareket | E: Etkileşim | F: Tam Ekran', 256, 130);
        ctx.fillText('Mouse: Kamera Kontrolü', 256, 155);
        ctx.fillText('VR Gözlük: Hareketli Etkileşim', 256, 180);

        // Status
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 16px Exo 2';
        ctx.fillText('● AKTİF', 256, 220);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        if (this.ui3D.mainPanel.material) {
            this.ui3D.mainPanel.material.map = texture;
            this.ui3D.mainPanel.material.needsUpdate = true;
        }
    },

    show3DUI: function() {
        if (!this.ui3D.isInitialized) this.create3DUI();
        
        if (this.ui3D.mainPanel) this.ui3D.mainPanel.visible = true;
        if (this.ui3D.controlsPanel) this.ui3D.controlsPanel.visible = true;
        if (this.ui3D.chartPanel) this.ui3D.chartPanel.visible = true;
        if (this.ui3D.dataPanel) this.ui3D.dataPanel.visible = true;
        
        this.update3DUIText();
    },

    hide3DUI: function() {
        if (this.ui3D.mainPanel) this.ui3D.mainPanel.visible = false;
        if (this.ui3D.controlsPanel) this.ui3D.controlsPanel.visible = false;
        if (this.ui3D.chartPanel) this.ui3D.chartPanel.visible = false;
        if (this.ui3D.dataPanel) this.ui3D.dataPanel.visible = false;
    },

    setupEnvironment: function(experimentId) {
        if (experimentId === 'photosynthesis') {
            this.scene.background = new THREE.Color(0x87CEEB);
            this.scene.fog = new THREE.Fog(0x87CEEB, 10, 80);
        } else if (experimentId === 'liver' || experimentId === 'enzyme_kinetics') {
            this.scene.background = new THREE.Color(0x1a1a2e);
            this.scene.fog = new THREE.Fog(0x1a1a2e, 5, 50);
        } else if (experimentId === 'osmosis') {
            this.scene.background = new THREE.Color(0xE0F7FA);
            this.scene.fog = new THREE.Fog(0xE0F7FA, 5, 50);
        } else if (experimentId === 'fermentation') {
            this.scene.background = new THREE.Color(0xFFF3E0);
            this.scene.fog = new THREE.Fog(0xFFF3E0, 5, 50);
        } else if (experimentId === 'acid_rain') {
            this.scene.background = new THREE.Color(0x778899);
            this.scene.fog = new THREE.Fog(0x778899, 10, 60);
        } else if (experimentId === 'respiration') {
            this.scene.background = new THREE.Color(0x263238);
            this.scene.fog = new THREE.Fog(0x263238, 5, 40);
        } else {
            this.scene.background = new THREE.Color(0x87CEEB);
            this.scene.fog = new THREE.Fog(0x87CEEB, 10, 80);
        }
    },

    addLights: function(experimentId) {
        // Ambient light for base illumination
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.lights.ambient);

        // Main directional light (sun)
        this.lights.sun = new THREE.DirectionalLight(0xffffff, 1.2);
        this.lights.sun.position.set(10, 20, 10);
        
        if (!this.isMobile) {
            this.lights.sun.castShadow = true;
            this.lights.sun.shadow.camera.left = -20;
            this.lights.sun.shadow.camera.right = 20;
            this.lights.sun.shadow.camera.top = 20;
            this.lights.sun.shadow.camera.bottom = -20;
            this.lights.sun.shadow.mapSize.width = 2048;
            this.lights.sun.shadow.mapSize.height = 2048;
            this.lights.sun.shadow.bias = -0.0001;
        }
        this.scene.add(this.lights.sun);

        // Hemisphere light for more natural outdoor lighting
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4a7c4e, 0.6);
        this.scene.add(hemiLight);
        this.lights.hemi = hemiLight;

        // Additional fill light
        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Add environment map for realistic reflections
        if (!this.isMobile) {
            this.createEnvironmentMap();
        }

        if (experimentId === 'photosynthesis') {
            this.lights.sunHelper = new THREE.Mesh(
                new THREE.SphereGeometry(2, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xffff00 })
            );
            this.lights.sunHelper.position.set(15, 25, -10);
            this.scene.add(this.lights.sunHelper);
            
            // Sun glow effect
            const sunGlow = new THREE.PointLight(0xffaa00, 2, 50);
            sunGlow.position.set(15, 25, -10);
            this.scene.add(sunGlow);
        }

        if (experimentId === 'liver' || experimentId === 'enzyme_kinetics') {
            // Lab-style lighting
            const labLight = new THREE.PointLight(0x00acc1, 1.5, 15);
            labLight.position.set(0, 3, -2);
            this.scene.add(labLight);
            this.lights.labLight = labLight;

            // Additional accent lights
            const accentLight1 = new THREE.PointLight(0x00ff88, 0.5, 10);
            accentLight1.position.set(3, 2, -3);
            this.scene.add(accentLight1);
            
            const accentLight2 = new THREE.PointLight(0xff0066, 0.5, 10);
            accentLight2.position.set(-3, 2, -3);
            this.scene.add(accentLight2);
        }
    },

    createEnvironmentMap: function() {
        // Create a simple procedural environment map
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        // Create gradient texture for environment
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#1e3a5f');
        gradient.addColorStop(0.4, '#87CEEB');
        gradient.addColorStop(0.6, '#b0e0e6');
        gradient.addColorStop(1, '#90EE90');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 256);

        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;

        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        this.scene.environment = envMap;

        texture.dispose();
        pmremGenerator.dispose();
    },

    addGround: function(experimentId) {
        const groundGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
        let groundColor = 0x4a7c4e;
        let groundRoughness = 0.8;

        if (experimentId === 'liver' || experimentId === 'enzyme_kinetics') {
            groundColor = 0x2a2a3e;
            groundRoughness = 0.4;
        } else if (experimentId === 'osmosis') {
            groundColor = 0xB3E5FC;
            groundRoughness = 0.1;
        } else if (experimentId === 'fermentation') {
            groundColor = 0xFFE0B2;
            groundRoughness = 0.5;
        } else if (experimentId === 'acid_rain') {
            groundColor = 0x3e2723;
            groundRoughness = 0.9;
        } else if (experimentId === 'photosynthesis') {
            groundColor = 0x3d6b2f;
            groundRoughness = 0.95;
        }

        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: groundColor,
            roughness: groundRoughness,
            metalness: 0.1,
            flatShading: this.isMobile
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = !this.isMobile;
        this.scene.add(ground);

        if (!this.isMobile) {
            // Remove grid for natural look, add subtle ground details
            if (experimentId !== 'liver' && experimentId !== 'enzyme_kinetics') {
                // Add small ground variation with vertex displacement
                const positionAttribute = groundGeometry.getAttribute('position');
                for (let i = 0; i < positionAttribute.count; i++) {
                    const z = positionAttribute.getZ(i);
                    positionAttribute.setZ(i, z + (Math.random() - 0.5) * 0.1);
                }
                groundGeometry.computeVertexNormals();
            }
        }
    },

    addGrassDetails: function() {
        // Add grass blade instances for realistic ground
        const grassCount = 500;
        const grassGeometry = new THREE.ConeGeometry(0.02, 0.15, 4);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c4e,
            roughness: 0.8,
            metalness: 0.0
        });

        const grassGroup = new THREE.InstancedMesh(grassGeometry, grassMaterial, grassCount);
        const dummy = new THREE.Object3D();
        
        for (let i = 0; i < grassCount; i++) {
            dummy.position.set(
                Math.random() * 20 - 10,
                0.075,
                Math.random() * 20 - 10
            );
            dummy.rotation.y = Math.random() * Math.PI;
            dummy.scale.setScalar(0.5 + Math.random() * 0.5);
            dummy.updateMatrix();
            grassGroup.setMatrixAt(i, dummy.matrix);
        }
        
        grassGroup.instanceMatrix.needsUpdate = true;
        grassGroup.castShadow = false;
        this.scene.add(grassGroup);
        this.models.grass = grassGroup;
    },

    setupControls: function() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'KeyE' && this.isNearInteractable()) {
                this.interact();
            }
            
            // Fullscreen toggle
            if (e.code === 'KeyF' && this.is3DActive) {
                this.toggleFullscreen();
            }
            
            // Toggle immersive mode
            if (e.code === 'KeyI' && this.is3DActive) {
                if (this.isImmersiveMode) {
                    this.showUIPanels();
                } else {
                    this.hideUIPanels();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        let mouseDown = false;
        let lastMouseX = 0;
        let lastMouseY = 0;

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            mouseDown = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            e.preventDefault();
        });

        document.addEventListener('mouseup', () => {
            mouseDown = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (!mouseDown || !this.is3DActive) return;

            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;

            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

            const euler = new THREE.Euler(0, 0, 0, 'YXZ');
            euler.setFromQuaternion(this.camera.quaternion);

            euler.y -= deltaX * 0.002;
            euler.x -= deltaY * 0.002;

            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

            this.camera.quaternion.setFromEuler(euler);
        });
    },

    setupMobileControls: function() {
        const joystick = document.createElement('div');
        joystick.id = 'mobile-joystick';
        joystick.style.cssText = `
            position: absolute;
            bottom: 80px;
            left: 30px;
            width: 100px;
            height: 100px;
            background: rgba(0, 172, 193, 0.2);
            border: 2px solid rgba(0, 172, 193, 0.5);
            border-radius: 50%;
            z-index: 1000;
            touch-action: none;
        `;

        const joystickHandle = document.createElement('div');
        joystickHandle.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: rgba(0, 172, 193, 0.6);
            border: 2px solid #00acc1;
            border-radius: 50%;
        `;
        joystick.appendChild(joystickHandle);

        const interactBtn = document.createElement('button');
        interactBtn.id = 'mobile-interact-btn';
        interactBtn.innerHTML = '<i class="fas fa-hand-pointer"></i> Etkileşim';
        interactBtn.style.cssText = `
            position: absolute;
            bottom: 80px;
            right: 30px;
            padding: 15px 25px;
            background: rgba(0, 172, 193, 0.8);
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            display: none;
        `;
        interactBtn.onclick = () => this.interact();

        document.getElementById('sim3DCanvas').appendChild(joystick);
        document.getElementById('sim3DCanvas').appendChild(interactBtn);

        let joystickCenter = { x: 0, y: 0 };

        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touch.joystickActive = true;
            const rect = joystick.getBoundingClientRect();
            joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        });

        joystick.addEventListener('touchmove', (e) => {
            if (!this.touch.joystickActive) return;
            e.preventDefault();

            const touch = e.touches[0];
            const dx = touch.clientX - joystickCenter.x;
            const dy = touch.clientY - joystickCenter.y;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 30;
            
            if (distance > maxDistance) {
                const angle = Math.atan2(dy, dx);
                this.touch.moveX = Math.cos(angle) * maxDistance;
                this.touch.moveY = Math.sin(angle) * maxDistance;
            } else {
                this.touch.moveX = dx;
                this.touch.moveY = dy;
            }

            joystickHandle.style.transform = `translate(calc(-50% + ${this.touch.moveX}px), calc(-50% + ${this.touch.moveY}px))`;
        });

        joystick.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch.joystickActive = false;
            this.touch.moveX = 0;
            this.touch.moveY = 0;
            joystickHandle.style.transform = 'translate(-50%, -50%)';
        });

        this.renderer.domElement.addEventListener('touchstart', (e) => {
            if (e.target === this.renderer.domElement) {
                this.touch.startX = e.touches[0].clientX;
                this.touch.startY = e.touches[0].clientY;
            }
        });

        this.renderer.domElement.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && e.target === this.renderer.domElement) {
                const deltaX = e.touches[0].clientX - this.touch.startX;
                const deltaY = e.touches[0].clientY - this.touch.startY;

                const euler = new THREE.Euler(0, 0, 0, 'YXZ');
                euler.setFromQuaternion(this.camera.quaternion);

                euler.y -= deltaX * 0.005;
                euler.x -= deltaY * 0.005;

                euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

                this.camera.quaternion.setFromEuler(euler);

                this.touch.startX = e.touches[0].clientX;
                this.touch.startY = e.touches[0].clientY;
            }
        });
    },

    createScene: function(experimentId) {
        this.models = {};

        if (experimentId === 'photosynthesis') {
            this.createPhotosynthesisScene();
        } else if (experimentId === 'liver') {
            this.createLiverScene();
        } else if (experimentId === 'osmosis') {
            this.createOsmosisScene();
        } else if (experimentId === 'fermentation') {
            this.createFermentationScene();
        } else if (experimentId === 'acid_rain') {
            this.createAcidRainScene();
        } else if (experimentId === 'respiration') {
            this.createRespirationScene();
        } else if (experimentId === 'enzyme_kinetics') {
            this.createEnzymeScene();
        } else if (experimentId === 'diffusion_simple') {
            this.createDiffusionScene();
        } else if (experimentId === 'water_prop') {
            this.createWaterPropScene();
        } else if (experimentId === 'dialysis') {
            this.createDialysisScene();
        } else if (experimentId === 'homeostasis') {
            this.createHomeostasisScene();
        } else {
            this.createDefaultScene();
        }
    },

    createPhotosynthesisScene: function() {
        // Tree trunk - realistic bark texture
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 12);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.95,
            metalness: 0.0,
            bumpScale: 0.02
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, 1.5, -3);
        trunk.castShadow = !this.isMobile;
        trunk.receiveShadow = !this.isMobile;
        this.scene.add(trunk);

        // Leaves - realistic foliage with Subsurface Scattering simulation
        const leavesGeometry = new THREE.SphereGeometry(1.5, this.isMobile ? 8 : 24, this.isMobile ? 8 : 24);
        const leavesMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x228B22,
            roughness: 0.6,
            metalness: 0.0,
            transmission: 0.1,
            thickness: 0.5,
            sheen: 0.5,
            sheenRoughness: 0.5,
            sheenColor: new THREE.Color(0x44aa44)
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(0, 4, -3);
        leaves.castShadow = !this.isMobile;
        leaves.receiveShadow = !this.isMobile;
        this.scene.add(leaves);

        this.models.tree = { trunk, leaves, interactable: true };

        // Add smaller trees/bushes for depth
        for (let i = 0; i < (this.isMobile ? 3 : 8); i++) {
            const bushGeometry = new THREE.SphereGeometry(0.5, 8, 8);
            const bushMaterial = new THREE.MeshPhysicalMaterial({ 
                color: 0x2d5f2d,
                roughness: 0.7,
                metalness: 0.0,
                sheen: 0.3
            });
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.set(
                Math.random() * 20 - 10,
                0.25,
                Math.random() * 20 - 10
            );
            bush.castShadow = !this.isMobile;
            this.scene.add(bush);
        }

        // Add grass details on ground
        if (!this.isMobile) {
            this.addGrassDetails();
        }

        if (!this.isMobile) {
            const particleCount = 100;
            const particlesGeometry = new THREE.BufferGeometry();
            const positions = [];

            for (let i = 0; i < particleCount; i++) {
                positions.push(
                    (Math.random() - 0.5) * 20,
                    Math.random() * 10,
                    (Math.random() - 0.5) * 20
                );
            }

            particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            const particlesMaterial = new THREE.PointsMaterial({ 
                color: 0xffffff, 
                size: 0.1,
                transparent: true,
                opacity: 0.6
            });
            const particles = new THREE.Points(particlesGeometry, particlesMaterial);
            this.scene.add(particles);
            this.models.particles = particles;
        }

        const oxygenBubbles = new THREE.Group();
        this.models.oxygenBubbles = oxygenBubbles;
        this.scene.add(oxygenBubbles);
    },

    createLiverScene: function() {
        // Lab table with realistic wood/material
        const tableGeometry = new THREE.BoxGeometry(3, 0.1, 2);
        const tableMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B7355,
            roughness: 0.6,
            metalness: 0.1
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.set(0, 0.8, -2);
        table.receiveShadow = !this.isMobile;
        table.castShadow = !this.isMobile;
        this.scene.add(table);

        // Add table legs
        const legGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 });
        const legPositions = [[-1.4, 0.4, -0.9], [1.4, 0.4, -0.9], [-1.4, 0.4, -3.1], [1.4, 0.4, -3.1]];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(...pos);
            leg.castShadow = !this.isMobile;
            this.scene.add(leg);
        });

        // Glass tube with realistic transparency
        const tubeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 24);
        const tubeMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
            roughness: 0.05,
            metalness: 0.0,
            transmission: 0.9,
            thickness: 0.5,
            ior: 1.5
        });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.position.set(0, 1.4, -2);
        tube.castShadow = !this.isMobile;
        this.scene.add(tube);

        // Liver with organic material
        const liverGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const liverMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x8B4513,
            roughness: 0.7,
            metalness: 0.0,
            sheen: 0.3,
            sheenRoughness: 0.8
        });
        const liver = new THREE.Mesh(liverGeometry, liverMaterial);
        liver.position.set(0, 1.1, -2);
        liver.castShadow = !this.isMobile;
        this.scene.add(liver);

        // Liquid in tube with water-like material
        const liquidGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 24);
        const liquidMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.5,
            roughness: 0.1,
            metalness: 0.0,
            transmission: 0.6,
            thickness: 0.3
        });
        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.set(0, 1.0, -2);
        this.scene.add(liquid);

        // Add lab equipment rack
        const rackGeom = new THREE.BoxGeometry(2.5, 0.05, 0.5);
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.3 });
        const rack = new THREE.Mesh(rackGeom, rackMat);
        rack.position.set(0, 1.8, -2);
        rack.castShadow = !this.isMobile;
        this.scene.add(rack);

        const bubbles = new THREE.Group();
        this.models.bubbles = bubbles;
        this.scene.add(bubbles);

        this.models.experiment = { table, tube, liver, liquid, interactable: true };
    },

    createOsmosisScene: function() {
        // Cell membrane - realistic organic material
        const cellGeometry = new THREE.SphereGeometry(0.5, 24, 24);
        const cellMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xF48FB1,
            transparent: true,
            opacity: 0.75,
            roughness: 0.3,
            metalness: 0.0,
            transmission: 0.3,
            thickness: 0.5,
            sheen: 0.5,
            sheenColor: new THREE.Color(0xff99aa)
        });
        const cell = new THREE.Mesh(cellGeometry, cellMaterial);
        cell.position.set(0, 1.5, -3);
        cell.castShadow = !this.isMobile;
        this.scene.add(cell);

        // Cell membrane - semi-permeable layer
        const membraneGeometry = new THREE.SphereGeometry(0.55, 32, 32);
        const membraneMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xAD1457,
            transparent: true,
            opacity: 0.2,
            wireframe: true,
            roughness: 0.4
        });
        const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial);
        membrane.position.set(0, 1.5, -3);
        this.scene.add(membrane);

        // Water container with realistic glass
        const containerGeometry = new THREE.BoxGeometry(4, 3, 4);
        const containerMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xE0F7FA,
            transparent: true,
            opacity: 0.15,
            roughness: 0.05,
            metalness: 0.0,
            transmission: 0.95,
            thickness: 0.5,
            ior: 1.33
        });
        const container = new THREE.Mesh(containerGeometry, containerMaterial);
        container.position.set(0, 1.5, -3);
        this.scene.add(container);

        // Add water surface with wave effect
        const waterGeom = new THREE.PlaneGeometry(3.8, 3.8, 32, 32);
        const waterMat = new THREE.MeshPhysicalMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.4,
            roughness: 0.1,
            metalness: 0.0,
            transmission: 0.8
        });
        const water = new THREE.Mesh(waterGeom, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.set(0, 0.2, -3);
        this.scene.add(water);
        this.models.water = water;

        const saltParticles = new THREE.Group();
        for (let i = 0; i < 50; i++) {
            const particleGeom = new THREE.SphereGeometry(0.02, 4, 4);
            const particleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const particle = new THREE.Mesh(particleGeom, particleMat);
            particle.position.set(
                (Math.random() - 0.5) * 3.5,
                1.5 + (Math.random() - 0.5) * 2.5,
                -3 + (Math.random() - 0.5) * 3.5
            );
            saltParticles.add(particle);
        }
        this.scene.add(saltParticles);
        this.models.saltParticles = saltParticles;

        this.models.cell = { cell, membrane, container, interactable: true };
    },

    createFermentationScene: function() {
        // Glass bottle with realistic transparency
        const bottleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 24);
        const bottleMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
            roughness: 0.02,
            metalness: 0.0,
            transmission: 0.95,
            thickness: 0.5,
            ior: 1.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
        bottle.position.set(0, 1.5, -3);
        bottle.castShadow = !this.isMobile;
        this.scene.add(bottle);

        // Fermentation liquid (yeast solution)
        const liquidGeometry = new THREE.CylinderGeometry(0.28, 0.28, 1.2, 24);
        const liquidMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xFFE0B2,
            transparent: true,
            opacity: 0.7,
            roughness: 0.2,
            metalness: 0.0,
            transmission: 0.4,
            thickness: 0.8,
            sheen: 0.3,
            sheenColor: new THREE.Color(0xffcc80)
        });
        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.set(0, 1.3, -3);
        this.scene.add(liquid);

        // Latex balloon with rubber-like material
        const balloonGeometry = new THREE.SphereGeometry(0.3, 24, 24);
        const balloonMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xEF5350,
            roughness: 0.4,
            metalness: 0.0,
            sheen: 0.8,
            sheenRoughness: 0.3,
            sheenColor: new THREE.Color(0xff8a80)
        });
        const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
        balloon.position.set(0, 2.4, -3);
        balloon.castShadow = !this.isMobile;
        this.scene.add(balloon);

        // Add bottle neck
        const neckGeom = new THREE.CylinderGeometry(0.08, 0.15, 0.3, 16);
        const neckMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
            transmission: 0.9,
            roughness: 0.02
        });
        const neck = new THREE.Mesh(neckGeom, neckMat);
        neck.position.set(0, 2.35, -3);
        this.scene.add(neck);

        // Add table/platform
        const tableGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 24);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.3 });
        const table = new THREE.Mesh(tableGeom, tableMat);
        table.position.set(0, 0.75, -3);
        table.castShadow = !this.isMobile;
        table.receiveShadow = !this.isMobile;
        this.scene.add(table);

        const gasParticles = new THREE.Group();
        this.models.gasParticles = gasParticles;
        this.scene.add(gasParticles);

        this.models.fermentation = { bottle, liquid, balloon, interactable: true };
    },

    createAcidRainScene: function() {
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.25, 2, 12);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8D6E63,
            roughness: 0.9,
            metalness: 0.0
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, 1, -3);
        trunk.castShadow = !this.isMobile;
        this.scene.add(trunk);

        // Tree leaves
        const leavesGeometry = new THREE.SphereGeometry(1, 16, 16);
        const leavesMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x228B22,
            roughness: 0.6,
            metalness: 0.0,
            sheen: 0.5,
            sheenColor: new THREE.Color(0x44aa44)
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(0, 2.5, -3);
        leaves.castShadow = !this.isMobile;
        this.scene.add(leaves);

        // Factory building
        const factoryGeometry = new THREE.BoxGeometry(2, 1.5, 1.5);
        const factoryMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x555555,
            roughness: 0.7,
            metalness: 0.3
        });
        const factory = new THREE.Mesh(factoryGeometry, factoryMaterial);
        factory.position.set(-5, 0.75, -5);
        factory.castShadow = !this.isMobile;
        this.scene.add(factory);

        // Factory chimney
        const chimneyGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 12);
        const chimneyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(-5, 2.25, -5);
        chimney.castShadow = !this.isMobile;
        this.scene.add(chimney);

        // Add industrial pipes
        const pipeGeom = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
        const pipeMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.4 });
        const pipe1 = new THREE.Mesh(pipeGeom, pipeMat);
        pipe1.position.set(-4, 1, -5);
        pipe1.rotation.z = Math.PI / 4;
        this.scene.add(pipe1);

        // Add road
        const roadGeom = new THREE.PlaneGeometry(20, 2);
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
        const road = new THREE.Mesh(roadGeom, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.set(3, 0.01, -5);
        road.receiveShadow = !this.isMobile;
        this.scene.add(road);

        const smokeParticles = new THREE.Group();
        this.models.smokeParticles = smokeParticles;
        this.scene.add(smokeParticles);

        this.models.acidRain = { trunk, leaves, factory, chimney, interactable: true };
    },

    createRespirationScene: function() {
        // Mitochondria - the powerhouse of the cell
        const mitoGeometry = new THREE.SphereGeometry(0.8, 24, 16);
        const mitoMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xFF7043,
            roughness: 0.5,
            metalness: 0.1,
            emissive: 0xFF7043,
            emissiveIntensity: 0.3,
            sheen: 0.5,
            sheenColor: new THREE.Color(0xffaa80),
            clearcoat: 0.3
        });
        const mitochondria = new THREE.Mesh(mitoGeometry, mitoMaterial);
        mitochondria.position.set(0, 1.5, -3);
        mitochondria.scale.set(1.5, 0.8, 1);
        mitochondria.castShadow = !this.isMobile;
        this.scene.add(mitochondria);

        // Inner membrane (cristae) - more detailed
        const innerMembraneGeometry = new THREE.TorusGeometry(0.5, 0.08, 12, 24);
        const innerMembraneMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xFFAB91,
            emissive: 0xFFAB91,
            emissiveIntensity: 0.4,
            roughness: 0.4,
            metalness: 0.1,
            sheen: 0.6
        });
        for (let i = 0; i < 4; i++) {
            const membrane = new THREE.Mesh(innerMembraneGeometry, innerMembraneMaterial);
            membrane.position.set(0, 1.5 + (i - 1.5) * 0.25, -3);
            membrane.rotation.x = Math.PI / 2;
            membrane.scale.set(1 - i * 0.15, 1, 1 - i * 0.15);
            this.scene.add(membrane);
        }

        // Add cell background/organelles
        const cellGeom = new THREE.SphereGeometry(2, 32, 32);
        const cellMat = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.1,
            roughness: 0.3,
            transmission: 0.9,
            thickness: 1
        });
        const cell = new THREE.Mesh(cellGeom, cellMat);
        cell.position.set(0, 1.5, -3);
        this.scene.add(cell);

        // Add some small organelles
        for (let i = 0; i < 10; i++) {
            const orgGeom = new THREE.SphereGeometry(0.05, 8, 8);
            const orgMat = new THREE.MeshStandardMaterial({ color: 0x66bb6a });
            const org = new THREE.Mesh(orgGeom, orgMat);
            org.position.set(
                (Math.random() - 0.5) * 3,
                1.5 + (Math.random() - 0.5) * 2,
                -3 + (Math.random() - 0.5) * 2
            );
            this.scene.add(org);
        }

        const atpParticles = new THREE.Group();
        this.models.atpParticles = atpParticles;
        this.scene.add(atpParticles);

        this.models.respiration = { mitochondria, interactable: true };
    },

    createEnzymeScene: function() {
        // Laboratory beaker with realistic glass
        const beakerGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32, 1, true);
        const beakerMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            roughness: 0.02,
            metalness: 0.0,
            transmission: 0.95,
            thickness: 0.5,
            ior: 1.5,
            side: THREE.DoubleSide
        });
        const beaker = new THREE.Mesh(beakerGeometry, beakerMaterial);
        beaker.position.set(0, 1.5, -3);
        beaker.castShadow = !this.isMobile;
        this.scene.add(beaker);

        // Add beaker bottom
        const bottomGeom = new THREE.CircleGeometry(0.38, 32);
        const bottomMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            transmission: 0.9,
            roughness: 0.02,
            side: THREE.DoubleSide
        });
        const bottom = new THREE.Mesh(bottomGeom, bottomMat);
        bottom.rotation.x = -Math.PI / 2;
        bottom.position.set(0, 0.9, -3);
        this.scene.add(bottom);

        // Add liquid in beaker
        const liquidGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.8, 32);
        const liquidMat = new THREE.MeshPhysicalMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.4,
            roughness: 0.1,
            transmission: 0.7,
            thickness: 0.3
        });
        const liquid = new THREE.Mesh(liquidGeom, liquidMat);
        liquid.position.set(0, 1.1, -3);
        this.scene.add(liquid);

        // Enzyme molecules - larger and more detailed
        const enzymeCount = 15;
        const enzymeGroup = new THREE.Group();
        for (let i = 0; i < enzymeCount; i++) {
            // Use different shapes for variety
            let enzymeGeometry;
            if (i % 3 === 0) {
                enzymeGeometry = new THREE.SphereGeometry(0.06, 12, 12);
            } else if (i % 3 === 1) {
                enzymeGeometry = new THREE.TorusGeometry(0.04, 0.02, 8, 16);
            } else {
                enzymeGeometry = new THREE.OctahedronGeometry(0.05);
            }
            
            const enzymeMaterial = new THREE.MeshPhysicalMaterial({ 
                color: 0xFFD700,
                roughness: 0.3,
                metalness: 0.2,
                emissive: 0xFFD700,
                emissiveIntensity: 0.3,
                sheen: 0.8,
                sheenColor: new THREE.Color(0xffea00)
            });
            const enzyme = new THREE.Mesh(enzymeGeometry, enzymeMaterial);
            enzyme.position.set(
                (Math.random() - 0.5) * 0.6,
                1.0 + Math.random() * 0.8,
                -3 + (Math.random() - 0.5) * 0.6
            );
            enzyme.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01
                )
            };
            enzyme.castShadow = !this.isMobile;
            enzymeGroup.add(enzyme);
        }
        this.scene.add(enzymeGroup);
        this.models.enzymeGroup = enzymeGroup;

        this.models.enzyme = { beaker, liquid, interactable: true };
    },

    createDiffusionScene: function() {
        // Petri dish with realistic glass
        const dishGeometry = new THREE.CylinderGeometry(2, 2, 0.2, 48);
        const dishMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0xeeeeee,
            roughness: 0.1,
            metalness: 0.0,
            transmission: 0.9,
            thickness: 0.2,
            ior: 1.5
        });
        const dish = new THREE.Mesh(dishGeometry, dishMaterial);
        dish.position.set(0, 0.1, -3);
        dish.rotation.x = Math.PI / 2;
        dish.receiveShadow = !this.isMobile;
        this.scene.add(dish);

        // Add dish rim
        const rimGeom = new THREE.TorusGeometry(2, 0.05, 8, 48);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.3 });
        const rim = new THREE.Mesh(rimGeom, rimMat);
        rim.position.set(0, 0.2, -3);
        rim.rotation.x = Math.PI / 2;
        this.scene.add(rim);

        // Add liquid in dish
        const liquidGeom = new THREE.CylinderGeometry(1.9, 1.9, 0.05, 48);
        const liquidMat = new THREE.MeshPhysicalMaterial({
            color: 0xbbdefb,
            transparent: true,
            opacity: 0.5,
            roughness: 0.05,
            transmission: 0.8
        });
        const liquid = new THREE.Mesh(liquidGeom, liquidMat);
        liquid.position.set(0, 0.12, -3);
        this.scene.add(liquid);

        // Dye center with glow
        const dyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const dyeMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x0000ff,
            emissive: 0x0000ff,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.1,
            transmission: 0.3
        });
        const dyeCenter = new THREE.Mesh(dyeGeometry, dyeMaterial);
        dyeCenter.position.set(0, 0.2, -3);
        dyeCenter.castShadow = !this.isMobile;
        this.scene.add(dyeCenter);

        // Add glow effect
        const glowGeom = new THREE.SphereGeometry(0.2, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        glow.position.copy(dyeCenter.position);
        this.scene.add(glow);
        this.models.dyeGlow = glow;

        const diffusionParticles = new THREE.Group();
        this.models.diffusionParticles = diffusionParticles;
        this.scene.add(diffusionParticles);

        this.models.diffusion = { dish, dyeCenter, liquid, interactable: true };
    },

    createDefaultScene: function() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00acc1 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 1, -3);
        cube.castShadow = !this.isMobile;
        this.scene.add(cube);

        this.models.default = { cube, interactable: true };
    },

    // ==================== WATER COHESION 3D SCENE ====================
    createWaterPropScene: function() {
        // Zemin (para yüzeyi)
        const surfaceGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 32);
        const surfaceMat = new THREE.MeshStandardMaterial({ color: 0xc0a060, metalness: 0.7, roughness: 0.3 });
        const surface = new THREE.Mesh(surfaceGeom, surfaceMat);
        surface.position.set(0, 0.85, -3);
        surface.receiveShadow = true;
        this.scene.add(surface);

        // Su damlası (ana küre)
        const dropGeom = new THREE.SphereGeometry(0.35, 24, 24);
        const dropMat = new THREE.MeshPhysicalMaterial({
            color: 0x00aaff,
            transparent: true,
            opacity: 0.75,
            roughness: 0.05,
            metalness: 0.0,
            transmission: 0.6,
            thickness: 0.5,
            ior: 1.33
        });
        const drop = new THREE.Mesh(dropGeom, dropMat);
        drop.position.set(0, 1.27, -3);
        drop.castShadow = true;
        this.scene.add(drop);
        this.models.waterDrop = drop;

        // Su molekülleri (yüzey çevresinde küçük küreler)
        const molGroup = new THREE.Group();
        const molGeom = new THREE.SphereGeometry(0.055, 8, 8);
        const molMat = new THREE.MeshPhysicalMaterial({ color: 0x44ccff, transparent: true, opacity: 0.8 });
        const molCount = this.isMobile ? 12 : 24;
        for (let i = 0; i < molCount; i++) {
            const angle = (i / molCount) * Math.PI * 2;
            const mol = new THREE.Mesh(molGeom, molMat.clone());
            mol.position.set(Math.cos(angle) * 0.42, 1.27, -3 + Math.sin(angle) * 0.42);
            mol.userData.angle = angle;
            mol.userData.baseR = 0.42;
            this.scene.add(mol);
            molGroup.add(mol);
        }
        this.models.molGroup = molGroup;
        this.scene.add(molGroup);

        // Bağ çizgileri (LineSegments)
        const linePoints = [];
        molGroup.children.forEach(m => {
            linePoints.push(drop.position.clone());
            linePoints.push(m.position.clone());
        });
        const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x88ddff, transparent: true, opacity: 0.25 });
        const lines = new THREE.LineSegments(lineGeom, lineMat);
        this.scene.add(lines);
        this.models.cohesionLines = lines;

        // Etiket info kutusu
        const infoGeom = new THREE.BoxGeometry(2.5, 0.5, 0.01);
        const infoMat = new THREE.MeshBasicMaterial({ color: 0x001133, transparent: true, opacity: 0.7 });
        const infoBox = new THREE.Mesh(infoGeom, infoMat);
        infoBox.position.set(0, 2.2, -3);
        this.scene.add(infoBox);

        this.models.waterScene = { surface, drop, molGroup, interactable: true };
    },

    // ==================== DIALYSIS (BAĞIRSAK) 3D SCENE ====================
    createDialysisScene: function() {
        // Diyaliz torbası / bağırsak tüpü
        const tubGeom = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 20, 1, true);
        const tubMat = new THREE.MeshPhysicalMaterial({
            color: 0xffcc88,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide,
            roughness: 0.3,
            transmission: 0.3
        });
        const tube = new THREE.Mesh(tubGeom, tubMat);
        tube.position.set(0, 1.5, -3);
        this.scene.add(tube);

        // Üst ve alt kapak
        const capGeom = new THREE.CircleGeometry(0.5, 20);
        const capMat = new THREE.MeshStandardMaterial({ color: 0xdd9955, side: THREE.DoubleSide });
        const topCap = new THREE.Mesh(capGeom, capMat);
        topCap.position.set(0, 2.76, -3);
        topCap.rotation.x = Math.PI / 2;
        this.scene.add(topCap);
        const botCap = new THREE.Mesh(capGeom, capMat.clone());
        botCap.position.set(0, 0.24, -3);
        botCap.rotation.x = Math.PI / 2;
        this.scene.add(botCap);

        // İç moleküller (büyük = nişasta, küçük = glikoz)
        this.models.starchGroup = new THREE.Group();
        this.models.glucoseGroup = new THREE.Group();

        const starchMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
        const glucoseMat = new THREE.MeshStandardMaterial({ color: 0xffee55, roughness: 0.4 });

        for (let i = 0; i < 8; i++) {
            const sg = new THREE.SphereGeometry(0.1, 8, 8);
            const s = new THREE.Mesh(sg, starchMat.clone());
            s.position.set((Math.random() - 0.5) * 0.7, 1.0 + Math.random() * 1.4, -3 + (Math.random() - 0.5) * 0.7);
            this.models.starchGroup.add(s);
        }
        for (let i = 0; i < 12; i++) {
            const gg = new THREE.SphereGeometry(0.045, 8, 8);
            const g = new THREE.Mesh(gg, glucoseMat.clone());
            // Başlangıç pozisyonunu userData'ya kaydet — reset için kullanılır
            const startX = (Math.random() - 0.5) * 0.6;
            const startY = 0.9 + Math.random() * 1.6;
            const startZ = -3 + (Math.random() - 0.5) * 0.6;
            g.position.set(startX, startY, startZ);
            g.userData.startPos = { x: startX, y: startY, z: startZ };
            // %75 yavaşlatıldı: 0.008 → 0.002
            g.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 0.002, (Math.random() - 0.5) * 0.001, (Math.random() - 0.5) * 0.002);
            g.userData.startVelocity = g.userData.velocity.clone();
            g.userData.escaped = false;
            g.material.transparent = true;
            g.material.opacity = 1;
            this.models.glucoseGroup.add(g);
        }
        this.scene.add(this.models.starchGroup);
        this.scene.add(this.models.glucoseGroup);

        // Dış ortam (şeffaf kap)
        const outerGeom = new THREE.CylinderGeometry(1.3, 1.3, 3, 20, 1, true);
        const outerMat = new THREE.MeshPhysicalMaterial({ color: 0x88aaff, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
        const outer = new THREE.Mesh(outerGeom, outerMat);
        outer.position.set(0, 1.5, -3);
        this.scene.add(outer);

        this.models.dialysis = { tube, interactable: true };
    },

    // ==================== HOMEOSTASIS 3D SCENE ====================
    createHomeostasisScene: function() {
        // İnsan silüeti — baş
        const headGeom = new THREE.SphereGeometry(0.32, 16, 16);
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5cba7, roughness: 0.8 });
        const head = new THREE.Mesh(headGeom, skinMat);
        head.position.set(0, 2.9, -3);
        head.castShadow = true;
        this.scene.add(head);

        // Gövde
        const bodyGeom = new THREE.CapsuleGeometry(0.28, 1.0, 8, 12);
        const body = new THREE.Mesh(bodyGeom, skinMat.clone());
        body.position.set(0, 1.8, -3);
        body.castShadow = true;
        this.scene.add(body);
        this.models.humanBody = body;

        // Kollar
        const armGeom = new THREE.CapsuleGeometry(0.09, 0.75, 4, 8);
        const leftArm = new THREE.Mesh(armGeom, skinMat.clone());
        leftArm.position.set(-0.45, 1.75, -3);
        leftArm.rotation.z = 0.3;
        this.scene.add(leftArm);
        const rightArm = new THREE.Mesh(armGeom.clone(), skinMat.clone());
        rightArm.position.set(0.45, 1.75, -3);
        rightArm.rotation.z = -0.3;
        this.scene.add(rightArm);

        // Bacaklar
        const legGeom = new THREE.CapsuleGeometry(0.1, 0.85, 4, 8);
        const leftLeg = new THREE.Mesh(legGeom, skinMat.clone());
        leftLeg.position.set(-0.18, 0.7, -3);
        this.scene.add(leftLeg);
        const rightLeg = new THREE.Mesh(legGeom.clone(), skinMat.clone());
        rightLeg.position.set(0.18, 0.7, -3);
        this.scene.add(rightLeg);

        // Termometre (gövde)
        const thermShaftGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12);
        const thermMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, transmission: 0.5 });
        const thermShaft = new THREE.Mesh(thermShaftGeom, thermMat);
        thermShaft.position.set(0.85, 2.0, -3);
        this.scene.add(thermShaft);

        // Termometre sıvısı
        const mercuryGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8);
        const mercuryMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xff1100, emissiveIntensity: 0.4 });
        const mercury = new THREE.Mesh(mercuryGeom, mercuryMat);
        mercury.position.set(0.85, 1.45, -3);
        this.scene.add(mercury);
        this.models.mercury = mercury;

        // Ter parçacıkları grubu
        const sweatGroup = new THREE.Group();
        this.models.sweatGroup = sweatGroup;
        this.scene.add(sweatGroup);

        // Isı halkası (body etrafında renkli glow)
        const ringGeom = new THREE.TorusGeometry(0.5, 0.04, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x3366ff, transparent: true, opacity: 0.4 });
        const heatRing = new THREE.Mesh(ringGeom, ringMat);
        heatRing.position.set(0, 1.8, -3);
        heatRing.rotation.x = Math.PI / 2;
        this.scene.add(heatRing);
        this.models.heatRing = heatRing;

        this.models.homeostasis = { head, body, interactable: true };
    },

    // ==================== ADVANCED PARTICLE SYSTEMS ====================
    
    createAdvancedParticleSystem: function(config) {
        const {
            count = 100,
            color = 0xffffff,
            size = 0.1,
            speed = 0.02,
            lifetime = 100,
            shape = 'sphere',
            glow = false
        } = config;

        const particles = {
            positions: new Float32Array(count * 3),
            velocities: new Float32Array(count * 3),
            lifetimes: new Float32Array(count),
            maxLifetime: lifetime,
            geometries: [],
            meshes: [],
            group: new THREE.Group(),
            active: true
        };

        // Initialize particles
        for (let i = 0; i < count; i++) {
            particles.velocities[i * 3] = (Math.random() - 0.5) * speed;
            particles.velocities[i * 3 + 1] = Math.random() * speed;
            particles.velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
            particles.lifetimes[i] = Math.random() * lifetime;
        }

        // Create geometry based on shape
        let geometry;
        switch(shape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(size, 8, 8);
                break;
            case 'cube':
                geometry = new THREE.BoxGeometry(size, size, size);
                break;
            case 'glow':
                geometry = new THREE.SphereGeometry(size * 1.5, 8, 8);
                break;
            default:
                geometry = new THREE.SphereGeometry(size, 8, 8);
        }

        // Create material
        const material = glow ? 
            new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            }) :
            new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.9
            });

        // Use instanced mesh for performance
        const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        
        const dummy = new THREE.Object3D();
        for (let i = 0; i < count; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            dummy.scale.setScalar(0);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        }
        
        particles.instancedMesh = instancedMesh;
        particles.dummy = dummy;
        particles.group.add(instancedMesh);
        
        this.scene.add(particles.group);
        return particles;
    },

    updateParticleSystem: function(particles, config) {
        if (!particles || !particles.active) return;
        
        const { speed = 0.02, spread = 1, origin = {x:0, y:0, z:0}, gravity = false } = config || {};
        
        for (let i = 0; i < particles.instancedMesh.count; i++) {
            // Update lifetime
            particles.lifetimes[i] += 1;
            
            // Reset if expired
            if (particles.lifetimes[i] > particles.maxLifetime) {
                particles.lifetimes[i] = 0;
                particles.positions[i * 3] = origin.x + (Math.random() - 0.5) * spread;
                particles.positions[i * 3 + 1] = origin.y;
                particles.positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * spread;
                
                particles.velocities[i * 3] = (Math.random() - 0.5) * speed;
                particles.velocities[i * 3 + 1] = Math.random() * speed * 2;
                particles.velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
            }
            
            // Update position
            particles.positions[i * 3] += particles.velocities[i * 3];
            particles.positions[i * 3 + 1] += particles.velocities[i * 3 + 1];
            particles.positions[i * 3 + 2] += particles.velocities[i * 3 + 2];
            
            // Apply gravity if enabled
            if (gravity) {
                particles.velocities[i * 3 + 1] -= 0.001;
            }
            
            // Update instance matrix
            const lifeRatio = particles.lifetimes[i] / particles.maxLifetime;
            const scale = Math.sin(lifeRatio * Math.PI) * 1.5;
            
            particles.dummy.position.set(
                particles.positions[i * 3],
                particles.positions[i * 3 + 1],
                particles.positions[i * 3 + 2]
            );
            particles.dummy.scale.setScalar(scale > 0 ? scale : 0.01);
            particles.dummy.updateMatrix();
            particles.instancedMesh.setMatrixAt(i, particles.dummy.matrix);
        }
        
        particles.instancedMesh.instanceMatrix.needsUpdate = true;
    },

    createWeatherEffect: function(type = 'rain') {
        const weatherGroup = new THREE.Group();
        const particleCount = this.isMobile ? 500 : 2000;
        
        if (type === 'rain') {
            const rainGeometry = new THREE.BufferGeometry();
            const rainPositions = new Float32Array(particleCount * 3);
            const rainVelocities = [];
            
            for (let i = 0; i < particleCount; i++) {
                rainPositions[i * 3] = (Math.random() - 0.5) * 50;
                rainPositions[i * 3 + 1] = Math.random() * 30;
                rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
                rainVelocities.push(0.3 + Math.random() * 0.2);
            }
            
            rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
            
            const rainMaterial = new THREE.PointsMaterial({
                color: 0xaaaaee,
                size: 0.1,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            
            const rain = new THREE.Points(rainGeometry, rainMaterial);
            rain.userData = { velocities: rainVelocities, type: 'rain' };
            weatherGroup.add(rain);
            
        } else if (type === 'snow') {
            const snowGeometry = new THREE.BufferGeometry();
            const snowPositions = new Float32Array(particleCount * 3);
            const snowVelocities = [];
            
            for (let i = 0; i < particleCount; i++) {
                snowPositions[i * 3] = (Math.random() - 0.5) * 50;
                snowPositions[i * 3 + 1] = Math.random() * 30;
                snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
                snowVelocities.push(0.02 + Math.random() * 0.03);
            }
            
            snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
            
            const snowMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.15,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            
            const snow = new THREE.Points(snowGeometry, snowMaterial);
            snow.userData = { velocities: snowVelocities, type: 'snow' };
            weatherGroup.add(snow);
            
        } else if (type === 'acid') {
            const acidGeometry = new THREE.BufferGeometry();
            const acidPositions = new Float32Array(particleCount * 3);
            const acidVelocities = [];
            
            for (let i = 0; i < particleCount; i++) {
                acidPositions[i * 3] = (Math.random() - 0.5) * 50;
                acidPositions[i * 3 + 1] = Math.random() * 30;
                acidPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
                acidVelocities.push(0.2 + Math.random() * 0.15);
            }
            
            acidGeometry.setAttribute('position', new THREE.BufferAttribute(acidPositions, 3));
            
            const acidMaterial = new THREE.PointsMaterial({
                color: 0xaaddaa,
                size: 0.12,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending
            });
            
            const acid = new THREE.Points(acidGeometry, acidMaterial);
            acid.userData = { velocities: acidVelocities, type: 'acid' };
            weatherGroup.add(acid);
        }
        
        this.scene.add(weatherGroup);
        return weatherGroup;
    },

    updateWeatherEffect: function(weatherGroup) {
        if (!weatherGroup) return;
        
        weatherGroup.children.forEach(weather => {
            if (!weather.userData.velocities) return;
            
            const positions = weather.geometry.attributes.position.array;
            const velocities = weather.userData.velocities;
            
            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3 + 1] -= velocities[i];
                
                // Add wind effect
                positions[i * 3] += 0.01;
                
                // Reset if below ground
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = 30;
                    positions[i * 3] = (Math.random() - 0.5) * 50;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
                }
            }
            
            weather.geometry.attributes.position.needsUpdate = true;
        });
    },

    // Glow effect for special objects
    createGlowEffect: function(object, color = 0x00acc1, intensity = 1) {
        // Create outer glow
        const glowGeometry = object.geometry.clone();
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3 * intensity,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.scale.multiplyScalar(1.2);
        object.add(glow);
        
        // Add point light for illumination
        const light = new THREE.PointLight(color, 0.5 * intensity, 5);
        object.add(light);
        
        return { glow, light };
    },

    setupInteractionUI: function() {
        const uiDiv = document.createElement('div');
        uiDiv.id = 'interaction-ui';
        uiDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 15px;
            border: 2px solid #00acc1;
            box-shadow: 0 0 30px rgba(0, 172, 193, 0.5);
            display: none;
            z-index: 1000;
            min-width: 300px;
            max-width: 90vw;
            font-family: 'Exo 2', sans-serif;
        `;
        document.body.appendChild(uiDiv);
        this.interactionUI = uiDiv;

        const hintDiv = document.createElement('div');
        hintDiv.id = 'interaction-hint';
        hintDiv.style.cssText = `
            position: absolute;
            bottom: ${this.isMobile ? '200px' : '20px'};
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: #00acc1;
            padding: 10px 20px;
            border-radius: 10px;
            border: 1px solid #00acc1;
            display: none;
            z-index: 1000;
            font-weight: bold;
            animation: pulse 2s infinite;
        `;
        hintDiv.innerHTML = this.isMobile ? 
            '<i class="fas fa-hand-pointer"></i> Etkileşim butonuna dokunun' : 
            '<i class="fas fa-hand-pointer"></i> Etkileşim için E tuşuna basın';
        document.getElementById('sim3DCanvas').appendChild(hintDiv);
    },

    isNearInteractable: function() {
        const cameraPosition = this.camera.position;
        
        for (const key in this.models) {
            const model = this.models[key];
            if (!model.interactable) continue;

            const modelPosition = new THREE.Vector3();
            if (model.trunk) {
                modelPosition.copy(model.trunk.position);
            } else if (model.tube) {
                modelPosition.copy(model.tube.position);
            } else if (model.cell) {
                modelPosition.copy(model.cell.position);
            } else if (model.bottle) {
                modelPosition.copy(model.bottle.position);
            } else if (model.cube) {
                modelPosition.copy(model.cube.position);
            } else if (model.beaker) {
                modelPosition.copy(model.beaker.position);
            } else if (model.dish) {
                modelPosition.copy(model.dish.position);
            } else if (model.mitochondria) {
                modelPosition.copy(model.mitochondria.position);
            }

            const distance = cameraPosition.distanceTo(modelPosition);
            if (distance < this.controls.interactionDistance) {
                return true;
            }
        }
        return false;
    },

    // ==================== ADVANCED INTERACTION SYSTEM ====================
    
    setupAdvancedInteraction: function() {
        // Raycaster for mouse/touch interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.interactableObjects = [];
        
        // Mouse move for hover effect
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Click for interaction
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));
        
        // Touch events for mobile
        this.renderer.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.renderer.domElement.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Build interactable objects list
        this.buildInteractableList();
    },
    
    buildInteractableList: function() {
        this.interactableObjects = [];
        
        for (const key in this.models) {
            const model = this.models[key];
            if (!model.interactable) continue;
            
            // Add all meshes from the model
            Object.values(model).forEach(obj => {
                if (obj instanceof THREE.Mesh) {
                    obj.userData.interactable = true;
                    obj.userData.modelKey = key;
                    this.interactableObjects.push(obj);
                }
            });
        }
    },
    
    onMouseMove: function(event) {
        if (!this.is3DActive) return;
        
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections
        const intersects = this.raycaster.intersectObjects(this.interactableObjects);
        
        // Reset previous hover
        if (this.hoveredObject && this.hoveredObject !== intersects[0]?.object) {
            this.onObjectHoverOut(this.hoveredObject);
            this.hoveredObject = null;
        }
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.interactable) {
                this.hoveredObject = object;
                this.onObjectHover(object);
                this.renderer.domElement.style.cursor = 'pointer';
            }
        } else {
            this.renderer.domElement.style.cursor = 'default';
        }
    },
    
    onMouseClick: function(event) {
        if (!this.is3DActive || !this.hoveredObject) return;
        
        // Trigger interaction
        this.triggerInteraction(this.hoveredObject);
    },
    
    onTouchStart: function(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        }
    },
    
    onTouchEnd: function(event) {
        if (!this.is3DActive) return;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactableObjects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.interactable) {
                this.triggerInteraction(object);
            }
        }
    },
    
    onObjectHover: function(object) {
        // Skip if already processing
        if (object.userData.isHovered) return;
        
        // Skip if this object has breathing animation (like tree leaves)
        if (object === this.models?.tree?.leaves) return;
        
        // Only apply hover to interactable objects
        if (!object.userData.interactable) return;
        
        // Mark as hovered
        object.userData.isHovered = true;
        
        // Add subtle highlight effect - change emissive color
        if (object.material && object.material.emissive) {
            // Save original values
            if (!object.userData.originalEmissive) {
                object.userData.originalEmissive = object.material.emissive.getHex();
                object.userData.originalEmissiveIntensity = object.material.emissiveIntensity || 0;
            }
            
            // Add highlight
            const currentEmissive = object.material.emissive.getHex();
            if (currentEmissive !== 0x00acc1) {
                object.material.emissive.setHex(0x00acc1);
                object.material.emissiveIntensity = 0.3;
            }
        }
    },
    
    onObjectHoverOut: function(object) {
        // Reset hover state
        object.userData.isHovered = false;
        
        // Skip if object has breathing animation
        if (object === this.models?.tree?.leaves) return;
        
        // Restore emissive color
        if (object.material && object.material.emissive && object.userData.originalEmissive !== undefined) {
            object.material.emissive.setHex(object.userData.originalEmissive);
            object.material.emissiveIntensity = object.userData.originalEmissiveIntensity;
        }
    },
    
    triggerInteraction: function(object) {
        // Visual feedback - flash effect
        const originalEmissive = object.material.emissive ? 
            object.material.emissive.clone() : new THREE.Color(0);
        const originalIntensity = object.material.emissiveIntensity || 0;
        
        if (object.material.emissive) {
            object.material.emissive.setHex(0x00ff00);
            object.material.emissiveIntensity = 0.8;
        }
        
        // Reset after short delay
        setTimeout(() => {
            if (object.material) {
                if (object.material.emissive) {
                    object.material.emissive.copy(originalEmissive);
                    object.material.emissiveIntensity = originalIntensity;
                }
            }
        }, 200);
        
        // Play sound effect (if available)
        this.playInteractionSound();
        
        // Open interaction panel
        this.interact();
    },
    
    playInteractionSound: function() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Audio not supported
        }
    },

    // Highlight interactable objects with outline
    createInteractionOutlines: function() {
        // This would require additional outline pass
        // Simplified version using emissive materials
        this.interactableObjects.forEach(obj => {
            if (obj.material && obj.material.emissive) {
                obj.userData.originalEmissive = obj.material.emissive.clone();
            }
        });
    },

    sanitizeHTML: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    interact: function() {
        const params = simulation.params;
        let content = '<h3 style="color: #00acc1; margin-bottom: 15px; font-size: 1.3em;">📊 Deney Değişkenleri</h3>';
        content += '<div style="line-height: 1.8;">';

        if (this.currentExperiment === 'photosynthesis') {
            const output = simulation.dataPoints.length > 0 ? 
                this.sanitizeHTML(simulation.dataPoints[simulation.dataPoints.length - 1].output.toFixed(2)) : '0';
            content += `
                <p><strong>💡 Işık Şiddeti:</strong> ${this.sanitizeHTML(String(params.light))}%</p>
                <p><strong>🌫️ CO₂ Seviyesi:</strong> ${this.sanitizeHTML(params.co2)}</p>
                <p><strong>⚡ Fotosentez Hızı:</strong> ${output}</p>
                <p style="margin-top: 15px; color: #aaa; font-size: 0.9em; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                    💡 <strong>Bilgi:</strong> Işık ve CO₂, fotosentez için gerekli ana faktörlerdir. Ağaç bu bileşenleri kullanarak oksijen üretir ve büyür.
                </p>
            `;
        } else if (this.currentExperiment === 'liver') {
            const output = simulation.dataPoints.length > 0 ? 
                this.sanitizeHTML(simulation.dataPoints[simulation.dataPoints.length - 1].output.toFixed(2)) : '0';
            content += `
                <p><strong>🔬 Karaciğer Durumu:</strong> ${params.liverState === 'whole' ? 'Bütün' : 'Kıyılmış'}</p>
                <p><strong>💧 H₂O₂ Miktarı:</strong> ${this.sanitizeHTML(String(params.peroxide))}</p>
                <p><strong>🔥 Haşlanmış:</strong> ${params.isBoiled === 'true' ? 'Evet' : 'Hayır'}</p>
                <p><strong>🌡️ Sıcaklık:</strong> ${this.sanitizeHTML(String(params.tempEnv))}°C</p>
                <p><strong>⚡ Reaksiyon Hızı:</strong> ${output}</p>
            `;
        } else if (this.currentExperiment === 'osmosis') {
            const output = simulation.dataPoints.length > 0 ? 
                this.sanitizeHTML(simulation.dataPoints[simulation.dataPoints.length - 1].output.toFixed(2)) : '100';
            content += `
                <p><strong>🧂 Tuz Konsantrasyonu:</strong> ${this.sanitizeHTML(String(params.salt))}%</p>
                <p><strong>📏 Hücre Hacmi:</strong> ${output}</p>
                <p style="margin-top: 15px; color: #aaa; font-size: 0.9em; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                    💧 <strong>Bilgi:</strong> Hücre, ortamın tonikliğine göre su alır veya kaybeder. İzotonik ortamda denge halindedir.
                </p>
            `;
        } else if (this.currentExperiment === 'fermentation') {
            const output = simulation.dataPoints.length > 0 ? 
                this.sanitizeHTML(simulation.dataPoints[simulation.dataPoints.length - 1].output.toFixed(2)) : '0';
            content += `
                <p><strong>🍬 Şeker Türü:</strong> ${this.sanitizeHTML(params.sugar)}</p>
                <p><strong>🌡️ Sıcaklık:</strong> ${this.sanitizeHTML(String(params.temp))}°C</p>
                <p><strong>🎈 Gaz Üretimi:</strong> ${output}</p>
            `;
        } else if (this.currentExperiment === 'acid_rain') {
            const output = simulation.dataPoints.length > 0 ? 
                this.sanitizeHTML(simulation.dataPoints[simulation.dataPoints.length - 1].output.toFixed(2)) : '5.6';
            content += `
                <p><strong>🏭 Fabrika Yükü:</strong> ${this.sanitizeHTML(String(params.factoryLoad))}%</p>
                <p><strong>🚗 Trafik Yoğunluğu:</strong> ${this.sanitizeHTML(String(params.traffic))}%</p>
                <p><strong>🛡️ Filtre:</strong> ${params.hasFilter === 'true' ? 'Var' : 'Yok'}</p>
                <p><strong>🌧️ Yağmur pH:</strong> ${output}</p>
            `;
        } else if (this.currentExperiment === 'respiration') {
            const output = simulation.dataPoints.length > 0 ? 
                this.sanitizeHTML(simulation.dataPoints[simulation.dataPoints.length - 1].output.toFixed(2)) : '0';
            content += `
                <p><strong>💨 Oksijen Seviyesi:</strong> ${this.sanitizeHTML(String(params.oxygen))}%</p>
                <p><strong>⚡ ATP Üretimi:</strong> ${output}</p>
            `;
        } else if (this.currentExperiment === 'enzyme_kinetics') {
            const output = simulation.dataPoints.length > 0 ? 
                this.sanitizeHTML(simulation.dataPoints[simulation.dataPoints.length - 1].output.toFixed(2)) : '0';
            content += `
                <p><strong>🌡️ Sıcaklık:</strong> ${this.sanitizeHTML(String(params.temp))}°C</p>
                <p><strong>⚗️ pH:</strong> ${this.sanitizeHTML(String(params.ph))}</p>
                <p><strong>⚡ Enzim Aktivitesi:</strong> ${output}</p>
            `;
        }

        content += '</div>';
        content += '<button onclick="simulation3D.closeInteraction()" style="margin-top: 20px; padding: 10px 20px; background: linear-gradient(135deg, #00acc1, #00bcd4); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; width: 100%; font-size: 1em; transition: all 0.3s;">✖️ Kapat</button>';

        this.interactionUI.innerHTML = content;
        this.interactionUI.style.display = 'block';
    },

    closeInteraction: function() {
        this.interactionUI.style.display = 'none';
    },

    updateMovement: function() {
        const speed = this.isMobile ? 0.08 : 0.1;
        const direction = new THREE.Vector3();

        if (this.keys['KeyW']) direction.z -= 1;
        if (this.keys['KeyS']) direction.z += 1;
        if (this.keys['KeyD']) direction.x -= 1;
        if (this.keys['KeyA']) direction.x += 1;

        if (this.isMobile && this.touch.joystickActive) {
            direction.x = -(this.touch.moveX / 30); // Sağ = negatif X (klavye D ile aynı yön)
            direction.z = this.touch.moveY / 30;
        }

        if (direction.length() > 0) {
            direction.normalize();
            
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(this.camera.up, cameraDirection).normalize();

            const moveVector = new THREE.Vector3();
            moveVector.addScaledVector(cameraDirection, -direction.z);
            moveVector.addScaledVector(right, direction.x);
            moveVector.normalize();
            moveVector.multiplyScalar(speed);

            this.camera.position.add(moveVector);
        }

        const hint = document.getElementById('interaction-hint');
        const mobileBtn = document.getElementById('mobile-interact-btn');
        const isNear = this.isNearInteractable();
        
        if (hint) {
            hint.style.display = isNear ? 'block' : 'none';
        }
        if (mobileBtn) {
            mobileBtn.style.display = isNear ? 'block' : 'none';
        }
    },

    updateDynamicEnvironment: function() {
        if (!simulation.params) return;

        const params = simulation.params;

        if (this.currentExperiment === 'photosynthesis' && this.lights.sun && this.lights.ambient) {
            const lightIntensity = params.light / 100;
            this.lights.sun.intensity = 0.3 + lightIntensity * 0.7;
            this.lights.ambient.intensity = 0.2 + lightIntensity * 0.4;

            if (this.lights.sunHelper) {
                this.lights.sunHelper.material.opacity = lightIntensity;
                this.lights.sunHelper.scale.setScalar(1 + lightIntensity * 0.5);
            }

            if (this.models.tree) {
                const leaves = this.models.tree.leaves;
                leaves.material.color.setHSL(0.33, 0.8 + lightIntensity * 0.2, 0.2 + lightIntensity * 0.3);
                
                if (simulation.isRunning && Math.random() < lightIntensity * 0.05 && !this.isMobile) {
                    const bubbleGeom = new THREE.SphereGeometry(0.05, 6, 6);
                    const bubbleMat = new THREE.MeshBasicMaterial({ 
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.7
                    });
                    const bubble = new THREE.Mesh(bubbleGeom, bubbleMat);
                    bubble.position.set(
                        leaves.position.x + (Math.random() - 0.5) * 1,
                        leaves.position.y,
                        leaves.position.z + (Math.random() - 0.5) * 1
                    );
                    bubble.userData.lifetime = 0;
                    this.models.oxygenBubbles.add(bubble);
                }
            }

            if (this.models.oxygenBubbles) {
                this.models.oxygenBubbles.children.forEach((bubble, idx) => {
                    bubble.position.y += 0.02;
                    bubble.userData.lifetime += 1;
                    if (bubble.userData.lifetime > 100) {
                        this.models.oxygenBubbles.remove(bubble);
                    }
                });
            }
        }

        if (this.currentExperiment === 'liver' && this.models.experiment) {
            const tempEnv = parseInt(params.tempEnv);
            const liquidColor = tempEnv === 0 ? 0xC8FAFF : (tempEnv >= 60 ? 0xFFC8C8 : 0x87CEEB);
            this.models.experiment.liquid.material.color.setHex(liquidColor);

            const canReact = params.isBoiled !== 'true' && tempEnv < 60;
            const rate = params.liverState === 'ground' ? 0.8 : 0.3;

            if (simulation.isRunning && canReact && Math.random() < rate && !this.isMobile) {
                const bubbleGeom = new THREE.SphereGeometry(0.02, 4, 4);
                const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
                const bubble = new THREE.Mesh(bubbleGeom, bubbleMat);
                bubble.position.set(
                    this.models.experiment.tube.position.x + (Math.random() - 0.5) * 0.15,
                    this.models.experiment.tube.position.y - 0.3,
                    this.models.experiment.tube.position.z + (Math.random() - 0.5) * 0.15
                );
                bubble.userData.lifetime = 0;
                this.models.bubbles.add(bubble);
            }

            this.models.bubbles.children.forEach((bubble) => {
                bubble.position.y += 0.02;
                bubble.userData.lifetime += 1;
                if (bubble.userData.lifetime > 50) {
                    this.models.bubbles.remove(bubble);
                }
            });
        }

        if (this.currentExperiment === 'osmosis' && this.models.cell) {
            const cellSize = simulation.dataPoints.length > 0 ? 
                simulation.dataPoints[simulation.dataPoints.length - 1].output / 100 : 1;
            const targetScale = Math.max(0.5, Math.min(1.5, cellSize));
            this.models.cell.cell.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                0.05
            );
            const membraneScale = targetScale + 0.04;
            this.models.cell.membrane.scale.lerp(
                new THREE.Vector3(membraneScale, membraneScale, membraneScale),
                0.05
            );

            if (this.models.saltParticles) {
                const saltAmount = params.salt * 2;
                while (this.models.saltParticles.children.length < saltAmount) {
                    const particleGeom = new THREE.SphereGeometry(0.02, 4, 4);
                    const particleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
                    const particle = new THREE.Mesh(particleGeom, particleMat);
                    particle.position.set(
                        (Math.random() - 0.5) * 3.5,
                        1.5 + (Math.random() - 0.5) * 2.5,
                        -3 + (Math.random() - 0.5) * 3.5
                    );
                    this.models.saltParticles.add(particle);
                }
                while (this.models.saltParticles.children.length > saltAmount) {
                    this.models.saltParticles.remove(this.models.saltParticles.children[0]);
                }
            }
        }

        if (this.currentExperiment === 'fermentation' && this.models.fermentation) {
            const balloonSize = simulation.dataPoints.length > 0 ? 
                0.3 + (simulation.dataPoints[simulation.dataPoints.length - 1].output / 50) : 0.3;
            this.models.fermentation.balloon.scale.lerp(
                new THREE.Vector3(balloonSize, balloonSize, balloonSize),
                0.05
            );

            if (simulation.isRunning && Math.random() < 0.1 && !this.isMobile) {
                const particleGeom = new THREE.SphereGeometry(0.02, 4, 4);
                const particleMat = new THREE.MeshBasicMaterial({ 
                    color: 0xCCCCCC,
                    transparent: true,
                    opacity: 0.5
                });
                const particle = new THREE.Mesh(particleGeom, particleMat);
                particle.position.set(
                    this.models.fermentation.liquid.position.x + (Math.random() - 0.5) * 0.2,
                    this.models.fermentation.liquid.position.y,
                    this.models.fermentation.liquid.position.z + (Math.random() - 0.5) * 0.2
                );
                particle.userData.lifetime = 0;
                this.models.gasParticles.add(particle);
            }

            this.models.gasParticles.children.forEach((particle) => {
                particle.position.y += 0.03;
                particle.userData.lifetime += 1;
                if (particle.userData.lifetime > 60) {
                    this.models.gasParticles.remove(particle);
                }
            });
        }

        if (this.currentExperiment === 'acid_rain' && this.models.acidRain) {
            const pollution = (params.factoryLoad + params.traffic) / 200;
            const healthColor = new THREE.Color().setHSL(0.33 * (1 - pollution), 0.8, 0.3);
            this.models.acidRain.leaves.material.color.copy(healthColor);

            if (simulation.isRunning && pollution > 0.2 && Math.random() < pollution * 0.1 && !this.isMobile) {
                const smokeGeom = new THREE.SphereGeometry(0.1, 4, 4);
                const smokeMat = new THREE.MeshBasicMaterial({ 
                    color: 0x333333,
                    transparent: true,
                    opacity: 0.5
                });
                const smoke = new THREE.Mesh(smokeGeom, smokeMat);
                smoke.position.set(
                    this.models.acidRain.chimney.position.x,
                    this.models.acidRain.chimney.position.y + 1,
                    this.models.acidRain.chimney.position.z
                );
                smoke.userData.lifetime = 0;
                this.models.smokeParticles.add(smoke);
            }

            this.models.smokeParticles.children.forEach((smoke) => {
                smoke.position.y += 0.02;
                smoke.position.x += (Math.random() - 0.5) * 0.02;
                smoke.scale.addScalar(0.01);
                smoke.material.opacity -= 0.01;
                smoke.userData.lifetime += 1;
                if (smoke.userData.lifetime > 100) {
                    this.models.smokeParticles.remove(smoke);
                }
            });
        }

        if (this.currentExperiment === 'respiration' && this.models.respiration) {
            const oxygenLevel = params.oxygen / 21;
            this.models.respiration.mitochondria.material.emissiveIntensity = 0.1 + oxygenLevel * 0.4;

            if (simulation.isRunning && Math.random() < oxygenLevel * 0.2 && !this.isMobile) {
                const atpGeom = new THREE.SphereGeometry(0.03, 4, 4);
                const atpMat = new THREE.MeshBasicMaterial({ 
                    color: 0xFFEB3B,
                    transparent: true,
                    opacity: 1
                });
                const atp = new THREE.Mesh(atpGeom, atpMat);
                atp.position.copy(this.models.respiration.mitochondria.position);
                atp.position.x += (Math.random() - 0.5) * 1;
                atp.position.z += (Math.random() - 0.5) * 1;
                atp.userData.lifetime = 0;
                this.models.atpParticles.add(atp);
            }

            this.models.atpParticles.children.forEach((atp) => {
                atp.userData.lifetime += 1;
                atp.material.opacity -= 0.02;
                if (atp.userData.lifetime > 50) {
                    this.models.atpParticles.remove(atp);
                }
            });
        }

        if (this.currentExperiment === 'enzyme_kinetics' && this.models.enzymeGroup) {
            const temp = params.temp;
            const ph = params.ph !== undefined ? parseFloat(params.ph) : 7;
            const tempDenatured = temp > 55;
            const phDenatured = ph < 3 || ph > 11;
            const denatured = tempDenatured || phDenatured;
            const speed = denatured ? 0 : (temp / 370) * (1 - Math.abs(ph - 7) / 7);

            this.models.enzymeGroup.children.forEach((enzyme) => {
                if (denatured) {
                    enzyme.material.color.setHex(0x555555);
                    enzyme.material.emissiveIntensity = 0;
                    // pH denatürasyonu: ezilmiş görünüm
                    if (phDenatured && !tempDenatured) {
                        const squish = 0.6 + Math.abs(Math.sin(Date.now() * 0.001)) * 0.1;
                        enzyme.scale.set(1.4, squish, 1.4);
                    } else {
                        enzyme.scale.set(1, 1, 1);
                    }
                } else {
                    // pH 7 civarı: altın, pH uzaklaştıkça soluklaşır
                    const phFactor = 1 - Math.abs(ph - 7) / 7;
                    enzyme.material.color.setHSL(0.13, 1.0, 0.3 + phFactor * 0.25);
                    enzyme.material.emissiveIntensity = 0.1 + speed * 0.4;
                    enzyme.scale.set(1, 1, 1);
                }

                enzyme.position.add(enzyme.userData.velocity.clone().multiplyScalar(speed));

                if (Math.abs(enzyme.position.x) > 0.35) enzyme.userData.velocity.x *= -1;
                if (Math.abs(enzyme.position.y - 1.5) > 0.4) enzyme.userData.velocity.y *= -1;
                if (Math.abs(enzyme.position.z + 3) > 0.35) enzyme.userData.velocity.z *= -1;
            });
        }

        if (this.currentExperiment === 'diffusion_simple' && this.models.diffusion) {
            const temp = params.temp;
            const diffusionSpeed = temp / 500;

            if (simulation.isRunning && Math.random() < 0.3 && !this.isMobile) {
                const particleGeom = new THREE.SphereGeometry(0.02, 4, 4);
                const particleMat = new THREE.MeshBasicMaterial({ 
                    color: params.molecule === 'dye' ? 0x0000ff : 0xff0000,
                    transparent: true,
                    opacity: 0.7
                });
                const particle = new THREE.Mesh(particleGeom, particleMat);
                particle.position.copy(this.models.diffusion.dyeCenter.position);
                particle.userData.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * diffusionSpeed,
                    0,
                    (Math.random() - 0.5) * diffusionSpeed
                );
                particle.userData.lifetime = 0;
                this.models.diffusionParticles.add(particle);
            }

            this.models.diffusionParticles.children.forEach((particle) => {
                particle.position.add(particle.userData.velocity);
                particle.userData.lifetime += 1;
                particle.material.opacity -= 0.005;
                if (particle.userData.lifetime > 200 || particle.position.distanceTo(this.models.diffusion.dyeCenter.position) > 2) {
                    this.models.diffusionParticles.remove(particle);
                }
            });
        }

        // ---- WATER PROP ----
        if (this.currentExperiment === 'water_prop' && this.models.waterDrop) {
            const temp = params.temp !== undefined ? parseFloat(params.temp) : 25;
            const t = Date.now() * 0.001;
            // Sıcaklık arttıkça damla yayvanlaşır (yüzey gerilimi düşer)
            const tension = 1 - temp / 130;
            const scaleX = 1 + (1 - tension) * 0.7;
            const scaleY = Math.max(0.45, 1 - (1 - tension) * 0.55);
            this.models.waterDrop.scale.lerp(new THREE.Vector3(scaleX, scaleY, scaleX), 0.04);

            // Moleküller sıcaklıkla daha geniş halkada titreşir
            if (this.models.molGroup) {
                const vibration = temp / 800;
                this.models.molGroup.children.forEach((mol) => {
                    const a = mol.userData.angle + t * (0.3 + temp * 0.005);
                    const r = mol.userData.baseR + vibration * (Math.random() - 0.5) * 4 + (1 - tension) * 0.3;
                    mol.position.x = Math.cos(a) * r;
                    mol.position.z = -3 + Math.sin(a) * r;
                    mol.position.y = 1.27 + Math.sin(t * 3 + mol.userData.angle) * vibration * 0.5;
                });
            }
        }

        // ---- DIALYSIS ----
        if (this.currentExperiment === 'dialysis' && this.models.glucoseGroup) {
            const canPass = params.bagContent === 'glucose';
            const speed = params.speed ? parseFloat(params.speed) : 1;

            this.models.glucoseGroup.children.forEach((g) => {
                if (!g.userData.escaped) {
                    if (canPass && simulation.isRunning) {
                        // %75 yavaşlatılmış kaçış ivmesi: 0.002 → 0.0005
                        g.userData.velocity.addScaledVector(
                            new THREE.Vector3(Math.sign(g.position.x) || 1, 0, Math.sign(g.position.z + 3) || 1).normalize(),
                            0.0005 * speed
                        );
                        g.position.add(g.userData.velocity);
                        const distFromAxis = Math.sqrt(g.position.x * g.position.x + (g.position.z + 3) * (g.position.z + 3));
                        if (distFromAxis > 0.8) g.userData.escaped = true;
                    }
                } else {
                    // Kaçan molekül yavaşça solar
                    g.material.opacity = Math.max(0, (g.material.opacity || 1) - 0.003);
                    g.position.add(g.userData.velocity.clone().multiplyScalar(0.3));
                }
            });

            // Nişasta zardan geçemez, hafif sallanır
            this.models.starchGroup.children.forEach((s) => {
                s.position.y += Math.sin(Date.now() * 0.001 + s.position.x) * 0.001;
            });
        }

        // ---- HOMEOSTASIS ----
        if (this.currentExperiment === 'homeostasis' && this.models.homeostasis) {
            const exercise = params.exercise !== undefined ? parseFloat(params.exercise) : 0;
            const bodyTemp = 37 + exercise * 0.05; // 37–42°C
            const t = Date.now() * 0.001;

            // Termometre sıvısı yükseliyor
            if (this.models.mercury) {
                const mercuryH = 0.15 + (exercise / 100) * 0.8;
                this.models.mercury.scale.y = mercuryH / 0.3;
                this.models.mercury.position.y = 1.35 + mercuryH / 2;
                // Renk: mavi → kırmızı
                const r = Math.min(1, 0.3 + exercise / 80);
                const b = Math.max(0, 1 - exercise / 60);
                this.models.mercury.material.color.setRGB(r, 0.1, b);
            }

            // Isı halkası rengi
            if (this.models.heatRing) {
                const hue = 0.66 - (exercise / 100) * 0.66; // mavi → kırmızı
                this.models.heatRing.material.color.setHSL(hue, 1, 0.5);
                this.models.heatRing.rotation.z += 0.01 * (exercise / 50 + 0.1);
            }

            // Ter parçacıkları
            if (simulation.isRunning && bodyTemp > 38.5 && Math.random() < (exercise / 100) * 0.15 && !this.isMobile) {
                const sweatGeom = new THREE.SphereGeometry(0.018, 4, 4);
                const sweatMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.8 });
                const sweat = new THREE.Mesh(sweatGeom, sweatMat);
                sweat.position.set(
                    (Math.random() - 0.5) * 0.6,
                    1.5 + Math.random() * 1.5,
                    -3 + (Math.random() - 0.5) * 0.6
                );
                sweat.userData.lifetime = 0;
                sweat.userData.vel = new THREE.Vector3((Math.random() - 0.5) * 0.005, -0.015, 0);
                this.models.sweatGroup.add(sweat);
            }
            if (this.models.sweatGroup) {
                this.models.sweatGroup.children.forEach((sw) => {
                    sw.position.add(sw.userData.vel);
                    sw.userData.lifetime += 1;
                    sw.material.opacity -= 0.015;
                    if (sw.userData.lifetime > 60) this.models.sweatGroup.remove(sw);
                });
            }

            // Vücut rengi: egzersiz arttıkça kırmızıya kayar
            if (this.models.humanBody && this.models.humanBody.material) {
                const hue = 0.07 - (exercise / 100) * 0.06;
                this.models.humanBody.material.color.setHSL(hue, 0.7, 0.5 + exercise * 0.002);
            }
        }
    },

    animate: function() {
        if (!this.is3DActive) return;

        this.animationFrameId = requestAnimationFrame(() => this.animate());

        // Performance monitoring (every 60 frames)
        if (!this.frameCount) this.frameCount = 0;
        this.frameCount++;
        
        if (this.frameCount % 60 === 0) {
            this.performanceCheck();
        }

        this.updateMovement();
        this.updateDynamicEnvironment();

        // Only update heavy effects on desktop
        if (!this.isMobile) {
            if (this.models.particles) {
                this.models.particles.rotation.y += 0.001;
            }
            
            // Tree breathing animation
            if (this.models.tree && simulation.isRunning) {
                const leaves = this.models.tree.leaves;
                const breathe = 1 + Math.sin(Date.now() * 0.001) * 0.03;
                leaves.scale.set(breathe, breathe, breathe);
            }
        }

        // Simple rotation for default object
        if (this.models.default && this.models.default.cube) {
            this.models.default.cube.rotation.y += 0.01;
        }

        // Render with XR
        if (this.isVRMode) {
            this.renderer.setAnimationLoop(() => {
                this.renderer.render(this.scene, this.camera);
            });
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    },

    // ==================== PERFORMANCE OPTIMIZATION ====================
    
    performanceCheck: function() {
        // Simple FPS counter
        if (!this.lastTime) {
            this.lastTime = performance.now();
            this.fps = 60;
            return;
        }
        
        const now = performance.now();
        const delta = now - this.lastTime;
        this.fps = Math.round(1000 / delta);
        this.lastTime = now;
        
        // Adaptive quality based on FPS
        if (this.fps < 30 && !this.isMobile) {
            this.reduceQuality();
        } else if (this.fps > 55 && this.isLowQuality) {
            this.increaseQuality();
        }
    },
    
    reduceQuality: function() {
        this.isLowQuality = true;
        
        // Reduce shadow quality
        if (this.renderer.shadowMap) {
            this.renderer.shadowMap.enabled = false;
        }
        
        // Reduce pixel ratio
        this.renderer.setPixelRatio(1);
        
        console.log('Quality reduced for better performance');
    },
    
    increaseQuality: function() {
        this.isLowQuality = false;
        
        // Restore shadow quality
        if (this.renderer.shadowMap && !this.isMobile) {
            this.renderer.shadowMap.enabled = true;
        }
        
        // Restore pixel ratio
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },
    
    // Level of Detail system
    createLOD: function(object, distances) {
        const lod = new THREE.LOD();
        
        // High detail (close)
        if (distances.high) {
            lod.addLevel(object.clone(), 0);
        }
        
        // Medium detail
        if (distances.medium) {
            lod.addLevel(this.createSimplifiedVersion(object), distances.medium);
        }
        
        // Low detail (far)
        if (distances.low) {
            lod.addLevel(this.createVerySimplifiedVersion(object), distances.low);
        }
        
        return lod;
    },
    
    createSimplifiedVersion: function(object) {
        const simplified = object.clone();
        if (simplified.geometry) {
            // Reduce geometry complexity
            // This is a simplified version
        }
        return simplified;
    },
    
    createVerySimplifiedVersion: function(object) {
        const verySimplified = object.clone();
        verySimplified.scale.setScalar(0.5);
        return verySimplified;
    },
    
    // Memory management
    disposeObject: function(object) {
        if (object.geometry) {
            object.geometry.dispose();
        }
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => mat.dispose());
            } else {
                object.material.dispose();
            }
        }
    },

    // Optimized particle rendering for mobile
    optimizeForMobile: function() {
        if (!this.isMobile) return;
        
        // Reduce particle counts
        if (this.models.oxygenBubbles) {
            // Limit max bubbles on mobile
        }
        
        // Disable some effects
        if (this.renderer) {
            this.renderer.shadowMap.enabled = false;
            this.renderer.setPixelRatio(1);
        }
        
        // Use simpler materials
        console.log('Mobile optimization applied');
    },

    onWindowResize: function() {
        const container = document.getElementById('sim3DCanvas');
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    },

    destroy: function() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.interactionUI) {
            this.interactionUI.remove();
        }

        const hint = document.getElementById('interaction-hint');
        if (hint) hint.remove();

        const joystick = document.getElementById('mobile-joystick');
        if (joystick) joystick.remove();

        const interactBtn = document.getElementById('mobile-interact-btn');
        if (interactBtn) interactBtn.remove();

        // Remove control buttons
        this.removeControlButtons();

        // Clean up 3D UI
        if (this.ui3D.mainPanel) {
            this.scene.remove(this.ui3D.mainPanel);
            this.ui3D.mainPanel.geometry.dispose();
            this.ui3D.mainPanel.material.dispose();
        }
        if (this.ui3D.controlsPanel) {
            this.scene.remove(this.ui3D.controlsPanel);
            this.ui3D.controlsPanel.geometry.dispose();
            this.ui3D.controlsPanel.material.dispose();
        }
        if (this.ui3D.chartPanel) {
            this.scene.remove(this.ui3D.chartPanel);
            this.ui3D.chartPanel.geometry.dispose();
            this.ui3D.chartPanel.material.dispose();
        }
        if (this.ui3D.dataPanel) {
            this.scene.remove(this.ui3D.dataPanel);
            this.ui3D.dataPanel.geometry.dispose();
            this.ui3D.dataPanel.material.dispose();
        }

        // End VR session if active
        if (this.isVRMode && this.vrSession) {
            this.vrSession.end();
            this.isVRMode = false;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.models = {};
        this.lights = {};
        this.ui3D.isInitialized = false;
    }
};

function toggleView3D() {
    const canvas2D = document.getElementById('simCanvas');
    const canvas3D = document.getElementById('sim3DCanvas');
    const toggleBtn = document.getElementById('toggle-3d-btn');

    if (!simulation3D.is3DActive) {
        canvas2D.style.display = 'none';
        canvas3D.classList.remove('hidden');
        canvas3D.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-square"></i> 2D Görünüm';
        
        simulation3D.is3DActive = true;
        simulation3D.init(app.currentExp.id);
        simulation3D.animate();
        
        // Add additional control buttons
        setTimeout(() => simulation3D.addControlButtons(), 100);
    } else {
        // Restore UI panels before leaving 3D
        simulation3D.showUIPanels();
        
        // Remove additional buttons
        simulation3D.removeControlButtons();
        
        canvas2D.style.display = 'block';
        canvas3D.classList.add('hidden');
        canvas3D.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-cube"></i> 3D Görünüm';
        
        simulation3D.is3DActive = false;
        simulation3D.isImmersiveMode = false;
        simulation3D.destroy();
    }
}

// Add control buttons for 3D mode
simulation3D.addControlButtons = function() {
    const container = document.getElementById('sim3DCanvas');
    if (!container) return;
    
    // Check if buttons already exist
    if (document.getElementById('immersive-toggle-btn')) return;
    
    // Immersive mode button (hide UI panels)
    const immersiveBtn = document.createElement('button');
    immersiveBtn.id = 'immersive-toggle-btn';
    immersiveBtn.innerHTML = '<i class="fas fa-expand"></i> Tam Ekran';
    immersiveBtn.style.cssText = `
        position: absolute;
        top: 80px;
        left: 3px;
        z-index: 100;
        background: rgba(0, 172, 193, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0, 172, 193, 0.5);
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.3s;
    `;
    immersiveBtn.onclick = () => {
        if (this.isImmersiveMode) {
            this.showUIPanels();
            immersiveBtn.innerHTML = '<i class="fas fa-expand"></i> Tam Ekran';
        } else {
            this.hideUIPanels();
            immersiveBtn.innerHTML = '<i class="fas fa-compress"></i> Normal Mod';
        }
    };
    container.appendChild(immersiveBtn);
    
    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.id = 'fullscreen-toggle-btn';
    fullscreenBtn.innerHTML = '<i class="fas fa-fullscreen"></i>';
    fullscreenBtn.title = 'Tam Ekran (F)';
    fullscreenBtn.style.cssText = `
        position: absolute;
        top: 3px;
        right: 3px;
        z-index: 100;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
    `;
    fullscreenBtn.onclick = () => this.toggleFullscreen();
    container.appendChild(fullscreenBtn);
    
    // Help tooltip
    const helpDiv = document.createElement('div');
    helpDiv.id = '3d-help-tooltip';
    helpDiv.innerHTML = `
        <div style="background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px; font-size: 11px; color: #aaa;">
            <div><b style="color: #00acc1;">Kontroller:</b></div>
            <div>WASD - Hareket</div>
            <div>Mouse - Kamera</div>
            <div>E - Etkileşim</div>
            <div>F - Tam Ekran</div>
            <div>I - UI Gizle/Aç</div>
        </div>
    `;
    helpDiv.style.cssText = `
        position: absolute;
        bottom: 3px;
        right: 3px;
        z-index: 100;
    `;
    container.appendChild(helpDiv);
};

simulation3D.removeControlButtons = function() {
    const buttons = ['immersive-toggle-btn', 'fullscreen-toggle-btn', '3d-help-tooltip', 'vr-toggle-btn'];
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.remove();
    });
};
