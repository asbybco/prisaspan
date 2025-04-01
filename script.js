document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    body.classList.add('loaded');

    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        // Reducir el número de partículas en dispositivos móviles
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 20 : 50;
        for (let i = 0; i < particleCount; i++) {
            createParticle(particlesContainer);
        }
    }

    // Sistema optimizado de carga de imágenes
    setupOptimizedImageLoading();
    
    // Precarga inteligente para navegación fluida
    setupNavigationPrecaching();

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

    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

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
    }

    const phoneIcon = document.getElementById('phoneIcon');
    const elevenlabsConvai = document.getElementById('elevenlabsConvai');
    if (phoneIcon && elevenlabsConvai) {
        phoneIcon.addEventListener('click', () => {
            elevenlabsConvai.classList.toggle('active');
            phoneIcon.classList.add('vibrate', 'wave');
            setTimeout(() => {
                phoneIcon.classList.remove('vibrate', 'wave');
            }, 800);
        });
    }

    // Reemplazar el código del botón de instalación personalizado con el comportamiento nativo
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // No prevenir el comportamiento por defecto para usar el diálogo nativo
        deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA instalada');
        deferredPrompt = null;
    });

    if (document.body.classList.contains('blog')) {
        // Optimizar Three.js
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            powerPreference: 'high-performance',
            antialias: false // Deshabilitar anti-aliasing para mejor rendimiento
        });
        
        // Reducir resolución en dispositivos móviles
        if (window.innerWidth < 768) {
            renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);
        }
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('particles').appendChild(renderer.domElement);
        
        // Reducir cantidad de partículas en móviles
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 500 : 1000;
        
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
        
        // Mejorar renderizado con limitación de FPS
        let animationId;
        let lastTime = 0;
        const fps = 30; // Limitar a 30 FPS
        const interval = 1000 / fps;
        
        function animateParticles(currentTime) {
            animationId = requestAnimationFrame(animateParticles);
            
            const delta = currentTime - lastTime;
            if (delta < interval) return;
            
            lastTime = currentTime - (delta % interval);
            
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
            
            // Solo renderizar si la pestaña está visible
            if (!document.hidden) {
                renderer.render(scene, camera);
            }
        }
        
        // Iniciar animación
        animationId = requestAnimationFrame(animateParticles);
        
        // Pausar animación cuando la pestaña no está visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animationId = requestAnimationFrame(animateParticles);
            }
        });

        const blogLogo = document.querySelector('.nav-3d svg');
        if (blogLogo) {
            blogLogo.addEventListener('click', () => {
                blogLogo.style.transition = 'transform 0.3s ease';
                blogLogo.style.transform = 'rotateY(180deg) scale(1.2)';
                setTimeout(() => {
                    blogLogo.style.transform = 'rotateY(0deg) scale(1)';
                }, 300);
            });
        }

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

        // Delegación de eventos para modales
        const overlay = document.getElementById('modalOverlay');
        document.addEventListener('click', (e) => {
            // Para botones de explorar
            if (e.target.classList.contains('explore-btn')) {
                const modalId = e.target.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                modal.classList.add('active');
                overlay.classList.add('active');
            }
            
            // Para botones de cerrar
            if (e.target.classList.contains('modal-close')) {
                document.querySelectorAll('.modal').forEach(modal => 
                    modal.classList.remove('active'));
                overlay.classList.remove('active');
            }
        });
        
        // Mantener el listener del overlay
        if (overlay) {
            overlay.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => 
                    modal.classList.remove('active'));
                overlay.classList.remove('active');
            });
        }

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

// Sistema optimizado de carga de imágenes
function setupOptimizedImageLoading() {
  // Solo proceder si el navegador soporta IntersectionObserver
  if ('IntersectionObserver' in window) {
    // Creamos un Map para trackear las imágenes ya cargadas
    const loadedImages = new Map();
    
    // Configuración del observer
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Verificar si la imagen tiene data-src
          if (!img.dataset.src) {
            imageObserver.unobserve(img);
            return;
          }
          
          const src = img.dataset.src;
          
          // Verificar si ya tenemos esta imagen en memoria
          if (!loadedImages.has(src)) {
            // Crear una imagen oculta para precachear
            const preloader = new Image();
            
            preloader.onload = () => {
              // Una vez cargada, actualizar la imagen visible
              img.src = src;
              img.classList.add('loaded');
              // Almacenar en nuestro Map para futuras referencias
              loadedImages.set(src, true);
            };
            
            preloader.src = src;
          } else {
            // Si ya está en memoria, asignar directamente
            img.src = src;
            img.classList.add('loaded');
          }
          
          // Dejar de observar esta imagen
          imageObserver.unobserve(img);
        }
      });
    }, {
      // Cargar cuando la imagen está cerca de entrar en la vista
      rootMargin: '200px 0px'
    });
    
    // Procesar todas las imágenes en la página
    document.querySelectorAll('img').forEach(img => {
      // Si la imagen ya tiene src pero queremos optimizarla
      if (img.src && !img.dataset.src && !img.classList.contains('active')) {
        img.dataset.src = img.src;
        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%235B2A32'/%3E%3C/svg%3E";
      }
      
      // Observar la imagen
      if (img.dataset.src) {
        imageObserver.observe(img);
      }
    });
  }
}

// Precarga inteligente para navegación fluida
function setupNavigationPrecaching() {
  // Detectar secciones en la página
  const sections = document.querySelectorAll('section');
  if (sections.length <= 1) return;
  
  // Crear un mapa de visibilidad de secciones
  const sectionVisibility = new Map();
  sections.forEach(section => {
    if (section.id) {
      sectionVisibility.set(section.id, false);
    }
  });
  
  // Observador para detectar qué sección es visible
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sectionId = entry.target.id;
      if (!sectionId) return;
      
      sectionVisibility.set(sectionId, entry.isIntersecting);
      
      if (entry.isIntersecting) {
        // Si una sección se vuelve visible, precargar imágenes de secciones adyacentes
        const currentIndex = Array.from(sections).findIndex(s => s.id === sectionId);
        
        // Precargar sección anterior y siguiente
        [-1, 1].forEach(offset => {
          const adjacentIndex = currentIndex + offset;
          if (adjacentIndex >= 0 && adjacentIndex < sections.length) {
            const adjacentSection = sections[adjacentIndex];
            const adjacentImages = adjacentSection.querySelectorAll('img[data-src]');
            
            adjacentImages.forEach(img => {
              if (!img.src.includes(img.dataset.src)) {
                // Crear un precargador para cada imagen
                const preloader = new Image();
                preloader.src = img.dataset.src;
              }
            });
          }
        });
      }
    });
  }, {
    threshold: 0.1  // 10% de la sección visible para activar
  });
  
  // Observar todas las secciones con ID
  sections.forEach(section => {
    if (section.id) {
      sectionObserver.observe(section);
    }
  });
}
