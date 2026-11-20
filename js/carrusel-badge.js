document.addEventListener('DOMContentLoaded',()=>{
  const stage=document.querySelector('.hero-slideshow');
  if(!stage) return;
  const badge=document.createElement('div');
  badge.className='hero-live-badge';
  badge.innerHTML='<span></span> CARRUSEL AUTOMÁTICO';
  stage.appendChild(badge);
});
