/* Partículas, luz de fundo e granulado atrás do conteúdo. */
(() => {
  'use strict';
  const criarFundo = () => {
    const tela = document.createElement('canvas');
    tela.id = 'ambientCanvas';
    tela.setAttribute('aria-hidden', 'true');
    const grao = document.createElement('div');
    grao.className = 'noise';
    grao.setAttribute('aria-hidden', 'true');
    document.body.prepend(tela, grao);
    const ctx = tela.getContext('2d');
    let T = 0, estrelas = [], largura = 0;

    const criarEstrelas = () => {
      estrelas = Array.from({ length: tela.width < 768 ? 70 : 140 }, () => ({
        x: Math.random() * tela.width,
        y: Math.random() * tela.height,
        r: Math.random() * 1.8 + 0.4,
        vy: Math.random() * 0.45 + 0.15,
        a: Math.random(),
        da: (Math.random() - 0.5) * 0.016,
      }));
    };
    const ajustar = () => {
      tela.width = innerWidth;
      tela.height = innerHeight;
      if (innerWidth !== largura) { largura = innerWidth; criarEstrelas(); }
    };
    const luz = (x, y, raio, paradas) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, raio);
      paradas.forEach(([p, cor]) => g.addColorStop(p, cor));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, tela.width, tela.height);
    };
    const desenhar = () => {
      const W = tela.width, H = tela.height, ox = Math.sin(T) * 0.04, oy = Math.cos(T * 0.72) * 0.03;
      ctx.clearRect(0, 0, W, H);
      luz(W * (0.5 + ox), H * (0.26 + oy), W * 0.72, [[0, 'rgba(190,148,32,.10)'], [0.5, 'rgba(165,124,22,.04)'], [1, 'rgba(0,0,0,0)']]);
      luz(W * (0.08 - ox), H * (0.9 - oy * 0.5), W * 0.38, [[0, 'rgba(205,134,22,.07)'], [1, 'rgba(0,0,0,0)']]);
      estrelas.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,160,32,${s.a * 0.55})`;
        ctx.fill();
      });
    };
    const mover = () => {
      T += 0.0025;
      estrelas.forEach((s) => {
        s.a = Math.max(0.04, Math.min(1, s.a + s.da));
        if (s.a <= 0.04 || s.a >= 1) s.da *= -1;
        s.y -= s.vy;
        if (s.y < -4) { s.y = tela.height + 4; s.x = Math.random() * tela.width; }
      });
    };

    addEventListener('resize', () => { ajustar(); desenhar(); });
    ajustar();
    desenhar();
    /* com movimento reduzido o fundo fica parado */
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const quadro = () => {
      if (!document.hidden) { mover(); desenhar(); }
      requestAnimationFrame(quadro);
    };
    requestAnimationFrame(quadro);
  };

  addEventListener('DOMContentLoaded', criarFundo);
})();
