document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    body.classList.add('loaded');

    // Función throttle para optimizar eventos frecuentes (scroll, resize)
    const throttle = (callback, delay = 250) => {
        let timeoutId;
        let lastExec = 0;
        
        return function(...args) {
            const now = Date.now();
            const elapsed = now - lastExec;
            
            const execute = () => {
                lastExec = Date.now();
                callback.apply(this, args);
            };
            
            if (elapsed > delay) {
                execute();
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(execute, delay - elapsed);
            }
        };
    };

    // Partículas CSS simples 
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        // Reducir el número de partículas en todos los dispositivos
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 15 : 30;
        for (let i = 0; i < particleCount; i++) {
            createParticle(particlesContainer);
        }
    }

    // Sistema optimizado de carga de imágenes
    setupOptimizedImageLoading();
    
    // Precarga inteligente para navegación fluida - solo si hay múltiples secciones
    const sections = document.querySelectorAll('section');
    if (sections.length > 2) {
        setupNavigationPrecaching();
    }

    // Carrusel de imágenes optimizado
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        const images = carouselContainer.querySelectorAll('.carousel-image');
        if (images.length > 0) {
            let currentIndex = 0;
            images[currentIndex].classList.add('active');
            
            // Usar setInterval solo cuando la pestaña está visible
            let carouselInterval;
            
            const startCarousel = () => {
                carouselInterval = setInterval(() => {
                    images[currentIndex].classList.remove('active');
                    currentIndex = (currentIndex + 1) % images.length;
                    images[currentIndex].classList.add('active');
                }, 5000);
            };
            
            const stopCarousel = () => {
                clearInterval(carouselInterval);
            };
            
            // Controlar carrusel basado en visibilidad de la página
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopCarousel();
                } else {
                    startCarousel();
                }
            });
            
            startCarousel();
        }
    }

    // Gestión del menú con delegación de eventos
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Throttle del evento scroll
        const hideMenu = throttle(() => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        }, 100);

        window.addEventListener('scroll', hideMenu);
        
        // Usar delegación de eventos para cerrar el menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Widget ElevenLabs
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

    // Código específico para la página del blog
    if (document.body.classList.contains('blog')) {
        // Cargar Three.js solo cuando sea necesario (lazy loading)
        let threeJsInitialized = false;
        
        const initThreeJs = () => {
            if (threeJsInitialized || !window.THREE) return;
            
            // Verificar que THREE esté disponible
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
                alpha: true,
                powerPreference: 'high-performance',
                antialias: false,
                precision: 'lowp' // Menor precisión para mejor rendimiento
            });
            
            // Reducir resolución en todos los dispositivos para mejor rendimiento
            const pixelRatio = window.innerWidth < 1024 ? 0.75 : 1;
            renderer.setPixelRatio(pixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            
            const particlesContainer = document.getElementById('particles');
            if (particlesContainer) {
                particlesContainer.appendChild(renderer.domElement);
            }
            
            // Reducir drasticamente la cantidad de partículas
            const isMobile = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
            let particleCount;
            
            if (isMobile) {
                particleCount = 250; // Reducido de 500
            } else if (isTablet) {
                particleCount = 400; // Valor intermedio
            } else {
                particleCount = 600; // Reducido de 1000
            }
            
            const particles = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const velocities = new Float32Array(particleCount * 3);
            
            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 1600; // Reducido de 2000
                positions[i + 1] = (Math.random() - 0.5) * 1600;
                positions[i + 2] = (Math.random() - 0.5) * 1600;
                // Velocidades más lentas para menor CPU
                velocities[i] = (Math.random() - 0.5) * 1;
                velocities[i + 1] = (Math.random() - 0.5) * 1;
                velocities[i + 2] = (Math.random() - 0.5) * 1;
            }
            
            particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particleMaterial = new THREE.PointsMaterial({ 
                color: 0xFFD700, 
                size: isMobile ? 2 : 3, 
                transparent: true, 
                opacity: 0.7,
                sizeAttenuation: false // Desactivar para mejor rendimiento
            });
            
            const particleSystem = new THREE.Points(particles, particleMaterial);
            scene.add(particleSystem);
            camera.position.z = 1000;
            
            // Mejorar renderizado con limitación de FPS
            let animationId;
            let lastTime = 0;
            // Reducir FPS aún más
            const fps = isMobile ? 20 : 30;
            const interval = 1000 / fps;
            
            // Usar una variable para controlar si la animación debe continuar
            let animationActive = true;
            
            function animateParticles(currentTime) {
                if (!animationActive) return;
                
                animationId = requestAnimationFrame(animateParticles);
                
                const delta = currentTime - lastTime;
                if (delta < interval) return;
                
                lastTime = currentTime - (delta % interval);
                
                const positions = particleSystem.geometry.attributes.position.array;
                // Optimizar bucle actualizando menos partículas por frame
                const updateStep = isMobile ? 6 : 3; // Actualizar cada 2 partículas en móvil
                
                for (let i = 0; i < particleCount * 3; i += updateStep) {
                    positions[i] += velocities[i] * 0.1;
                    positions[i + 1] += velocities[i + 1] * 0.1;
                    positions[i + 2] += velocities[i + 2] * 0.1;
                    
                    if (Math.abs(positions[i]) > 1000) velocities[i] *= -1;
                    if (Math.abs(positions[i + 1]) > 1000) velocities[i + 1] *= -1;
                    if (Math.abs(positions[i + 2]) > 1000) velocities[i + 2] *= -1;
                }
                
                particleSystem.geometry.attributes.position.needsUpdate = true;
                particleSystem.rotation.y += 0.0005; // Rotación más lenta
                
                // Solo renderizar si la pestaña está visible y el elemento es visible
                if (!document.hidden && isElementInViewport(particlesContainer)) {
                    renderer.render(scene, camera);
                }
            }
            
            // Función para comprobar si un elemento está visible en el viewport
            function isElementInViewport(el) {
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                return (
                    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.bottom >= 0
                );
            }
            
            // Iniciar animación
            animationId = requestAnimationFrame(animateParticles);
            
            // Optimizar eventos para mejor rendimiento
            let resizeTimeout;
            window.addEventListener('resize', () => {
                // Throttling del resize
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                }, 250);
            });
            
            // Pausar animación cuando la pestaña no está visible
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    animationActive = false;
                    cancelAnimationFrame(animationId);
                } else {
                    animationActive = true;
                    animationId = requestAnimationFrame(animateParticles);
                }
            });
            
            // Detener animación al hacer scroll (reanudar después de un tiempo)
            let scrollTimeout;
            window.addEventListener('scroll', throttle(() => {
                if (animationActive) {
                    animationActive = false;
                    cancelAnimationFrame(animationId);
                }
                
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (!animationActive && !document.hidden) {
                        animationActive = true;
                        animationId = requestAnimationFrame(animateParticles);
                    }
                }, 200);
            }, 100));
            
            threeJsInitialized = true;
        };
        
        // Iniciar Three.js solo cuando sea visible o después de un retraso
        if ('IntersectionObserver' in window) {
            const threeJsObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    setTimeout(initThreeJs, 500); // Pequeño retraso para no bloquear la carga
                    threeJsObserver.disconnect();
                }
            });
            
            const particlesElem = document.getElementById('particles');
            if (particlesElem) {
                threeJsObserver.observe(particlesElem);
            }
        } else {
            // Fallback si IntersectionObserver no está disponible
            setTimeout(initThreeJs, 1000);
        }

        // Animación del logo optimizada
        const blogLogo = document.querySelector('.nav-3d svg');
        if (blogLogo) {
            blogLogo.addEventListener('click', () => {
                if (!blogLogo.classList.contains('animating')) {
                    blogLogo.classList.add('animating');
                    blogLogo.style.transform = 'rotateY(180deg) scale(1.2)';
                    setTimeout(() => {
                        blogLogo.style.transform = 'rotateY(0deg) scale(1)';
                        setTimeout(() => {
                            blogLogo.classList.remove('animating');
                        }, 300);
                    }, 300);
                }
            });
        }

        // Barra de búsqueda con delegación de eventos mejorada
        const toggleSearch = () => {
            const searchBar = document.getElementById('searchBar');
            if (searchBar) {
                searchBar.classList.toggle('active');
                if (searchBar.classList.contains('active')) {
                    document.getElementById('searchInput')?.focus();
                }
            }
        };
        window.toggleSearch = toggleSearch;
        
        // Optimizar eventos de scroll con throttle
        const hideSearchBar = throttle(() => {
            const searchBar = document.getElementById('searchBar');
            if (searchBar?.classList.contains('active')) {
                searchBar.classList.remove('active');
            }
        }, 100);
        
        window.addEventListener('scroll', hideSearchBar);
        
        // Usar delegación para eventos de clic (un solo listener)
        document.addEventListener('click', (e) => {
            const searchBar = document.getElementById('searchBar');
            const exploreBtn = document.getElementById('explore-btn');
            
            // Gestión de cierre de la barra de búsqueda
            if (searchBar && searchBar.classList.contains('active') && 
                !searchBar.contains(e.target) && 
                exploreBtn !== e.target) {
                searchBar.classList.remove('active');
            }
            
            // Gestión unificada de modales
            if (e.target.classList.contains('explore-btn')) {
                const modalId = e.target.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                    document.getElementById('modalOverlay')?.classList.add('active');
                }
            } else if (e.target.classList.contains('modal-close')) {
                document.querySelectorAll('.modal').forEach(modal => 
                    modal.classList.remove('active'));
                document.getElementById('modalOverlay')?.classList.remove('active');
            } else if (e.target.id === 'modalOverlay') {
                document.querySelectorAll('.modal').forEach(modal => 
                    modal.classList.remove('active'));
                e.target.classList.remove('active');
            }
        });

        // Optimizar búsqueda de recetas
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
        
        // Preprocesar los textos normalizados para búsquedas más rápidas
        const normalizeText = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const recipesNormalized = recipes.map(recipe => ({
            ...recipe,
            normalizedTitle: normalizeText(recipe.title)
        }));
        
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        
        if (searchInput && searchResults) {
            // Optimizar la búsqueda con debounce
            let debounceTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    const input = normalizeText(searchInput.value);
                    
                    // No buscar si el input está vacío
                    if (!input.trim()) {
                        searchResults.innerHTML = '';
                        return;
                    }
                    
                    // Limpiar resultados anteriores
                    searchResults.innerHTML = '';
                    
                    // Filtrar recetas
                    const matches = recipesNormalized.filter(recipe => 
                        recipe.normalizedTitle.includes(input));
                    
                    // Crear fragmento para mejor rendimiento en el DOM
                    const fragment = document.createDocumentFragment();
                    
                    matches.forEach(match => {
                        const div = document.createElement('div');
                        div.className = 'p-2 hover:bg-gray-700 cursor-pointer';
                        div.textContent = match.title;
                        div.dataset.modalId = match.id;
                        fragment.appendChild(div);
                    });
                    
                    searchResults.appendChild(fragment);
                }, 200); // Debounce de 200ms
            });
            
            // Usar delegación de eventos para los resultados
            searchResults.addEventListener('click', (e) => {
                const resultItem = e.target.closest('div[data-modal-id]');
                if (resultItem) {
                    const modalId = resultItem.dataset.modalId;
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        modal.classList.add('active');
                        document.getElementById('modalOverlay')?.classList.add('active');
                        document.getElementById('searchBar')?.classList.remove('active');
                    }
                }
            });
        }
    }
});

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    const size = Math.random() * 4 + 1; // Tamaños más pequeños
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    const tx = (Math.random() - 0.5) * 150; // Distancias más cortas
    const ty = (Math.random() - 0.5) * 150;
    const ex = (Math.random() - 0.5) * 80;
    const ey = (Math.random() - 0.5) * 80;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.setProperty('--ex', `${ex}px`);
    particle.style.setProperty('--ey', `${ey}px`);
    particle.style.animationDuration = `${Math.random() * 4 + 6}s`;
    container.appendChild(particle);
    
    // Usar MutationObserver para verificar si el elemento aún existe
    const observer = new MutationObserver((mutations) => {
        if (!document.body.contains(particle)) {
            observer.disconnect();
            return;
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    particle.addEventListener('animationend', () => {
        observer.disconnect();
        if (container && document.body.contains(container)) {
            particle.remove();
            createParticle(container);
        }
    });
}

// Sistema optimizado de carga de imágenes
function setupOptimizedImageLoading() {
  if ('IntersectionObserver' in window) {
    const loadedImages = new Map();
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (!img.dataset.src) {
            imageObserver.unobserve(img);
            return;
          }
          
          const src = img.dataset.src;
          
          if (!loadedImages.has(src)) {
            const preloader = new Image();
            
            preloader.onload = () => {
              if (document.body.contains(img)) {
                img.src = src;
                img.classList.add('loaded');
                loadedImages.set(src, true);
              }
            };
            
            preloader.src = src;
          } else {
            img.src = src;
            img.classList.add('loaded');
          }
          
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '200px 0px',
      threshold: 0.1
    });
    
    document.querySelectorAll('img:not([loading="eager"])').forEach(img => {
      if (img.src && !img.dataset.src && !img.classList.contains('active') && !img.hasAttribute('loading')) {
        img.dataset.src = img.src;
        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%235B2A32'/%3E%3C/svg%3E";
      }
      
      if (img.dataset.src) {
        imageObserver.observe(img);
      }
    });
  }
}

// Precarga inteligente para navegación fluida
function setupNavigationPrecaching() {
  const sections = document.querySelectorAll('section');
  if (sections.length <= 1) return;
  
  const sectionVisibility = new Map();
  sections.forEach(section => {
    if (section.id) {
      sectionVisibility.set(section.id, false);
    }
  });
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sectionId = entry.target.id;
      if (!sectionId) return;
      
      sectionVisibility.set(sectionId, entry.isIntersecting);
      
      if (entry.isIntersecting) {
        const currentIndex = Array.from(sections).findIndex(s => s.id === sectionId);
        
        // Solo precargar la siguiente sección (no la anterior) para ahorrar recursos
        const nextIndex = currentIndex + 1;
        if (nextIndex < sections.length) {
          const nextSection = sections[nextIndex];
          const priorityImages = nextSection.querySelectorAll('img[data-src]');
          
          if (priorityImages.length > 0) {
            // Limitar a solo 2 imágenes precargadas para ahorrar recursos
            const imagesToPreload = Array.from(priorityImages).slice(0, 2);
            
            imagesToPreload.forEach(img => {
              if (!img.src.includes(img.dataset.src)) {
                const preloader = new Image();
                preloader.src = img.dataset.src;
              }
            });
          }
        }
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '100px 0px'
  });
  
  sections.forEach(section => {
    if (section.id) {
      sectionObserver.observe(section);
    }
  });
}
