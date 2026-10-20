(() => {
  const words = {
    en: { hint:'Swipe or use the arrows to explore',previous:'Previous cards',next:'Next cards',page:'Show page',courses:'Language courses',details:'Course preparation details',menu:'Menu',expand:'Expand navigation',collapse:'Collapse navigation' },
    fr: { hint:'Faites glisser ou utilisez les flèches',previous:'Cartes précédentes',next:'Cartes suivantes',page:'Afficher la page',courses:'Formations linguistiques',details:'Détails des préparations',menu:'Menu',expand:'Développer le menu',collapse:'Réduire le menu' },
    de: { hint:'Wischen oder die Pfeile verwenden',previous:'Vorherige Karten',next:'Nächste Karten',page:'Seite anzeigen',courses:'Sprachkurse',details:'Kursvorbereitung im Detail',menu:'Menü',expand:'Navigation erweitern',collapse:'Navigation verkleinern' }
  };
  Object.assign(words.en,{pause:'Pause',play:'Play',autoplay:'Pause automatic sliding'});
  Object.assign(words.fr,{pause:'Pause',play:'Lecture',autoplay:'Mettre le défilement automatique en pause'});
  Object.assign(words.de,{pause:'Pause',play:'Start',autoplay:'Automatisches Gleiten pausieren'});
  const copy = () => words[document.documentElement.lang] || words.en;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('header nav');
  nav.id = 'site-navigation';
  menu.setAttribute('aria-controls', nav.id);
  menu.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span class="menu-label"></span>';
  function updateMenu() {
    menu.querySelector('.menu-label').textContent = copy().menu;
    menu.setAttribute('aria-label', menu.getAttribute('aria-expanded') === 'true' ? copy().collapse : copy().expand);
  }
  new MutationObserver(updateMenu).observe(menu, {attributes:true,attributeFilter:['aria-expanded']});
  matchMedia('(max-width:1100px)').addEventListener('change', event => {
    if (!event.matches) { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.focus();
    }
  });
  const localize = [];
  document.querySelectorAll('.detail-grid').forEach((track,index) => {
    const cards = [...track.querySelectorAll(':scope > article')];
    if (cards.length < 2) return;
    track.classList.add('is-carousel');
    track.id ||= `course-carousel-${index}`;
    track.tabIndex = 0;
    track.setAttribute('role','region');
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.innerHTML = '<span class="carousel-hint"></span><div class="carousel-dots"></div><button class="carousel-arrow previous" type="button">←</button><span class="carousel-counter" aria-live="polite" aria-atomic="true"></span><button class="carousel-arrow next" type="button">→</button>';
    track.after(controls);
    const autoplayButton=document.createElement('button');
    autoplayButton.type='button';autoplayButton.className='carousel-autoplay';
    controls.querySelector('.carousel-dots').after(autoplayButton);
    const hint=controls.querySelector('.carousel-hint'),dots=controls.querySelector('.carousel-dots'),previous=controls.querySelector('.previous'),next=controls.querySelector('.next'),counter=controls.querySelector('.carousel-counter');
    previous.setAttribute('aria-controls',track.id);
    next.setAttribute('aria-controls',track.id);
    let points=[],active=0,frame,timer,inView=false,userPaused=false,hovered=false,focused=false;
    function scheduleAutoplay() {
      clearTimeout(timer);
      if(userPaused||preference.matches||hovered||focused||!inView||document.hidden||points.length<2||document.body.classList.contains('animations-paused'))return;
      timer=setTimeout(()=>{go((active+1)%points.length);scheduleAutoplay();},1200);
    }
    function go(page) {
      track.scrollTo({left:points[Math.max(0,Math.min(page,points.length-1))],behavior:preference.matches?'instant':'smooth'});
    }
    function update() {
      frame=undefined;
      active=points.reduce((best,point,i)=>Math.abs(point-track.scrollLeft)<Math.abs(points[best]-track.scrollLeft)?i:best,0);
      previous.disabled=active===0;
      next.disabled=active===points.length-1;
      const value=`${String(active+1).padStart(2,'0')} / ${String(points.length).padStart(2,'0')}`;
      if(counter.textContent!==value)counter.textContent=value;
      [...dots.children].forEach((dot,i)=>dot.setAttribute('aria-current',String(i===active)));
    }
    function refresh() {
      const priorPoints=points;
      const priorPage=active;
      const maximum=Math.max(0,track.scrollWidth-track.clientWidth);
      const values=[0,...cards.map(card=>Math.min(maximum,Math.max(0,card.offsetLeft-3))),maximum];
      points=values.filter((value,i)=>!values.slice(0,i).some(prior=>Math.abs(prior-value)<2)).sort((a,b)=>a-b);
      dots.replaceChildren(...points.map((_,i)=>{
        const dot=document.createElement('button');dot.type='button';dot.className='carousel-dot';
        dot.setAttribute('aria-label',`${copy().page} ${i+1}`);dot.setAttribute('aria-controls',track.id);
        dot.addEventListener('click',()=>go(i));return dot;
      }));
      if(points.length!==priorPoints.length || points.some((point,i)=>Math.abs(point-priorPoints[i])>2)) {
        track.scrollTo({left:points[Math.min(priorPage,points.length-1)],behavior:'instant'});
      }
      update();
      scheduleAutoplay();
    }
    function translate() {
      hint.textContent=copy().hint;previous.setAttribute('aria-label',copy().previous);next.setAttribute('aria-label',copy().next);
      track.setAttribute('aria-label',copy().details);
      autoplayButton.textContent=userPaused?copy().play:copy().pause;
      autoplayButton.setAttribute('aria-label',userPaused?copy().play:copy().autoplay);
      autoplayButton.setAttribute('aria-pressed',String(userPaused));
      autoplayButton.disabled=preference.matches;
      counter.setAttribute('aria-live',userPaused||preference.matches?'polite':'off');
      [...dots.children].forEach((dot,i)=>dot.setAttribute('aria-label',`${copy().page} ${i+1}`));
    }
    previous.addEventListener('click',()=>go(active-1));
    next.addEventListener('click',()=>go(active+1));
    track.addEventListener('keydown',event=>{
      if(event.target!==track)return;
      if(event.key==='ArrowRight'){event.preventDefault();go(active+1);}
      if(event.key==='ArrowLeft'){event.preventDefault();go(active-1);}
      if(event.key==='Home'){event.preventDefault();go(0);}
      if(event.key==='End'){event.preventDefault();go(points.length-1);}
    });
    track.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
    autoplayButton.addEventListener('click',()=>{userPaused=!userPaused;translate();scheduleAutoplay();});
    [track,controls].forEach(element=>{
      element.addEventListener('mouseenter',()=>{hovered=true;scheduleAutoplay();});
      element.addEventListener('mouseleave',()=>{hovered=false;scheduleAutoplay();});
      element.addEventListener('focusin',()=>{focused=true;scheduleAutoplay();});
      element.addEventListener('focusout',()=>queueMicrotask(()=>{focused=track.contains(document.activeElement)||controls.contains(document.activeElement);scheduleAutoplay();}));
    });
    new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;scheduleAutoplay();},{threshold:.35}).observe(track);
    new MutationObserver(scheduleAutoplay).observe(document.body,{attributes:true,attributeFilter:['class']});
    document.addEventListener('visibilitychange',scheduleAutoplay);
    preference.addEventListener('change',()=>{translate();scheduleAutoplay();});
    new ResizeObserver(refresh).observe(track);
    refresh();translate();localize.push(translate);
  });
  const languageControls=document.querySelector('.languages');
  languageControls.setAttribute('role','group');
  const languageNames={en:'English',fr:'Français',de:'Deutsch'};
  languageControls.querySelectorAll('[data-lang]').forEach(button=>{
    button.setAttribute('aria-label',languageNames[button.dataset.lang]);
    button.setAttribute('lang',button.dataset.lang);
    button.title=languageNames[button.dataset.lang];
  });
  function translateAll(){
    updateMenu();localize.forEach(update=>update());
    languageControls.dataset.active=document.documentElement.lang;
    languageControls.setAttribute('aria-label',{en:'Website language',fr:'Langue du site',de:'Sprache der Website'}[document.documentElement.lang]||'Website language');
  }
  new MutationObserver(translateAll).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  translateAll();
  new ResizeObserver(()=>{
    document.documentElement.style.setProperty('--site-header-height',`${Math.ceil(document.querySelector('header').getBoundingClientRect().height)+16}px`);
  }).observe(document.querySelector('header'));
})();
