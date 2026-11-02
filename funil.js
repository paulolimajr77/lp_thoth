/* Painel "antes e depois" do funil na seção Onde a venda se perde. Precisa carregar antes do efeitos.js. */
(() => {
  'use strict';
  const cabecalho = document.querySelector('#dores .section-heading');
  if (!cabecalho) return;
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ETAPAS = ['Conversa', 'Interesse', 'Atendimento', 'Venda'];
  const ANTES = ['Equipe ocupada', 'Cliente não avança', 'Ninguém acompanha tudo', 'Dados escondidos'];
  const DEPOIS = ['Resposta com a IA', 'Acompanhamento', 'Histórico e responsável', 'Etapas e origem'];
  /* muda a velocidade do painel inteiro: maior = mais lento */
  const LENTO = 1.6;
  const CICLO = 13000 * LENTO;
  const APARECE = [600, 1300, 2000, 2700].map((x) => x * LENTO);
  const RESOLVE = [5600, 6200, 6800, 7400].map((x) => x * LENTO);
  const VIRA_DEPOIS = 5000 * LENTO;
  const ENCHE = 8000 * LENTO;
  const RECOMECA = 12400 * LENTO;
  const VISTO = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const SETA = '<svg width="20" height="22" viewBox="0 0 20 22"><path d="M4 2.5V17l3.9-3.7 2.6 5.8 2.5-1.1-2.5-5.6H16z" fill="#fff" stroke="#11110e" stroke-width="1.3" stroke-linejoin="round"/></svg>';

  const MEDIDAS = {
    largo: { nome: 'largo', L: 480, A: 440, centro: 112, larguras: [190, 165, 140, 100], chipX: 250, chipL: 208, y0: 74, passo: 62, altura: 46 },
    estreito: { nome: 'estreito', L: 340, A: 440, centro: 76, larguras: [134, 122, 110, 76], chipX: 166, chipL: 160, y0: 74, passo: 62, altura: 46 },
  };

  const grade = document.createElement('div');
  grade.className = 'fv-grade';
  cabecalho.before(grade);
  cabecalho.classList.remove('centered');
  const painel = document.createElement('div');
  painel.className = 'fv-painel ef-entrada';
  painel.setAttribute('aria-hidden', 'true');
  grade.append(cabecalho, painel);

  let palco, cena, partes, m;
  let estado = { problemas: 4, depois: true, resolvidos: 4, cheio: true };

  const meio = (k) => m.y0 + k * m.passo + m.altura / 2;

  function montar() {
    m = painel.clientWidth < 420 ? MEDIDAS.estreito : MEDIDAS.largo;
    painel.innerHTML = `<div class="fv-palco fv-${m.nome}" style="width:${m.L}px;height:${m.A}px"><div class="fv-cena">
      <div class="fv-topo"><span class="fv-mono">Do contato à venda</span>
        <span class="fv-chave"><i></i><b data-lado="antes">Antes</b><b data-lado="depois">Depois</b></span></div>
      <svg class="fv-moldura" viewBox="0 0 ${m.L} ${m.A}" width="${m.L}" height="${m.A}"><rect x="10" y="60" width="${m.L - 20}" height="270" rx="16" pathLength="1"/></svg>
      <span class="fv-selo fv-mono" style="left:${m.L / 2}px">Tudo no THOTH</span>
      ${ETAPAS.map((nome, k) => `<div class="fv-etapa" style="left:${m.centro - m.larguras[k] / 2}px;top:${m.y0 + k * m.passo}px;width:${m.larguras[k]}px;height:${m.altura}px"><span>${nome}</span></div>`).join('')}
      ${ETAPAS.map((_, k) => {
        const borda = m.centro + m.larguras[k] / 2 - (k === 3 ? 0 : 10);
        return `<i class="fv-liga" style="left:${borda}px;top:${meio(k)}px;width:${m.chipX - borda}px"></i>
          ${k < 3 ? `<i class="fv-furo" style="left:${borda - 5}px;top:${meio(k) - 5}px"></i>` : ''}
          <div class="fv-chip" style="left:${m.chipX}px;top:${meio(k) - 22}px;width:${m.chipL}px">
            <div class="fv-face fv-antes"><span class="fv-n">0${k + 1}</span><span>${ANTES[k]}</span></div>
            <div class="fv-face fv-depois"><span class="fv-ok">${VISTO}</span><span>${DEPOIS[k]}</span></div>
          </div>`;
      }).join('')}
      <span class="fv-rotulo fv-mono">Próximo passo de cada conversa</span>
      <div class="fv-barra"><i></i></div>
      <span class="fv-nota fv-mono">Fluxo ilustrativo</span>
    </div><div class="fv-cursor">${SETA}</div></div>`;
    palco = painel.querySelector('.fv-palco');
    cena = painel.querySelector('.fv-cena');
    partes = {
      chips: [...painel.querySelectorAll('.fv-chip')],
      ligas: [...painel.querySelectorAll('.fv-liga')],
      furos: [...painel.querySelectorAll('.fv-furo')],
      etapas: [...painel.querySelectorAll('.fv-etapa')],
      chave: painel.querySelector('.fv-chave'),
      moldura: painel.querySelector('.fv-moldura'),
      selo: painel.querySelector('.fv-selo'),
      barra: painel.querySelector('.fv-barra'),
      cursor: painel.querySelector('.fv-cursor'),
    };
    partes.chave.querySelectorAll('b').forEach((lado) => lado.addEventListener('click', () => {
      manual = true;
      const depois = lado.dataset.lado === 'depois';
      desenhar({ problemas: 4, depois, resolvidos: depois ? 4 : 0, cheio: depois });
      cena.style.opacity = '1';
      partes.cursor.style.opacity = '0';
    }));
    ajustar();
    desenhar(estado);
  }

  function ajustar() {
    palco.style.transform = `scale(${painel.clientWidth / m.L})`;
    painel.style.height = `${(painel.clientWidth / m.L) * m.A}px`;
  }

  function desenhar(novo) {
    estado = novo;
    partes.chips.forEach((chip, k) => {
      const visto = k < novo.problemas;
      const resolvido = novo.depois && k < novo.resolvidos;
      chip.classList.toggle('fv-ve', visto);
      chip.classList.toggle('fv-ok-feito', resolvido);
      partes.ligas[k].classList.toggle('fv-ve', visto);
      partes.ligas[k].classList.toggle('fv-ok-feito', resolvido);
      if (partes.furos[k]) partes.furos[k].classList.toggle('fv-ok-feito', resolvido);
    });
    partes.chave.classList.toggle('fv-no-depois', novo.depois);
    partes.moldura.classList.toggle('fv-ve', novo.depois);
    partes.selo.classList.toggle('fv-ve', novo.depois && novo.resolvidos >= 1);
    partes.barra.classList.toggle('fv-cheia', novo.cheio);
    partes.etapas[3].classList.toggle('fv-acesa', novo.cheio);
  }

  function faiscas() {
    const cores = ['#a69861', '#506d48', '#d9cfa3'];
    for (let k = 0; k < 14; k++) {
      const f = document.createElement('i');
      f.className = 'fv-faisca';
      f.style.background = cores[k % 3];
      f.style.left = `${m.L - 110}px`;
      f.style.top = '378px';
      cena.append(f);
      const angulo = (k / 14) * Math.PI * 2;
      const raio = k % 2 ? 44 : 30;
      f.animate([
        { transform: 'translate(0,0) scale(.4)', opacity: 1 },
        { transform: `translate(${Math.cos(angulo) * raio}px,${Math.sin(angulo) * raio}px) scale(1)`, opacity: 0 },
      ], { duration: 800 * LENTO, delay: (k % 3) * 30, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }).onfinish = () => f.remove();
    }
  }

  let contaGota = 0;
  function gota() {
    const nivel = contaGota++ % 5;
    const g = document.createElement('i');
    g.className = 'fv-gota';
    cena.append(g);
    const desvio = (Math.random() - 0.5) * 26;
    const inicio = { transform: `translate(${m.centro + desvio}px,56px)`, opacity: 0 };
    const escapa = nivel < 3 && !(estado.depois && nivel < estado.resolvidos);
    let quadros;
    let duracao;
    if (escapa) {
      const borda = m.centro + m.larguras[nivel] / 2 - 10;
      const y = meio(nivel);
      quadros = [
        inicio,
        { transform: `translate(${m.centro + desvio * 0.6}px,70px)`, opacity: 1, offset: 0.08 },
        { transform: `translate(${m.centro + desvio * 0.3}px,${y}px)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${borda}px,${y}px)`, opacity: 1, background: '#8a8672', offset: 0.68 },
        { transform: `translate(${borda + 34}px,${y + 26}px)`, opacity: 0, background: '#b9b4a2' },
      ];
      duracao = (1500 + nivel * 300) * LENTO;
    } else {
      quadros = [
        inicio,
        { transform: `translate(${m.centro + desvio * 0.6}px,70px)`, opacity: 1, offset: 0.06 },
        { transform: `translate(${m.centro + desvio * 0.2}px,${meio(3) + 20}px)`, opacity: 1, offset: 0.75 },
        { transform: `translate(${40 + Math.random() * (m.L - 80)}px,368px)`, opacity: 0 },
      ];
      duracao = 2300 * LENTO;
    }
    g.animate(quadros, { duration: duracao, easing: 'linear' }).onfinish = () => g.remove();
  }

  let manual = false;
  let faiscou = false;
  function quadro(t) {
    if (manual) return;
    const depois = t >= VIRA_DEPOIS && t < RECOMECA;
    const cheio = depois && t >= ENCHE;
    desenhar({
      problemas: t >= RECOMECA ? 4 : APARECE.filter((x) => t >= x).length,
      depois,
      resolvidos: depois ? RESOLVE.filter((x) => t >= x).length : 0,
      cheio,
    });
    if (cheio && !faiscou) { faiscou = true; faiscas(); }
    if (!cheio) faiscou = false;
    cena.style.opacity = t >= 12450 * LENTO || t < 120 ? '0' : '1';
    const naTela = t >= 4200 * LENTO && t < 5900 * LENTO;
    const noBotao = t >= 4300 * LENTO;
    const clicando = t >= 4950 * LENTO && t < 5100 * LENTO;
    partes.cursor.style.opacity = naTela ? '1' : '0';
    partes.cursor.style.transform = `translate3d(${noBotao ? m.L - 58 : m.L - 150}px,${noBotao ? 28 : 468}px,0) scale(${clicando ? 0.84 : 1})`;
  }

  montar();
  new ResizeObserver(() => {
    const certo = painel.clientWidth < 420 ? MEDIDAS.estreito : MEDIDAS.largo;
    if (certo !== m) montar(); else ajustar();
  }).observe(painel);

  if (reduzido) return;

  let origem = 0;
  let parado = 0;
  let relogio;
  let fonte;
  const tocar = () => {
    if (relogio) return;
    origem += performance.now() - parado;
    relogio = setInterval(() => quadro((performance.now() - origem) % CICLO), 50);
    fonte = setInterval(() => { if (!document.hidden) gota(); }, 230 * LENTO);
  };
  const pausar = () => {
    if (!relogio) return;
    clearInterval(relogio);
    clearInterval(fonte);
    relogio = undefined;
    parado = performance.now();
  };
  origem = performance.now();
  parado = origem;
  estado = { problemas: 0, depois: false, resolvidos: 0, cheio: false };
  desenhar(estado);
  new IntersectionObserver(([item]) => (item.isIntersecting ? tocar() : pausar()), { threshold: 0.3 }).observe(painel);
})();
