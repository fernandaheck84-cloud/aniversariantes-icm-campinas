
let aniversariantes = JSON.parse(localStorage.getItem("aniversariantes") || "[]");

function salvarLista() {
  localStorage.setItem("aniversariantes", JSON.stringify(aniversariantes));
}

function exibirLista(filtro = "") {
  const ul = document.getElementById("lista-aniversariantes");
  ul.innerHTML = "";
  aniversariantes
    .filter(p => !filtro || p.categoria === filtro)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .forEach((p, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<b>${p.nome}</b> (${p.categoria}) - ${p.data}
        <button onclick="remover(${i})">Excluir</button>`;
      ul.appendChild(li);
    });
}

function remover(index) {
  aniversariantes.splice(index, 1);
  salvarLista();
  exibirLista(document.getElementById("filtro-categoria").value);
}

document.getElementById("formulario").addEventListener("submit", e => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const data = document.getElementById("data").value;
  const categoria = document.getElementById("categoria").value;
  const sexo = document.getElementById("sexo").value;
  aniversariantes.push({ nome, telefone, data, categoria, sexo });
  salvarLista();
  e.target.reset();
  exibirLista(document.getElementById("filtro-categoria").value);
});

document.getElementById("filtro-categoria").addEventListener("change", e => {
  exibirLista(e.target.value);
});

document.getElementById("parabenizar").addEventListener("click", () => {
  const hoje = new Date().toISOString().slice(5, 10);
  const aniversariantesHoje = aniversariantes.filter(p => p.data.slice(5, 10) === hoje);
  if (aniversariantesHoje.length === 0) {
    alert("Ninguém faz aniversário hoje.");
    return;
  }
  let msg = "A Paz do Senhor irmãos!\n\n";
  msg += `*Hoje temos ${aniversariantesHoje.length} aniversariante(s)!*\n\n`;
  aniversariantesHoje.forEach((p, idx) => {
    const artigo = p.sexo === "feminino" ? "Nossa" : "Nosso";
    const categoriaFmt = `*${p.categoria}*`;
    const nomeFmt = `*${p.nome}*`;
    msg += `${artigo} ${categoriaFmt} ${nomeFmt} está completando mais um ano de vida. 🎉\n`;
    msg += `Clique abaixo para dar os parabéns:\nhttps://wa.me/55${p.telefone}`;
    if (idx < aniversariantesHoje.length - 1) msg += "\n\n";
  });
  const url = "https://wa.me/?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");
});

window.addEventListener("load", () => {
  exibirLista();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});
