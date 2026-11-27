const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
const num = s => parseFloat(String(s||'').replace('%','').replace(',','.')) || 0;

/* La sección Analítica (catálogo de dashboards) está en js/analitica.js. */

const pCompany = document.getElementById('pCompany');
const pResponsible = document.getElementById('pResponsible');
uniq(projectData.map(x=>x.responsable)).forEach(v=>pResponsible.insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
const pType = document.getElementById('pType');
uniq(projectData.map(x=>x.empresa)).forEach(v=>pCompany.insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));

function money(v){
  const n = parseFloat(String(v||'').replace(/[^\d.-]/g,'')) || 0;
  return n ? 'S/ '+n.toLocaleString('es-PE',{maximumFractionDigits:0}) : '—';
}
function renderProjects(){
  const q=document.getElementById('pSearch').value.toLowerCase();
  const co=pCompany.value, ty=pType.value;
  const rows=projectData.filter(x =>
    (!q || [x.proyecto,x.negocio,x.responsable,x.tecnologia,x.fase,x.empresa].join(' ').toLowerCase().includes(q)) &&
    (co==='TODAS' || x.empresa===co) &&
    (ty==='TODOS' || x.tipo===ty)
  );
  document.getElementById('projectList').innerHTML = rows.length ? rows.map(x=>`
    <article class="project ${x.tipo==='Automatización'?'auto':''}">
      <div class="project-type"><span class="type">${esc(x.tipo)}</span><span class="phase">${esc(x.fase)}</span></div>
      <h4>${esc(x.proyecto)}</h4>
      <div class="project-grid">
        <div><small>Empresa</small><b>${esc(x.empresa)}</b></div>
        <div><small>Negocio</small><b>${esc(x.negocio)}</b></div>
        <div><small>Responsable</small><b>${esc(x.responsable)}</b></div>
        <div><small>Tecnología</small><b>${esc(x.tecnologia)}</b></div>
        <div><small>ERP SAP</small><b>${esc(x.erp)}</b></div>
        <div><small>Impacto</small><b>${money(x.ahorro)}</b></div>
      </div>
      <div class="progress-head"><span>AVANCE</span><span>${esc(x.avance)}</span></div>
      <div class="progress"><i style="width:${Math.min(100,num(x.avance))}%"></i></div>
      <div class="project-foot"><span>${x.replica==='SI'?'↗ Réplica':'• Iniciativa'}</span><span>${esc(x.estadoReplica||x.estadoErp||'')}</span></div>
    </article>`).join('') : '<div style="grid-column:1/-1;padding:35px;text-align:center;color:#7b8fa4;font-size:10px">No hay iniciativas con los filtros seleccionados.</div>';
}
pCompany.addEventListener('change',renderProjects); pResponsible.addEventListener('change',renderProjects);
pType.addEventListener('change',renderProjects);
document.getElementById('pSearch').addEventListener('input',renderProjects);
renderProjects();
