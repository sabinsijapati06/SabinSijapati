// Hash routes work on GitHub Pages and when index.html is opened locally.
(() => {
  const hero = document.querySelector('.welcome');
  const content = document.getElementById('portfolio-content');
  const topbar = document.querySelector('.page-topbar');
  const contact = document.getElementById('contact');
  const title = document.getElementById('view-title');
  const sections = ['about','skills','projects'].map(id => document.getElementById(id));
  const titles = {portfolio:'My Portfolio',about:'About Me',skills:'My Skills',projects:'My Projects',contact:'Get in touch'};
  const cards = [...document.querySelectorAll('#projects article')];
  const menu = document.getElementById('site-menu');
  const menuButton = document.getElementById('menu-open');
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
  function render(initial = false) {
    closeMenu();
    const [route, query = ''] = location.hash.slice(1).split('?');
    const skill = route === 'projects' ? new URLSearchParams(query).get('skill') || '' : '';
    const home = !Object.hasOwn(titles,route);
    document.body.classList.toggle('is-welcome',home);
    hero.hidden = !home;
    topbar.hidden = home;
    content.hidden = home;
    contact.hidden = home;
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
    title.textContent = 'My Portfolio';
    document.title = home ? 'Sabin Sijapati | Welcome' : (skill ? skill + ' Projects' : titles[route]) + ' | Sabin Sijapati';
    document.querySelectorAll('#site-menu nav a').forEach(link => {
      if(link.getAttribute('href') === '#' + route) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    const target = home ? hero : route === 'portfolio' ? title : document.getElementById(route);
    const behavior = initial || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (home) window.scrollTo({top:0,behavior:'auto'});
    else target.scrollIntoView({behavior,block:'start'});
    if (!initial) {
      const focusTarget = home ? hero.querySelector('.brand') : target;
      if (!home) focusTarget.setAttribute('tabindex','-1');
      focusTarget.focus({preventScroll:true});
    }
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
      render();
    });
  });
  window.addEventListener('hashchange',() => render());
  render(true);
})();
