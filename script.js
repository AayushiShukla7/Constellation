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
gradient.addColorStop(0, 'white');
gradient.addColorStop(0.5, 'magenta');
gradient.addColorStop(1, 'blue');
ctx.fillStyle = gradient;

// Contains logic to build individual particle objects
class Particle {
    constructor(effect) {
        this.effect = effect;   // Singleton implementation
        //this.radius = 15;   // Pixels (default)
        this.radius = Math.random() * 10 + 5; 
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);  
        
        //this.vx = 1;    // Speed      
        this.vx = Math.random() * 1 - 0.5; 
        this.vy = Math.random() * 1 - 0.5; 
    }

    draw(context) {
        // context.fillStyle = 'hsl(300, 100%, 50%)';
        // context.fillStyle = 'hsl('+ this.x * 0.5 +', 100%, 50%)';
        // context.fillStyle = 'hsl('+ Math.random() * 360 +', 100%, 50%)';

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
    }

    update() {
        //this.x++;
        this.x += this.vx;
        if(this.x > this.effect.width - this.radius || this.x < 0) this.vx *= -1;

        this.y += this.vy;
        if(this.y > this.effect.height - this.radius || this.y < 0) this.vy *= -1;
    }
}

// Brain of our codebase (manages all particles)
class Effect {
    // To make sure all shapes are drawn within the cannvas area
    constructor(canvas) {
        this.canvas = canvas;   // Converts it to a class property
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.particles = [];
        this.numberOfParticles = 200;
        this.createParticles();
    }

    createParticles() {
        for(let i = 0; i < this.numberOfParticles; i++){
            this.particles.push(new Particle(this));
        }
    }

    handleParticles(context) {
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
    }
}

const effect = new Effect(canvas);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);      // Removes the alt paint (previous animation) to clear up the canvas of trails
    effect.handleParticles(ctx);
    requestAnimationFrame(animate); // Creates animation loop
}

animate();

