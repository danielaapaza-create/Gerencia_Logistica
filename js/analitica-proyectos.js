const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
const num = s => parseFloat(String(s||'').replace('%','').replace(',','.')) || 0;

const companySelect = document.getElementById('aCompany');
const areaSelect = document.getElementById('aArea');
uniq(analyticsData.map(x=>x.empresa)).forEach(v=>companySelect.insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
uniq(analyticsData.map(x=>x.area)).forEach(v=>areaSelect.insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));

function renderAnalytics(){
  const q = document.getElementById('aSearch').value.toLowerCase();
  const company = companySelect.value;
  const area = areaSelect.value;
  const rows = analyticsData.filter(x =>
    (!q || [x.dashboard,x.area,x.responsable,x.jefatura,x.gerencia,x.empresa].join(' ').toLowerCase().includes(q)) &&
    (company==='TODAS' || x.empresa===company) &&
    (area==='TODAS' || x.area===area)
  );

  const grouped = {};
  rows.forEach(x => {
    grouped[x.empresa] ??= {};
    grouped[x.empresa][x.area] ??= [];
    grouped[x.empresa][x.area].push(x);
  });

  const order = ['SAN FERNANDO','CHIMU',...uniq(Object.keys(grouped))];
  const companies = uniq(order).filter(x=>grouped[x]);

  document.getElementById('companyGrid').innerHTML = companies.length ? companies.map((co,ci)=>{
    const areas = Object.keys(grouped[co]).sort((a,b)=>a.localeCompare(b,'es'));
    const total = areas.reduce((n,a)=>n+grouped[co][a].length,0);
    const isChimu = co.toUpperCase()==='CHIMU';
    return `<article class="company-card ${isChimu?'chimu':''}">
      <div class="company-title">
        <div class="company-name"><div class="company-logo">${isChimu?'CH':'SF'}</div><div><strong>${esc(co)}</strong><span>${co.toUpperCase()==='SAN FERNANDO'?'La buena familia':'Así nos gusta el pollo'}</span></div></div>
        <span class="company-count">${total} dashboard${total===1?'':'s'}</span>
      </div>
      ${areas.map((ar,i)=>`<div class="area-row" data-area-key="${esc(co+'|'+ar)}">
        <button class="area-button" type="button" onclick="toggleArea(this)">
          <span class="area-left"><span class="area-dot"></span><strong>${esc(ar)}</strong></span>
          <span style="display:flex;align-items:center;gap:10px"><span class="area-count">${grouped[co][ar].length} dashboard${grouped[co][ar].length===1?'':'s'}</span><span class="chev">⌄</span></span>
        </button>
        <div class="dash-list">${grouped[co][ar].map(x=>`
          <div class="dashboard">
            <div><h4>${esc(x.dashboard)}</h4><div class="dashboard-meta">Responsable: <b>${esc(x.responsable||'—')}</b> · Jefatura: <b>${esc(x.jefatura||'—')}</b><br>Actualización: ${esc(x.fecha||'—')} ${esc(x.hora||'')}</div></div>
            ${/^https?:\/\//i.test(x.url) ? `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">ABRIR POWER BI ↗</a>` : `<span class="no-link">ENLACE PENDIENTE</span>`}
          </div>`).join('')}</div>
      </div>`).join('')}
    </article>`;
  }).join('') : '<div style="grid-column:1/-1;padding:35px;text-align:center;color:#7b8fa4;font-size:10px">No hay dashboards con los filtros seleccionados.</div>';
}
function toggleArea(btn){ btn.closest('.area-row').classList.toggle('open'); }
companySelect.addEventListener('change',renderAnalytics);
areaSelect.addEventListener('change',renderAnalytics);
document.getElementById('aSearch').addEventListener('input',renderAnalytics);
renderAnalytics();

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
