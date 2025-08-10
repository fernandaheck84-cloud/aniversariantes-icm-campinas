
(function(){
  const $ = (q) => document.querySelector(q);
  const storeKey = 'aniversariantes_icm_push_v431';
  const state = {
    pessoas: JSON.parse(localStorage.getItem(storeKey) || '[]'),
    adminKey: localStorage.getItem('admin_key') || '',
    filtroNome: ''
  };

  const feminine=['Irmã','Pequena','Intermediária'];
  const masculine=['Pastor','Diácono','Irmão','Bebê','Pequeno','Intermediário'];

  function salvarLocal(){ localStorage.setItem(storeKey, JSON.stringify(state.pessoas)); }
  async function salvar(){
    salvarLocal(); render();
    if(state.adminKey){ try{ await saveCloud(); setCloudStatus('Nuvem: conectado ✓'); }catch(e){ setCloudStatus('Nuvem: erro ao salvar'); } }
  }
  function setCloudStatus(t){ const el=document.getElementById('cloudStatus'); if(el) el.textContent=t; }

  function limparForm(){ $('#nome').value=''; $('#telefone').value=''; $('#data').value=''; $('#semAno').checked=false; $('#categoria').value='Irmão'; $('#grupo').value='Grupo 1'; $('#nome').focus(); }
  function telNum(t){ return (t||'').replace(/\D+/g,''); }
  function hojeMMDD(){ const n=new Date(); return `${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; }
  function pronome(c){ return feminine.includes(c)?'Nossa':(masculine.includes(c)?'Nosso':'Nosso(a)'); }
  function sortByMD(list){ return list.sort((a,b)=>{ const ak=(a.data||'').slice(5,10).replace('-',''); const bk=(b.data||'').slice(5,10).replace('-',''); return ak===bk?a.nome.localeCompare(b.nome,'pt-BR'):ak.localeCompare(bk); }); }
  function toDDMMYYYY(iso){ if(!iso)return''; const y=iso.slice(0,4), mo=iso.slice(5,7), d=iso.slice(8,10); return (y==='2000')?`${d}-${mo}`:`${d}-${mo}-${y}`; }
  function fromDate(){ const v=$('#data').value; const s=$('#semAno').checked; if(!v)return''; return s?`2000-${v.slice(5,7)}-${v.slice(8,10)}`:v; }

  function mensagemHoje(){
    const h=hojeMMDD();
    const arr=state.pessoas.filter(p=>(p.data||'').slice(5,10)===h);
    if(!arr.length) return '';
    let msg=`Hoje temos *${arr.length}* aniversariante(s).\n\n`;
    arr.forEach((p,i)=>{
      const nm=(p.nome||'').split(/\s+/)[0];
      msg+=`${pronome(p.categoria)} *${p.categoria} ${nm}* está completando mais um ano de vida.\nClique abaixo para dar os parabéns:\nhttps://wa.me/${telNum(p.telefone)}${i<arr.length-1?'\n\n':''}`;
    });
    return msg;
  }

  function render(){
    state.pessoas=sortByMD(state.pessoas);
    const totalEl = document.getElementById('totalReg'); if(totalEl) totalEl.textContent=String(state.pessoas.length);
    const h=hojeMMDD(); const arrHoje=state.pessoas.filter(p=>(p.data||'').slice(5,10)===h);
    const qtdHojeEl = document.getElementById('qtdHoje'); if(qtdHojeEl) qtdHojeEl.textContent=arrHoje.length;
    const btnHoje=document.getElementById('btnHoje'); if(btnHoje) btnHoje.classList.toggle('success', arrHoje.length>0);

    const termo=(state.filtroNome||'').toLowerCase().trim();
    const lista=$('#lista'); if(!lista) return;
    lista.innerHTML='';
    (termo?state.pessoas.filter(p=>p.nome.toLowerCase().includes(termo)):state.pessoas).forEach((p,i)=>{
      const el=document.createElement('div'); el.className='item';
      const left=document.createElement('div');
      const title=document.createElement('div'); title.className='item-title';
      const grupoTxt=p.grupo?` • ${p.grupo}`:'';
      title.innerHTML=`<span class="bold-underline">${p.nome}</span> &nbsp; <span class="badge">${p.categoria}</span> <span class="small">${grupoTxt}</span>`;
      const small=document.createElement('div'); small.className='small'; small.textContent=`Nascimento: ${toDDMMYYYY(p.data)} • Telefone: ${p.telefone}`;
      const link=document.createElement('div'); link.className='small'; link.innerHTML=`Link WhatsApp: <a href="https://wa.me/${telNum(p.telefone)}" target="_blank">https://wa.me/${telNum(p.telefone)}</a>`;
      left.appendChild(title); left.appendChild(small); left.appendChild(link);
      const right=document.createElement('div'); right.style.display='grid'; right.style.gap='8px';
      right.innerHTML=`<button class='btn ghost' data-edit='${i}'>Editar</button><button class='btn danger' data-del='${i}'>Excluir</button>`;
      el.appendChild(left); el.appendChild(right); lista.appendChild(el);
    });
  }

  // Cloud via Netlify Functions
  async function saveCloud(){
    const res=await fetch('/.netlify/functions/cloud-save',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-admin-key':state.adminKey},
      body:JSON.stringify({pessoas:state.pessoas})
    });
    if(!res.ok) throw new Error('save failed');
  }
  async function loadCloud(){
    const res=await fetch('/.netlify/functions/cloud-load',{headers:{'x-admin-key':state.adminKey}});
    if(!res.ok) throw new Error('load failed');
    const data=await res.json();
    if(Array.isArray(data.pessoas)){
      state.pessoas=data.pessoas;
      salvarLocal(); render();
      setCloudStatus('Nuvem: conectado ✓');
    }else{
      setCloudStatus('Nuvem: sem dados');
    }
  }
  async function connectCloud(){
    const k = prompt('Digite sua CHAVE DE ACESSO (ADMIN_KEY):');
    if(!k){ setCloudStatus('Nuvem: não conectado'); return; }
    state.adminKey = k.trim();
    localStorage.setItem('admin_key', state.adminKey);
    try{ await loadCloud(); }catch(e){ setCloudStatus('Nuvem: erro na conexão'); }
  }

  // Eventos
  const cloudBtn = document.getElementById('btnCloud');
  if(cloudBtn){ cloudBtn.addEventListener('click', connectCloud); }

  const addBtn = document.getElementById('btnAdd');
  if(addBtn){
    addBtn.addEventListener('click',()=>{
      const nome=$('#nome')?.value.trim();
      const telefone=telNum($('#telefone')?.value||'');
      const iso=fromDate();
      const categoria=$('#categoria')?.value, grupo=$('#grupo')?.value;
      if(!nome||!telefone||!iso){alert('Preencha nome, telefone e data.');return;}
      if(!/^\d{10,15}$/.test(telefone)){alert('Informe o telefone com DDI+DDD+número.');return;}
      state.pessoas.push({nome,telefone,data:iso,categoria,grupo}); salvar(); limparForm();
    });
  }
  const clearBtn = document.getElementById('btnClear');
  if(clearBtn){ clearBtn.addEventListener('click',limparForm); }

  const lista = document.getElementById('lista');
  if(lista){
    lista.addEventListener('click',e=>{
      const d=e.target.getAttribute('data-del'), ed=e.target.getAttribute('data-edit');
      if(d!==null){ if(confirm('Excluir este cadastro?')){ state.pessoas.splice(Number(d),1); salvar(); } }
      if(ed!==null){
        const p=state.pessoas[Number(ed)];
        const nn=prompt('Nome:',p.nome)||p.nome;
        const nt=prompt('Telefone (só números):',p.telefone)||p.telefone;
        const nd=prompt('Data (dd-mm ou dd-mm-aaaa):',toDDMMYYYY(p.data))||toDDMMYYYY(p.data);
        const m=nd.match(/^(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?$/);
        if(!m){alert('Data inválida');return;}
        const d2=String(parseInt(m[1],10)).padStart(2,'0'); const mo=String(parseInt(m[2],10)).padStart(2,'0'); const y=m[3]?String(m[3]).padStart(4,'0'):'2000';
        state.pessoas[Number(ed)]={nome:nn.trim(),telefone:telNum(nt),data:`${y}-${mo}-${d2}`,categoria:p.categoria,grupo:p.grupo};
        salvar();
      }
    });
  }

  const hojeBtn = document.getElementById('btnHoje');
  if(hojeBtn){ hojeBtn.addEventListener('click',()=>{ const m=mensagemHoje(); alert(m||'Nenhum aniversariante hoje.'); }); }

  const shareBtn = document.getElementById('btnShare');
  if(shareBtn){
    shareBtn.addEventListener('click',async()=>{
      const m=mensagemHoje(); if(!m){alert('Nenhum aniversariante hoje.');return;}
      if(navigator.share){ try{ await navigator.share({text:m}); }catch(e){} }
      else { try{ await navigator.clipboard.writeText(m); alert('Mensagem copiada!'); } catch(e){ alert('Copie manualmente:\n\n'+m); } }
    });
  }

  // Busca
  const busca = document.getElementById('busca'); if(busca){ busca.addEventListener('input', e=>{ state.filtroNome = e.target.value; render(); }); }
  const limparBusca = document.getElementById('limparBusca'); if(limparBusca){ limparBusca.addEventListener('click',()=>{ state.filtroNome=''; if(busca) busca.value=''; render(); }); }

  // Init
  render();
})(); 
