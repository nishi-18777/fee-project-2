// Resume Spark - High-Visibility Animated Cyber Particle Background
(function() {
    function initCyberBackground() {
        if (document.getElementById('cyberCanvas')) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'cyberCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        canvas.style.opacity = '1';
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particleCount = width < 768 ? 45 : 90;
        const maxDistance = width < 768 ? 100 : 155;
        const particles = [];

        // Mouse Tracker for interactive glowing lines
        const mouse = {
            x: null,
            y: null,
            radius: 160
        };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Ambient Drifting Glowing Orbs
        const orbs = [
            { x: width * 0.25, y: height * 0.35, vx: 0.3, vy: 0.2, radius: 280, color: 'rgba(0, 242, 254, 0.08)' },
            { x: width * 0.75, y: height * 0.65, vx: -0.25, vy: -0.2, radius: 340, color: 'rgba(0, 131, 176, 0.09)' },
            { x: width * 0.5, y: height * 0.85, vx: 0.2, vy: -0.15, radius: 220, color: 'rgba(79, 172, 254, 0.06)' }
        ];

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.85;
                this.vy = (Math.random() - 0.5) * 0.85;
                this.radius = Math.random() * 2.6 + 1.6; // 1.6px to 4.2px
                this.baseAlpha = Math.random() * 0.4 + 0.55; // 0.55 to 0.95
                this.alpha = this.baseAlpha;
                this.pulseSpeed = Math.random() * 0.03 + 0.01;
                this.pulseAngle = Math.random() * Math.PI * 2;
                
                const rand = Math.random();
                if (rand < 0.6) {
                    this.color = '#00f2fe'; // Brand neon cyan
                } else if (rand < 0.85) {
                    this.color = '#00c6ff'; // Electric teal
                } else {
                    this.color = '#ffffff'; // White twinkle
                }
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Screen Wrap
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                // Gentle Alpha Pulsing
                this.pulseAngle += this.pulseSpeed;
                this.alpha = this.baseAlpha + Math.sin(this.pulseAngle) * 0.2;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = Math.max(0.2, Math.min(1, this.alpha));
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#00f2fe';
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // 1. Draw Ambient Glowing Energy Orbs
            for (let i = 0; i < orbs.length; i++) {
                const orb = orbs[i];
                orb.x += orb.vx;
                orb.y += orb.vy;

                if (orb.x < -orb.radius) orb.x = width + orb.radius;
                if (orb.x > width + orb.radius) orb.x = -orb.radius;
                if (orb.y < -orb.radius) orb.y = height + orb.radius;
                if (orb.y > height + orb.radius) orb.y = -orb.radius;

                const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
                grad.addColorStop(0, orb.color);
                grad.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                ctx.fill();
            }

            // 2. Draw Interconnecting Constellation Lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDistance) {
                        const lineAlpha = (1 - dist / maxDistance) * 0.45;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = '#00f2fe';
                        ctx.globalAlpha = lineAlpha;
                        ctx.lineWidth = 1.1;
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = '#00f2fe';
                        ctx.stroke();
                    }
                }

                // 3. Mouse Interactive Connections
                if (mouse.x !== null && mouse.y !== null) {
                    const mdx = particles[i].x - mouse.x;
                    const mdy = particles[i].y - mouse.y;
                    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

                    if (mdist < mouse.radius) {
                        const mLineAlpha = (1 - mdist / mouse.radius) * 0.65;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = '#00f2fe';
                        ctx.globalAlpha = mLineAlpha;
                        ctx.lineWidth = 1.3;
                        ctx.shadowBlur = 6;
                        ctx.shadowColor = '#00f2fe';
                        ctx.stroke();
                    }
                }
            }

            // 4. Update and Draw Particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            ctx.globalAlpha = 1;
            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCyberBackground);
    } else {
        initCyberBackground();
    }
})();
