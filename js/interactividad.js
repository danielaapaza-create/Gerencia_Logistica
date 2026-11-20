/* V18 interactividad: progreso, navegación activa, reveal y retorno superior */
document.addEventListener('DOMContentLoaded',()=>{
  const progress=document.createElement('div'); progress.id='scrollProgress'; document.body.appendChild(progress);
  const top=document.createElement('button'); top.id='backTop'; top.type='button'; top.innerHTML='↑'; top.title='Volver arriba'; document.body.appendChild(top);
  const nav=[...document.querySelectorAll('.navlinks a[href^="#"]')];
  const sections=[...document.querySelectorAll('main section[id]')];
  const update=()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=(max>0?(scrollY/max)*100:0)+'%';
    top.classList.toggle('show',scrollY>650);
    let current='inicio';
    sections.forEach(sec=>{if(scrollY>=sec.offsetTop-180) current=sec.id});
    nav.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));
  };
  addEventListener('scroll',update,{passive:true}); update();
  top.onclick=()=>scrollTo({top:0,behavior:'smooth'});
  const revealEls=[...document.querySelectorAll('.section-head,.mission-card,.role,.business,.network-card,.analytics-shell,.project-card,.event-card,.tech-card')];
  revealEls.forEach(el=>el.classList.add('reveal'));
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -40px'});
  revealEls.forEach(el=>io.observe(el));
  /* Cerrar/abrir secciones con doble clic en su encabezado; mantiene los controles internos funcionales. */
  document.querySelectorAll('.is-collapsible > .container > .section-head').forEach(h=>{
    h.title='Clic para contraer o expandir';
  });
});
