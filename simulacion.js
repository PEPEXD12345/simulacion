const canvas = document.getElementById('lienzo');
        const ctx = canvas.getContext('2d');
        const contadorDOM = document.getElementById('contadorComida');
        
        let hormigas = [];
        let feromonas = [];
        let totalComida = 0; 
        
        // variables para el control de la pausa
        let enPausa = false;
        let animacionFrame;

        const numHormigas = 150; 
        const nido = { x: 40, y: 200 };
        const comida = { x: 650, y: 200 };

        // laberinto
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
            // detener cualquier animacion previa para evitar que se aceleren al reiniciar
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

        // Funcin para alternar entre Pausa y Reanudar
        function togglePausa() {
            enPausa = !enPausa;
            const btnPausa = document.getElementById('btnPausa');
            
            if (enPausa) {
                btnPausa.innerText = "Reanudar Simulación";
                cancelAnimationFrame(animacionFrame); // Detiene el bucle de actualizacion
            } else {
                btnPausa.innerText = "Pausar Simulación";
                actualizar(); // reactiva el bucle
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
            
            feromonas.forEach((f, index) => {
                ctx.fillStyle = `rgba(255, 100, 100, ${f.fuerza})`;
                ctx.fillRect(f.x, f.y, 4, 4);
                f.fuerza -= 0.0015; 
                if (f.fuerza <= 0) feromonas.splice(index, 1);
            });

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

        function {

                        if (opciones.length > 0) {
                            opciones.sort((a, b) => a.olor - b.olor);
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

                if (!h.tieneComida && Math.abs(h.x - comida.x) < 20 && Math.abs(h.y - comida.y) < 20) {
                    h.tieneComida = true;
                    h.angulo += Math.PI; 
                    h.evadiendo = 0;
                }
                
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
            
            // Guardado de el ID del frame para poder cancelarlo al pausar
            animacionFrame = requestAnimationFrame(actualizar);
        }

     
        iniciarSimulacion();
