document.addEventListener('DOMContentLoaded', () => {
    const particleContainer = document.getElementById('particles');
    const particleCount = window.innerWidth < 768 ? 15 : 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        particle.style.left = `${startX}vw`;
        particle.style.top = `${startY}vh`;
        const size = 2 + Math.random() * 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        const tx = (Math.random() - 0.5) * 50;
        const ty = (Math.random() - 0.5) * 50;
        const ex = (Math.random() - 0.5) * 100;
        const ey = (Math.random() - 0.5) * 100;
        particle.style.setProperty('--tx', `${tx}vw`);
        particle.style.setProperty('--ty', `${ty}vh`);
        particle.style.setProperty('--ex', `${ex}vw`);
        particle.style.setProperty('--ey', `${ey}vh`);
        particle.style.animationDuration = `${10 + Math.random() * 5}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particleContainer.appendChild(particle);
    }
    const convaiElement = document.getElementById('elevenlabsConvai');
    if (convaiElement.getAttribute('agent-id')) {
        console.log('Agent ID loaded successfully');
    } else {
        console.error('Agent ID not set');
    }
    document.body.classList.add('loaded');
    const fadeInElements = document.querySelectorAll('.fade-in-container');
    fadeInElements.forEach(el => {
        el.classList.add('animate-fade-in');
        el.addEventListener('animationend', () => {
            el.classList.add('animate-pulse-subtle');
        });
    });
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const isExpanded = navMenu.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
        if (isExpanded) {
            setTimeout(() => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }, 10000);
        }
    });
    window.addEventListener('scroll', () => {
        if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
    document.querySelectorAll('#navMenu a').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => card.querySelector('.overlay p').style.opacity = '1');
        card.addEventListener('mouseleave', () => card.querySelector('.overlay p').style.opacity = '0');
    });
    const carouselImages = document.querySelectorAll('.carousel-image');
    let currentImageIndex = 0;
    let carouselInterval;
    if (carouselImages.length > 0) {
        carouselImages[0].classList.add('active');
        function showNextImage() {
            carouselImages[currentImageIndex].classList.remove('active');
            currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
            carouselImages[currentImageIndex].classList.add('active');
        }
        function startCarousel() {
            carouselInterval = setInterval(showNextImage, 3000);
        }
        function stopCarousel() {
            clearInterval(carouselInterval);
        }
        startCarousel();
        document.querySelector('.carousel-container').addEventListener('mouseenter', stopCarousel);
        document.querySelector('.carousel-container').addEventListener('mouseleave', startCarousel);
    } else {
        console.error("No se encontraron imágenes en el carrusel.");
    }
    const phoneIcon = document.getElementById('phoneIcon');
    const convai = document.getElementById('elevenlabsConvai');
    phoneIcon.addEventListener('click', () => convai.classList.toggle('active'));
    function triggerAnimation() {
        phoneIcon.classList.remove('vibrate', 'wave');
        void phoneIcon.offsetWidth;
        phoneIcon.classList.add('vibrate', 'wave');
    }
    triggerAnimation();
    const animationInterval = setInterval(triggerAnimation, 5000);
    window.addEventListener('beforeunload', () => clearInterval(animationInterval));
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registrado con éxito:', registration.scope);
                })
                .catch((error) => {
                    console.error('Error al registrar el Service Worker:', error);
                });
        });
    }
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('PWA lista para instalar');
        const installButton = document.createElement('button');
        installButton.textContent = 'Instalar Prisas Pan';
        installButton.className = 'fixed bottom-10 left-10 bg-yellow-300 text-black p-2 rounded z-50';
        document.body.appendChild(installButton);
        installButton.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuario aceptó instalar la PWA');
                } else {
                    console.log('Usuario rechazó instalar la PWA');
                }
                deferredPrompt = null;
                installButton.remove();
            });
        });
    });
    window.addEventListener('appinstalled', () => {
        console.log('PWA instalada con éxito');
    });
});
