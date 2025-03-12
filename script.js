document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    body.classList.add('loaded');

    // Partículas
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
            createParticle(particlesContainer);
        }
    }

    // Carrusel
    const images = document.querySelectorAll('.carousel-image');
    if (images.length > 0) {
        let currentIndex = 0;
        images[currentIndex].classList.add('active');
        setInterval(() => {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }, 5000);
    }

    // Menú hamburguesa con contracción automática
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    let menuTimeout;
    if (menuToggle && navMenu) {
        const hideMenu = () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        };
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            if (isExpanded) {
                clearTimeout(menuTimeout);
                menuTimeout = setTimeout(hideMenu, 15000); // 15 segundos
            }
        });
        window.addEventListener('scroll', hideMenu);
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                hideMenu();
            }
        });
        navMenu.addEventListener('mousemove', () => clearTimeout(menuTimeout));
        navMenu.addEventListener('touchmove', () => clearTimeout(menuTimeout));
    }

    // Teléfono y efecto en SVG del blog
    const phoneIcon = document.getElementById('phoneIcon');
    const elevenlabsConvai = document.getElementById('elevenlabsConvai');
    const blogSvg = document.querySelector('.nav-3d svg') || document.querySelector('nav svg');
    if (phoneIcon && elevenlabsConvai) {
        phoneIcon.addEventListener('click', () => {
            elevenlabsConvai.classList.toggle('active');
            phoneIcon.classList.add('vibrate', 'wave');
            setTimeout(() => {
                phoneIcon.classList.remove('vibrate', 'wave');
            }, 800);
        });
    }
    if (blogSvg) {
        blogSvg.addEventListener('click', () => {
            blogSvg.classList.add('vibrate', 'wave');
            setTimeout(() => {
                blogSvg.classList.remove('vibrate', 'wave');
            }, 800);
        });
    }

    // Botón de instalación
    let deferredPrompt;
    const widgetContainer = document.querySelector('.elevenlabs-widget-container') || document.body;
    const installBtn = document.createElement('button');
    installBtn.classList.add('install-btn');
    installBtn.textContent = 'Instalar App';
    widgetContainer.appendChild(installBtn);

    const showInstallButton = () => {
        installBtn.classList.add('visible');
        setTimeout(() => {
            installBtn.classList.remove('visible');
        }, 15000);
    };

    window.addEventListener('load', () => {
        setTimeout(() => {
            showInstallButton();
            setInterval(showInstallButton, 20000);
        }, 7000);
    });

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(outcome === 'accepted' ? 'Usuario aceptó instalar la PWA' : 'Usuario rechazó instalar la PWA');
            deferredPrompt = null;
        }
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA instalada');
        installBtn.classList.remove('visible');
    });

    // Blog: Partículas 3D, Modales y Búsqueda
    if (document.body.classList.contains('blog')) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('particles').appendChild(renderer.domElement);
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 2000;
            positions[i + 2] = (Math.random() - 0.5) * 2000;
            velocities[i] = (Math.random() - 0.5) * 2;
            velocities[i + 1] = (Math.random() - 0.5) * 2;
            velocities[i + 2] = (Math.random() - 0.5) * 2;
        }
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({ color: 0xFFD700, size: 3, transparent: true, opacity: 0.8 });
        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);
        camera.position.z = 1000;
        function animateParticles() {
            requestAnimationFrame(animateParticles);
            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] += velocities[i] * 0.1;
                positions[i + 1] += velocities[i + 1] * 0.1;
                positions[i + 2] += velocities[i + 2] * 0.1;
                if (Math.abs(positions[i]) > 1000) velocities[i] *= -1;
                if (Math.abs(positions[i + 1]) > 1000) velocities[i + 1] *= -1;
                if (Math.abs(positions[i + 2]) > 1000) velocities[i + 2] *= -1;
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.rotation.y += 0.001;
            renderer.render(scene, camera);
        }
        animateParticles();

        const hideMenu = () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        };
        window.addEventListener('scroll', hideMenu);
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                hideMenu();
            }
        });

        const toggleSearch = () => document.getElementById('searchBar').classList.toggle('active');
        window.toggleSearch = toggleSearch;
        const hideSearchBar = () => {
            const searchBar = document.getElementById('searchBar');
            if (searchBar.classList.contains('active')) {
                searchBar.classList.remove('active');
            }
        };
        window.addEventListener('scroll', hideSearchBar);
        document.addEventListener('click', (e) => {
            const searchBar = document.getElementById('searchBar');
            const exploreBtn = document.getElementById('explore-btn');
            if (!searchBar.contains(e.target) && !exploreBtn.contains(e.target)) {
                hideSearchBar();
            }
        });

        const exploreButtons = document.querySelectorAll('.explore-btn');
        const overlay = document.getElementById('modalOverlay');
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.modal-close');
        exploreButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                modal.classList.add('active');
                overlay.classList.add('active');
            });
        });
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modals.forEach(modal => modal.classList.remove('active'));
                overlay.classList.remove('active');
            });
        });
        overlay.addEventListener('click', () => {
            modals.forEach(modal => modal.classList.remove('active'));
            overlay.classList.remove('active');
        });

        const recipes = [
            { title: 'Pandebono Clásico', id: 'modal-pandebono' },
            { title: 'Torta Tres Leches', id: 'modal-torta' },
            { title: 'Pan Hawaiano', id: 'modal-hawaiano' },
            { title: 'Buñuelo Relleno De Arequipe', id: 'modal-bunuelo' },
            { title: 'Pan de Yuca Paisa', id: 'modal-yuca' },
            { title: 'Pan de Maíz Dulce', id: 'modal-maiz' },
            { title: 'Huevos con Hogao y Café', id: 'modal-huevos' },
            { title: 'Arepa de Choclo y Jugo', id: 'modal-arepa' },
            { title: 'Calentado Paisa y Avena', id: 'modal-calentado' }
        ];
        const normalizeText = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => {
                const input = normalizeText(searchInput.value);
                searchResults.innerHTML = '';
                const matches = recipes.filter(recipe => normalizeText(recipe.title).includes(input));
                matches.forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'p-2 hover:bg-gray-700 cursor-pointer';
                    div.textContent = match.title;
                    div.onclick = () => {
                        document.getElementById(match.id).classList.add('active');
                        overlay.classList.add('active');
                        document.getElementById('searchBar').classList.remove('active');
                    };
                    searchResults.appendChild(div);
                });
            });
        }
    }
});

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    const size = Math.random() * 5 + 2;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 0.5) * 200;
    const ex = (Math.random() - 0.5) * 100;
    const ey = (Math.random() - 0.5) * 100;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--ex', `${ex}px`);
    particle.style.setProperty('--ey', `${ey}px`);
    particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
    container.appendChild(particle);
    particle.addEventListener('animationend', () => {
        particle.remove();
        createParticle(container);
    });
}
