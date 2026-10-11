// Hash routes keep this site compatible with GitHub Pages.
(() => {
  const hero = document.querySelector('.welcome');
  const content = document.getElementById('portfolio-content');
  const topbar = document.querySelector('.page-topbar');
  const footer = document.getElementById('contact');
  const title = document.getElementById('view-title');
  const sections = ['about','skills','projects'].map(id => document.getElementById(id));
  const titles = {portfolio:'My Portfolio',about:'About Me',skills:'My Skills',projects:'My Projects',contact:'Get in touch'};
  function render(initial = false) {
    const route = location.hash.slice(1);
    const home = !Object.hasOwn(titles,route);
    document.body.classList.toggle('is-welcome',home);
    hero.hidden = !home;
    topbar.hidden = home;
    content.hidden = home || route === 'contact';
    footer.hidden = route !== 'contact';
    sections.forEach(section => {
      section.hidden = home || (route !== 'portfolio' && section.id !== route);
      section.querySelector('h2').hidden = route === section.id;
    });
    title.textContent = titles[route] || 'My Portfolio';
    document.title = home ? 'Sabin Sijapati | Welcome' : titles[route] + ' | Sabin Sijapati';
    document.querySelectorAll('.page-topbar nav a').forEach(link => {
      if(link.getAttribute('href') === '#' + route) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    window.scrollTo(0,0);
    if(!initial) {
      const target = home ? hero.querySelector('.brand') : route === 'contact' ? footer : title;
      target.focus({preventScroll:true});
    }
  }
  window.addEventListener('hashchange',() => render());
  render(true);
})();
