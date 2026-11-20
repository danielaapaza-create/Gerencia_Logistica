document.addEventListener('DOMContentLoaded',()=>{
  const sections=[...document.querySelectorAll('main .section')];
  sections.forEach((section)=>{
    const head=section.querySelector(':scope > .container > .section-head');
    if(!head) return;
    section.classList.add('is-collapsible');
    const btn=document.createElement('button');
    btn.className='section-collapse';
    btn.type='button';
    btn.setAttribute('aria-label','Contraer o expandir sección');
    btn.textContent='⌄';
    head.appendChild(btn);
    const toggle=()=>{
      section.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded',String(!section.classList.contains('is-collapsed')));
    };
    btn.addEventListener('click',e=>{e.stopPropagation();toggle()});
    head.addEventListener('click',e=>{
      if(e.target.closest('a,button,input,select')) return;
      toggle();
    });
    btn.setAttribute('aria-expanded','true');
  });
});
