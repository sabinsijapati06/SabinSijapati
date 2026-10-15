// Hash routes work on GitHub Pages and when index.html is opened locally.
(() => {
  const hero = document.querySelector('.welcome');
  const content = document.getElementById('portfolio-content');
  const topbar = document.querySelector('.page-topbar');
  const contact = document.getElementById('contact');
  const sections = ['about','skills','projects'].map(id => document.getElementById(id));
  const titles = {portfolio:'About Me',about:'About Me',skills:'My Skills',projects:'My Projects',contact:'Get in touch'};
  const cards = [...document.querySelectorAll('#projects article')];
  const menu = document.getElementById('site-menu');
  const menuButton = document.getElementById('menu-open');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const autoButton = document.createElement('button');
  autoButton.type = 'button';
  autoButton.className = 'auto-scroll-button roll-link';
  setAutoLabel('Auto Scroll');
  autoButton.setAttribute('aria-label','Start automatic scrolling');
  autoButton.setAttribute('aria-pressed','false');
  menuButton.before(autoButton);
  function setAutoLabel(text) {
    const mask = document.createElement('span');
    mask.className = 'roll-mask';
    mask.setAttribute('aria-hidden','true');
    for (let i = 0; i < 2; i++) {
      const label = document.createElement('span');
      label.className = 'roll-label';
      label.textContent = text;
      mask.append(label);
    }
    autoButton.replaceChildren(mask);
  }

  let autoFrame = null;
  let autoRunning = false;
  let lastAutoTime = 0;
  let autoElapsed = 0;
  let autoPosition = 0;
  function stopAutoScroll() {
    autoRunning = false;
    if (autoFrame !== null) cancelAnimationFrame(autoFrame);
    autoFrame = null;
    document.documentElement.classList.remove('auto-scrolling');
    setAutoLabel('Auto Scroll');
    autoButton.setAttribute('aria-label','Start automatic scrolling');
    autoButton.setAttribute('aria-pressed','false');
  }
  function autoStep(time) {
    if (!autoRunning) return;
    const dt = lastAutoTime ? Math.min(time - lastAutoTime,50) : 0;
    lastAutoTime = time;
    autoElapsed += dt;
    const bottom = Math.max(0,document.documentElement.scrollHeight - innerHeight);
    const remaining = bottom - autoPosition;
    if (remaining <= 1) {
      window.scrollTo({top:bottom,behavior:'instant'});
      stopAutoScroll();
      return;
    }
    // Gentle acceleration and deceleration, independent of display refresh rate.
    const ramp = Math.min(1,autoElapsed / 1100);
    const easeIn = ramp * ramp * (3 - 2 * ramp);
    const easeOut = Math.min(1,Math.max(.15,remaining / 140));
    autoPosition = Math.min(bottom,autoPosition + 48 * easeIn * easeOut * dt / 1000);
    window.scrollTo({top:autoPosition,behavior:'instant'});
    autoFrame = requestAnimationFrame(autoStep);
  }
  autoButton.addEventListener('click', () => {
    if (autoRunning) { stopAutoScroll(); return; }
    const bottom = document.documentElement.scrollHeight - innerHeight;
    if (scrollY >= bottom - 2) return;
    autoRunning = true;
    autoPosition = scrollY;
    lastAutoTime = 0;
    autoElapsed = 0;
    document.documentElement.classList.add('auto-scrolling');
    setAutoLabel('Pause Scroll');
    autoButton.setAttribute('aria-label','Pause automatic scrolling');
    autoButton.setAttribute('aria-pressed','true');
    autoFrame = requestAnimationFrame(autoStep);
  });
  window.addEventListener('wheel',stopAutoScroll,{passive:true});
  window.addEventListener('touchstart',stopAutoScroll,{passive:true});
  window.addEventListener('keydown', event => {
    if (['Escape','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) stopAutoScroll();
  });
  document.addEventListener('pointerdown',event => {
    if (autoRunning && !autoButton.contains(event.target)) stopAutoScroll();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAutoScroll(); });
  window.addEventListener('resize',stopAutoScroll);

  const animatedSections = [...sections, contact];
  const revealAnimations = new Map();
  const revealed = new Set();
  function revealItems(section) {
    if (section.id === 'about') return [...section.querySelectorAll('.about-photo-area, .about-copy > *')];
    return section.id === 'contact' ? [...section.querySelectorAll('.contact-content > *')] : [...section.children];
  }
  function revealItem(item, delay = 0) {
    if (revealed.has(item) || revealAnimations.has(item) || item.hidden) return;
    revealed.add(item);
    if (motionPreference.matches || !item.animate) { item.classList.remove('reveal-pending'); return; }
    const animation = item.animate([
      {opacity:0, transform:'perspective(1000px) translateY(48px) rotateX(12deg)', filter:'blur(10px)'},
      {opacity:1, transform:'perspective(1000px) translateY(0) rotateX(0deg)', filter:'blur(0)'}
    ], {duration:1300, delay, easing:'cubic-bezier(.16,1,.3,1)', fill:'both'});
    revealAnimations.set(item,animation);
    animation.onfinish = () => {
      item.classList.remove('reveal-pending');
      animation.cancel();
      revealAnimations.delete(item);
    };
  }
  function replayVisible(section) {
    let index = 0;
    revealItems(section).forEach(item => {
      const rect = item.getBoundingClientRect();
      if (!item.hidden && rect.bottom > 100 && rect.top < innerHeight - 25) {
        revealItem(item,index++ * 180);
      }
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      let index = 0;
      entries.forEach(entry => {
        if (entry.isIntersecting && !revealed.has(entry.target)) {
          revealItem(entry.target,index++ * 160);
        }
      });
    }, {threshold:0, rootMargin:'-90px 0px -35px 0px'});
    animatedSections.forEach(section => revealItems(section).forEach(item => {
      if (!motionPreference.matches && item.animate) item.classList.add('reveal-pending');
      observer.observe(item);
    }));
  }
  // Re-arm only well outside the viewport, avoiding animation-edge loops.
  // The same scroll events are fired by manual scrolling and Auto Scroll.
  let revealFrame = null;
  function updateScrollReveals() {
    revealFrame = null;
    if (document.body.classList.contains('is-welcome') || motionPreference.matches) return;
    const top = topbar.getBoundingClientRect().bottom;
    let index = 0;
    animatedSections.forEach(section => revealItems(section).forEach(item => {
      if (item.hidden || !item.getClientRects().length) return;
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -160 || rect.top > innerHeight + 160) {
        if (revealed.has(item)) {
          revealAnimations.get(item)?.cancel();
          revealAnimations.delete(item);
          revealed.delete(item);
          item.classList.add('reveal-pending');
        }
      } else if (rect.bottom > top && rect.top < innerHeight - 20 && !revealed.has(item)) {
        revealItem(item,Math.min(index++ * 100,300));
      }
    }));
  }
  window.addEventListener('scroll', () => {
    if (revealFrame === null) revealFrame = requestAnimationFrame(updateScrollReveals);
  }, {passive:true});
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      revealAnimations.forEach(animation => animation.cancel());
      revealAnimations.clear();
      document.querySelectorAll('.reveal-pending').forEach(item => item.classList.remove('reveal-pending'));
    }
  });
  document.addEventListener('focusin', event => {
    const pending = event.target.closest('.reveal-pending');
    if (pending) {
      revealAnimations.get(pending)?.cancel();
      revealAnimations.delete(pending);
      pending.classList.remove('reveal-pending');
      revealed.add(pending);
    }
  });
  function closeMenu() { if (menu.open) menu.close(); }
  menuButton.addEventListener('click', () => {
    menu.showModal();
    menuButton.setAttribute('aria-expanded','true');
    document.body.classList.add('menu-is-open');
  });
  document.getElementById('menu-close').addEventListener('click', closeMenu);
  menu.addEventListener('close', () => {
    menuButton.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-is-open');
    if (!topbar.hidden) menuButton.focus({preventScroll:true});
  });
  // A click on the native dialog backdrop has coordinates outside the panel.
  menu.addEventListener('click', event => {
    const rect = menu.getBoundingClientRect();
    if (event.target === menu && (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom)) closeMenu();
  });
  menu.querySelectorAll('nav a').forEach(link => link.addEventListener('click', closeMenu));
  function matches(project, skill) {
    const tokens = project.technology.toLowerCase().split(/,|\band\b/).map(s=>s.trim());
    const key = skill.toLowerCase();
    if (key === 'github' && project.title === 'Personal Portfolio Website') return true;
    if (key === 'dsa') return tokens.includes('dsa');
    return tokens.includes(key);
  }
  function render(initial = false, exploreEntry = false) {
    stopAutoScroll();
    closeMenu();
    const about = document.getElementById('about');
    about.classList.remove('about-entering');
    const [route, query = ''] = location.hash.slice(1).split('?');
    const skill = route === 'projects' ? new URLSearchParams(query).get('skill') || '' : '';
    const home = !Object.hasOwn(titles,route);
    document.body.classList.toggle('is-welcome',home);
    document.documentElement.classList.toggle('portfolio-open', !home);
    if (home) {
      revealed.clear();
      animatedSections.forEach(section => revealItems(section).forEach(item => {
        if (!motionPreference.matches && item.animate && 'IntersectionObserver' in window) item.classList.add('reveal-pending');
      }));
      revealAnimations.forEach(animation => animation.cancel());
      revealAnimations.clear();
    }
    hero.hidden = !home;
    topbar.hidden = home;
    content.hidden = home;
    contact.hidden = home;
    if (!home) document.documentElement.style.setProperty('--nav-height', topbar.getBoundingClientRect().height + 'px');
    sections.forEach(section => {
      section.hidden = home;
      section.querySelector('h2').hidden = false;
    });
    let count = 0;
    cards.forEach((card,i) => {
      card.hidden = !!skill && !matches(data.projects[i],skill);
      if (!card.hidden) count++;
    });
    const status = document.getElementById('filter-status');
    status.textContent = skill ? (count ? count + ' project' + (count === 1 ? '' : 's') + ' using ' + skill : 'No ' + skill + ' projects are featured yet. Choose “View all projects” to explore the current collection.') : 'Selected coursework and personal projects.';
    document.getElementById('clear-filter').hidden = !skill;
    document.title = home ? 'Sabin Sijapati | Welcome' : (skill ? skill + ' Projects' : titles[route]) + ' | Sabin Sijapati';
    document.querySelectorAll('#site-menu nav a').forEach(link => {
      if(link.getAttribute('href') === '#' + route) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    const target = home ? hero : route === 'portfolio' ? document.getElementById('about') : document.getElementById(route);
    const behavior = initial || exploreEntry || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (home) window.scrollTo({top:0,behavior:'auto'});
    else target.scrollIntoView({behavior,block:'start'});
    if (!initial) {
      const focusTarget = home ? hero.querySelector('.brand') : target;
      if (!home) focusTarget.setAttribute('tabindex','-1');
      focusTarget.focus({preventScroll:true});
    }
    if (!home && animatedSections.includes(target)) replayVisible(target);

  }
  // Two text layers produce the reference-inspired rolling button labels.
  document.querySelectorAll('.explore, .admin-link, .menu-button, nav a, #clear-filter, .project-source').forEach(link => {
    const label = link.textContent.trim();
    link.setAttribute('aria-label',label);
    link.classList.add('roll-link');
    link.replaceChildren();
    const mask=document.createElement('span'); mask.className='roll-mask'; mask.setAttribute('aria-hidden','true');
    for(let i=0;i<2;i++){const layer=document.createElement('span');layer.className='roll-label';layer.textContent=label;mask.append(layer);}
    link.append(mask);
  });
  document.querySelectorAll('.social-links a').forEach(link => {
    const label = link.querySelector('span');
    if (!label) return;
    const text=label.textContent;
    label.className='roll-mask';
    label.setAttribute('aria-hidden','true');
    link.setAttribute('aria-label',text);
    link.classList.add('roll-link');
    label.replaceChildren();
    for(let i=0;i<2;i++){const layer=document.createElement('span');layer.className='roll-label';layer.textContent=text;label.append(layer);}
  });
  // Handle repeated selections too, and prevent native anchor jumps.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const hash = link.getAttribute('href');
      if (location.hash !== hash) history.pushState(null,'',hash);
      render(false, link.classList.contains('explore'));
    });
  });
  window.addEventListener('hashchange',() => render());
  render(true);
})();
