// Setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// ctx.fillStyle = 'pink';
ctx.strokeStyle = 'white';
// ctx.lineWidth = 2;
console.log(ctx);

const gradient = ctx.createLinearGradient(0,0,canvas.width,canvas.height);

gradient.addColorStop(0, '#12B8FF');
gradient.addColorStop(0.25, '#01DC03');
gradient.addColorStop(0.5, '#FFE62D');
gradient.addColorStop(0.75, '#FD4499');
gradient.addColorStop(1, '#DF19FB');

ctx.fillStyle = gradient;
ctx.strokeStyle = 'white';

// Contains logic to build individual particle objects
class Particle {
    constructor(effect) {
        this.effect = effect;   // Singleton implementation
        //this.radius = 15;   // Pixels (default)
        this.radius = Math.floor(Math.random() * 10 + 1);   // Why Math.floor()? - Because it's easier for JS to work with integers.
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);

        //this.vx = 1;    // Speed
        this.vx = Math.random() * 1 - 0.5;
        this.vy = Math.random() * 1 - 0.5;

        // for physics in particle motion
        this.pushX = 0;
        this.pushY = 0;

        // Simulating physics
        this.friction = 0.95;
    }

    draw(context) {
        // context.fillStyle = 'hsl(300, 100%, 50%)';
        // context.fillStyle = 'hsl('+ this.x * 0.5 +', 100%, 50%)';
        // context.fillStyle = 'hsl('+ Math.random() * 360 +', 100%, 50%)';

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        // context.stroke();
    }

    update() {
        if(this.effect.mouse.pressed) {
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;

            const distance = Math.hypot(dx, dy);

            // Dynamic spped according to mouse distance
            const force = this.effect.mouse.radius / distance;

            if(distance < this.effect.mouse.radius) {
                const angle = Math.atan2(dy, dx);   // atan2: Counter-clockwise angle in radians between horizontal line from (0,0) and line between (x,y) coordinates

                // Moves particles away from each other
                // this.x += Math.cos(angle) * force;
                // this.y += Math.sin(angle) * force;

                // Physics in particle motion
                this.pushX += Math.cos(angle) * force;
                this.pushY += Math.sin(angle) * force;
            }
        }

        this.x += (this.pushX *= this.friction) + this.vx;
        this.y += (this.pushY *= this.friction) + this.vy;

        // Edge cases - Push balls past the edges of the canvas
        if(this.x < this.radius) {
            // Left Corner/Edge
            this.x = this.radius;
            this.vx *= -1;
        }
        else if(this.x > this.effect.width -  this.radius) {
            // Right Corner/Edge
            this.x = this.effect.width -  this.radius;
            this.vx *= -1;
        }
        else if(this.y < this.radius) {
            // Top Corner/Edge
            this.y = this.radius;
            this.vy *= -1;
        }
        else if(this.y > this.effect.width -  this.radius) {
            // Bottom Corner/Edge
            this.y = this.effect.width -  this.radius;
            this.vy *= -1;
        }
    }

    reset() {
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    }
}

// Brain of our codebase (manages all particles)
class Effect {
    // To make sure all shapes are drawn within the cannvas area
    constructor(canvas, context) {
        this.canvas = canvas;   // Converts it to a class property
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 300;
        this.createParticles();

        // Make particles react to mouse
        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            radius: 200     // Mouse influence radius
        }

        window.addEventListener('resize', e => {
            // console.log(e.target.window.innerWidth);
            this.resize(e.target.window.innerWidth, e.target.window.innerHeight, context);
        });

        window.addEventListener('mousemove', e => {
            // console.log(e.x, e.y);
            if(this.mouse.pressed) {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
                console.log(this.mouse.x, this.mouse.y);
            }
        });

        window.addEventListener('mousedown', e => {
            this.mouse.pressed = true;
            this.mouse.x = e.x;
                this.mouse.y = e.y;
        });

        window.addEventListener('mouseup', e => {
            this.mouse.pressed = false;
        });
    }

    createParticles() {
        for(let i = 0; i < this.numberOfParticles; i++){
            this.particles.push(new Particle(this));
        }
    }

    handleParticles(context) {
        this.connectParticles(context);    // Draws a line joining all particles within 100 pixels from each other

        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
    }

    connectParticles(context) {
        // Creates a Particle System
        const maxDistance = 100;

        for (let a = 0; a < this.particles.length; a++){
            for(let b = a; b < this.particles.length; b++) {
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;

                const distance = Math.hypot(dx, dy);
                if(distance < maxDistance) {
                    context.save();     // Save current state of canvas

                    const opacity = 1 - (distance/maxDistance); // Disappear as the particles move away - Makes transition smooth and not glitchy
                    context.globalAlpha = opacity;

                    context.beginPath();
                    context.moveTo(this.particles[a].x, this.particles[a].y);   // Defines starting point/coordinate of the line [joining the two points]
                    context.lineTo(this.particles[b].x, this.particles[b].y);   // Defines end point/coordinate of the line [joining the two points]
                    context.stroke();

                    context.restore();  // Reset canvas
                }
            }
        }
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;

        this.width = width;
        this.height = height;

        // WHY? - Because it resets every time window gets resized, to default value (black)**
        const gradient = this.context.createLinearGradient(0,0,width, height);
        
        gradient.addColorStop(0, '#12B8FF');
        gradient.addColorStop(0.25, '#01DC03');
        gradient.addColorStop(0.5, '#FFE62D');
        gradient.addColorStop(0.75, '#FD4499');
        gradient.addColorStop(1, '#DF19FB');

        this.context.fillStyle = gradient;
        this.context.strokeStyle = 'white';

        // Redistribute particles all around
        this.particles.forEach(particle => {
            particle.reset();
        })
    }
}

const effect = new Effect(canvas, ctx);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);      // Removes the alt paint (previous animation) to clear up the canvas of trails
    effect.handleParticles(ctx);
    requestAnimationFrame(animate); // Creates animation loop
}

animate();

