(function(){
  const type = document.getElementById('eventTypeFilter');
  const business = document.getElementById('eventBusinessFilter');
  const count = document.getElementById('eventCount');
  const cards = Array.from(document.querySelectorAll('.event-real'));
  function filterEvents(){
    const t=(type?.value||'').toUpperCase();
    const b=(business?.value||'').toUpperCase();
    let visible=0;
    cards.forEach(card=>{
      const okT=!t || (card.dataset.type||'').toUpperCase()===t;
      const okB=!b || (card.dataset.business||'').toUpperCase()===b;
      card.style.display=(okT&&okB)?'flex':'none';
      if(okT&&okB) visible++;
    });
    if(count) count.textContent=visible;
  }
  type?.addEventListener('change',filterEvents);
  business?.addEventListener('change',filterEvents);
})();
