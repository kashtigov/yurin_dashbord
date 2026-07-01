// ====== Данные таймлайна запуска ======
const PHASES=[
  {s:"2026-06-29",e:"2026-07-02",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-07-01",e:"2026-07-14",n:"Прогрев к ЯДРУ",t:"warm"},
  {s:"2026-07-05",e:"2026-07-05",n:"Съёмка",t:"shoot"},
  {s:"2026-07-07",e:"2026-07-10",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-07-07",e:"2026-07-14",n:"Финальная упаковка ЯДРА",t:"pack"},
  {s:"2026-07-14",e:"2026-07-14",n:"Съёмка",t:"shoot"},
  {s:"2026-07-15",e:"2026-07-25",n:"Старт продаж ЯДРА",t:"sales"},
  {s:"2026-07-16",e:"2026-07-19",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-07-18",e:"2026-07-24",n:"СРМ",t:"crm"},
  {s:"2026-07-23",e:"2026-07-23",n:"Съёмка",t:"shoot"},
  {s:"2026-07-25",e:"2026-08-04",n:"Финальная упаковка КЛУБА",t:"pack"},
  {s:"2026-07-25",e:"2026-07-28",n:"Подготовка к съёмке",t:"prep"},
  {s:"2026-07-27",e:"2026-08-04",n:"Прогрев к КЛУБУ",t:"warm"},
  {s:"2026-08-01",e:"2026-08-01",n:"Съёмка",t:"shoot"},
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
  document.getElementById('salesList').innerHTML=sorted.length?sorted.map(s=>{
    const p=prod(s.product),pre=s.type==="предоплата",ref=s.type==="возврат";
    const meta=[s.date||'без даты',(+s.qty>1?s.qty+' шт':''),(+s.net!==+s.gross?'чистыми '+RUB(s.net)+' ₽':''),(pre?'предоплата':''),(ref?'возврат':''),(s.note?esc(s.note):'')].filter(Boolean).join(' · ');
    return `<div class="salerow"><span class="saledot" style="background:${ref?'var(--bad)':pre?'var(--warn)':(p?dirTag(p.tag):'var(--mut)')}"></span>
      <div class="saleinfo"><div class="sp">${p?esc(p.name):'—'}</div><div class="sm">${meta}</div></div>
      <div class="saleamt ${pre?'pre':''}" style="${ref?'color:var(--bad)':''}">${ref?'−':''}${RUB(s.gross)} ₽</div>
      <button class="del" data-sdel="${s.id}">×</button></div>`;
  }).join(''):`<div class="empty">Операций пока нет.</div>`;
  document.querySelectorAll('[data-sdel]').forEach(el=>el.addEventListener('click',()=>{
    S.sales=S.sales.filter(x=>x.id!==el.dataset.sdel);renderSalesList();renderOverview();renderProducts();save();
  }));
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
function taskDirOptions(sel){
  return S.products.map(p=>`<option value="${esc(p.id)}" ${sel===p.id?'selected':''}>${esc(p.name)}</option>`).join('')
    +`<option value="content" ${sel==="content"?'selected':''}>Контент</option><option value="general" ${sel==="general"?'selected':''}>Общее</option>`;
}
function renderTasks(){
  const groups=[...S.products.map(p=>p.id),"content","general"];
  document.getElementById('taskGroups').innerHTML=groups.map(g=>{
    const items=S.tasks.map((tk,i)=>({tk,i})).filter(x=>x.tk.dir===g);
    if(!items.length)return"";
    const tag=prod(g)?prod(g).tag:g;
    return `<div class="dirhead"><span class="tag" style="color:${dirTag(tag)}">${esc(dirLabel(g))}</span></div>`+items.map(({tk,i})=>{
      const eff=isOverdue(tk)?"Просрочено":tk.status;
      return `<div class="trow">
        <div class="ttop"><input value="${esc(tk.title)}" placeholder="Задача" data-tt="${i}"><button class="del" data-tdel="${i}">×</button></div>
        <div class="tmeta"><select data-tdir="${i}">${taskDirOptions(tk.dir)}</select><select data-tw="${i}">${whoOptions(tk.who)}</select></div>
        <div class="tmeta2"><input type="date" value="${tk.deadline||''}" data-td="${i}">
          <select data-ts="${i}" style="color:${eff==='Готово'?'var(--good)':eff==='Просрочено'?'var(--bad)':eff==='В работе'?'var(--accent)':'var(--mut)'}">${TSTATUS.map(s=>`<option ${tk.status===s?'selected':''}>${s}</option>`).join('')}</select>
        </div></div>`;
    }).join('');
  }).join('')||`<div class="empty">Задач нет.</div>`;
  document.querySelectorAll('[data-tt]').forEach(el=>el.addEventListener('input',()=>{S.tasks[+el.dataset.tt].title=el.value;save();}));
  document.querySelectorAll('[data-tw]').forEach(el=>el.addEventListener('change',()=>{S.tasks[+el.dataset.tw].who=el.value;save();}));
  document.querySelectorAll('[data-tdir]').forEach(el=>el.addEventListener('change',()=>{S.tasks[+el.dataset.tdir].dir=el.value;renderTasks();save();}));
  document.querySelectorAll('[data-td]').forEach(el=>el.addEventListener('change',()=>{S.tasks[+el.dataset.td].deadline=el.value;renderTasks();save();}));
  document.querySelectorAll('[data-ts]').forEach(el=>el.addEventListener('change',()=>{S.tasks[+el.dataset.ts].status=el.value;renderTasks();save();}));
  document.querySelectorAll('[data-tdel]').forEach(el=>el.addEventListener('click',()=>{S.tasks.splice(+el.dataset.tdel,1);renderTasks();save();}));
}

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
  document.getElementById('expenseRows').innerHTML=S.expenses.map((e,i)=>`
    <div class="exprow"><div class="exptop"><input value="${esc(e.item)}" placeholder="Статья расхода" data-ei="${i}"><button class="del" data-edel="${i}">×</button></div>
    <div class="expmeta"><select data-ec="${i}">${CATS.map(c=>`<option ${e.cat===c?'selected':''}>${c}</option>`).join('')}</select>
    <input class="num" type="number" min="0" placeholder="Сумма ₽" data-ea="${i}" value="${e.amount||''}"></div></div>`).join('');
  document.querySelectorAll('[data-ei]').forEach(el=>el.addEventListener('input',()=>{S.expenses[+el.dataset.ei].item=el.value;save();}));
  document.querySelectorAll('[data-ec]').forEach(el=>el.addEventListener('change',()=>{S.expenses[+el.dataset.ec].cat=el.value;updateExpenseTotals();save();}));
  document.querySelectorAll('[data-ea]').forEach(el=>el.addEventListener('input',()=>{S.expenses[+el.dataset.ea].amount=+el.value||0;updateExpenseTotals();renderOverview();save();}));
  document.querySelectorAll('[data-edel]').forEach(el=>el.addEventListener('click',()=>{S.expenses.splice(+el.dataset.edel,1);renderExpenses();renderOverview();save();}));
}

function currentWeekStart(){ return weekStartISO(TODAY); }
function getOrCreateCurrentWeek(){
  const ws=currentWeekStart();
  let w=S.weeklyFocus.find(x=>x.weekStart===ws);
  if(!w){ w={weekStart:ws,items:[{text:"",done:false},{text:"",done:false},{text:"",done:false}]}; S.weeklyFocus.push(w); }
  return w;
}
function weekRangeLabel(ws){
  const start=new Date(ws+'T00:00:00'); const end=new Date(start); end.setDate(end.getDate()+6);
  const f=d=>d.getDate()+' '+MN[d.getMonth()];
  return f(start)+' – '+f(end);
}
function renderWeekly(){
  const w=getOrCreateCurrentWeek();
  document.getElementById('weekRange').textContent=weekRangeLabel(w.weekStart);
  document.getElementById('weekItems').innerHTML=w.items.map((it,i)=>`
    <div class="wkitem">
      <input type="checkbox" data-wkdone="${i}" ${it.done?'checked':''}>
      <input class="wktext" data-wktext="${i}" value="${esc(it.text)}" placeholder="Ключевая задача №${i+1}">
    </div>`).join('');
  document.querySelectorAll('[data-wkdone]').forEach(el=>el.addEventListener('change',()=>{w.items[+el.dataset.wkdone].done=el.checked;renderWeekly();save();}));
  document.querySelectorAll('[data-wktext]').forEach(el=>el.addEventListener('input',()=>{w.items[+el.dataset.wktext].text=el.value;save();}));

  const history=[...S.weeklyFocus].filter(x=>x.weekStart!==w.weekStart).sort((a,b)=>b.weekStart.localeCompare(a.weekStart));
  document.getElementById('weekHistory').innerHTML=history.length?history.map(h=>{
    const doneCount=h.items.filter(it=>it.done).length;
    return `<div class="wkhist"><div class="wkhistdate">${weekRangeLabel(h.weekStart)} · ${doneCount}/${h.items.length} выполнено</div>
      ${h.items.map(it=>`<div class="wkhistitem ${it.done?'done':''}">${it.done?'✓':'○'} ${esc(it.text)||'—'}</div>`).join('')}</div>`;
  }).join(''):'<div class="empty">История появится после первой завершённой недели.</div>';
}

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

function renderAll(){buildSaleProducts();renderOverview();renderWeekly();renderTimeline();renderSalesList();renderProducts();renderTasks();renderContent();renderExpenses();renderStats();
  const m=document.getElementById('lastMetaLine'); if(m) m.textContent=lastMeta?('последнее изменение: '+lastMeta):'';
}
