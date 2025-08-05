
const lista = document.getElementById("lista");
const form = document.getElementById("form");
const btnHoje = document.getElementById("filtrarHoje");
const btnCompartilhar = document.getElementById("parabenizar");
const destaque = document.getElementById("aniversarioHoje");

let aniversariantes = JSON.parse(localStorage.getItem("aniversariantes") || "[]");

function salvar() {
  localStorage.setItem("aniversariantes", JSON.stringify(aniversariantes));
  render();
}

form.onsubmit = (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const aniversario = document.getElementById("aniversario").value;
  const sexo = document.getElementById("sexo").value;
  const categoria = document.getElementById("categoria").value;
  if (nome && telefone && aniversario && sexo && categoria) {
    aniversariantes.push({ nome, telefone, aniversario, sexo, categoria });
    salvar();
    form.reset();
  }
};

function render(filtrarHoje = false) {
  lista.innerHTML = "";
  destaque.innerHTML = "";
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const hojeStr = `${hoje.getFullYear()}-${mes}-${dia}`;
  let dados = aniversariantes.slice();
  if (filtrarHoje) {
    dados = dados.filter(p => {
      const [ano, mm, dd] = p.aniversario.split("-");
      return mm === mes && dd === dia;
    });
  } else {
    dados.sort((a, b) => a.aniversario.slice(5).localeCompare(b.aniversario.slice(5)));
  }

  for (const p of dados) {
    const li = document.createElement("li");
    li.innerText = `${p.nome} (${p.categoria}) - ${p.aniversario}`;
    const excluir = document.createElement("button");
    excluir.innerText = "Excluir";
    excluir.onclick = () => {
      aniversariantes = aniversariantes.filter(x => x !== p);
      salvar();
    };
    li.appendChild(excluir);
    lista.appendChild(li);
  }

  const hojeAniv = aniversariantes.filter(p => {
    const [ano, mm, dd] = p.aniversario.split("-");
    return mm === mes && dd === dia;
  });
  if (hojeAniv.length > 0) {
    destaque.innerText = `🎉 Hoje é o aniversário de ${hojeAniv[0].nome.split(" ")[0]}!`;
  }
}

btnHoje.onclick = () => render(true);

btnCompartilhar.onclick = () => {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const hojeAniversariantes = aniversariantes.filter(p => {
    const [ano, mm, dd] = p.aniversario.split("-");
    return mm === mes && dd === dia;
  });

  if (hojeAniversariantes.length === 0) {
    alert("Nenhum aniversariante hoje.");
    return;
  }

  let msg = `Hoje é o aniversário de ${hojeAniversariantes[0].nome.split(" ")[0]}\n\n`;
  msg += "A Paz do Senhor irmãos!\n";
  msg += `Hoje temos **${hojeAniversariantes.length} aniversariante${hojeAniversariantes.length > 1 ? "s" : ""}!**\n\n`;

  for (const p of hojeAniversariantes) {
    const artigo = p.sexo === "feminino" ? "Nossa" : "Nosso";
    const nomePrimeiro = p.nome.split(" ")[0];
    msg += `${artigo} **${p.categoria} ${nomePrimeiro}** está completando mais um ano de vida.\n`;
    msg += `Clique abaixo para dar os parabéns:\nhttps://wa.me/55${p.telefone}\n\n`;
  }

  const url = "https://wa.me/?text=" + encodeURIComponent(msg.trim());
  window.open(url, "_blank");
};

render();
