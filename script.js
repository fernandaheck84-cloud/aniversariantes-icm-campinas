// URL da Web App do Google Apps Script
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwDH0ttYBXfWCHn3N1IizMTa-5daR9xrXJ3u3GjnTjzBd3wlLPusWMm-_Af0CnGrXXWoA/exec";

document.addEventListener("DOMContentLoaded", () => {
  carregarAniversariantes();

  const form = document.getElementById("formulario");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const aniversario = document.getElementById("aniversario").value;
    const categoria = document.getElementById("categoria").value;
    const sexo = document.querySelector('input[name="sexo"]:checked')?.value;

    if (!nome || !telefone || !aniversario || !categoria || !sexo) {
      alert("Preencha todos os campos.");
      return;
    }

    const dados = { nome, telefone, aniversario, categoria, sexo, acao: "adicionar" };

    await fetch(SHEET_URL, {
      method: "POST",
      body: JSON.stringify(dados)
    });

    form.reset();
    carregarAniversariantes();
  });
});

function formatarDataISO(dataStr) {
  const hoje = new Date();
  const [ano, mes, dia] = dataStr.split("-");
  return new Date(hoje.getFullYear(), parseInt(mes) - 1, parseInt(dia));
}

async function carregarAniversariantes() {
  const listaDiv = document.getElementById("lista-aniversariantes");
  if (!listaDiv) return;

  listaDiv.innerHTML = "<p>Carregando aniversariantes...</p>";
  try {
    const response = await fetch(SHEET_URL);
    const dados = await response.json();

    const hoje = new Date();
    const hojeDia = hoje.getDate();
    const hojeMes = hoje.getMonth() + 1;

    const ordenados = dados.sort((a, b) =>
      formatarDataISO(a.aniversario) - formatarDataISO(b.aniversario)
    );

    let html = "";
    let aniversariantesHoje = [];

    ordenados.forEach(pessoa => {
      const [ano, mes, dia] = pessoa.aniversario.split("-");
      const primeiroNome = pessoa.nome.split(" ")[0];
      const categoriaFmt = pessoa.categoria;
      const artigo = pessoa.sexo === "feminino" ? "Nossa" : "Nosso";

      if (parseInt(dia) === hojeDia && parseInt(mes) === hojeMes) {
        aniversariantesHoje.push(`${artigo} <b><u>${categoriaFmt} ${primeiroNome}</u></b>`);
      }

      html += `<li>${primeiroNome} (${categoriaFmt}) - ${dia}/${mes} - <a target="_blank" href="https://wa.me/55${pessoa.telefone}">WhatsApp</a></li>`;
    });

    if (aniversariantesHoje.length > 0) {
      const mensagem = aniversariantesHoje.length === 1
        ? `🎉 Hoje é o aniversário de ${aniversariantesHoje[0]}`
        : `🎉 Hoje temos ${aniversariantesHoje.length} aniversariantes:<br>` +
          aniversariantesHoje.map(p => `• ${p}`).join("<br>");
      listaDiv.innerHTML = `<p>${mensagem}</p><ul>${html}</ul>`;
    } else {
      listaDiv.innerHTML = `<ul>${html}</ul>`;
    }
  } catch (e) {
    listaDiv.innerHTML = "<p>Erro ao carregar aniversariantes.</p>";
  }
}document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  const nomeInput = document.getElementById('nome');
  const telefoneInput = document.getElementById('telefone');
  const dataInput = document.getElementById('data');
  const categoriaInput = document.getElementById('categoria');
  const lista = document.createElement('ul');

  form.insertAdjacentElement('afterend', lista);

  const aniversariantes = [];

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = nomeInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const data = dataInput.value;
    const categoria = categoriaInput.value;

    if (nome && telefone && data && categoria) {
      aniversariantes.push({ nome, telefone, data, categoria });
      atualizarLista();
      form.reset();
    }
  });

  function atualizarLista() {
    lista.innerHTML = '';
    aniversariantes.forEach((a, index) => {
      const item = document.createElement('li');
      item.textContent = `${a.nome} (${a.categoria}) - ${formatarData(a.data)} - ${a.telefone}`;
      lista.appendChild(item);
    });
  }

  function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  const nomeInput = document.getElementById('nome');
  const telefoneInput = document.getElementById('telefone');
  const dataInput = document.getElementById('data');
  const categoriaInput = document.getElementById('categoria');
  const lista = document.createElement('ul');

  form.insertAdjacentElement('afterend', lista);

  let aniversariantes = [];

  // Carregar dados salvos do localStorage
  if (localStorage.getItem('aniversariantes')) {
    aniversariantes = JSON.parse(localStorage.getItem('aniversariantes'));
    atualizarLista();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = nomeInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const data = dataInput.value;
    const categoria = categoriaInput.value;

    if (nome && telefone && data && categoria) {
      aniversariantes.push({ nome, telefone, data, categoria });
      salvarLocalStorage();
      atualizarLista();
      form.reset();
    }
  });

  function atualizarLista() {
    lista.innerHTML = '';
    aniversariantes.forEach((a) => {
      const item = document.createElement('li');
      item.textContent = `${a.nome} (${a.categoria}) - ${formatarData(a.data)} - ${a.telefone}`;
      lista.appendChild(item);
    });
  }

  function salvarLocalStorage() {
    localStorage.setItem('aniversariantes', JSON.stringify(aniversariantes));
  }

  function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }
});
