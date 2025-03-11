document.addEventListener('DOMContentLoaded', () => {
    const particleContainer = document.getElementById('particles');
    const particleCount = window.innerWidth < 768 ? 15 : 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        const size = 2 + Math.random() * 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 60}vw`);
        particle.style.setProperty('--ty', `${(Math.random() - 0.5) * 60}vh`);
        particle.style.setProperty('--ex', `${(Math.random() - 0.5) * 120}vw`);
        particle.style.setProperty('--ey', `${(Math.random() - 0.5) * 120}vh`);
        particle.style.animationDuration = `${8 + Math.random() * 6}s`;
        particle.style.animationDelay = `${Math.random() * 4}s`;
        particleContainer.appendChild(particle);
    }
    const convaiElement = document.getElementById('elevenlabsConvai');
    if (convaiElement.getAttribute('agent-id')) console.log('Agent ID loaded successfully');
    else console.error('Agent ID not set');
    document.body.classList.add('loaded');
    document.querySelectorAll('.fade-in-container').forEach(el => {
        el.classList.add('animate-fade-in');
        el.addEventListener('animationend', () => el.classList.add('animate-pulse-subtle'));
    });
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        if (navMenu.classList.contains('active')) {
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
        carouselInterval = setInterval(showNextImage, 3000);
        document.querySelector('.carousel-container').addEventListener('mouseenter', () => clearInterval(carouselInterval));
        document.querySelector('.carousel-container').addEventListener('mouseleave', () => carouselInterval = setInterval(showNextImage, 3000));
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
    const animationInterval = setInterval(triggerAnimation, 4000);
    window.addEventListener('beforeunload', () => clearInterval(animationInterval));
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('Service Worker registrado con éxito:', registration.scope))
                .catch(error => console.error('Error al registrar el Service Worker:', error));
        });
    }
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installButton = document.createElement('button');
        installButton.textContent = 'Instalar App';
        installButton.className = 'install-button hexagon';
        document.querySelector('.elevenlabs-widget-container').appendChild(installButton);
        setTimeout(() => installButton.style.opacity = '1', 1500);
        setTimeout(() => {
            installButton.style.animation = 'fadeOut 0.6s ease-out forwards';
            setTimeout(() => {
                installButton.style.display = 'none';
                installButton.style.animation = '';
            }, 600);
        }, 11500);
        setTimeout(() => {
            installButton.className = 'install-button circle';
            installButton.style.display = 'block';
            installButton.style.opacity = '1';
            setTimeout(() => {
                installButton.style.animation = 'fadeOut 0.6s ease-out forwards';
                setTimeout(() => installButton.style.display = 'none', 600);
            }, 10000);
        }, 26500);
        installButton.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') console.log('Usuario aceptó instalar la PWA');
                else console.log('Usuario rechazó instalar la PWA');
                deferredPrompt = null;
                installButton.remove();
            });
        });
    });
    window.addEventListener('appinstalled', () => console.log('PWA instalada con éxito'));
});
