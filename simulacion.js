const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d');
const contadorDOM = document.getElementById('contadorComida');

let hormigas = [];
let feromonas = [];
let totalComida = 0; 

let enPausa = false;
let animacionFrame;

const numHormigas = 150; 
const nido = { x: 40, y: 200 };
const comida = { x: 650, y: 200 };

// Laberinto
const paredes = [
    { x: 150, y: 0, w: 30, h: 60 },
    { x: 150, y: 250, w: 30, h: 60 },
    { x: 320, y: 120, w: 30, h: 60 },
    { x: 150, y: 120, w: 30, h: 100 },
    { x: 320, y: 50, w: 30, h: 280 },
    { x: 490, y: 50, w: 30, h: 280 },
    { x: 220, y: 220, w: 30, h: 30 },
    { x: 410, y: 0, w: 30, h: 80 },
    { x: 380, y: 120, w: 30, h: 40 }
];

function iniciarSimulacion() {
    if (animacionFrame) cancelAnimationFrame(animacionFrame);
    
    hormigas = [];
    feromonas = [];
    totalComida = 0;
    contadorDOM.innerText = totalComida; 
    
    enPausa = false;
    document.getElementById('btnPausa').innerText = "Pausar Simulación";

    for (let i = 0; i < numHormigas; i++) {
        hormigas.push({ 
            x: nido.x, y: nido.y, 
            tieneComida: false, 
            angulo: Math.random() * Math.PI * 2,
            vectorNidoX: 0, 
            vectorNidoY: 0,
            evadiendo: 0 
        });
    }
    actualizar();
}

function togglePausa() {
    enPausa = !enPausa;
    const btnPausa = document.getElementById('btnPausa');
    
    if (enPausa) {
        btnPausa.innerText = "Reanudar Simulación";
        cancelAnimationFrame(animacionFrame);
    } else {
        btnPausa.innerText = "Pausar Simulación";
        actualizar();
    }
}

function choca(x, y) {
    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return true;
    for (let p of paredes) {
        if (x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h) return true;
    }
    return false;
}

function oler(x, y) {
    let olor = 0;
    for (let f of feromonas) {
        let d = Math.sqrt(Math.pow(f.x - x, 2) + Math.pow(f.y - y, 2));
        if (d < 20) olor += f.fuerza; 
    }
    return olor;
}

function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Se recorre a la inversa para poder eliminar elementos sin alterar el índice de la iteración
    for (let i = feromonas.length - 1; i >= 0; i--) {
        let f = feromonas[i];
        ctx.fillStyle = `rgba(255, 100, 100, ${f.fuerza})`;
        ctx.fillRect(f.x, f.y, 4, 4);
        f.fuerza -= 0.0015; 
        if (f.fuerza <= 0) feromonas.splice(i, 1);
    }

    ctx.fillStyle = '#777'; paredes.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
    ctx.fillStyle = 'blue'; ctx.fillRect(nido.x - 15, nido.y - 15, 30, 30);
    ctx.fillStyle = 'green'; ctx.fillRect(comida.x - 15, comida.y - 15, 30, 30);

    hormigas.forEach(h => {
        ctx.fillStyle = 'black';
        ctx.fillRect(h.x, h.y, 3, 3);
        
        if (h.tieneComida) {
            ctx.fillStyle = '#2ecc71'; 
            ctx.fillRect(h.x + 0.5, h.y - 2, 2, 2);
        }
    });
}

function actualizar() {
    const velocidad = 2;

    hormigas.forEach(h => {
        if (h.evadiendo > 0) h.evadiendo--;

        if (!h.tieneComida) {
            if (h.evadiendo === 0) {
                // Muestreo de olor a la izquierda, centro y derecha
                let opciones = [];
                let giros = [-0.5, 0, 0.5];
                for (let giro of giros) {
                    let anguloPrueba = h.angulo + giro;
                    let px = h.x + Math.cos(anguloPrueba) * 15;
                    let py = h.y + Math.sin(anguloPrueba) * 15;
                    opciones.push({ giro: giro, olor: oler(px, py) });
                }

                // Ordenar de MAYOR a MENOR cantidad de olor
                opciones.sort((a, b) => b.olor - a.olor);

                if (opciones[0].olor > 0) {
                    h.angulo += opciones[0].giro;
                } else {
                    h.angulo += (Math.random() - 0.5) * 0.4; 
                }
            }
        } else {
            if (h.evadiendo === 0) {
                let anguloHaciaNido = Math.atan2(h.vectorNidoY, h.vectorNidoX);
                let dif = anguloHaciaNido - h.angulo;
                
                while (dif > Math.PI) dif -= Math.PI * 2;
                while (dif < -Math.PI) dif += Math.PI * 2;
                
                h.angulo += dif * 0.15; 
            }
            
            if (Math.random() < 0.2) feromonas.push({ x: h.x, y: h.y, fuerza: 1.0 });
        }

        let movX = Math.cos(h.angulo) * velocidad;
        let movY = Math.sin(h.angulo) * velocidad;

        if (choca(h.x + movX, h.y + movY)) {
            h.angulo += (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 1.5);
            h.evadiendo = 25; 
        } else {
            h.x += movX;
            h.y += movY;
            h.vectorNidoX -= movX;
            h.vectorNidoY -= movY;
        }

        // Recoger comida
        if (!h.tieneComida && Math.abs(h.x - comida.x) < 20 && Math.abs(h.y - comida.y) < 20) {
            h.tieneComida = true;
            h.angulo += Math.PI; 
            h.evadiendo = 0;
        }
        
        // Entregar comida
        let distanciaAlNido = Math.sqrt(h.vectorNidoX**2 + h.vectorNidoY**2);
        if (h.tieneComida && (distanciaAlNido < 15 || (Math.abs(h.x - nido.x) < 20 && Math.abs(h.y - nido.y) < 20))) {
            h.tieneComida = false; 
            h.vectorNidoX = 0; 
            h.vectorNidoY = 0;
            h.angulo += Math.PI; 
            h.evadiendo = 0;
            
            totalComida++;
            contadorDOM.innerText = totalComida;
        }
    });

    dibujar();
    
    if (!enPausa) {
        animacionFrame = requestAnimationFrame(actualizar);
    }
}

iniciarSimulacion();
