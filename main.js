document.getElementById('nav').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));document.querySelectorAll('section').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');document.getElementById(b.dataset.t).classList.add('on');});
document.getElementById('saleType').addEventListener('click',e=>{const b=e.target.closest('[data-type]');if(!b)return;
  saleType=b.dataset.type;document.querySelectorAll('#saleType button').forEach(x=>x.classList.toggle('on',x===b));});
document.getElementById('addSale').addEventListener('click',()=>{
  const pid=document.getElementById('saleProduct').value;
  const gross=+document.getElementById('saleGross').value||0;
  let net=document.getElementById('saleNet').value;net=net===''?gross:(+net||0);
  const qty=+document.getElementById('saleQty').value||1;
  const date=document.getElementById('saleDate').value||TODAY.toISOString().slice(0,10);
  const note=document.getElementById('saleNote').value.trim();
  if(gross<=0){document.getElementById('saleGross').focus();return;}
  S.sales.push({id:uid(),product:pid,gross,net,qty,date,type:saleType,note});
  document.getElementById('saleGross').value='';document.getElementById('saleNet').value='';document.getElementById('saleQty').value='1';document.getElementById('saleNote').value='';
  renderSalesList();renderOverview();renderProducts();save();
});
document.getElementById('addProduct').addEventListener('click',()=>{
  S.products.push({id:"p"+uid(),name:"Новый продукт",tag:"general",price:0,status:"Подготовка",window:""});
  buildSaleProducts();renderProducts();save();
});
document.getElementById('addFormat').addEventListener('click',()=>{S.formats.push({name:"",made:0,reach:0,reposts:0,saves:0,verdict:"Тестируется"});renderContent();save();});
document.getElementById('addExpense').addEventListener('click',()=>{S.expenses.push({item:"",cat:"Прочее",amount:0,date:""});renderExpenses();save();});
document.getElementById('addStats').addEventListener('click',()=>{
  const date=document.getElementById('statsDate').value||TODAY.toISOString().slice(0,10);
  const ig=+document.getElementById('statsIg').value||0;
  const tg=+document.getElementById('statsTg').value||0;
  const vk=+document.getElementById('statsVk').value||0;
  const yt=+document.getElementById('statsYt').value||0;
  if(!ig&&!tg&&!vk&&!yt){alert('Введи хотя бы одно значение');return;}
  const existing=S.statsHistory.findIndex(r=>r.date===date);
  if(existing>=0) S.statsHistory[existing]={date,instagram:ig,telegram:tg,vk,youtube:yt};
  else S.statsHistory.push({date,instagram:ig,telegram:tg,vk,youtube:yt});
  ['statsIg','statsTg','statsVk','statsYt'].forEach(id=>document.getElementById(id).value='');
  renderStats();save();
});

document.getElementById('refreshBtn').addEventListener('click',async()=>{
  setStatus("обновляю…");
  const status=await load();
  if(status==='ok'){ renderAll(); setStatus("обновлено ✓",true); }
  else if(status==='denied'){ setStatus("доступ запрещён",false); }
  else { setStatus("ошибка обновления",false); }
});
