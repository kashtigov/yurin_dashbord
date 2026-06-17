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
function renderPhases(){
  const ph=[
    {d:"Кон. июня",n:"Клуб",end:new Date(2026,5,30)},
    {d:"Нач. июля",n:"«Ядро акробатики» 30к",end:new Date(2026,6,7)},
    {d:"Нач. августа",n:"Клуб",end:new Date(2026,7,7)},
    {d:"Кон. августа",n:"Распродажа",end:new Date(2026,7,31)},
    {d:"Нач. сентября",n:"Клуб (опц.)",end:new Date(2026,8,7)},
    {d:"10 сен–окт",n:"Большой курс",end:new Date(2026,9,31)},
    {d:"7 ноября",n:"Цель 5 000 000 ₽",end:DEADLINE}
  ];
  document.getElementById('phases').innerHTML=ph.map((p,i)=>{
    const done=p.end<TODAY,now=!done&&(i===0||ph[i-1].end<TODAY);
    return `<div class="phase ${done?'done':now?'now':''}"><div class="pd">${p.d}</div><div class="pn">${p.n}</div></div>`;
  }).join('');
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

function renderAll(){buildSaleProducts();renderOverview();renderWeekly();renderSalesList();renderProducts();renderTasks();renderContent();renderExpenses();
  const m=document.getElementById('lastMetaLine'); if(m) m.textContent=lastMeta?('последнее изменение: '+lastMeta):'';
}
