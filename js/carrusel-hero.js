(function(){
  const slides=[...document.querySelectorAll('.hero-slide')];
  const dots=[...document.querySelectorAll('.hero-dot')];
  const prev=document.querySelector('.hero-prev'), next=document.querySelector('.hero-next');
  if(!slides.length) return;
  let index=0, timer;
  function show(i){
    index=(i+slides.length)%slides.length;
    slides.forEach((s,k)=>s.classList.toggle('active',k===index));
    dots.forEach((d,k)=>d.classList.toggle('active',k===index));
  }
  function restart(){clearInterval(timer);timer=setInterval(()=>show(index+1),2000)}
  prev?.addEventListener('click',()=>{show(index-1);restart()});
  next?.addEventListener('click',()=>{show(index+1);restart()});
  dots.forEach(d=>d.addEventListener('click',()=>{show(Number(d.dataset.slide));restart()}));
  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){show(index-1);restart()}
    if(e.key==='ArrowRight'){show(index+1);restart()}
  });
  const stage=document.querySelector('.hero-slideshow');
  let touchX=0;
  stage?.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});
  stage?.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-touchX;
    if(Math.abs(dx)>45){show(index+(dx<0?1:-1));restart()}
  },{passive:true});
  show(0); restart();
})();
