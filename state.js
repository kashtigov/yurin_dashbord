// ====== Базовые хелперы и константы ======
const RUB=n=>(Math.round(n)||0).toLocaleString('ru-RU');
const TODAY=new Date();
const DEADLINE=new Date(2026,10,7);
const MN=["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
const uid=()=>Math.random().toString(36).slice(2,9);
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
// Неделя у команды — со среды по среду (день планёрки)
function weekStartISO(date){
  const d=new Date(date);
  const diff=(d.getDay()-3+7)%7;
  d.setDate(d.getDate()-diff);
  return d.toISOString().slice(0,10);
}

// ====== Стартовые данные запуска ======
function defaultState(){
  return {
    goal:5000000,
    months:[
      {key:"2026-06",plan:150000},{key:"2026-07",plan:350000},{key:"2026-08",plan:500000},
      {key:"2026-09",plan:1300000},{key:"2026-10",plan:2400000},{key:"2026-11",plan:300000}
    ],
    products:[
      {id:"club",name:"Клуб",tag:"club",price:0,status:"Пересобрать",window:"Продажи: кон. июня, авг, сен"},
      {id:"core",name:"Курс «Ядро акробатики»",tag:"core",price:30000,status:"Сборка",window:"Готов к 11 июля · продажи нач. июля"},
      {id:"big",name:"Большой курс",tag:"big",price:0,status:"Подготовка",window:"Продажи: 10 сен – кон. окт"},
      {id:"mini",name:"Распродажа мини-продуктов",tag:"mini",price:0,status:"Запланирована",window:"Кон. августа · разово"},
      {id:"minitrain",name:"Мини-обучение",tag:"minitrain",price:0,status:"Подготовка",window:""}
    ],
    sales:[],
    tasks:[
      {title:"Запустить клуб через подготовленный прогрев",dir:"club",who:"Витя",deadline:"2026-06-30",status:"В работе"},
      {title:"Переупаковать клуб (1 мес = 1 тема)",dir:"club",who:"",deadline:"2026-07-15",status:"Не начато"},
      {title:"Усилить продажи клуба + система ведения",dir:"club",who:"",deadline:"",status:"Не начато"},
      {title:"Создать курс «Ядро акробатики» (30 000 ₽)",dir:"core",who:"Витя",deadline:"2026-07-11",status:"В работе"},
      {title:"Лендинг и упаковка курса",dir:"core",who:"Полина",deadline:"2026-07-11",status:"В работе"},
      {title:"Подготовить воронки продаж курса",dir:"core",who:"",deadline:"2026-07-11",status:"Не начато"},
      {title:"Текст для сайта с кейсами",dir:"core",who:"Витя + Полина",deadline:"2026-06-20",status:"В работе"},
      {title:"Пересобрать воронку большого курса",dir:"big",who:"",deadline:"",status:"Не начато"},
      {title:"Старт продаж большого курса",dir:"big",who:"",deadline:"2026-09-10",status:"Не начато"},
      {title:"Внедрить автовебинары",dir:"big",who:"",deadline:"",status:"Не начато"},
      {title:"Распродажа + прогрев к онлайн-магазину",dir:"mini",who:"",deadline:"2026-08-25",status:"Не начато"},
      {title:"Система вертикального контента",dir:"content",who:"",deadline:"2026-06-30",status:"В работе"},
      {title:"Выйти на 5 000 подписчиков органикой",dir:"content",who:"",deadline:"2026-06-30",status:"В работе"},
      {title:"Тестировать форматы Reels по системе",dir:"content",who:"",deadline:"",status:"Не начато"},
      {title:"Регламент управления финансами",dir:"general",who:"Артём",deadline:"2026-08-01",status:"Не начато"},
      {title:"Утвердить концепцию клуба и дату открытия продаж (тема на 40 дней, вход ~раз в 3 мес)",dir:"club",who:"Витя",deadline:"2026-06-24",status:"В работе"},
      {title:"Написать стратегию прогрева на клуб",dir:"club",who:"Витя",deadline:"2026-06-24",status:"Не начато"},
      {title:"Расписать контент-план клуба на 40 дней (форматы и объём)",dir:"club",who:"Полина",deadline:"",status:"Не начато"},
      {title:"Разобрать Todoist — навести порядок в накопившихся задачах",dir:"general",who:"Витя",deadline:"2026-06-24",status:"Не начато"},
      {title:"Досмотреть оставшиеся 5 сценариев Reels на здравый смысл",dir:"content",who:"Полина",deadline:"2026-06-17",status:"Не начато"},
      {title:"Изучить через Cursor возможность мини-приложения / личного кабинета для клуба",dir:"club",who:"Полина",deadline:"",status:"Не начато"},
      {title:"Купить клуб Тимофея с рабочего аккаунта Артёма — посмотреть изнутри",dir:"club",who:"Артём",deadline:"",status:"Не начато"},
      {title:"Перенести анализ ЦА (и ключевую часть Builden) в Notion",dir:"general",who:"Полина",deadline:"",status:"Не начато"}
    ],
    weeklyFocus:[
      {weekStart:"2026-06-17",items:[
        {plan:"Утвердить концепцию клуба и дату открытия продаж",fact:"",progress:0},
        {plan:"Написать стратегию прогрева на клуб",fact:"",progress:0},
        {plan:"Разобрать Todoist — навести порядок в задачах",fact:"",progress:0}
      ]}
    ],
    formats:[{name:"",made:0,reach:0,repostPct:0,subs:0,verdict:"Тестируется"}],
    expenses:[{item:"",cat:"Трафик/реклама",amount:0,date:""}],
    statsHistory:[],
    reports:[],
    hypotheses:[]
  };
}
const TSTATUS=["Не начато","В работе","Готово","Просрочено"];
const PSTATUS=["Подготовка","Сборка","Пересобрать","Запланирована","В продаже","Продано","Завершено"];
const VERDICTS=["Тестируется","Масштабируем","Средне","Отклонён"];
const CATS=["Трафик/реклама","Команда/подряд","Сервисы","Продакшн","Прочее"];
const SUBGOAL=60000;
const WHO_OPTIONS=["Витя","Артём","Полина"];
function whoOptions(sel){
  let opts=`<option value="" ${!sel?'selected':''}>Не назначен</option>`+
    WHO_OPTIONS.map(w=>`<option value="${w}" ${sel===w?'selected':''}>${w}</option>`).join('');
  if(sel&&!WHO_OPTIONS.includes(sel)) opts+=`<option value="${esc(sel)}" selected>${esc(sel)}</option>`;
  return opts;
}
const TAGCOLORS={club:"var(--blue)",core:"var(--accent)",big:"var(--good)",mini:"var(--warn)",minitrain:"var(--purple)",content:"#c08ae8",general:"var(--mut)"};

// ====== Текущее состояние ======
let S=defaultState(), saleType="продажа";

// ====== Миграция старого формата данных в текущий ======
function migrate(){
  if(!S.sales) S.sales=[];
  S.products.forEach(p=>{
    if(p.revenue&&+p.revenue>0) S.sales.push({id:uid(),product:p.id,amount:+p.revenue,date:TODAY.toISOString().slice(0,10),type:"продажа",note:"перенос"});
    if(p.prepay&&+p.prepay>0) S.sales.push({id:uid(),product:p.id,amount:+p.prepay,date:TODAY.toISOString().slice(0,10),type:"предоплата",note:"перенос"});
    delete p.revenue; delete p.units; delete p.prepay;
  });
  if(S.months) S.months.forEach(m=>{delete m.fact;});
  if(!S.products.some(p=>p.id==="minitrain")) S.products.push({id:"minitrain",name:"Мини-обучение",tag:"minitrain",price:0,status:"Подготовка",window:""});
  S.sales.forEach(s=>{ if(s.gross===undefined)s.gross=+s.amount||0; if(s.net===undefined||s.net===null)s.net=s.gross; if(!s.qty)s.qty=1; delete s.amount; });
  S.formats.forEach(f=>{ if(f.repostPct===undefined)f.repostPct=0; if(f.subs===undefined)f.subs=0; delete f.reposts; delete f.saves; });
  if(!Array.isArray(S.weeklyFocus)) S.weeklyFocus=[];
  S.weeklyFocus.forEach(w=>{
    if(Array.isArray(w.items)) w.items.forEach(it=>{
      if(it.plan===undefined) it.plan=it.text||'';
      if(it.fact===undefined) it.fact='';
      if(it.progress===undefined) it.progress=it.done?100:0;
      if(!Array.isArray(it.subs)) it.subs=[];
      delete it.text; delete it.done;
    });
  });
  if(!Array.isArray(S.statsHistory)) S.statsHistory=[];
  if(!Array.isArray(S.reports)) S.reports=[];
  S.reports.forEach(r=>{
    if(!Array.isArray(r.reels)) r.reels=[];
    if(r.pubSubs===undefined) r.pubSubs=0;
    if(r.testSubs===undefined) r.testSubs=0;
    // Воронка была общей — разносим по каналам. Старые цифры уходят в Instagram.
    if(!r.fn){
      r.fn={
        ig:{leads:+r.fIg||0,first:+r.fFirst||0,site:+r.fSite||0,install:+r.fInstall||0,paid:+r.fPaid||0,refused:+r.fRefused||0},
        tg:{leads:+r.fTg||0,first:0,site:0,install:0,paid:0,refused:0},
        vk:{leads:+r.fVk||0,first:0,site:0,install:0,paid:0,refused:0}
      };
      delete r.fIg;delete r.fTg;delete r.fVk;delete r.fFirst;delete r.fSite;delete r.fInstall;delete r.fPaid;delete r.fRefused;
    }
    ['ig','tg','vk'].forEach(c=>{ if(!r.fn[c]) r.fn[c]={leads:0,first:0,site:0,install:0,paid:0,refused:0}; });
  });
  if(!Array.isArray(S.hypotheses)) S.hypotheses=[];
  S.hypotheses.forEach(h=>{ if(!Array.isArray(h.checkpoints)) h.checkpoints=[]; });
}

// ====== Расчётные функции над S ======
const prod=id=>S.products.find(p=>p.id===id);
const sgn=s=>s.type==="возврат"?-1:1;
const isSale=s=>s.type==="продажа"||s.type==="возврат";
function prodGross(id){return S.sales.filter(s=>s.product===id&&isSale(s)).reduce((a,s)=>a+sgn(s)*(+s.gross||0),0);}
function prodNet(id){return S.sales.filter(s=>s.product===id&&isSale(s)).reduce((a,s)=>a+sgn(s)*(+s.net||0),0);}
function prodUnits(id){return S.sales.filter(s=>s.product===id&&isSale(s)).reduce((a,s)=>a+sgn(s)*(+s.qty||1),0);}
function prodPrepay(id){return S.sales.filter(s=>s.product===id&&s.type==="предоплата").reduce((a,s)=>a+(+s.gross||0),0);}
function grossCollected(){return S.sales.filter(isSale).reduce((a,s)=>a+sgn(s)*(+s.gross||0),0);}
function netCollected(){return S.sales.filter(isSale).reduce((a,s)=>a+sgn(s)*(+s.net||0),0);}
function totalPrepay(){return S.sales.filter(s=>s.type==="предоплата").reduce((a,s)=>a+(+s.gross||0),0);}
function monthFact(key){return S.sales.filter(s=>isSale(s)&&s.date&&s.date.slice(0,7)===key).reduce((a,s)=>a+sgn(s)*(+s.gross||0),0);}
function totalExp(){return S.expenses.reduce((a,e)=>a+(+e.amount||0),0);}
function totalSubs(){return S.formats.reduce((a,f)=>a+(+f.subs||0),0);}
function planToDate(){let cum=0;S.months.forEach(m=>{const[y,mo]=m.key.split('-').map(Number);const e=new Date(y,mo,0),st=new Date(y,mo-1,1);if(e<TODAY)cum+=+m.plan||0;else if(st<=TODAY&&TODAY<=e)cum+=(+m.plan||0)*(TODAY.getDate()/e.getDate());});return cum;}
function dirLabel(d){const p=prod(d);if(p)return p.name;if(d==="content")return"Контент";if(d==="general")return"Общее";return d;}
function dirTag(tag){return TAGCOLORS[tag]||"var(--mut)";}
