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
  function matches(project, skill) {
    const tokens = project.technology.toLowerCase().split(/,|\band\b/).map(s=>s.trim());
    const key = skill.toLowerCase();
    if (key === 'github' && project.title === 'Personal Portfolio Website') return true;
    if (key === 'dsa') return tokens.some(t=>/recursion|trees|linked lists|traversal|arrays/.test(t));
    return tokens.includes(key);
  }
  function render(initial = false) {
    const [route, query = ''] = location.hash.slice(1).split('?');
    const skill = route === 'projects' ? new URLSearchParams(query).get('skill') || '' : '';
    const home = !Object.hasOwn(titles,route);
    document.body.classList.toggle('is-welcome',home);
    hero.hidden = !home;
    topbar.hidden = home;
    content.hidden = home || route === 'contact';
    contact.hidden = route !== 'contact' && route !== 'portfolio';
    sections.forEach(section => {
      section.hidden = home || (route !== 'portfolio' && section.id !== route);
      section.querySelector('h2').hidden = route === section.id;
    });
    let count = 0;
    cards.forEach((card,i) => {
      card.hidden = !!skill && !matches(data.projects[i],skill);
      if (!card.hidden) count++;
    });
    const status = document.getElementById('filter-status');
    status.textContent = skill ? (count ? count + ' project' + (count === 1 ? '' : 's') + ' using ' + skill : 'No ' + skill + ' projects are featured yet. Choose “View all projects” to explore the current collection.') : 'Selected coursework and personal projects.';
    document.getElementById('clear-filter').hidden = !skill;
    title.textContent = titles[route] || 'My Portfolio';
    document.title = home ? 'Sabin Sijapati | Welcome' : (skill ? skill + ' Projects' : titles[route]) + ' | Sabin Sijapati';
    document.querySelectorAll('.page-topbar nav a').forEach(link => {
      if(link.getAttribute('href') === '#' + route) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    window.scrollTo(0,0);
    if(!initial) (home ? hero.querySelector('.brand') : route === 'contact' ? contact : title).focus({preventScroll:true});
  }
  // Two text layers produce the reference-inspired rolling button labels.
  document.querySelectorAll('.explore, .admin-link, nav a, .skills-list a, #clear-filter').forEach(link => {
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
  window.addEventListener('hashchange',() => render());
  render(true);
})();
