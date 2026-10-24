/* =========================================================
   Vinicius Fernandes · Consultoria online
   ========================================================= */

/* CONTATO
   WHATSAPP: só números, com DDI e DDD (ex.: '5511999999999').
   Enquanto estiver vazio, todos os botões abrem o direct do Instagram
   e a mensagem pronta é copiada para a área de transferência. */
const WHATSAPP = '';
const INSTAGRAM = 'viny.fernandespersonal';

(function () {
  'use strict';

  const html = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  let motion = false;
  try {
    motion = /[?&]motion=1(&|$)/.test(location.search) || !matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}
  html.classList.toggle('motion-ok', motion);

  const temGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (temGsap) { gsap.registerPlugin(ScrollTrigger); html.classList.add('gsap-ok'); }
  const anima = motion && temGsap;

  /* ---------- Contato ---------- */
  const linkContato = (msg) => WHATSAPP
    ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`
    : `https://ig.me/m/${INSTAGRAM}`;

  const aviso = $('.aviso');
  let avisoTimer;
  function mostraAviso(txt) {
    aviso.textContent = txt;
    aviso.classList.add('visivel');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove('visivel'), 4200);
  }
  function copia(txt) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt).catch(() => {});
    return Promise.resolve();
  }

  $$('[data-cta]').forEach((a) => {
    a.href = linkContato(a.dataset.msg);
    if (!WHATSAPP) {
      a.addEventListener('click', () => {
        copia(a.dataset.msg);
        mostraAviso('Mensagem copiada. É só colar no direct.');
      });
    }
  });

  /* ---------- Navegação: fundo ao rolar, some descendo, volta subindo ---------- */
  const nav = $('.nav');
  const flutuante = $('.flutuante');
  const final = $('.final');
  const barra = $('.progresso span');
  let ultimoY = 0;
  let finalVisivel = false;
  // um cálculo por quadro, no máximo; a altura da página só é medida quando muda
  let maxRolagem = 1;
  const medeAltura = () => { maxRolagem = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  medeAltura();
  addEventListener('resize', medeAltura, { passive: true });
  addEventListener('load', medeAltura);
  if ('ResizeObserver' in window) new ResizeObserver(medeAltura).observe(document.body);

  let pendente = false;
  function aoRolar() {
    pendente = false;
    const y = window.scrollY;
    nav.classList.toggle('rolou', y > 20);
    nav.classList.toggle('escondida', y > 500 && y > ultimoY + 4);
    if (y < ultimoY - 4) nav.classList.remove('escondida');
    ultimoY = y;
    barra.style.transform = `scaleX(${Math.min(1, y / maxRolagem)})`;
    const mostra = y > innerHeight * .8 && !finalVisivel;
    flutuante.classList.toggle('visivel', mostra);
    flutuante.tabIndex = mostra ? 0 : -1;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { finalVisivel = e.isIntersecting; aoRolar(); }, { threshold: .15 }).observe(final);
  }
  addEventListener('scroll', () => {
    if (!pendente) { pendente = true; requestAnimationFrame(aoRolar); }
  }, { passive: true });
  aoRolar();

  /* ---------- Grades animadas param quando saem da tela ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('parada', !e.isIntersecting)));
    $$('.grade').forEach((g) => io.observe(g));
  }

  /* ---------- Vídeos: tocam só quando aparecem ---------- */
  $$('video').forEach((v) => {
    if (!motion) { v.removeAttribute('autoplay'); return; }
    if (!('IntersectionObserver' in window)) { v.play().catch(() => {}); return; }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
    }, { threshold: .2 }).observe(v);
  });

  /* ---------- Comparador antes e depois ---------- */
  const comp = $('[data-comparador]');
  if (comp) {
    const range = $('.comp-range', comp);
    const setPos = (v) => comp.style.setProperty('--pos', v + '%');
    range.addEventListener('input', () => setPos(range.value));
    setPos(range.value);
    $$('.troca').forEach((b) => b.addEventListener('click', () => {
      const n = b.dataset.par;
      $('[data-antes]', comp).src = `assets/img/poliana-${n}-antes.jpg`;
      $('[data-depois]', comp).src = `assets/img/poliana-${n}-depois.jpg`;
      $$('.troca').forEach((x) => { x.classList.toggle('ativa', x === b); x.setAttribute('aria-pressed', x === b); });
      range.value = 50; setPos(50);
      if (anima) gsap.fromTo(comp, { scale: .97 }, { scale: 1, duration: .6, ease: 'expo.out' });
    }));
    // dica de que dá para arrastar: a linha passeia uma vez quando aparece
    if (anima) {
      ScrollTrigger.create({
        trigger: comp, start: 'top 70%', once: true,
        onEnter: () => {
          const o = { v: 50 };
          gsap.timeline().to(o, { v: 22, duration: .7, ease: 'power2.inOut', onUpdate: () => setPos(o.v) })
            .to(o, { v: 76, duration: .9, ease: 'power2.inOut', onUpdate: () => setPos(o.v) })
            .to(o, { v: 50, duration: .6, ease: 'power2.out', onUpdate: () => { setPos(o.v); range.value = o.v; } });
        }
      });
    }
  }

  /* ---------- Funil de 3 perguntas ---------- */
  const quiz = $('[data-quiz]');
  if (quiz) {
    const passos = $$('.quiz-passo', quiz);
    const etapa = $('[data-etapa]', quiz);
    const barraQuiz = $('[data-barra]', quiz);
    const voltar = $('[data-voltar]', quiz);
    const dica = $('[data-dica]', quiz);
    const previa = $('[data-previa]', quiz);
    const enviar = $('[data-enviar]', quiz);
    const enviarTxt = $('[data-enviar-txt]', quiz);
    const ajuda = $('[data-ajuda]', quiz);
    const nome = quiz.elements.nome;
    let atual = 0;

    const valor = (n) => (quiz.elements[n] && quiz.elements[n].value) || '';

    function mensagem() {
      const n = nome.value.trim();
      return `Olá, Vinicius! ${n ? 'Sou ' + n + ' e vim' : 'Vim'} pelo site. ` +
        `Meu objetivo é ${valor('objetivo')}. Hoje ${valor('momento')} e treino ${valor('local')}. ` +
        `Quero saber como funciona a consultoria online.`;
    }
    function atualizaMensagem() {
      const m = mensagem();
      previa.textContent = m;
      enviar.href = linkContato(m);
    }
    enviarTxt.textContent = WHATSAPP ? 'Enviar no WhatsApp' : 'Enviar no direct';
    ajuda.textContent = WHATSAPP ? 'Abre o WhatsApp com a mensagem pronta.' : 'A mensagem é copiada e o direct do Instagram abre. É só colar.';

    function vaiPara(i) {
      const de = passos[atual];
      const para = passos[i];
      const frente = i > atual;
      atual = i;
      etapa.textContent = i + 1;
      barraQuiz.style.width = ((i + 1) / passos.length * 100) + '%';
      voltar.disabled = i === 0;
      dica.textContent = i === passos.length - 1 ? 'Confira e envie' : 'Escolha uma opção';
      if (i === passos.length - 1) atualizaMensagem();
      const troca = () => {
        de.classList.remove('ativo');
        para.classList.add('ativo');
        const foco = para.querySelector('input:checked') || para.querySelector('input');
        if (foco) foco.focus({ preventScroll: true });
      };
      if (!anima) { troca(); return; }
      gsap.to(de, {
        x: frente ? -30 : 30, autoAlpha: 0, duration: .22, ease: 'power2.in',
        onComplete: () => {
          gsap.set(de, { clearProps: 'all' });
          troca();
          gsap.fromTo(para, { x: frente ? 30 : -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .45, ease: 'expo.out', clearProps: 'all' });
          gsap.fromTo($$('.opcao, .campo, .previa, [data-enviar]', para), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, stagger: .05, ease: 'expo.out', clearProps: 'all' });
        }
      });
    }

    quiz.addEventListener('change', (e) => {
      if (e.target.type !== 'radio') return;
      const idx = passos.indexOf(e.target.closest('.quiz-passo'));
      if (idx === atual && atual < passos.length - 1) setTimeout(() => vaiPara(atual + 1), 260);
    });
    nome.addEventListener('input', atualizaMensagem);
    voltar.addEventListener('click', () => { if (atual > 0) vaiPara(atual - 1); });
    quiz.addEventListener('submit', (e) => e.preventDefault());
    enviar.addEventListener('click', () => {
      atualizaMensagem();
      if (!WHATSAPP) { copia(mensagem()); mostraAviso('Mensagem copiada. É só colar no direct.'); }
    });
  }

  /* ---------- Destaques vermelhos ---------- */
  const marcadores = $$('.marcador');
  if (anima) {
    marcadores.forEach((m) => {
      m.classList.add('js-marcador');
      ScrollTrigger.create({ trigger: m, start: 'top 85%', once: true, onEnter: () => m.classList.add('visivel') });
    });
  }

  /* ---------- Ajustes do búlgaro: o vídeo fixo acompanha a lista ---------- */
  const ajustes = $$('.ajuste');
  const hudNum = $('[data-hud-num]');
  const hudTxt = $('[data-hud-txt]');
  function ativaAjuste(i) {
    ajustes.forEach((a, j) => a.classList.toggle('ativo', j === i));
    hudNum.textContent = String(i + 1).padStart(2, '0');
    if (anima) {
      gsap.fromTo(hudTxt, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .45, ease: 'expo.out' });
    }
    hudTxt.textContent = ajustes[i].dataset.ajuste;
  }
  if (ajustes.length) {
    if (anima) {
      ajustes.forEach((a, i) => ScrollTrigger.create({
        trigger: a, start: 'top 62%', end: 'bottom 62%',
        onEnter: () => ativaAjuste(i), onEnterBack: () => ativaAjuste(i)
      }));
      ativaAjuste(0);
    } else {
      ajustes.forEach((a) => a.classList.add('ativo'));
    }
  }

  if (!anima) {
    $$('.intro').forEach((el) => el.remove());
    html.classList.remove('com-intro');
    return;
  }

  /* =========================================================
     Animações (GSAP)
     ========================================================= */

  /* ---------- Abertura + entrada do topo ---------- */
  const palavras = $$('.topo-titulo .palavra');
  const topoTl = gsap.timeline({ paused: true });
  topoTl
    .from('.nav', { yPercent: -100, autoAlpha: 0, duration: .8, ease: 'expo.out' })
    .from('.topo-rotulo', { y: 20, autoAlpha: 0, duration: .6, ease: 'expo.out' }, '<.1')
    .from(palavras, { yPercent: 110, rotate: 4, autoAlpha: 0, duration: 1, stagger: .07, ease: 'expo.out' }, '<.05')
    .from('.topo-titulo .marca-fundo', { scaleX: 0, duration: .8, ease: 'expo.inOut' }, '-=.75')
    .from('.topo-sub, .topo-botoes, .topo-provas li', { y: 22, autoAlpha: 0, duration: .8, stagger: .06, ease: 'expo.out' }, '-=.55')
    .from('.cartao-video', { clipPath: 'inset(100% 0 0 0)', duration: 1.1, ease: 'expo.inOut' }, .35)
    .from('.cartao-video .video', { scale: 1.3, duration: 1.6, ease: 'expo.out' }, '<.2')
    .from('.topo-midia .canto', { scale: 0, duration: .6, ease: 'back.out(3)' }, '-=.9')
    .from('.anot', { x: -16, autoAlpha: 0, duration: .6, stagger: .15, ease: 'expo.out' }, '-=.6')
    .from('.selo-insta, .rolar', { autoAlpha: 0, duration: .6 }, '-=.3');

  const intro = $('.intro');
  if (html.classList.contains('com-intro') && intro) {
    try { sessionStorage.setItem('vf-intro', '1'); } catch (e) {}
    const introTl = gsap.timeline({
      onComplete: () => { intro.remove(); html.classList.remove('com-intro'); ScrollTrigger.refresh(); }
    });
    introTl
      .from('.intro .grade', { autoAlpha: 0, duration: .5 })
      .from('.intro-vf .vf-v', { xPercent: -60, autoAlpha: 0, duration: .55, ease: 'expo.out' }, '<.1')
      .from('.intro-vf .vf-f', { xPercent: 60, autoAlpha: 0, duration: .55, ease: 'expo.out' }, '<')
      .from('.intro-nome span', { yPercent: 100, autoAlpha: 0, duration: .6, stagger: .08, ease: 'expo.out' }, '-=.3')
      .from('.intro-tag', { letterSpacing: '1em', autoAlpha: 0, duration: .7, ease: 'expo.out' }, '-=.4')
      .to('.intro-cortina', { scaleY: 1, duration: .55, ease: 'expo.in' }, '+=.35')
      .set('.intro-centro, .intro .grade', { autoAlpha: 0 })
      .set('.intro-cortina', { transformOrigin: 'top' })
      .to('.intro-cortina', { scaleY: 0, duration: .6, ease: 'expo.out' })
      .to(intro, { autoAlpha: 0, duration: .01 }, '<.25')
      .add(() => topoTl.play(), '<-.2');
    intro.addEventListener('click', () => introTl.progress(1), { once: true });
  } else {
    topoTl.play();
  }

  /* ---------- Cartão do vídeo inclina com o mouse ---------- */
  const tilt = $('[data-tilt]');
  if (tilt && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const rx = gsap.quickTo(tilt, 'rotationX', { duration: .8, ease: 'power3' });
    const ry = gsap.quickTo(tilt, 'rotationY', { duration: .8, ease: 'power3' });
    gsap.set(tilt, { transformPerspective: 900 });
    $('.topo').addEventListener('pointermove', (e) => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      ry(x * 10); rx(-y * 8);
    });
    $('.topo').addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  /* ---------- Topo some em profundidade ao rolar ---------- */
  gsap.to('.topo-texto', { yPercent: -12, autoAlpha: .2, ease: 'none', scrollTrigger: { trigger: '.topo', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.topo-midia', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.topo', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- Faixa: acelera e inverte com a rolagem ---------- */
  const trilho = $('.faixa-trilho');
  const loop = gsap.to(trilho, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
  // um único tween reaproveitado (antes eram dois tweens novos a cada evento de rolagem)
  const velocidade = gsap.quickTo(loop, 'timeScale', { duration: .6, ease: 'power3.out' });
  let sentido = 1, voltaTimer;
  ScrollTrigger.create({
    trigger: '.faixa', start: 'top bottom', end: 'bottom top',
    onToggle: (st) => (st.isActive ? loop.resume() : loop.pause()),
    onUpdate: (st) => {
      sentido = st.direction;
      velocidade(sentido * Math.min(5, 1 + Math.abs(st.getVelocity()) / 400));
      clearTimeout(voltaTimer);
      voltaTimer = setTimeout(() => velocidade(sentido), 160);
    }
  });

  /* ---------- Revelações genéricas ---------- */
  ScrollTrigger.batch('[data-revela]', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: .1, ease: 'expo.out', clearProps: 'transform' })
  });

  /* ---------- Títulos: cada linha sobe ---------- */
  $$('.titulo, .final-titulo').forEach((t) => {
    gsap.from(t, { clipPath: 'inset(0 0 100% 0)', y: 30, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 88%', once: true } });
  });

  /* ---------- Cartões de dor: carimbo "achismo" bate ---------- */
  $$('.dor').forEach((d, i) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: d, start: 'top 82%', once: true }, delay: i * .12 });
    tl.from(d.querySelector('.carimbo'), { scale: 2.6, autoAlpha: 0, rotate: -30, duration: .45, ease: 'power4.in' }, .5)
      .fromTo(d, { x: 0 }, { x: 4, duration: .05, repeat: 3, yoyo: true, ease: 'none', clearProps: 'x' });
    gsap.from(d.querySelector('.dor-num'), { yPercent: 60, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: d, start: 'top 85%', once: true } });
  });

  /* ---------- Vídeo do búlgaro entra com máscara ---------- */
  gsap.from('.cb-quadro', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: '.cb-quadro', start: 'top 80%', once: true } });

  /* ---------- Extensora: seta desenha ---------- */
  const seta = $('.ce-seta path');
  if (seta) {
    const len = seta.getTotalLength();
    gsap.fromTo(seta, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.ce-comparar', start: 'top 85%', once: true } });
  }
  gsap.from('.ce-foto img', { scale: 1.25, ease: 'none', scrollTrigger: { trigger: '.ce-foto', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.set('.ce-foto', { overflow: 'hidden' });

  /* ---------- Caneta: palavra gigante desliza ---------- */
  gsap.fromTo('.caneta-palavra', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: '.caneta', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.caneta-foto img', { clipPath: 'inset(0 100% 0 0)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: '.caneta-foto', start: 'top 80%', once: true } });

  /* ---------- Resultados: fotos coladas com fita, parallax leve ---------- */
  $$('.jen-foto').forEach((f, i) => {
    gsap.to(f, { yPercent: [-6, 6, -3][i], ease: 'none', scrollTrigger: { trigger: '.res-jennifer', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- Passos: linha preenche ---------- */
  const linhaP = $('.passos-linha span');
  if (linhaP) {
    gsap.fromTo(linhaP, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.passos', start: 'top 75%', end: 'bottom 60%', scrub: .6 } });
  }
  gsap.from('.passo-num', { scale: 0, rotate: -90, duration: .7, stagger: .12, ease: 'back.out(2)', scrollTrigger: { trigger: '.passos', start: 'top 80%', once: true } });

  /* ---------- Final: foto sobe da grade ---------- */
  gsap.from('.final-foto img', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.from('.final-titulo .marca-fundo', { scaleX: 0, duration: .9, ease: 'expo.inOut', scrollTrigger: { trigger: '.final-titulo', start: 'top 80%', once: true } });

  /* ---------- Botões magnéticos ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnetico').forEach((b) => {
      const mx = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' });
      const my = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .25);
        my((e.clientY - r.top - r.height / 2) * .35);
      });
      b.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
