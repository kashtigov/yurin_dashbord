// ====== Адрес бэкенда (Google Apps Script) ======
const STORAGE_URL="https://script.google.com/macros/s/AKfycbxlQSH1w5UAmrXLe7wiK1hxQgH3bPfLrwIi0ToEmOj_B9vtRG6cDEozMqTeXU1WsqNn/exec";

// ====== Google Sign-In ======
const GOOGLE_CLIENT_ID='7996169456-kbnff5okn556488suogq5ua03tmri12p.apps.googleusercontent.com';
const TOKEN_KEY='acro_dash_gtoken';
function getToken(){return sessionStorage.getItem(TOKEN_KEY)||'';}
function setToken(t){sessionStorage.setItem(TOKEN_KEY,t);}
function clearToken(){sessionStorage.removeItem(TOKEN_KEY);}
function withToken(url){return url+(url.includes('?')?'&':'?')+'idtoken='+encodeURIComponent(getToken());}
function decodeJwt(t){try{const p=t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(escape(atob(p))));}catch(e){return {};}}
let currentUserName='';
let lastMeta='';

// ====== Загрузка и сохранение состояния ======
let lastDeniedReason='';
async function load(){
  try{
    const res=await fetch(withToken(STORAGE_URL),{method:'GET'});
    const text=await res.text();
    if(text.startsWith('DENIED')){ lastDeniedReason=text.slice(text.indexOf(':')+1)||'неизвестна'; return 'denied'; }
    let env; try{ env=JSON.parse(text); }catch(e){ env={state:text,meta:''}; }
    if(env.state&&String(env.state).trim()) S=Object.assign(defaultState(),JSON.parse(env.state));
    lastMeta=env.meta||'';
    migrate();
    return 'ok';
  }catch(e){ console.error('Не удалось загрузить данные:',e); return 'error'; }
}
let t=null;
function save(){
  setStatus("сохраняю…");clearTimeout(t);
  t=setTimeout(async()=>{
    const blob=JSON.stringify(S);
    try{
      const res=await fetch(withToken(STORAGE_URL),{method:'POST',body:blob});
      const txt=await res.text();
      if(txt.startsWith('DENIED')){ setStatus("отказ сервера: "+(txt.slice(txt.indexOf(':')+1)||'?'),false); clearToken(); return; }
      if(txt==='INVALID_JSON'||txt==='INVALID_SHAPE'){ setStatus("сервер отклонил данные — напиши разработчику",false); return; }
      setStatus("сохранено для команды ✓ · "+currentUserName,true);
    }catch(e){ console.error('Не удалось сохранить:',e); setStatus("ошибка сохранения — проверь интернет",false); }
  },450);
}
function setStatus(x,ok){const el=document.getElementById('saveStatus');el.textContent=x;el.className="st"+(ok?" saved":"");}

// ====== Экран входа ======
async function gateAndBoot(){
  const overlay=document.getElementById('passOverlay'),errEl=document.getElementById('passError');
  async function tryEnter(token){
    setToken(token);
    currentUserName=decodeJwt(token).name||decodeJwt(token).email||'';
    const status=await load();
    if(status==='ok'){
      overlay.style.display='none';
      document.getElementById('saleDate').value=TODAY.toISOString().slice(0,10);
      renderAll();setStatus("готово ✓",true);
      return true;
    }
    errEl.style.display='block';
    errEl.textContent=status==='denied'?('Отказ сервера: '+lastDeniedReason):'Нет связи с сервером — проверь интернет';
    clearToken();
    return false;
  }
  function showButton(){
    overlay.style.display='flex';
    // Ждём Google GSI — даём до 5 секунд, потом показываем ошибку
    let attempts=0;
    const tryRender=()=>{
      if(window.google&&google.accounts&&google.accounts.id){
        google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:r=>tryEnter(r.credential)});
        google.accounts.id.renderButton(document.getElementById('googleBtn'),{theme:'outline',size:'large',locale:'ru'});
      } else if(attempts++<25){
        setTimeout(tryRender,200);
      } else {
        errEl.style.display='block';errEl.textContent='Не удалось загрузить вход Google — проверь интернет и обнови страницу';
      }
    };
    tryRender();
  }
  const t0=getToken();
  if(t0){ if(await tryEnter(t0)) return; }
  showButton();
}
document.addEventListener('DOMContentLoaded',gateAndBoot);
