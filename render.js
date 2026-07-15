// ====== Состояние сворачиваемых секций (по умолчанию свёрнуты) ======
const collapsed={sales:true, expenses:true, archive:true};

// ====== Данные таймлайна запуска ======
const PHASES=[
  {s:"2026-06-29",e:"2026-07-02",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-07-01",e:"2026-07-14",n:"Прогрев к ЯДРУ",t:"warm"},
  {s:"2026-07-05",e:"2026-07-05",n:"Съёмка",t:"shoot"},
  {s:"2026-07-07",e:"2026-07-10",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-07-07",e:"2026-07-14",n:"Финальная упаковка ЯДРА",t:"pack"},
  {s:"2026-07-14",e:"2026-07-14",n:"Съёмка",t:"shoot"},
  {s:"2026-07-16",e:"2026-07-19",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-07-18",e:"2026-07-24",n:"СРМ",t:"crm"},
  {s:"2026-07-20",e:"2026-07-25",n:"Старт продаж ЯДРА",t:"sales"},
  {s:"2026-07-21",e:"2026-07-21",n:"Съёмка",t:"shoot"},
  {s:"2026-07-25",e:"2026-08-04",n:"Финальная упаковка КЛУБА",t:"pack"},
  {s:"2026-07-25",e:"2026-07-28",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-07-27",e:"2026-08-04",n:"Прогрев к КЛУБУ",t:"warm"},
  {s:"2026-07-30",e:"2026-07-30",n:"Съёмка",t:"shoot"},
  {s:"2026-08-03",e:"2026-08-06",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-08-05",e:"2026-08-10",n:"Продажи клуба",t:"sales"},
  {s:"2026-08-11",e:"2026-08-11",n:"Съёмка",t:"shoot"},
  {s:"2026-08-13",e:"2026-08-16",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-08-15",e:"2026-08-24",n:"Финальная упаковка РАСПРОДАЖИ",t:"pack"},
  {s:"2026-08-19",e:"2026-08-24",n:"Прогрев к РАСПРОДАЖЕ",t:"warm"},
  {s:"2026-08-20",e:"2026-08-20",n:"Съёмка",t:"shoot"},
  {s:"2026-08-22",e:"2026-08-25",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-08-25",e:"2026-09-01",n:"РАСПРОДАЖА",t:"sales"},
  {s:"2026-08-29",e:"2026-08-29",n:"Съёмка",t:"shoot"},
  {s:"2026-09-02",e:"2026-09-12",n:"Финальная упаковка БК",t:"pack"},
  {s:"2026-09-02",e:"2026-11-07",n:"Прогрев к БК",t:"warm"},
  {s:"2026-09-10",e:"2026-11-07",n:"Старт продаж БК",t:"sales"},
];
const LANE_CFG=[
  {t:"sales",label:"💸 Продажи",  color:"#3ecf8e"},
  {t:"warm", label:"🔥 Прогрев",  color:"#f97316"},
  {t:"pack", label:"🏁 Упаковка", color:"#5b9bd5"},
  {t:"prep", label:"⚡️ Съёмка", color:"#d4a24a"},
  {t:"crm",  label:"💻 СРМ",     color:"#c08ae8"},
  {t:"shoot",label:"🎬 Даты съёмок",color:"#888"},
];

function renderTimeline(){
  const todayStr=TODAY.toISOString().slice(0,10);
  const D0=new Date('2026-06-28T00:00:00'),D1=new Date('2026-11-08T00:00:00');
  const TOTAL=(D1-D0)/86400000;
  const LW=102,CX=LW+5,CW=760,ROW=30,HDR=26,PAD=8,W=LW+CW+PAD+10;
  const H=HDR+LANE_CFG.length*ROW+PAD+14;
  function dx(dateStr){return CX+(new Date(dateStr+'T00:00:00')-D0)/86400000/TOTAL*CW;}

  // Сетка и подписи месяцев
  const MONTHS=[['2026-07-01','Июль'],['2026-08-01','Август'],['2026-09-01','Сен.'],['2026-10-01','Окт.'],['2026-11-01','Ноя.']];
  let grid=MONTHS.map(([d,nm])=>{const x=dx(d).toFixed(1);return`<line x1="${x}" y1="${HDR-6}" x2="${x}" y2="${H-PAD-12}" stroke="var(--line)" stroke-width="1"/>
    <text x="${x}" y="${HDR-10}" font-size="10" fill="var(--dim)">${nm}</text>`;}).join('');

  // Линия «сегодня»
  const tx=dx(todayStr);
  const todayLine=tx>=CX&&tx<=CX+CW?`<line x1="${tx.toFixed(1)}" y1="${HDR-6}" x2="${tx.toFixed(1)}" y2="${H-PAD-12}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="${tx.toFixed(1)}" y="${H-PAD+2}" font-size="9" fill="var(--accent)" text-anchor="middle">сегодня</text>`:'';

  // Полосы по лейнам
  let labels='',bars='';
  LANE_CFG.forEach((lane,li)=>{
    const y=HDR+li*ROW,cy=y+ROW/2;
    labels+=`<text x="${LW-4}" y="${(cy+4).toFixed(1)}" text-anchor="end" font-size="11" fill="var(--mut)">${lane.label}</text>`;
    const events=PHASES.filter(p=>p.t===lane.t);
    if(lane.t==='shoot'){
      events.forEach(p=>{const x=dx(p.s);bars+=`<circle cx="${x.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="${lane.color}"><title>🎬 Съёмка · ${p.s.slice(5).replace('-','.')}</title></circle>`;});
    } else {
      events.forEach(p=>{
        const x1=dx(p.s),x2=Math.max(dx(p.e)+CW/TOTAL,x1+6),bw=x2-x1,bh=ROW-10,by=cy-bh/2;
        const done=new Date(p.e+'T23:59:59')<TODAY,now=new Date(p.s+'T00:00:00')<=TODAY&&TODAY<=new Date(p.e+'T23:59:59');
        const op=done?0.32:1;
        bars+=`<rect x="${x1.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh}" rx="3" fill="${lane.color}" opacity="${op}">
          <title>${p.n}\n${p.s.slice(5).replace('-','.')} — ${p.e.slice(5).replace('-','.')}</title></rect>`;
        if(now) bars+=`<rect x="${x1.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh}" rx="3" fill="none" stroke="white" stroke-width="1.5" opacity="0.7"/>`;
        if(bw>52){const nm=p.n.length>13?p.n.slice(0,12)+'…':p.n;bars+=`<text x="${(x1+4).toFixed(1)}" y="${(cy+4).toFixed(1)}" font-size="10" fill="${done?'var(--dim)':'white'}" font-weight="500" style="pointer-events:none">${nm}</text>`;}
      });
    }
  });

  document.getElementById('timelineGantt').innerHTML=`<div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
    <svg viewBox="0 0 ${W} ${H}" width="${W}" style="min-width:${W}px;max-width:100%;display:block">
      ${grid}${todayLine}${labels}${bars}
    </svg></div>`;

  // Список всех событий под Гантом
  const sorted=[...PHASES].sort((a,b)=>a.s.localeCompare(b.s));
  const fmtDate=d=>{const[,m,day]=d.split('-');return`${+day}.${+m}`;};
  const colOf=t=>LANE_CFG.find(l=>l.t===t)?.color||'var(--mut)';
  const emojiOf=t=>({sales:'💸',warm:'🔥',pack:'🏁',prep:'⚡️',crm:'💻',shoot:'🎬'}[t]||'');
  document.getElementById('timelineList').innerHTML=sorted.map(p=>{
    const done=new Date(p.e+'T23:59:59')<TODAY;
    const now=new Date(p.s+'T00:00:00')<=TODAY&&TODAY<=new Date(p.e+'T23:59:59');
    return`<div class="tlrow ${done?'tldone':now?'tlnow':''}">
      <span class="tldot" style="background:${colOf(p.t)}"></span>
      <span class="tldate">${fmtDate(p.s)}${p.s!==p.e?` — ${fmtDate(p.e)}`:''}</span>
      <span class="tlname">${emojiOf(p.t)} ${p.n}</span>
      ${now?'<span class="tlbadge">сейчас</span>':done?'<span class="tlbadge tldone">✓</span>':''}
    </div>`;
  }).join('');
}

function renderPhases(){
  const todayStr=TODAY.toISOString().slice(0,10);
  const active=PHASES.filter(p=>p.s<=todayStr&&todayStr<=p.e);
  const upcoming=PHASES.filter(p=>p.s>todayStr).slice(0,3);
  const colOf=t=>LANE_CFG.find(l=>l.t===t)?.color||'var(--accent)';
  const emojiOf=t=>({sales:'💸',warm:'🔥',pack:'🏁',prep:'⚡️',crm:'💻',shoot:'🎬'}[t]||'');
  const fmtD=d=>{const[,m,day]=d.split('-');return`${+day}.${+m}`;};
  let html='';
  if(active.length) html+=active.map(p=>`<div class="phase now" style="border-color:${colOf(p.t)}">
    <div class="pd" style="color:${colOf(p.t)}">${fmtD(p.s)}–${fmtD(p.e)}</div>
    <div class="pn">${emojiOf(p.t)} ${p.n}</div></div>`).join('');
  if(upcoming.length) html+=upcoming.map(p=>`<div class="phase">
    <div class="pd">${fmtD(p.s)}</div>
    <div class="pn">${emojiOf(p.t)} ${p.n}</div></div>`).join('');
  document.getElementById('phases').innerHTML=html||'<div class="empty">Все этапы запуска завершены.</div>';
}

function updateRhythmDerived(){
  document.getElementById('planMark').style.left=Math.min(100,planToDate()/S.goal*100).toFixed(1)+'%';
  const col=grossCollected(),ptd=planToDate(),rb=document.getElementById('rhythmBadge');
  if(ptd<1){rb.innerHTML=`<div class="rhythm n">Запуск только стартовал — план почти не накопился</div>`;}
  else{const r=col/ptd;let cls="n",txt="";
    if(r>=1.1){cls="g";txt=`Опережаем план на ${RUB(col-ptd)} ₽`;}
    else if(r>=0.95){cls="g";txt="На ритме — идём по плану";}
    else if(r>=0.8){cls="n";txt=`Чуть отстаём: −${RUB(ptd-col)} ₽ к плану`;}
    else{cls="b";txt=`Отстаём: −${RUB(ptd-col)} ₽ на сегодня`;}
    rb.innerHTML=`<div class="rhythm ${cls}">План на сегодня ≈ ${RUB(ptd)} ₽ · ${txt}</div>`;}
}
function renderOverview(){
  const gross=grossCollected(),net=netCollected(),exp=totalExp();
  document.getElementById('collected').innerHTML=RUB(gross)+'&nbsp;<small>₽ грязными</small>';
  document.getElementById('goalBar').style.width=Math.min(100,gross/S.goal*100).toFixed(1)+'%';
  document.getElementById('daysLeft').textContent=Math.max(0,Math.ceil((DEADLINE-TODAY)/864e5));
  updateRhythmDerived();
  const sales=S.sales.filter(s=>s.type==="продажа").reduce((a,s)=>a+(+s.qty||1),0);
  document.getElementById('kpis').innerHTML=[
    {l:"Чистые (после комиссий)",v:RUB(net),s:"₽"},
    {l:"Чистая прибыль",v:RUB(net-exp),s:"₽",cls:(net-exp)<0?"red":"green"},
    {l:"В предоплатах",v:RUB(totalPrepay()),s:"₽"},
    {l:"Продаж",v:RUB(sales),s:""}
  ].map(c=>`<div class="kpi"><div class="lab">${c.l}</div><div class="v num ${c.cls||''}">${c.v}${c.s?` <small>${c.s}</small>`:''}</div></div>`).join('');
  renderLeaderboard();renderPhases();renderRhythmRows();renderBestFormat();
}
function renderLeaderboard(){
  const data=S.products.map(p=>({p,rev:prodGross(p.id),units:prodUnits(p.id)})).sort((a,b)=>b.rev-a.rev);
  const max=Math.max(...data.map(d=>d.rev),1),any=data.some(d=>d.rev>0);
  document.getElementById('leaderboard').innerHTML=any?data.map(d=>`
    <div class="lbrow"><div class="lbname">${esc(d.p.name)}</div>
    <div class="lbbar"><div class="lbfill" style="width:${Math.max(2,d.rev/max*100)}%;background:${dirTag(d.p.tag)}"></div><span class="lbval">${RUB(d.rev)} ₽ · ${d.units} шт</span></div></div>`).join('')
    :`<div class="empty">Пока нет продаж. Внеси первую во вкладке «Продажи» — увидишь, какой продукт лидирует.</div>`;
}
function renderRhythmRows(){
  document.getElementById('rhythmRows').innerHTML=S.months.map((m,i)=>{
    const[y,mo]=m.key.split('-');const plan=+m.plan||0,fact=monthFact(m.key);
    const w=plan>0?Math.min(100,fact/plan*100):0;
    const col=plan===0?"var(--panel2)":fact>=plan?"linear-gradient(90deg,#3ecf8e,#5bd)":fact>=plan*0.8?"linear-gradient(90deg,#d4a24a,#e8c878)":"linear-gradient(90deg,#e5604d,#c44)";
    return `<div class="mrow"><div class="mlabel">${MN[+mo-1]} ${y.slice(2)}</div>
      <div><div class="mtrack"><div class="mfill" data-mfill="${i}" style="width:${w}%;background:${col}"></div></div>
      <div class="mnums"><span class="factval">факт ${RUB(fact)} ₽</span><div class="pf"><span>план</span><input class="num" type="number" min="0" data-mp="${i}" value="${plan||''}" placeholder="0"></div></div></div></div>`;
  }).join('');
  document.querySelectorAll('[data-mp]').forEach(el=>el.addEventListener('input',()=>{
    const i=+el.dataset.mp;S.months[i].plan=+el.value||0;
    const m=S.months[i],plan=+m.plan||0,fact=monthFact(m.key);
    const f=document.querySelector(`[data-mfill="${i}"]`);if(f)f.style.width=(plan>0?Math.min(100,fact/plan*100):0)+'%';
    updateRhythmDerived();save();
  }));
}

function buildSaleProducts(){document.getElementById('saleProduct').innerHTML=S.products.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');}
function renderSalesList(){
  const sorted=[...S.sales].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const wrap=document.getElementById('salesList');
  const head=`<div class="collapse-head" data-collapse="sales">
    <span class="ct">История операций <span class="cn">${sorted.length}</span></span>
    <span class="cc">${collapsed.sales?'▼ показать':'▲ скрыть'}</span></div>`;
  if(collapsed.sales){ wrap.innerHTML=head; bindCollapse(); return; }
  const list=sorted.length?sorted.map(s=>{
    const p=prod(s.product),pre=s.type==="предоплата",ref=s.type==="возврат";
    const meta=[s.date||'без даты',(+s.qty>1?s.qty+' шт':''),(+s.net!==+s.gross?'чистыми '+RUB(s.net)+' ₽':''),(pre?'предоплата':''),(ref?'возврат':''),(s.note?esc(s.note):'')].filter(Boolean).join(' · ');
    return `<div class="salerow"><span class="saledot" style="background:${ref?'var(--bad)':pre?'var(--warn)':(p?dirTag(p.tag):'var(--mut)')}"></span>
      <div class="saleinfo"><div class="sp">${p?esc(p.name):'—'}</div><div class="sm">${meta}</div></div>
      <div class="saleamt ${pre?'pre':''}" style="${ref?'color:var(--bad)':''}">${ref?'−':''}${RUB(s.gross)} ₽</div>
      <button class="del" data-sdel="${s.id}">×</button></div>`;
  }).join(''):`<div class="empty">Операций пока нет.</div>`;
  wrap.innerHTML=head+list;
  bindCollapse();
  document.querySelectorAll('[data-sdel]').forEach(el=>el.addEventListener('click',()=>{
    S.sales=S.sales.filter(x=>x.id!==el.dataset.sdel);renderSalesList();renderOverview();renderProducts();save();
  }));
}

function bindCollapse(){
  document.querySelectorAll('[data-collapse]').forEach(el=>{
    if(el._bound)return; el._bound=true;
    el.addEventListener('click',()=>{
      const k=el.dataset.collapse; collapsed[k]=!collapsed[k];
      if(k==='sales')renderSalesList(); else if(k==='expenses')renderExpenses(); else if(k==='archive')renderWeekly();
    });
  });
}

function renderProducts(){
  document.getElementById('productCards').innerHTML=S.products.map((p,i)=>{
    const gross=prodGross(p.id),net=prodNet(p.id),units=prodUnits(p.id),pre=prodPrepay(p.id),check=units>0?gross/units:0;
    return `<div class="card">
      <h3><input class="pnameedit" data-pn="${i}" value="${esc(p.name)}"><span class="tag ${p.tag}">продукт</span></h3>
      <div class="pedit">
        <div><label>Цена, ₽</label><input class="num" type="number" min="0" data-pp="${i}" value="${p.price||''}" placeholder="—"></div>
        <div><label>Статус</label><select data-pst="${i}">${PSTATUS.map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
        <div style="grid-column:1/-1"><label>Окно продаж</label><input data-pw="${i}" value="${esc(p.window)}" placeholder="когда продаём"></div>
      </div>
      <div class="psum">
        <span>Грязными<b class="num">${RUB(gross)} ₽</b></span>
        <span>Чистыми<b class="num">${RUB(net)} ₽</b></span>
        <span>Продано<b class="num">${units} шт</b></span>
        <span>Предоплаты<b class="num">${RUB(pre)} ₽</b></span>
        <span>Ср. чек<b class="num">${check?RUB(check)+' ₽':'—'}</b></span>
      </div></div>`;
  }).join('');
  document.querySelectorAll('[data-pn]').forEach(el=>el.addEventListener('input',()=>{S.products[+el.dataset.pn].name=el.value;buildSaleProducts();save();}));
  document.querySelectorAll('[data-pp]').forEach(el=>el.addEventListener('input',()=>{S.products[+el.dataset.pp].price=+el.value||0;save();}));
  document.querySelectorAll('[data-pw]').forEach(el=>el.addEventListener('input',()=>{S.products[+el.dataset.pw].window=el.value;save();}));
  document.querySelectorAll('[data-pst]').forEach(el=>el.addEventListener('change',()=>{S.products[+el.dataset.pst].status=el.value;save();}));
}

function isOverdue(tk){return tk.deadline&&tk.status!=="Готово"&&new Date(tk.deadline)<TODAY;}
function bestFormat(){let best=null;S.formats.forEach(f=>{if(f.name&&(+f.subs||0)>(best?+best.subs||0:-1))best=f;});return best;}
function renderBestFormat(){
  const b=bestFormat(),el=document.getElementById('bestFormat');if(!el)return;
  if(!b){el.innerHTML=`<div class="empty">Внеси статистику форматов во вкладке «Контент» — здесь появится лидер по подпискам.</div>`;return;}
  el.innerHTML=`<h3>${esc(b.name)}<span class="tag content">формат · по подпискам</span></h3>
    <div class="psum">
      <span>Подписок<b class="num">${RUB(b.subs)}</b></span>
      <span>Ср. охват<b class="num">${RUB(b.reach)}</b></span>
      <span>% репостов<b class="num">${(+b.repostPct||0)}%</b></span>
      <span>Роликов<b class="num">${(+b.made||0)} / 20</b></span>
      <span>Вердикт<b class="num" style="font-size:13px">${b.verdict||'—'}</b></span>
    </div>`;
}
function updateContentKpis(){
  const totVid=S.formats.reduce((s,f)=>s+(+f.made||0),0),subs=totalSubs(),best=bestFormat();
  document.getElementById('subCurrent').innerHTML=RUB(subs)+'&nbsp;<small>подписчиков</small>';
  document.getElementById('subBar').style.width=Math.min(100,subs/SUBGOAL*100).toFixed(1)+'%';
  document.getElementById('contentKpis').innerHTML=[
    {l:"Форматов в тесте",v:S.formats.filter(f=>f.name).length},{l:"Роликов выпущено",v:RUB(totVid)},
    {l:"Лучший формат",v:best&&best.name?esc(best.name):"—",small:true},{l:"Подписок с него",v:best?RUB(best.subs):"—"}
  ].map(c=>`<div class="kpi"><div class="lab">${c.l}</div><div class="v num" style="${c.small?'font-size:15px':''}">${c.v}</div></div>`).join('');
}
function renderContent(){
  updateContentKpis();
  document.getElementById('formatRows').innerHTML=S.formats.map((f,i)=>{
    const prog=Math.min(100,(+f.made||0)/20*100);
    return `<div class="fmtrow"><div class="fmttop"><input value="${esc(f.name)}" placeholder="Название формата" data-fn="${i}"><button class="del" data-fdel="${i}">×</button></div>
      <div class="fmtgrid">
        <div class="fmtcell"><label>Роликов / 20</label><input class="num" type="number" min="0" max="20" data-fmade="${i}" value="${f.made||''}" placeholder="0"></div>
        <div class="fmtcell"><label>Ср. охват</label><input class="num" type="number" min="0" data-freach="${i}" value="${f.reach||''}" placeholder="0"></div>
        <div class="fmtcell"><label>% репостов</label><input class="num" type="number" min="0" step="0.1" data-frep="${i}" value="${f.repostPct||''}" placeholder="0"></div>
        <div class="fmtcell"><label>Подписок</label><input class="num" type="number" min="0" data-fsubs="${i}" value="${f.subs||''}" placeholder="0"></div>
      </div>
      <div class="progress20"><div data-fprog="${i}" style="width:${prog}%"></div></div>
      <div class="verdict"><select data-fv="${i}">${VERDICTS.map(v=>`<option ${f.verdict===v?'selected':''}>${v}</option>`).join('')}</select></div></div>`;
  }).join('');
  document.querySelectorAll('[data-fn]').forEach(el=>el.addEventListener('input',()=>{S.formats[+el.dataset.fn].name=el.value;renderBestFormat();save();}));
  document.querySelectorAll('[data-fmade]').forEach(el=>el.addEventListener('input',()=>{const i=+el.dataset.fmade;S.formats[i].made=+el.value||0;const p=document.querySelector(`[data-fprog="${i}"]`);if(p)p.style.width=Math.min(100,(+el.value||0)/20*100)+'%';renderBestFormat();save();}));
  document.querySelectorAll('[data-freach]').forEach(el=>el.addEventListener('input',()=>{S.formats[+el.dataset.freach].reach=+el.value||0;renderBestFormat();save();}));
  document.querySelectorAll('[data-frep]').forEach(el=>el.addEventListener('input',()=>{S.formats[+el.dataset.frep].repostPct=+el.value||0;renderBestFormat();save();}));
  document.querySelectorAll('[data-fsubs]').forEach(el=>el.addEventListener('input',()=>{S.formats[+el.dataset.fsubs].subs=+el.value||0;updateContentKpis();renderBestFormat();save();}));
  document.querySelectorAll('[data-fv]').forEach(el=>el.addEventListener('change',()=>{S.formats[+el.dataset.fv].verdict=el.value;renderBestFormat();save();}));
  document.querySelectorAll('[data-fdel]').forEach(el=>el.addEventListener('click',()=>{S.formats.splice(+el.dataset.fdel,1);renderContent();save();}));
}

function updateExpenseTotals(){
  const tot=totalExp();
  document.getElementById('expTotal').textContent=RUB(tot)+' ₽';
  const byCat={};S.expenses.forEach(e=>{byCat[e.cat]=(byCat[e.cat]||0)+(+e.amount||0);});
  document.getElementById('catBreak').innerHTML=Object.entries(byCat).filter(([,v])=>v>0).map(([c,v])=>`<div class="catpill">${c}: <b class="num">${RUB(v)} ₽</b></div>`).join('')||'<div class="catpill">пока нет расходов</div>';
  const net=netCollected()-tot,np=document.getElementById('netProfit');np.textContent=RUB(net)+' ₽';np.style.color=net<0?'var(--bad)':'var(--good)';
}
function renderExpenses(){
  updateExpenseTotals();
  const wrap=document.getElementById('expenseRows');
  const head=`<div class="collapse-head" data-collapse="expenses">
    <span class="ct">Статьи расходов <span class="cn">${S.expenses.length}</span></span>
    <span class="cc">${collapsed.expenses?'▼ показать':'▲ скрыть'}</span></div>`;
  if(collapsed.expenses){ wrap.innerHTML=head; bindCollapse(); return; }
  const rows=S.expenses.map((e,i)=>`
    <div class="exprow"><div class="exptop"><input value="${esc(e.item)}" placeholder="Статья расхода" data-ei="${i}"><button class="del" data-edel="${i}">×</button></div>
    <div class="expmeta"><select data-ec="${i}">${CATS.map(c=>`<option ${e.cat===c?'selected':''}>${c}</option>`).join('')}</select>
    <input class="num" type="number" min="0" placeholder="Сумма ₽" data-ea="${i}" value="${e.amount||''}"></div></div>`).join('');
  wrap.innerHTML=head+rows;
  bindCollapse();
  document.querySelectorAll('[data-ei]').forEach(el=>el.addEventListener('input',()=>{S.expenses[+el.dataset.ei].item=el.value;save();}));
  document.querySelectorAll('[data-ec]').forEach(el=>el.addEventListener('change',()=>{S.expenses[+el.dataset.ec].cat=el.value;updateExpenseTotals();save();}));
  document.querySelectorAll('[data-ea]').forEach(el=>el.addEventListener('input',()=>{S.expenses[+el.dataset.ea].amount=+el.value||0;updateExpenseTotals();renderOverview();save();}));
  document.querySelectorAll('[data-edel]').forEach(el=>el.addEventListener('click',()=>{S.expenses.splice(+el.dataset.edel,1);renderExpenses();renderOverview();save();}));
}

function currentWeekStart(){ return weekStartISO(TODAY); }
function getOrCreateCurrentWeek(){
  const ws=currentWeekStart();
  let w=S.weeklyFocus.find(x=>x.weekStart===ws);
  if(!w){ w={weekStart:ws,items:[newWeekItem(),newWeekItem(),newWeekItem()]}; S.weeklyFocus.push(w); }
  return w;
}
function newWeekItem(){return {plan:"",fact:"",progress:0,subs:[]};}
function weekRangeLabel(ws){
  const start=new Date(ws+'T00:00:00'); const end=new Date(start); end.setDate(end.getDate()+6);
  const f=d=>d.getDate()+' '+MN[d.getMonth()];
  return f(start)+' – '+f(end);
}
function progColor(p){return p>=100?'var(--good)':p>=50?'var(--accent)':'var(--warn)';}

let openSubs=new Set();
function weekItemHTML(it,i,wKey){
  const p=+it.progress||0;
  const subs=it.subs||[];
  const doneN=subs.filter(s=>s.done).length;
  const key=wKey+'|'+i, open=openSubs.has(key);
  const subsHTML=open?`
    ${subs.map((s,si)=>`<div class="subrow">
      <input type="checkbox" data-subdone="${key}" data-subi="${si}" ${s.done?'checked':''}>
      <input class="subtext ${s.done?'sdone':''}" data-subtext="${key}" data-subi="${si}" value="${esc(s.text)}" placeholder="Подзадача">
      <button class="del" data-subdel="${key}" data-subi="${si}">×</button>
    </div>`).join('')}
    <button class="addbtn subadd" data-subadd="${key}">+ Подзадача</button>`:'';
  return `<div class="wkitem">
    <div class="wkihead">
      <span class="wknum">Цель ${i+1}</span>
      <span class="wkpct" style="color:${progColor(p)}">${p}%</span>
      <button class="del wkdel" data-wkdel="${i}" data-wk="${wKey}">×</button>
    </div>
    <input class="wktext" data-wkfield="plan" data-wki="${i}" data-wk="${wKey}" value="${esc(it.plan)}" placeholder="Цель недели">
    <input class="wktext wkfact" data-wkfield="fact" data-wki="${i}" data-wk="${wKey}" value="${esc(it.fact)}" placeholder="Факт: что реально вышло">
    <input class="wkrange" type="range" min="0" max="100" step="5" value="${p}" data-wkprog="${i}" data-wk="${wKey}" style="--c:${progColor(p)}">
    <div class="subhead" data-subtoggle="${key}">
      <span>Подзадачи${subs.length?` <b style="color:${doneN===subs.length?'var(--good)':'var(--mut)'}">${doneN}/${subs.length}</b>`:''}</span>
      <span style="color:var(--mut)">${open?'▲':'▼'}</span>
    </div>
    ${subsHTML}
  </div>`;
}

// Защита от двойной привязки: один обработчик на элемент+событие, повторный вызов игнорируется
function on(el,ev,fn){
  if(!el) return;
  el._b=el._b||{};
  if(el._b[ev]) return;
  el._b[ev]=1;
  el.addEventListener(ev,fn);
}
function subRef(key){
  const [wk,i]=key.split('|');
  const w=S.weeklyFocus.find(x=>x.weekStart===wk);
  return w&&w.items[+i]?w.items[+i]:null;
}
function bindWeekItemEvents(){
  document.querySelectorAll('[data-wkfield]').forEach(el=>on(el,'input',()=>{
    const w=S.weeklyFocus.find(x=>x.weekStart===el.dataset.wk); if(!w)return;
    w.items[+el.dataset.wki][el.dataset.wkfield]=el.value; save();
  }));
  document.querySelectorAll('[data-wkprog]').forEach(el=>on(el,'input',()=>{
    const w=S.weeklyFocus.find(x=>x.weekStart===el.dataset.wk); if(!w)return;
    w.items[+el.dataset.wkprog].progress=+el.value; renderWeekly(); save();
  }));
  document.querySelectorAll('[data-wkdel]').forEach(el=>on(el,'click',()=>{
    const w=S.weeklyFocus.find(x=>x.weekStart===el.dataset.wk); if(!w)return;
    w.items.splice(+el.dataset.wkdel,1); renderWeekly(); save();
  }));
  document.querySelectorAll('[data-subtoggle]').forEach(el=>on(el,'click',()=>{
    const k=el.dataset.subtoggle; openSubs.has(k)?openSubs.delete(k):openSubs.add(k); renderWeekly();
  }));
  document.querySelectorAll('[data-subadd]').forEach(el=>on(el,'click',()=>{
    const it=subRef(el.dataset.subadd); if(!it)return;
    it.subs.push({text:"",done:false}); renderWeekly(); save();
  }));
  document.querySelectorAll('[data-subdone]').forEach(el=>on(el,'change',()=>{
    const it=subRef(el.dataset.subdone); if(!it)return;
    it.subs[+el.dataset.subi].done=el.checked; renderWeekly(); save();
  }));
  document.querySelectorAll('[data-subtext]').forEach(el=>on(el,'input',()=>{
    const it=subRef(el.dataset.subtext); if(!it)return;
    it.subs[+el.dataset.subi].text=el.value; save();
  }));
  document.querySelectorAll('[data-subdel]').forEach(el=>on(el,'click',()=>{
    const it=subRef(el.dataset.subdel); if(!it)return;
    it.subs.splice(+el.dataset.subi,1); renderWeekly(); save();
  }));
}

function renderWeekly(){
  const w=getOrCreateCurrentWeek();
  document.getElementById('weekRange').textContent=weekRangeLabel(w.weekStart);
  const avg=w.items.length?Math.round(w.items.reduce((a,it)=>a+(+it.progress||0),0)/w.items.length):0;
  document.getElementById('weekItems').innerHTML=
    w.items.map((it,i)=>weekItemHTML(it,i,w.weekStart)).join('')+
    `<button class="addbtn" id="addWeekItem">+ Добавить задачу недели</button>
     <div class="wkavg">Средний прогресс недели: <b style="color:${progColor(avg)}">${avg}%</b></div>`;
  // Архив прошлых недель — свёрнут по умолчанию, внутри каждая неделя тоже раскрывается
  const history=[...S.weeklyFocus].filter(x=>x.weekStart!==w.weekStart).sort((a,b)=>b.weekStart.localeCompare(a.weekStart));
  const archHead=`<div class="collapse-head" data-collapse="archive">
    <span class="ct">Архив прошлых недель <span class="cn">${history.length}</span></span>
    <span class="cc">${collapsed.archive?'▼ показать':'▲ скрыть'}</span></div>`;
  const archBody=(collapsed.archive||!history.length)?'':history.map(h=>{
    const havg=h.items.length?Math.round(h.items.reduce((a,it)=>a+(+it.progress||0),0)/h.items.length):0;
    const open=editedWeeks.has(h.weekStart);
    return `<div class="wkhist">
      <div class="wkhistdate" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" data-wktoggle="${h.weekStart}">
        <span>${weekRangeLabel(h.weekStart)} · <b style="color:${progColor(havg)}">${havg}%</b></span>
        <span style="color:var(--mut)">${open?'▲ свернуть':'▼ редактировать'}</span>
      </div>
      ${open
        ? h.items.map((it,i)=>weekItemHTML(it,i,h.weekStart)).join('')+`<button class="addbtn" data-wkadd="${h.weekStart}">+ Задача</button>`
        : h.items.map(it=>`<div class="wkhistitem ${(+it.progress||0)>=100?'done':''}">${(+it.progress||0)>=100?'✓':(+it.progress||0)+'%'} ${esc(it.plan)||'—'}${it.fact?` <span style="color:var(--dim)">→ ${esc(it.fact)}</span>`:''}</div>`).join('')
      }
    </div>`;
  }).join('');
  document.getElementById('weekHistory').innerHTML=history.length?archHead+archBody:'<div class="empty">История появится после первой завершённой недели.</div>';

  // Обработчики вешаются ОДИН раз — только когда вся разметка уже на месте
  bindCollapse();
  bindWeekItemEvents();
  on(document.getElementById('addWeekItem'),'click',()=>{w.items.push(newWeekItem());renderWeekly();save();});
  document.querySelectorAll('[data-wktoggle]').forEach(el=>on(el,'click',()=>{
    const k=el.dataset.wktoggle; editedWeeks.has(k)?editedWeeks.delete(k):editedWeeks.add(k); renderWeekly();
  }));
  document.querySelectorAll('[data-wkadd]').forEach(el=>on(el,'click',()=>{
    const w2=S.weeklyFocus.find(x=>x.weekStart===el.dataset.wkadd); if(!w2)return;
    w2.items.push(newWeekItem()); renderWeekly(); save();
  }));
}
let editedWeeks=new Set();

function renderStats(){
  document.getElementById('statsDate').value=TODAY.toISOString().slice(0,10);
  const rows=[...S.statsHistory].sort((a,b)=>b.date.localeCompare(a.date));
  const NETS=[{k:'instagram',label:'Instagram',color:'#e1306c'},{k:'telegram',label:'Telegram',color:'#2aabee'},{k:'vk',label:'ВКонтакте',color:'#4a76a8'},{k:'youtube',label:'YouTube',color:'#ff0000'}];

  document.getElementById('statsHistory').innerHTML=rows.length?`
    <table class="statstbl">
      <thead><tr><th>Дата</th>${NETS.map(n=>`<th style="color:${n.color}">${n.label}</th>`).join('')}<th></th></tr></thead>
      <tbody>${rows.map((r,i)=>{
        const realIdx=S.statsHistory.findIndex(x=>x.date===r.date);
        const prev=rows[i+1];
        function diff(k){const d=(+r[k]||0)-(+prev?.[k]||0);if(!prev||d===0)return'';const col=d>0?'var(--good)':'var(--bad)';return`<span style="color:${col};font-size:11px">${d>0?'+':''}${d.toLocaleString('ru-RU')}</span>`;}
        return`<tr><td class="mono">${r.date}</td>${NETS.map(n=>`<td>${(+r[n.k]||0).toLocaleString('ru-RU')}<br>${diff(n.k)}</td>`).join('')}<td><button class="del" data-sdel="${realIdx}">×</button></td></tr>`;
      }).join('')}</tbody>
    </table>`:'<div class="empty">Замеров пока нет</div>';

  document.querySelectorAll('[data-sdel]').forEach(el=>el.addEventListener('click',()=>{S.statsHistory.splice(+el.dataset.sdel,1);renderStats();renderStatsChart();save();}));
  renderStatsChart();
}

function renderStatsChart(){
  const el=document.getElementById('statsChartWrap');
  const rows=[...S.statsHistory].sort((a,b)=>a.date.localeCompare(b.date));
  if(rows.length<2){el.innerHTML='<div class="empty">Нужно минимум 2 замера для графика.</div>';return;}
  const NETS=[{k:'instagram',label:'IG',color:'#e1306c'},{k:'telegram',label:'TG',color:'#2aabee'},{k:'vk',label:'VK',color:'#4a76a8'},{k:'youtube',label:'YT',color:'#ff0000'}];
  const W=560,H=200,PL=48,PR=16,PT=12,PB=36;
  const allVals=rows.flatMap(r=>NETS.map(n=>+r[n.k]||0)).filter(v=>v>0);
  if(!allVals.length){el.innerHTML='<div class="empty">Все значения нули — добавь реальные цифры.</div>';return;}
  const minV=Math.min(...allVals),maxV=Math.max(...allVals);
  const pad=(maxV-minV)*0.1||maxV*0.1||1;
  const lo=Math.max(0,minV-pad),hi=maxV+pad;
  const cx=i=>(PL+(W-PL-PR)*i/(rows.length-1)).toFixed(1);
  const cy=v=>(PT+(H-PT-PB)*(1-(v-lo)/(hi-lo))).toFixed(1);
  const fmt=n=>n>=1000?(n/1000).toFixed(1)+'k':n;
  const yTicks=4;
  let gridLines='',yLabels='';
  for(let i=0;i<=yTicks;i++){const v=lo+(hi-lo)*i/yTicks;const y=cy(v);gridLines+=`<line x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`;yLabels+=`<text x="${PL-4}" y="${+y+4}" text-anchor="end" fill="var(--dim)" font-size="10">${fmt(Math.round(v))}</text>`;}
  let xLabels='';
  const step=Math.max(1,Math.floor(rows.length/5));
  rows.forEach((r,i)=>{if(i%step===0||i===rows.length-1)xLabels+=`<text x="${cx(i)}" y="${H-PB+14}" text-anchor="middle" fill="var(--dim)" font-size="10">${r.date.slice(5)}</text>`;});
  let lines='',dots='';
  NETS.forEach(n=>{
    const pts=rows.map((r,i)=>`${cx(i)},${cy(+r[n.k]||lo)}`).join(' ');
    lines+=`<polyline points="${pts}" fill="none" stroke="${n.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.9"/>`;
    rows.forEach((r,i)=>{const v=+r[n.k]||0;if(v>0)dots+=`<circle cx="${cx(i)}" cy="${cy(v)}" r="3.5" fill="${n.color}"><title>${n.label}: ${v.toLocaleString('ru-RU')}\n${r.date}</title></circle>`;});
  });
  const legend=NETS.map(n=>`<span style="display:inline-flex;align-items:center;gap:5px;margin-right:12px;font-size:12px;color:var(--mut)"><span style="width:14px;height:3px;background:${n.color};display:inline-block;border-radius:2px"></span>${n.label}</span>`).join('');
  el.innerHTML=`<div style="margin-bottom:8px">${legend}</div><svg viewBox="0 0 ${W} ${H}" width="100%" style="overflow:visible">${gridLines}${yLabels}${xLabels}${lines}${dots}</svg>`;
}

// ====== Отчёт по неделям ======
let openReports=new Set();

function newReport(){
  const to=TODAY.toISOString().slice(0,10);
  const f=new Date(TODAY); f.setDate(f.getDate()-6);
  return {id:uid(), from:f.toISOString().slice(0,10), to,
    igSubs:0,igUnsubs:0,igTotal:0,
    pubCount:0,pubViews:0,pubReposts:0,pubSubs:0,pubCore:0,pubCode:0,
    testCount:0,testViews:0,testReposts:0,testSubs:0,testCore:0,testCode:0,
    tgSubs:0,tgUnsubs:0,tgTotal:0,
    reels:[],
    fn:{ig:{leads:0,first:0,site:0,install:0,paid:0,refused:0},
        tg:{leads:0,first:0,site:0,install:0,paid:0,refused:0},
        vk:{leads:0,first:0,site:0,install:0,paid:0,refused:0}}};
}
function newReelRow(){return {name:"",views:0,reach:0,reposts:0,subs:0,code:0};}
function shareRate(rl){const r=+rl.reach||0; return r?((+rl.reposts||0)/r*100):0;}

// Итоги IG/TG из отчёта автоматически попадают в график на главной
function syncReportToStats(r){
  if(!r.to) return;
  const ig=+r.igTotal||0, tg=+r.tgTotal||0;
  if(!ig&&!tg) return;
  let e=S.statsHistory.find(x=>x.date===r.to);
  if(!e){ e={date:r.to,instagram:0,telegram:0,vk:0,youtube:0}; S.statsHistory.push(e); }
  if(ig) e.instagram=ig;
  if(tg) e.telegram=tg;
}

function numF(rid,key,val,ph){return `<input class="num" type="number" min="0" data-rf="${rid}" data-rk="${key}" value="${val||''}" placeholder="${ph||'0'}">`;}
function fieldBox(lab,inp){return `<div class="rfield"><label>${lab}</label>${inp}</div>`;}

function reelsTableHTML(r){
  const add=`<button class="addbtn" data-rradd="${r.id}">+ Добавить ролик</button>`;
  if(!r.reels.length) return `<div class="empty" style="padding:10px 0">Роликов пока нет — добавь первый кнопкой ниже.</div>${add}`;
  const rows=r.reels.map((rl,i)=>({rl,i})).sort((a,b)=>shareRate(b.rl)-shareRate(a.rl));
  return `<div style="overflow-x:auto"><table class="statstbl rtbl">
    <thead><tr><th>Ролик</th><th>Просм.</th><th>Охват</th><th>Репост</th><th>Подпис.</th><th>Доля<br>подел.</th><th>Код.<br>слово</th><th></th></tr></thead>
    <tbody>${rows.map(({rl,i})=>{
      const sh=shareRate(rl);
      const col=sh>=2?'var(--good)':sh>=1?'var(--accent)':'var(--mut)';
      return `<tr>
        <td><input class="rnm" data-rr="${r.id}" data-rri="${i}" data-rrk="name" value="${esc(rl.name)}" placeholder="Название"></td>
        <td><input class="num rsm" type="number" min="0" data-rr="${r.id}" data-rri="${i}" data-rrk="views" value="${rl.views||''}"></td>
        <td><input class="num rsm" type="number" min="0" data-rr="${r.id}" data-rri="${i}" data-rrk="reach" value="${rl.reach||''}"></td>
        <td><input class="num rsm" type="number" min="0" data-rr="${r.id}" data-rri="${i}" data-rrk="reposts" value="${rl.reposts||''}"></td>
        <td><input class="num rsm" type="number" min="0" data-rr="${r.id}" data-rri="${i}" data-rrk="subs" value="${rl.subs||''}"></td>
        <td><b data-rshare="${r.id}-${i}" style="color:${col};font-family:'JetBrains Mono',Inter,monospace;font-size:12px">${sh.toFixed(2)}%</b></td>
        <td><input class="num rsm" type="number" min="0" data-rr="${r.id}" data-rri="${i}" data-rrk="code" value="${rl.code||''}"></td>
        <td><button class="del" data-rrdel="${r.id}" data-rri="${i}">×</button></td>
      </tr>`;}).join('')}</tbody></table></div>${add}`;
}

// ====== Воронка ЯДРА по каналам ======
const FN_CH=[{k:'ig',l:'Instagram'},{k:'tg',l:'Telegram'},{k:'vk',l:'ВК'}];
const FN_STEPS=[
  {k:'leads',l:'Обращений'},
  {k:'first',l:'Первое сообщение'},
  {k:'site',l:'Отправили сайт / цену'},
  {k:'install',l:'Оформляет рассрочку'},
  {k:'paid',l:'Полная оплата'},
  {k:'refused',l:'Отказ',bad:true}
];
function fnTot(r,k){return FN_CH.reduce((a,c)=>a+(+r.fn[c.k][k]||0),0);}

function funnelHTML(r){
  const tbl=`<div style="overflow-x:auto"><table class="statstbl fntbl">
    <thead><tr><th>Этап</th>${FN_CH.map(c=>`<th>${c.l}</th>`).join('')}<th>Итого</th></tr></thead>
    <tbody>${FN_STEPS.map(s=>`<tr>
      <td class="fnst" style="${s.bad?'color:var(--bad)':''}">${s.l}</td>
      ${FN_CH.map(c=>`<td><input class="num rsm" type="number" min="0" data-fn="${r.id}" data-fnc="${c.k}" data-fnk="${s.k}" value="${r.fn[c.k][s.k]||''}"></td>`).join('')}
      <td><b data-fntot="${r.id}-${s.k}" style="font-family:'JetBrains Mono',Inter,monospace;font-size:12px;color:${s.bad?'var(--bad)':'var(--txt)'}">${RUB(fnTot(r,s.k))}</b></td>
    </tr>`).join('')}</tbody></table></div>`;

  // Конверсия в оплату по каждому каналу
  const conv=FN_CH.map(c=>{
    const f=r.fn[c.k], leads=+f.leads||0, pay=(+f.paid||0)+(+f.install||0);
    const pct=leads?(pay/leads*100):0;
    const col=pct>=15?'var(--good)':pct>=7?'var(--accent)':'var(--mut)';
    return `<div class="cvcard"><div class="cvl">${c.l}</div>
      <div class="cvv" style="color:${col}">${leads?pct.toFixed(1)+'%':'—'}</div>
      <div class="cvs">${RUB(pay)} из ${RUB(leads)}</div></div>`;
  }).join('');
  const tl=fnTot(r,'leads'), tp=fnTot(r,'paid')+fnTot(r,'install');
  const tpct=tl?(tp/tl*100):0;
  return tbl+`<div class="rnote" style="margin-top:12px">Конверсия обращения → оплата (рассрочка + полная):</div>
    <div class="cvgrid">${conv}<div class="cvcard" style="border-color:var(--accent)">
      <div class="cvl">Итого</div><div class="cvv" style="color:var(--accent)">${tl?tpct.toFixed(1)+'%':'—'}</div>
      <div class="cvs">${RUB(tp)} из ${RUB(tl)}</div></div></div>`;
}

function subsSplitHTML(r){
  const p=+r.pubSubs||0,t=+r.testSubs||0,tot=p+t;
  if(!tot) return '';
  const pp=p/tot*100, pv=+r.pubViews||0, tv=+r.testViews||0;
  // Сколько подписчиков на 1000 просмотров — показывает, какой режим эффективнее
  const pk=pv?(p/pv*1000):0, tk=tv?(t/tv*1000):0;
  return `<div class="splitwrap">
    <div class="splitbar"><div style="width:${pp.toFixed(1)}%;background:var(--accent)"></div><div style="width:${(100-pp).toFixed(1)}%;background:var(--purple)"></div></div>
    <div class="splitleg">
      <span><i style="background:var(--accent)"></i>Основные: <b>${RUB(p)}</b> (${pp.toFixed(0)}%)${pk?` · <span style="color:var(--dim)">${pk.toFixed(1)} на 1000 просм.</span>`:''}</span>
      <span><i style="background:var(--purple)"></i>Пробные: <b>${RUB(t)}</b> (${(100-pp).toFixed(0)}%)${tk?` · <span style="color:var(--dim)">${tk.toFixed(1)} на 1000 просм.</span>`:''}</span>
    </div>
    <div class="rnote">Всего с Reels: <b>${RUB(tot)}</b>${pk&&tk?` · эффективнее <b style="color:${pk>=tk?'var(--accent)':'var(--purple)'}">${pk>=tk?'основные':'пробные'}</b> на подписчика`:''}</div>
  </div>`;
}

function renderReports(){
  const wrap=document.getElementById('reportList'); if(!wrap)return;
  const list=[...S.reports].sort((a,b)=>(b.to||'').localeCompare(a.to||''));
  if(!list.length){ wrap.innerHTML='<div class="empty">Отчётов пока нет. Нажми «+ Новый отчёт за период».</div>'; bindReportAdd(); return; }

  wrap.innerHTML=list.map(r=>{
    const open=openReports.has(r.id);
    const growth=(+r.igSubs||0)-(+r.igUnsubs||0);
    const views=(+r.pubViews||0)+(+r.testViews||0);
    const paid=fnTot(r,'paid')+fnTot(r,'install');
    const per=`${(r.from||'?').slice(5).split('-').reverse().join('.')} – ${(r.to||'?').slice(5).split('-').reverse().join('.')}`;
    const headSum=`<span class="rsum">IG ${RUB(r.igTotal)} <b style="color:${growth>=0?'var(--good)':'var(--bad)'}">${growth>=0?'+':''}${RUB(growth)}</b></span>
      <span class="rsum">просмотров ${RUB(views)}</span><span class="rsum">оплат ${RUB(paid)}</span>`;
    if(!open) return `<div class="rcard">
      <div class="collapse-head" data-ropen="${r.id}" style="margin-bottom:0">
        <span class="ct">${per} ${headSum}</span><span class="cc">▼ открыть</span></div></div>`;

    return `<div class="rcard">
      <div class="collapse-head" data-ropen="${r.id}" style="margin-bottom:12px">
        <span class="ct">${per} ${headSum}</span><span class="cc">▲ свернуть</span></div>

      <div class="rgrid2" style="margin-bottom:14px">
        ${fieldBox('Период с',`<input type="date" data-rf="${r.id}" data-rk="from" value="${r.from||''}">`)}
        ${fieldBox('по',`<input type="date" data-rf="${r.id}" data-rk="to" value="${r.to||''}">`)}
      </div>

      <div class="rsect">Подписчики Instagram</div>
      <div class="rgrid3">
        ${fieldBox('Подписки',numF(r.id,'igSubs',r.igSubs))}
        ${fieldBox('Отписки',numF(r.id,'igUnsubs',r.igUnsubs))}
        ${fieldBox('Итого',numF(r.id,'igTotal',r.igTotal))}
      </div>
      <div class="rnote">Прирост за период: <b style="color:${growth>=0?'var(--good)':'var(--bad)'}">${growth>=0?'+':''}${RUB(growth)}</b></div>

      <div class="rsect">Reels — общий доступ</div>
      <div class="rgrid3">
        ${fieldBox('Кол-во роликов',numF(r.id,'pubCount',r.pubCount))}
        ${fieldBox('Просмотры',numF(r.id,'pubViews',r.pubViews))}
        ${fieldBox('Репосты',numF(r.id,'pubReposts',r.pubReposts))}
        ${fieldBox('Подписчиков принесли',numF(r.id,'pubSubs',r.pubSubs))}
        ${fieldBox('Запросы «Ядро»',numF(r.id,'pubCore',r.pubCore))}
        ${fieldBox('Кодовое слово',numF(r.id,'pubCode',r.pubCode))}
      </div>

      <div class="rsect">Reels — пробный режим</div>
      <div class="rgrid3">
        ${fieldBox('Кол-во роликов',numF(r.id,'testCount',r.testCount))}
        ${fieldBox('Просмотры',numF(r.id,'testViews',r.testViews))}
        ${fieldBox('Репосты',numF(r.id,'testReposts',r.testReposts))}
        ${fieldBox('Подписчиков принесли',numF(r.id,'testSubs',r.testSubs))}
        ${fieldBox('Запросы «Ядро»',numF(r.id,'testCore',r.testCore))}
        ${fieldBox('Кодовое слово',numF(r.id,'testCode',r.testCode))}
      </div>
      <div data-split="${r.id}">${subsSplitHTML(r)}</div>

      <div class="rsect">Telegram</div>
      <div class="rgrid3">
        ${fieldBox('Новые подписчики',numF(r.id,'tgSubs',r.tgSubs))}
        ${fieldBox('Отписки',numF(r.id,'tgUnsubs',r.tgUnsubs))}
        ${fieldBox('Всего',numF(r.id,'tgTotal',r.tgTotal))}
      </div>

      <div class="rsect">Разбор по роликам <span style="font-weight:400;color:var(--dim);font-size:11px">· доля поделившихся = репосты ÷ охват</span></div>
      ${reelsTableHTML(r)}

      <div class="rsect">Воронка курса ЯДРО · по каналам</div>
      ${funnelHTML(r)}

      <button class="del rdel" data-rdel="${r.id}">Удалить отчёт</button>
    </div>`;
  }).join('');

  bindReportAdd();
  document.querySelectorAll('[data-ropen]').forEach(el=>el.addEventListener('click',()=>{
    const k=el.dataset.ropen; openReports.has(k)?openReports.delete(k):openReports.add(k); renderReports();
  }));
  document.querySelectorAll('[data-rf]').forEach(el=>el.addEventListener('input',()=>{
    const r=S.reports.find(x=>x.id===el.dataset.rf); if(!r)return;
    const k=el.dataset.rk;
    r[k]=el.type==='number'?(+el.value||0):el.value;
    if(k==='igTotal'||k==='tgTotal'||k==='to'){ syncReportToStats(r); renderStats(); }
    if(k==='pubSubs'||k==='testSubs'||k==='pubViews'||k==='testViews'){
      const w=document.querySelector(`[data-split="${r.id}"]`);
      if(w) w.innerHTML=subsSplitHTML(r);
    }
    save();
  }));
  document.querySelectorAll('[data-rr]').forEach(el=>el.addEventListener('input',()=>{
    const r=S.reports.find(x=>x.id===el.dataset.rr); if(!r)return;
    const i=+el.dataset.rri,k=el.dataset.rrk;
    if(!r.reels[i])return;
    r.reels[i][k]= k==='name'?el.value:(+el.value||0);
    if(k==='reposts'||k==='reach'){
      const cell=document.querySelector(`[data-rshare="${r.id}-${i}"]`);
      if(cell){const sh=shareRate(r.reels[i]);cell.textContent=sh.toFixed(2)+'%';
        cell.style.color=sh>=2?'var(--good)':sh>=1?'var(--accent)':'var(--mut)';}
    }
    save();
  }));
  document.querySelectorAll('[data-fn]').forEach(el=>el.addEventListener('input',()=>{
    const r=S.reports.find(x=>x.id===el.dataset.fn); if(!r)return;
    r.fn[el.dataset.fnc][el.dataset.fnk]=+el.value||0;
    const cell=document.querySelector(`[data-fntot="${r.id}-${el.dataset.fnk}"]`);
    if(cell) cell.textContent=RUB(fnTot(r,el.dataset.fnk));
    save();
  }));
  document.querySelectorAll('[data-rradd]').forEach(el=>el.addEventListener('click',()=>{
    const r=S.reports.find(x=>x.id===el.dataset.rradd); if(!r)return;
    r.reels.push(newReelRow()); renderReports(); save();
  }));
  document.querySelectorAll('[data-rrdel]').forEach(el=>el.addEventListener('click',()=>{
    const r=S.reports.find(x=>x.id===el.dataset.rrdel); if(!r)return;
    r.reels.splice(+el.dataset.rri,1); renderReports(); save();
  }));
  document.querySelectorAll('[data-rdel]').forEach(el=>el.addEventListener('click',()=>{
    if(!confirm('Удалить отчёт целиком? Данные периода пропадут.'))return;
    S.reports=S.reports.filter(x=>x.id!==el.dataset.rdel); renderReports(); save();
  }));
}

// ====== Гипотезы в тесте ======
function newHypo(){
  return {id:uid(),name:"",desc:"",start:TODAY.toISOString().slice(0,10),end:"",score:0,checkpoints:[]};
}
function scoreColor(s){return s>=8?'var(--good)':s>=5?'var(--accent)':s>=1?'var(--bad)':'var(--dim)';}
function hypoStatus(h){
  const t=TODAY.toISOString().slice(0,10);
  if(h.end&&h.end<t) return {l:'Тест завершён',c:'var(--mut)'};
  if(h.start&&h.start>t) return {l:'Ещё не начат',c:'var(--dim)'};
  if(h.end) {
    const total=(new Date(h.end)-new Date(h.start))/86400000;
    const gone=(TODAY-new Date(h.start))/86400000;
    const left=Math.ceil(total-gone);
    return {l:`Идёт тест · ${left>0?left+' дн. до итога':'итог сегодня'}`,c:'var(--accent)'};
  }
  return {l:'Идёт тест',c:'var(--accent)'};
}

function renderHypotheses(){
  const wrap=document.getElementById('hypoList'); if(!wrap)return;
  const b=document.getElementById('addHypo');
  if(b&&!b._bound){b._bound=true;b.addEventListener('click',()=>{S.hypotheses.push(newHypo());renderHypotheses();save();});}

  if(!S.hypotheses.length){ wrap.innerHTML='<div class="empty">Гипотез пока нет. Нажми «+ Новая гипотеза».</div>'; return; }

  const sorted=[...S.hypotheses].map((h,i)=>({h,i})).sort((a,b)=>{
    const t=TODAY.toISOString().slice(0,10);
    const aDone=a.h.end&&a.h.end<t?1:0, bDone=b.h.end&&b.h.end<t?1:0;
    return aDone-bDone || (a.h.start||'').localeCompare(b.h.start||'');
  });

  wrap.innerHTML=sorted.map(({h,i})=>{
    const st=hypoStatus(h), sc=+h.score||0;
    return `<div class="hcard" style="${st.l==='Тест завершён'?'opacity:.72':''}">
      <div class="hhead">
        <span class="hbadge" style="color:${st.c};border-color:${st.c}">${st.l}</span>
        <button class="del" data-hdel="${i}">×</button>
      </div>
      <input class="hname" data-hf="${i}" data-hk="name" value="${esc(h.name)}" placeholder="Название гипотезы">
      <textarea class="hdesc" data-hf="${i}" data-hk="desc" rows="2" placeholder="Что проверяем и почему — суть гипотезы">${esc(h.desc)}</textarea>
      <div class="rgrid2">
        ${fieldBox('Старт теста',`<input type="date" data-hf="${i}" data-hk="start" value="${h.start||''}">`)}
        ${fieldBox('Итог (конец теста)',`<input type="date" data-hf="${i}" data-hk="end" value="${h.end||''}">`)}
      </div>

      <div class="hsub">Промежуточные срезы</div>
      ${h.checkpoints.length?h.checkpoints.map((c,ci)=>`
        <div class="cprow">
          <input type="date" class="cpdate" data-hcp="${i}" data-hci="${ci}" data-hck="date" value="${c.date||''}">
          <input class="cpnote" data-hcp="${i}" data-hci="${ci}" data-hck="note" value="${esc(c.note)}" placeholder="Что видим на этот момент">
          <button class="del" data-hcpdel="${i}" data-hci="${ci}">×</button>
        </div>`).join(''):'<div class="empty" style="padding:6px 0;font-size:12px">Срезов нет — добавь первый.</div>'}
      <button class="addbtn" data-hcpadd="${i}">+ Промежуточный срез</button>

      <div class="hsub">Эффективность гипотезы</div>
      <div class="hscore">
        <input class="wkrange" type="range" min="0" max="10" step="1" value="${sc}" data-hsc="${i}">
        <b style="color:${scoreColor(sc)}">${sc?sc+' / 10':'—'}</b>
      </div>
      <div class="rnote">0 — ещё не оценили. 1–4 отклоняем, 5–7 доработать, 8–10 масштабируем.</div>
    </div>`;
  }).join('');

  document.querySelectorAll('[data-hf]').forEach(el=>el.addEventListener('input',()=>{
    const h=S.hypotheses[+el.dataset.hf]; if(!h)return;
    h[el.dataset.hk]=el.value;
    if(el.dataset.hk==='start'||el.dataset.hk==='end') renderHypotheses();
    save();
  }));
  document.querySelectorAll('[data-hsc]').forEach(el=>el.addEventListener('input',()=>{
    S.hypotheses[+el.dataset.hsc].score=+el.value; renderHypotheses(); save();
  }));
  document.querySelectorAll('[data-hcp]').forEach(el=>el.addEventListener('input',()=>{
    const h=S.hypotheses[+el.dataset.hcp]; if(!h)return;
    h.checkpoints[+el.dataset.hci][el.dataset.hck]=el.value; save();
  }));
  document.querySelectorAll('[data-hcpadd]').forEach(el=>el.addEventListener('click',()=>{
    S.hypotheses[+el.dataset.hcpadd].checkpoints.push({date:TODAY.toISOString().slice(0,10),note:""});
    renderHypotheses(); save();
  }));
  document.querySelectorAll('[data-hcpdel]').forEach(el=>el.addEventListener('click',()=>{
    S.hypotheses[+el.dataset.hcpdel].checkpoints.splice(+el.dataset.hci,1); renderHypotheses(); save();
  }));
  document.querySelectorAll('[data-hdel]').forEach(el=>el.addEventListener('click',()=>{
    if(!confirm('Удалить гипотезу?'))return;
    S.hypotheses.splice(+el.dataset.hdel,1); renderHypotheses(); save();
  }));
}

function bindReportAdd(){
  const b=document.getElementById('addReport'); if(!b||b._bound)return; b._bound=true;
  b.addEventListener('click',()=>{
    const r=newReport(); S.reports.push(r); openReports.add(r.id); renderReports(); save();
  });
}

function renderAll(){
  const steps=[buildSaleProducts,renderOverview,renderWeekly,renderTimeline,renderHypotheses,renderSalesList,renderProducts,renderContent,renderExpenses,renderStats,renderReports];
  steps.forEach(fn=>{try{fn();}catch(e){console.error('Ошибка в '+fn.name+':',e);}});
  const m=document.getElementById('lastMetaLine'); if(m) m.textContent=lastMeta?('последнее изменение: '+lastMeta):'';
}
