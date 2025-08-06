const urlPlanilha = "https://script.google.com/macros/s/AKfycbwDH0ttYBXfWCHn3N1IizMTa-5daR9xrXJ3u3GjnTjzBd3wlLPusWMm-_Af0CnGrXXWoA/exec";

document.addEventListener("DOMContentLoaded", () => {
  carregarDadosDaPlanilha();
  const form = document.getElementById("formulario");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const telefone = document.getElementById("telefone").value;
    const dataNascimento = document.getElementById("dataNascimento").value;
    const categoria = document.getElementById("categoria").value;
    const sexo = document.querySelector('input[name="sexo"]:checked')?.value || "não informado";

    const dados = { nome, telefone, dataNascimento, categoria, sexo };

    await fetch(urlPlanilha, {
      method: "POST",
      body: JSON.stringify(dados),
      headers: { "Content-Type": "application/json" }
    });

    form.reset();
    carregarDadosDaPlanilha();
  });
});

async function carregarDadosDaPlanilha() {
  const res = await fetch(urlPlanilha);
  const aniversariantes = await res.json();
  const lista = document.getElementById("lista");
  const destaque = document.getElementById("destaque");
  lista.innerHTML = "";
  destaque.innerHTML = "";

  const hoje = new Date().toISOString().slice(5, 10);

  const aniversariantesHoje = [];

  aniversariantes.forEach(pessoa => {
    const li = document.createElement("li");
    li.textContent = `${pessoa.nome} (${pessoa.categoria}) - ${pessoa.dataNascimento}`;
    lista.appendChild(li);

    if (pessoa.dataNascimento?.slice(5, 10) === hoje) {
      aniversariantesHoje.push(pessoa);
    }
  });

  if (aniversariantesHoje.length > 0) {
    const nomes = aniversariantesHoje.map(p =>
      `${p.sexo === "feminino" ? "Nossa" : "Nosso"} <b><u>${p.categoria}</u></b> <b><u>${p.nome.split(" ")[0]}</u></b> está completando mais um ano de vida.
Clique abaixo para dar os parabéns:
https://wa.me/55${p.telefone.replace(/[^0-9]/g, "")}`
    ).join("

");

    destaque.innerHTML = `
      <p>Hoje temos <b>${aniversariantesHoje.length} aniversariante(s)</b>!</p>
      <pre>${nomes}</pre>
      <button onclick="compartilhar()">Parabenizar no WhatsApp</button>
    `;

    window.mensagemCompartilhamento = `A Paz do Senhor irmãos!
Hoje temos **${aniversariantesHoje.length} aniversariante(s)!**

${aniversariantesHoje.map(p =>
      `${p.sexo === "feminino" ? "Nossa" : "Nosso"} **${p.categoria} ${p.nome.split(" ")[0]}** está completando mais um ano de vida.
Clique abaixo para dar os parabéns:
https://wa.me/55${p.telefone.replace(/[^0-9]/g, "")}`
    ).join("

")}`;
  }
}

function compartilhar() {
  const msg = window.mensagemCompartilhamento || "";
  const url = "https://wa.me/?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");
}