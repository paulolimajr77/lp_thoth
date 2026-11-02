/* Movimento de entrada do site. Precisa carregar antes do script.js: troca o .reveal antigo pelas entradas novas. */
(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('ef');

  const TITULOS = 'h1,h2';
  const foraDoConteudo = (el) => el.closest('dialog,nav,header,footer');
  const titulos = [...document.querySelectorAll(TITULOS)].filter((t) => !foraDoConteudo(t));

  /* títulos: palavra por palavra; degradê e trecho que não quebra entram inteiros */
  titulos.forEach((titulo) => {
    let i = 0;
    const atraso = () => `${(i++ * 0.05).toFixed(3)}s`;
    const partir = (no) => {
      [...no.childNodes].forEach((filho) => {
        if (filho.nodeType === 3) {
          const frag = document.createDocumentFragment();
          filho.textContent.split(/([ \t\n\r\f]+)/).forEach((pedaco) => {
            if (!pedaco) return;
            if (/^[ \t\n\r\f]+$/.test(pedaco)) { frag.append(pedaco); return; }
            const s = document.createElement('span');
            s.className = 'ef-palavra';
            s.textContent = pedaco;
            s.style.setProperty('--d', atraso());
            frag.append(s);
          });
          filho.replaceWith(frag);
        } else if (filho.nodeType === 1 && filho.tagName !== 'BR') {
          const estilo = getComputedStyle(filho);
          if (estilo.backgroundClip === 'text' || estilo.webkitBackgroundClip === 'text' || estilo.whiteSpace === 'nowrap') {
            filho.classList.add('ef-palavra');
            filho.style.setProperty('--d', atraso());
          } else partir(filho);
        }
      });
    };
    partir(titulo);
    titulo.classList.add('ef-titulo');
  });

  /* .reveal que traz um título: o título entra palavra por palavra e o resto entra junto, sem esconder o bloco */
  const marcarEntrada = (el) => {
    el.classList.remove('reveal', 'reveal-delay', 'reveal-delay-2');
    el.classList.add('ef-entrada');
  };
  const abrirBloco = (bloco) => {
    bloco.classList.remove('reveal', 'reveal-delay', 'reveal-delay-2');
    [...bloco.children].forEach((filho) => {
      if (filho.matches(TITULOS)) return;
      if (filho.querySelector(TITULOS)) abrirBloco(filho);
      else filho.classList.add('ef-entrada');
    });
  };
  document.querySelectorAll('.reveal').forEach((el) => {
    if (el.querySelector(TITULOS)) abrirBloco(el);
    else if (el.classList.contains('hero-product')) {
      el.classList.remove('reveal', 'reveal-delay');
      el.classList.add('ef-visual');
    } else marcarEntrada(el);
  });

  /* listas que o script.js anima: os filhos passam a entrar em grupo */
  document.querySelectorAll('.leak-list,.flow-rail,.outcome-grid,.comparison-cards,.fit-list,.implementation-steps,.plans-grid,.faq-list').forEach((lista) => {
    lista.classList.remove('ef-entrada');
    [...lista.children].forEach((filho) => filho.classList.add('ef-entrada'));
  });

  /* grupos: dois ou mais vizinhos do mesmo tipo entram em sequência */
  const pais = new Set([...document.querySelectorAll('.ef-entrada')].map((el) => el.parentElement));
  pais.forEach((pai) => {
    const porTipo = new Map();
    [...pai.children].filter((f) => f.classList.contains('ef-entrada')).forEach((f) => {
      const tipo = f.classList[0];
      porTipo.set(tipo, [...(porTipo.get(tipo) || []), f]);
    });
    porTipo.forEach((itens) => {
      if (itens.length < 2) return;
      pai.classList.add('ef-grupo');
      itens.forEach((f, k) => f.style.setProperty('--d', `${(k * 0.08).toFixed(2)}s`));
    });
    if (pai.classList.contains('ef-grupo')) {
      [...pai.children].forEach((f) => { if (f.classList.contains('ef-entrada') && !f.style.getPropertyValue('--d')) f.classList.remove('ef-entrada'); });
    }
  });

  /* cartões: sobem ao passar o mouse */
  document.querySelectorAll('.h2-step,.h2-pain-card,.res-card,.plan-card').forEach((cartao) => cartao.classList.add('ef-cartao'));

  const observador = new IntersectionObserver((itens) => {
    itens.forEach((item) => {
      if (!item.isIntersecting) return;
      item.target.classList.add('in');
      observador.unobserve(item.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.ef-titulo,.ef-entrada,.ef-visual').forEach((el) => observador.observe(el));

  /* brilho da borda: só gira com o cartão ou o botão na tela */
  const naTela = new IntersectionObserver((itens) => {
    itens.forEach((item) => item.target.classList.toggle('ef-giro', item.isIntersecting));
  });
  document.querySelectorAll('.plan-featured,.button-dark,.button-primary').forEach((el) => {
    /* o botão claro do plano em destaque não leva: o cartão em volta já tem */
    if (el.matches('.plan-featured .button-primary')) return;
    const brilho = document.createElement('span');
    brilho.className = 'ef-brilho';
    brilho.setAttribute('aria-hidden', 'true');
    el.append(brilho);
    naTela.observe(el);
  });
})();
