const SKILL_ICONS = {"html": "html5", "css": "css3", "javascript": "javascript", "java": "java", "c++": "cplusplus", "github": "github", "python": "python", "linux": "linux", "oop": "oop", "dsa": "dsa"};
const DEFAULTS = {"name": "Sabin Sijapati", "tagline": "Computer Science Student | Aspiring Software Developer", "about": "Hi, I’m Sabin! I’m studying at Sinclair Community College and working toward a career in software development. I’m interested in building useful applications and learning about cloud computing and AI.", "skills": "HTML, CSS, JavaScript, Java, C++, OOP, DSA, GitHub, Python, Linux", "email": "sabinsijapati06@gmail.com", "github": "https://github.com/sabinsijapati06", "linkedin": "https://www.linkedin.com/in/sabin-sijapati-1150a6310/", "background": "", "projects": [{"title": "Cave Diver Pathfinding Visualizer", "description": "A Java Swing application that generates a random 10 × 10 cave and highlights an escape route within a depth limit.", "technology": "Java, Swing, recursion, DSA"}, {"title": "Birthday Database", "description": "A C++ console application for managing birthday records with a binary search tree.", "technology": "C++, binary search trees, file handling, DSA"}, {"title": "Graph Representations & Traversal", "description": "A C++ coursework project comparing adjacency matrices and adjacency lists, with depth-first and breadth-first traversal.", "technology": "C++, graphs, BFS, DFS, DSA"}, {"title": "Catacomb Crawler", "description": "A turn-based Java console game with a configurable dungeon, a hero, monsters, and an escape objective.", "technology": "Java, OOP, inheritance"}, {"title": "Personal Portfolio Website", "description": "A responsive personal website with a photo welcome screen, separate content views, and skill-based project filtering.", "technology": "HTML, CSS, JavaScript, GitHub"}]};

const KEY = 'sabin-portfolio-selected-v2';
const localDemo = location.protocol === 'file:' || ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
function validPhoto(value) { return typeof value === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value); }
function safeLink(value) { try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
let data = structuredClone(DEFAULTS);
if (localDemo) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === 'object') {
      for (const k of Object.keys(DEFAULTS)) if (k !== 'projects' && typeof saved[k] === 'string') data[k] = saved[k];
      if (Array.isArray(saved.projects) && saved.projects.length === DEFAULTS.projects.length) data.projects = saved.projects.map((p,i) => Object.fromEntries(Object.keys(DEFAULTS.projects[i]).map(k => [k,typeof p?.[k] === 'string' ? p[k] : DEFAULTS.projects[i][k]])));
    }
  } catch { /* Default content remains usable when storage is unavailable. */ }
}
const editor = document.getElementById('editor');
if (!editor) {
  document.querySelector('h1').textContent = data.name;
  const footerName = document.querySelector('.footer-name');
  if (footerName) footerName.textContent = data.name;
  document.querySelector('.welcome-copy > p:not(.eyebrow)').textContent = data.tagline;
  document.querySelector('#about .about-intro').textContent = data.about;
  const skills = document.querySelector('.skills-list'); skills.replaceChildren();
  data.skills.split(',').map(s=>s.trim()).filter(Boolean).forEach(s=>{ const li=document.createElement('li'); const link=document.createElement('a');
    const iconName=SKILL_ICONS[s.toLowerCase()];
    if(iconName){const img=document.createElement('img');img.src='images/skills/'+iconName+'.svg';img.alt='';img.width=28;img.height=28;img.className='skill-logo'+(iconName==='github'?' skill-logo-github':'');link.append(img);}
    const label=document.createElement('span');label.className='skill-flip';
    label.setAttribute('aria-hidden','true');link.setAttribute('aria-label',s);
    const inner=document.createElement('span');inner.className='skill-flip-inner';
    for(const face of ['front','back']){const text=document.createElement('span');text.className='skill-flip-'+face;text.textContent=s;inner.append(text);}
    label.append(inner);link.append(label);
    link.href='#projects?skill='+encodeURIComponent(s);li.append(link);skills.append(li); });
  document.querySelectorAll('#projects article').forEach((a,i)=>{
    a.querySelector('h3').textContent=data.projects[i].title;
    a.querySelector('p').textContent=data.projects[i].description;
    const strong=a.querySelector('p strong'); const p=strong.parentNode; p.replaceChildren(strong,document.createTextNode(' '+data.projects[i].technology));
  });
  const links=document.querySelectorAll('#contact a');
  links[0].href='mailto:'+encodeURIComponent(data.email);
  links[1].href=safeLink(data.github)||'#contact'; links[2].href=safeLink(data.linkedin)||'#contact';
  if (validPhoto(data.background)) document.querySelector('.welcome').style.backgroundImage = 'linear-gradient(90deg,rgba(5,15,25,.85),rgba(5,15,25,.5)),url("'+data.background+'")';
  if (!localDemo) document.querySelector('.admin-link').hidden=true;
} else {
  const status=document.getElementById('status');
  const say = message => status.textContent=message;
  const login=document.getElementById('login');
  if (!localDemo) {
    document.getElementById('enter').disabled=true;
    say('The demo editor is available only on your computer. Online admin access is not configured.');
  }
  let background=data.background;
  for(const name of ['name','tagline','about','skills','email','github','linkedin']) editor.elements.namedItem(name).value=data[name];
  const fields=document.getElementById('project-fields');
  data.projects.forEach((p,i)=>{
    const set=document.createElement('fieldset'); const legend=document.createElement('legend'); legend.textContent='Project '+(i+1); set.append(legend);
    for(const key of ['title','description','technology']) { const label=document.createElement('label'); label.textContent=key[0].toUpperCase()+key.slice(1); const input=document.createElement(key==='description'?'textarea':'input'); input.name='project-'+i+'-'+key; input.value=p[key]; input.required=true; input.maxLength=4000; label.append(input); set.append(label); }
    fields.append(set);
  });
  document.getElementById('enter').onclick=()=>{ if(!localDemo)return; login.hidden=true; editor.hidden=false; editor.elements.namedItem('name').focus(); say('Local demo opened. No authentication has taken place.'); };
  document.getElementById('exit').onclick=()=>{ editor.hidden=true; login.hidden=false; document.getElementById('enter').focus(); say('Demo closed. Saved local edits are retained.'); };
  document.getElementById('photo').onchange=async event=>{
    const file=event.target.files[0]; if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){say('Choose a JPG, PNG, or WebP under 2 MB.'); event.target.value=''; return;}
    const reader=new FileReader(); reader.onload=()=>{background=reader.result; say('Photo selected. Click Save local changes to apply it.');}; reader.onerror=()=>say('Could not read this photo. Try another file.'); reader.readAsDataURL(file);
  };
  document.getElementById('remove-photo').onclick=()=>{background=''; document.getElementById('photo').value=''; say('Original welcome photo selected. Save to apply.');};
  editor.onsubmit=event=>{
    event.preventDefault(); if(!localDemo)return;
    const next=structuredClone(data);
    for(const name of ['name','tagline','about','skills','email','github','linkedin']) next[name]=editor.elements.namedItem(name).value.trim();
    if(!safeLink(next.github)||!safeLink(next.linkedin)){say('Contact links must start with https:// or http://.');return;}
    next.background=background;
    next.projects=DEFAULTS.projects.map((p,i)=>Object.fromEntries(Object.keys(p).map(key=>[key,editor.elements.namedItem('project-'+i+'-'+key).value.trim()])));
    try {localStorage.setItem(KEY,JSON.stringify(next));data=next;say('Saved in this browser. View portfolio to see your changes.');} catch {say('Could not save: browser storage may be blocked or full. Try a smaller background photo.');}
  };
  document.getElementById('preview').onclick=()=>location.href='index.html';
  document.getElementById('export').onclick=()=>{ const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})); const a=document.createElement('a'); a.href=url;a.download='portfolio-content-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Exported the last saved content.'); };
}

// An optional screenshot can be added later without showing a broken image.
document.querySelectorAll('.project-image').forEach(image => {
  image.addEventListener('error', () => { image.hidden = true; });
  if (image.complete && !image.naturalWidth) image.hidden = true;
});
