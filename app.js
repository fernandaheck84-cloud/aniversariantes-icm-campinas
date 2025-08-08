(function(){
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));
  const storeKey = 'aniversariantes_icm_v1';

  const state = {
    pessoas: JSON.parse(localStorage.getItem(storeKey) || '[]')
  };

  const feminineCats = ['Irmã', 'Pequena', 'Intermediária'];
  const masculineCats = ['Pastor', 'Diácono', 'Irmão', 'Bebê', 'Pequeno', 'Intermediário'];
  const neutralCats   = ['Adolescente', 'Jovem'];

  function salvar() {
    localStorage.setItem(storeKey, JSON.stringify(state.pessoas));
    render();
  }

  function limparForm() {
    $('#nome').value = '';
    $('#telefone').value = '';
    $('#data').value = '';
    $('#categoria').value = 'Irmão';
    $('#nome').focus();
  }

  function normalizarTelefone(t) {
    return (t || '').replace(/\D+/g, '');
  }

  function getHojeMMDD() {
    const now = new Date();
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const dd = String(now.getDate()).padStart(2,'0');
    return `${mm}-${dd}`;
  }

  function primeiroNome(nome) {
    return (nome || '').trim().split(/\s+/)[0];
  }

  function pronome(categoria) {
    if (feminineCats.includes(categoria)) return 'Nossa';
    if (masculineCats.includes(categoria)) return 'Nosso';
    return 'Nosso(a)';
    // Para neutras/indefinidas.
  }

  function montarMensagemHoje() {
    const hoje = getHojeMMDD();
    const aniversariantesHoje = state.pessoas.filter(p => (p.data || '').slice(5,10).replace('-','-') === hoje);
    const total = aniversariantesHoje.length;
    if (!total) return '';

    let msg = `Hoje temos *${total}* aniversariante(s).\n\n`;
    aniversariantesHoje.forEach((p, idx) => {
      const pr = pronome(p.categoria);
      const nomePrimeiro = primeiroNome(p.nome);
      const cat = p.categoria;
      const tel = normalizarTelefone(p.telefone);
      msg += `${pr} *_${cat} ${nomePrimeiro}_* está completando mais um ano de vida.\n` +
             `Clique abaixo para dar os parabéns:\nhttps://wa.me/${tel}${idx < total-1 ? '\n\n' : ''}`;
    });
    return msg;
  }

  function render() {
    // contagens
    const hoje = getHojeMMDD();
    const aniversariantesHoje = state.pessoas.filter(p => (p.data || '').slice(5,10).replace('-','-') === hoje);
    $('#qtdHoje').textContent = String(aniversariantesHoje.length);
    $('#totalReg').textContent = String(state.pessoas.length);

    // filtro
    const lista = $('#lista');
    lista.innerHTML = '';

    state.pessoas = sortByMonthDay(state.pessoas);

    state.pessoas
      .forEach((p, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'item';

        const left = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'item-title';
        title.innerHTML = `<span class="bold-underline">${p.nome}</span> &nbsp; <span class="badge">${p.categoria}</span>`;

        const small = document.createElement('div');
        small.className = 'small';
        small.textContent = `Nascimento: ${p.data} • Telefone: ${p.telefone}`;

        const link = document.createElement('div');
        link.className = 'small';
        const tel = normalizarTelefone(p.telefone);
        link.innerHTML = `Link WhatsApp: <a href="https://wa.me/${tel}" target="_blank">https://wa.me/${tel}</a>`;

        left.appendChild(title);
        left.appendChild(small);
        left.appendChild(link);

        const right = document.createElement('div');
        right.style.display = 'grid';
        right.style.gap = '8px';
        right.innerHTML = `
          <button class="btn ghost" data-edit="${idx}">Editar</button>
          <button class="btn danger" data-del="${idx}">Excluir</button>
        `;

        wrap.appendChild(left);
        wrap.appendChild(right);
        lista.appendChild(wrap);
      });
  }

  // Handlers
  $('#btnAdd').addEventListener('click', () => {
    const nome = $('#nome').value.trim();
    const telefone = normalizarTelefone($('#telefone').value);
    const data = $('#data').value;
    const categoria = $('#categoria').value;

    if (!nome || !telefone || !data) {
      alert('Preencha nome, telefone e data.');
      return;
    }
    if (!/^\d{10,15}$/.test(telefone)) {
      alert('Informe o telefone apenas com números (DDI+DDD+número), ex: 5511987654321.');
      return;
    }

    state.pessoas.push({ nome, telefone, data, categoria });
    salvar();
    limparForm();
  });

  $('#btnClear').addEventListener('click', limparForm);

  $('#filtro').addEventListener('change', render);

  $('#lista').addEventListener('click', (e) => {
    const delIdx = e.target.getAttribute('data-del');
    const editIdx = e.target.getAttribute('data-edit');
    if (delIdx !== null) {
      if (confirm('Tem certeza que deseja excluir?')) {
        state.pessoas.splice(Number(delIdx), 1);
        salvar();
      }
    }
    if (editIdx !== null) {
      const p = state.pessoas[Number(editIdx)];
      const novoNome = prompt('Nome:', p.nome) ?? p.nome;
      const novoTel = prompt('Telefone (só números):', p.telefone) ?? p.telefone;
      const novaData = prompt('Data de nascimento (YYYY-MM-DD):', p.data) ?? p.data;
      const novaCategoria = prompt('Categoria (ex.: Irmã):', p.categoria) ?? p.categoria;
      state.pessoas[Number(editIdx)] = { nome: novoNome.trim(), telefone: normalizarTelefone(novoTel), data: novaData, categoria: novaCategoria };
      salvar();
    }
  });

  $('#btnHoje').addEventListener('click', () => {
    const msg = montarMensagemHoje();
    if (!msg) {
      alert('Nenhum aniversariante hoje.');
      return;
    }
    alert(msg);
  });

  $('#btnCopiar').addEventListener('click', async () => {
    const msg = montarMensagemHoje();
    if (!msg) { alert('Nenhum aniversariante hoje.'); return; }
    try {
      await navigator.clipboard.writeText(msg);
      alert('Mensagem copiada! Você pode colar no WhatsApp.');
    } catch(e) {
      alert('Não foi possível copiar automaticamente. Selecione e copie manualmente:\n\n' + msg);
    }
  });

  $('#btnShare').addEventListener('click', async () => {
    const msg = montarMensagemHoje();
    if (!msg) { alert('Nenhum aniversariante hoje.'); return; }
    const shareData = { text: msg };
    if (navigator.share) {
      try { await navigator.share(shareData); } 
      catch(e) { /* cancelado */ }
    } else {
      try {
        await navigator.clipboard.writeText(msg);
        alert('Compartilhamento nativo indisponível. Mensagem copiada!');
      } catch(e) {
        alert('Copie manualmente:\n\n' + msg);
      }
    }
  });

  // Inicialização
  render();
})();