// Resume Spark - High Performance Animated Cyber Background
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
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.65';
        document.body.prepend(canvas);

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const particleCount = width < 768 ? 25 : 55;
        const maxDistance = width < 768 ? 90 : 135;
        const particles = [];

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.7;
                this.vy = (Math.random() - 0.5) * 0.7;
                this.radius = Math.random() * 2 + 1.2;
                this.color = Math.random() > 0.4 ? '#00f2fe' : '#00b4db';
                this.alpha = Math.random() * 0.6 + 0.3;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.alpha;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#00f2fe';
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDistance) {
                        const lineAlpha = (1 - dist / maxDistance) * 0.25;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = '#00f2fe';
                        ctx.globalAlpha = lineAlpha;
                        ctx.lineWidth = 0.8;
                        ctx.shadowBlur = 0;
                        ctx.stroke();
                    }
                }
            }

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
