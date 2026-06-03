/**
 * 🧙‍♂️ SCRIPT LÓGICO - FICHA DIGITAL TORMENTA 20 (JdoA)
 *
 * Este arquivo controla o comportamento da ficha, conectando o HTML com o
 * JavaScript, atualizando cálculos automáticos e salvando/carregando dados.

 */

/* =========================================================================
	Visão geral do arquivo
	- Inicialização: evento DOMContentLoaded para ligar eventos e restaurar estado
	- Persistência: salvarEstado() / restaurarEstado()
	- Serialização: coletarFichaEmObjeto() / popularFichaDeObjeto()
	- UI: calcularTudo(), funções que adicionam/removem linhas, inicializadores
	- Import/Export: exportarFichaJSON(), importarFichaJSON().
	========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
	// Executa o script principal quando o documento HTML estiver pronto.
	calcularTudo();

	// Restaura estado salvo no localStorage, se existir.
	restaurarEstado();

	// Pega o formulário e observa mudanças em qualquer campo.
	const formulario = document.getElementById("ficha-form");
	formulario.addEventListener("input", calcularTudo);
	formulario.addEventListener("change", calcularTudo);

	// Salva automaticamente ao mudar qualquer campo do formulário.
	formulario.addEventListener("input", salvarEstado);
	formulario.addEventListener("change", salvarEstado);

	// Captura cliques em botões de remoção para salvar após remoção dinâmica
	document.addEventListener("click", (e) => {
		const t = e.target;
		if (
			t.classList &&
			(t.classList.contains("btn-remover-item") ||
				t.classList.contains("btn-remover-magia") ||
				t.classList.contains("btn-remover-ataque"))
		) {
			setTimeout(salvarEstado, 0);
		}
	});

	// Salva antes de fechar/recarregar a página para reduzir perda acidental
	window.addEventListener("beforeunload", salvarEstado);

	// Cria os controles de atributo para cada perícia.
	inicializarAtributosDasPericias();

	// Conecta os botões da interface às funções de ação.
	document
		.getElementById("btn-adicionar-magia")
		.addEventListener("click", adicionarMagiaLinha);
	document
		.getElementById("btn-adicionar-item")
		.addEventListener("click", adicionarItemLinha);
	document
		.getElementById("btn-adicionar-ataque")
		.addEventListener("click", adicionarAtaqueLinha);
	document
		.getElementById("btn-salvar")
		.addEventListener("click", exportarFichaJSON);
	document
		.getElementById("input-carregar")
		.addEventListener("change", importarFichaJSON);

	// Botão Reset: limpa o localStorage da ficha e recarrega a página.
	const btnReset = document.getElementById("btn-reset");
	if (btnReset) {
		btnReset.addEventListener("click", () => {
			if (
				!confirm(
					"Tem certeza que deseja resetar a ficha? Isso apagará os dados preenchidos!.",
				)
			)
				return;
			localStorage.removeItem(STORAGE_KEY);
			window.removeEventListener("beforeunload", salvarEstado);
			location.reload();
		});
	}
});

// -------------------- Configuração / Constantes --------------------
// Chave usada no localStorage para persistir a ficha
const STORAGE_KEY = "ficha_torm20_backup";

/* ===================== Persistência (localStorage) =====================
 * Salva o estado atual da ficha no localStorage.
 * Reutiliza o objeto montado por `coletarFichaEmObjeto()`.
 * Proteção: erros no processo são silenciados com um aviso no console.
 * ===================================================================== */
function salvarEstado() {
	try {
		const fichaDados = coletarFichaEmObjeto();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(fichaDados));
	} catch (e) {
		console.warn("Falha ao salvar estado:", e);
	}
}

/* ===================== Restauração (localStorage → formulário) ============
 * Lê o JSON salvo em `localStorage` e delega a popular os campos para
 * `popularFichaDeObjeto(dados)`. Erros são registrados no console.
 * ====================================================================== */
function restaurarEstado() {
	try {
		const texto = localStorage.getItem(STORAGE_KEY);
		if (!texto) return;
		const dados = JSON.parse(texto);
		// Reaproveita a função de importação: aceita um objeto em vez de FileReader.
		popularFichaDeObjeto(dados);
	} catch (e) {
		console.warn("Falha ao restaurar estado:", e);
	}
}

/* ===================== Serialização da ficha (form → objeto) ============
 * Varre o DOM, lê os campos da ficha e monta um objeto plano que pode ser
 * salvo em `localStorage` ou exportado como JSON. A estrutura final é a
 * mesma esperada por `popularFichaDeObjeto()`.
 * ===================================================================== */
function coletarFichaEmObjeto() {
	const fichaDados = {
		dadosBasicos: {
			nome: document.getElementById("nome").value,
			jogador: document.getElementById("jogador").value,
			raca: document.getElementById("raca").value,
			classe: document.getElementById("classe").value,
			nivel: document.getElementById("nivel").value,
			divindade: document.getElementById("divindade").value,
			origem: document.getElementById("origem").value,
			tamanho: document.getElementById("tamanho").value,
			deslocamento: document.getElementById("deslocamento").value,
		},
		atributos: {
			forca: document.getElementById("forca").value,
			destreza: document.getElementById("destreza").value,
			constituicao: document.getElementById("constituicao").value,
			inteligencia: document.getElementById("inteligencia").value,
			sabedoria: document.getElementById("sabedoria").value,
			carisma: document.getElementById("carisma").value,
		},
		configClasse: {
			"pv-inicial": document.getElementById("pv-inicial").value,
			"pm-inicial": document.getElementById("pm-inicial").value,
			"pv-por-nivel": document.getElementById("pv-por-nivel").value,
			"pm-por-nivel": document.getElementById("pm-por-nivel").value,
			"pv-atributo-chave": document.getElementById("pv-atributo-chave").value,
			"pm-atributo-chave": document.getElementById("pm-atributo-chave").value,
			"pv-atual": document.getElementById("pv-atual").value,
			"pv-temporario": document.getElementById("pv-temporario").value,
			"pm-atual": document.getElementById("pm-atual").value,
			"pm-temporario": document.getElementById("pm-temporario").value,
		},
		defesaCD: {
			bonusArmadura: document.getElementById("bonus-armadura").value,
			bonusEscudo: document.getElementById("bonus-escudo").value,
			outrosDefesa: document.getElementById("outros-defesa").value,
			ignorarDestreza: document.getElementById("ignorar-destreza").checked,
			penalidadeArmadura: document.getElementById("penalidade-armadura").value,
			cdAtributoChave: document.getElementById("cd-atributo-chave").value,
			cdOutros: document.getElementById("cd-outros").value,
		},
		periciasOutros: {},
		inventario: [],
		magias: [],
		ataques: [],
		poderes: document.getElementById("poderes").value,
		anotacoes: document.getElementById("anotacoes").value,
	};

	// Perícias: coleta estado (treinada/outros/atributo) por linha
	document.querySelectorAll(".pericia-linha").forEach((linha) => {
		const checkbox = linha.querySelector("input[id$='-treinada']");
		const inputOutros = linha.querySelector("input[id$='-outros']");
		const atributoSelecao = linha.querySelector(".pericia-atributo-seletor");
		const attrChave = atributoSelecao
			? atributoSelecao.value
			: linha.getAttribute("data-atributo");
		if (checkbox && inputOutros) {
			fichaDados.periciasOutros[checkbox.id] = {
				treinada: checkbox.checked,
				outros: inputOutros.value,
				atributo: attrChave,
			};
		}
	});

	// Inventário: transforma cada linha em um objeto simples
	document
		.querySelectorAll("#lista-inventario .item-inventario-linha")
		.forEach((item) => {
			fichaDados.inventario.push({
				nome: item.querySelector(".item-nome").value,
				qtd: item.querySelector(".item-qtd").value,
				espaco: item.querySelector(".item-espaco").value,
			});
		});

	// Magias: lista de descrições (texto livre)
	document.querySelectorAll("#lista-magias .magia-item").forEach((magia) => {
		fichaDados.magias.push({
			descricao: magia.querySelector(".magia-descricao").value,
		});
	});

	// Ataques: cada linha vira um objeto com os campos relevantes
	document
		.querySelectorAll("#lista-ataques .ataque-linha")
		.forEach((ataque) => {
			fichaDados.ataques.push({
				nome: ataque.querySelector(".ataque-nome").value,
				pericia: ataque.querySelector(".ataque-pericia").value,
				bonusExtra: ataque.querySelector(".ataque-bonus-extra").value,
				dano: ataque.querySelector(".ataque-dano").value,
				critico: ataque.querySelector(".ataque-critico").value,
				tipo: ataque.querySelector(".ataque-tipo").value,
				alcance: ataque.querySelector(".ataque-alcance").value,
			});
		});

	return fichaDados;
}

/* ===================== Desserialização (objeto → formulário) ===========
 * Popula os campos do formulário a partir do objeto salvo. Recria linhas
 * dinâmicas (inventário, magias, ataques) e atualiza seletores/flags.
 * ===================================================================== */
function popularFichaDeObjeto(dados) {
	if (!dados) return;

	// Dados básicos e atributos (campos simples mapeados por id)
	for (let chave in dados.dadosBasicos) {
		const el = document.getElementById(chave);
		if (el) el.value = dados.dadosBasicos[chave];
	}
	for (let chave in dados.atributos) {
		const el = document.getElementById(chave);
		if (el) el.value = dados.atributos[chave];
	}
	for (let chave in dados.configClasse) {
		const el = document.getElementById(chave);
		if (el) el.value = dados.configClasse[chave];
	}

	// Defesa / CD (campos com nomes diferentes na UI)
	if (dados.defesaCD) {
		document.getElementById("bonus-armadura").value =
			dados.defesaCD.bonusArmadura || 0;
		document.getElementById("bonus-escudo").value =
			dados.defesaCD.bonusEscudo || 0;
		document.getElementById("outros-defesa").value =
			dados.defesaCD.outrosDefesa || 0;
		document.getElementById("ignorar-destreza").checked =
			!!dados.defesaCD.ignorarDestreza;
		document.getElementById("penalidade-armadura").value =
			dados.defesaCD.penalidadeArmadura || 0;
		document.getElementById("cd-atributo-chave").value =
			dados.defesaCD.cdAtributoChave || "";
		document.getElementById("cd-outros").value = dados.defesaCD.cdOutros || 0;
	}

	// Perícias: aplica estados salvos (treinada/outros/atributo)
	if (dados.periciasOutros) {
		for (let id in dados.periciasOutros) {
			const checkbox = document.getElementById(id);
			if (checkbox) {
				checkbox.checked = dados.periciasOutros[id].treinada;
				const inputOutros = document.getElementById(
					id.replace("-treinada", "-outros"),
				);
				if (inputOutros) inputOutros.value = dados.periciasOutros[id].outros;
				const linhaPericia = checkbox.closest(".pericia-linha");
				if (linhaPericia) {
					const atributoSelecao = linhaPericia.querySelector(
						".pericia-atributo-seletor",
					);
					if (atributoSelecao) {
						atributoSelecao.value =
							dados.periciasOutros[id].atributo || atributoSelecao.value;
						linhaPericia.setAttribute("data-atributo", atributoSelecao.value);
					}
				}
			}
		}
	}

	// Inventário: limpa e recria linhas conforme o objeto salvo
	const listaInventario = document.getElementById("lista-inventario");
	listaInventario.innerHTML = "";
	(dados.inventario || []).forEach((item) => {
		const novoItem = document.createElement("li");
		novoItem.className = "item-inventario-linha";
		novoItem.innerHTML = `
				<input type="text" class="item-nome" value="${item.nome}">
				<input type="number" class="item-qtd" value="${item.qtd}" min="0" step="0.01">
				<small class="input-note" title="Quantidade" style="margin-left: 0.4em">Qtd</small>
				<input type="number" class="item-espaco" value="${item.espaco}" min="0" step="0.01">
				<small class="input-note" title="Espaços ocupados" style="margin-left: 0.4em">Espaços</small>
				<button type="button" class="btn-remover-item" onclick="this.parentElement.remove(); calcularTudo(); salvarEstado();">Remover</button>
			`;
		listaInventario.appendChild(novoItem);
	});

	// Magias: limpa e recria
	const listaMagias = document.getElementById("lista-magias");
	listaMagias.innerHTML = "";
	(dados.magias || []).forEach((magia) => {
		const novoItem = document.createElement("li");
		novoItem.className = "magia-item";
		novoItem.innerHTML = `
			<textarea class="magia-descricao" rows="12">${magia.descricao}</textarea>
			<button type="button" class="btn-remover-magia" onclick="this.parentElement.remove(); calcularTudo(); salvarEstado();">Remover Magia</button>
		`;
		listaMagias.appendChild(novoItem);
	});

	// Ataques: recria linhas da tabela de ataques
	const listaAtaques = document.getElementById("lista-ataques");
	listaAtaques.innerHTML = "";
	(dados.ataques || []).forEach((ataque) => {
		const novaLinha = document.createElement("tr");
		novaLinha.className = "ataque-linha";
		novaLinha.innerHTML = `
			<td><input type="text" class="ataque-nome" value="${ataque.nome}"></td>
			<td>
				<select class="ataque-pericia">
					<option value="luta" ${ataque.pericia === "luta" ? "selected" : ""}>Luta (Corpo a Corpo)</option>
					<option value="pontaria" ${ataque.pericia === "pontaria" ? "selected" : ""}>Pontaria (À Distância)</option>
					<option value="nenhum" ${ataque.pericia === "nenhum" ? "selected" : ""}>Nenhum (Apenas Bônus)</option>
				</select>
			</td>
			<td><input type="number" class="ataque-bonus-extra" value="${ataque.bonusExtra}"></td>
			<td><input type="number" class="ataque-total" readonly value="0"></td>
			<td><input type="text" class="ataque-dano" value="${ataque.dano}"></td>
			<td><input type="text" class="ataque-critico" value="${ataque.critico}"></td>
			<td><input type="text" class="ataque-tipo" value="${ataque.tipo}"></td>
			<td><input type="text" class="ataque-alcance" value="${ataque.alcance}"></td>
			<td><button type="button" class="btn-remover-ataque" onclick="this.parentElement.parentElement.remove(); calcularTudo(); salvarEstado();">✖</button></td>
		`;
		listaAtaques.appendChild(novaLinha);
	});

	document.getElementById("poderes").value = dados.poderes || "";
	document.getElementById("anotacoes").value = dados.anotacoes || "";

	// Re-inicializa seletores/labels dependentes e recalcula tudo
	inicializarAtributosDasPericias();
	calcularTudo();
}

/* ===================== Cálculos e atualização da interface ==============
 * Função principal de cálculo: atualiza PV/PM, defesa, CDs, perícias,
 * carga, e totais de ataque. Lê campos do DOM e escreve resultados na UI.
 * ===================================================================== */
function calcularTudo() {
	// Lê o nível atual e usa 1 como valor padrão se o campo estiver vazio.
	const nivel = parseInt(document.getElementById("nivel").value) || 1;
	// Observações sintáticas (usadas abaixo):
	// - parseInt(...): converte string para inteiro.
	// - parseFloat(...): converte string para número (decimais).
	// - Math.floor(...): arredonda para baixo.
	// - '||' fornece valor padrão quando o lado esquerdo for falsy.
	// - Operador ternário: condição ? valorSeVerdadeiro : valorSeFalso.
	const metadeNivel = Math.floor(nivel / 2);

	// --- LÓGICA DE CONVERSÃO DE DESLOCAMENTO ---
	const metrosDeslocamento =
		parseFloat(document.getElementById("deslocamento").value) || 0;
	const totalTiles = Math.floor(metrosDeslocamento / 1.5);
	document.getElementById("deslocamento-tiles").innerText = totalTiles;

	// Calcula o bônus de treino escalonado por nível.
	let bonusTreino = 2;
	if (nivel >= 7 && nivel <= 14) bonusTreino = 4;
	if (nivel >= 15) bonusTreino = 6;

	// Lê cada atributo do personagem.
	const forca = parseInt(document.getElementById("forca").value) || 0;
	const destreza = parseInt(document.getElementById("destreza").value) || 0;
	const constituicao =
		parseInt(document.getElementById("constituicao").value) || 0;
	const inteligencia =
		parseInt(document.getElementById("inteligencia").value) || 0;
	const sabedoria = parseInt(document.getElementById("sabedoria").value) || 0;
	const carisma = parseInt(document.getElementById("carisma").value) || 0;

	// Guarda os atributos em um objeto para buscar pelo nome mais tarde.
	const mapaAtributos = {
		forca,
		destreza,
		constituicao,
		inteligencia,
		sabedoria,
		carisma,
	};

	// Lê os valores de PV/PM iniciais e ganhos por nível.
	const pvInicial = parseInt(document.getElementById("pv-inicial").value) || 0;
	const pvPorNivel =
		parseInt(document.getElementById("pv-por-nivel").value) || 0;
	const pmInicial = parseInt(document.getElementById("pm-inicial").value) || 0;
	const pmPorNivel =
		parseInt(document.getElementById("pm-por-nivel").value) || 0;
	const pvAtributoChave = document.getElementById("pv-atributo-chave").value;
	const pmAtributoChave = document.getElementById("pm-atributo-chave").value;

	const modPVAtributo =
		pvAtributoChave && mapaAtributos[pvAtributoChave]
			? mapaAtributos[pvAtributoChave]
			: 0; // obtém modificador do atributo chave (ou 0)
	let modPMAtributo =
		pmAtributoChave && mapaAtributos[pmAtributoChave]
			? mapaAtributos[pmAtributoChave]
			: 0;
	if (modPMAtributo < 0) modPMAtributo = 0; // Garante que não tenha mod negativo.

	let pvNivel = (pvPorNivel + modPVAtributo) * (nivel - 1);
	if (pvNivel < 0) pvNivel = 1; // Não deixa PV por nível ficar negativo.

	const pmNivel = pmPorNivel * (nivel - 1);

	const pvMaximo = pvInicial + modPVAtributo + pvNivel;
	const pmMaximo = pmInicial + modPMAtributo + pmNivel;

	document.getElementById("pv-max").value = pvMaximo;
	document.getElementById("pm-max").value = pmMaximo;

	const bonusArmadura =
		parseInt(document.getElementById("bonus-armadura").value) || 0;
	const bonusEscudo =
		parseInt(document.getElementById("bonus-escudo").value) || 0;
	const outrosDefesa =
		parseInt(document.getElementById("outros-defesa").value) || 0;
	const ignorarDestreza = document.getElementById("ignorar-destreza").checked;
	const penalidadeArmadura =
		parseInt(document.getElementById("penalidade-armadura").value) || 0;

	// Se a armadura exige ignorar destreza, o modificador de destreza vira 0.
	const desNaDefesa = ignorarDestreza ? 0 : destreza;
	const defesaTotal =
		10 + desNaDefesa + bonusArmadura + bonusEscudo + outrosDefesa;
	document.getElementById("defesa-total").value = defesaTotal;

	// CD = 10 + metade do nível + atributo chave + outros bônus.
	const cdAtributoChave = document.getElementById("cd-atributo-chave").value;
	const cdOutros = parseInt(document.getElementById("cd-outros").value) || 0;
	const modCDAtributo = mapaAtributos[cdAtributoChave] || 0;

	const cdTotal = 10 + metadeNivel + modCDAtributo + cdOutros;
	document.getElementById("cd-total").value = cdTotal;

	// Para cada perícia na tabela, calcula o valor total automaticamente.
	const linhasPericias = document.querySelectorAll(".pericia-linha");
	linhasPericias.forEach((linha) => {
		const atributoSelecao = linha.querySelector(".pericia-atributo-seletor");
		const attrChave = atributoSelecao
			? atributoSelecao.value
			: linha.getAttribute("data-atributo");
		const sofrePenalidade = linha.getAttribute("data-penalidade") === "true";

		const checkboxTreinada = linha.querySelector("input[id$='-treinada']");
		const inputOutros = linha.querySelector("input[id$='-outros']");
		const inputTotal = linha.querySelector("input[id$='-total']");

		if (checkboxTreinada && inputOutros && inputTotal) {
			const modAtributo = mapaAtributos[attrChave] || 0;
			const outrosBonus = parseInt(inputOutros.value) || 0;
			const penalidadeAplicada = sofrePenalidade ? penalidadeArmadura : 0;

			let totalPericia = 0;
			if (checkboxTreinada.checked) {
				// Se a perícia for treinada, soma o bônus de treino.
				totalPericia =
					modAtributo +
					metadeNivel +
					bonusTreino +
					outrosBonus -
					penalidadeAplicada;
			} else {
				if (linha.getAttribute("data-apenas-treinada") === "true") {
					// Perícias que só funcionam se treinadas não têm valor sem treino.
					totalPericia = 0;
				} else {
					// Perícias não treinadas usam apenas atributo + metade do nível.
					totalPericia =
						modAtributo + metadeNivel + outrosBonus - penalidadeAplicada;
				}
			}
			inputTotal.value = totalPericia;
		}
	});

	let bonusCarga = forca * 2; // bônus de carga derivado da Força
	if (forca < 0) bonusCarga = -1; // proteção para valores inválidos

	const cargaMaxima = 10 + bonusCarga; // capacidade máxima: base 10 + bônus de força
	document.getElementById("carga-maxima").innerText = cargaMaxima;

	let cargaAtualAcumulada = 0;
	const itensInventario = document.querySelectorAll(
		"#lista-inventario .item-inventario-linha",
	);
	itensInventario.forEach((item) => {
		const qtd = parseFloat(item.querySelector(".item-qtd").value) || 0;
		const espaco = parseFloat(item.querySelector(".item-espaco").value) || 0;
		cargaAtualAcumulada += qtd * espaco;
	});
	document.getElementById("carga-atual").innerText =
		cargaAtualAcumulada.toFixed(1);
	// --- CÁLCULO AUTOMÁTICO DE ATAQUES ---
	const totalLuta =
		parseInt(document.getElementById("p-luta-total").value) || 0;
	const totalPontaria =
		parseInt(document.getElementById("p-pontaria-total").value) || 0;

	const linhasAtaques = document.querySelectorAll(".ataque-linha");
	linhasAtaques.forEach((linha) => {
		const seletorPericia = linha.querySelector(".ataque-pericia").value;
		const inputBonusExtra =
			parseInt(linha.querySelector(".ataque-bonus-extra").value) || 0;
		const inputTotalAtaque = linha.querySelector(".ataque-total");

		let valorBasePericia = 0;
		if (seletorPericia === "luta") {
			valorBasePericia = totalLuta;
		} else if (seletorPericia === "pontaria") {
			valorBasePericia = totalPontaria;
		}

		// Teste de Ataque = Valor Atualizado da Perícia + Bônus Extra da Arma/Buff
		inputTotalAtaque.value = valorBasePericia + inputBonusExtra;
	});
	// ------------------------------------------------
}

/* --------------------- Helpers: adicionar linhas na UI ------------------ */
/**
 * Adiciona uma nova linha na lista de magias.
 * O jogador pode preencher os campos dessa nova magia.
 */
function adicionarMagiaLinha() {
	const lista = document.getElementById("lista-magias");
	const novoItem = document.createElement("li");
	novoItem.className = "magia-item";
	novoItem.innerHTML = `
        <textarea class="magia-descricao" rows="12" placeholder="Nome e Descrição da Magia..."></textarea>
        <button type="button" class="btn-remover-magia" onclick="this.parentElement.remove(); calcularTudo();">Remover Magia</button>
    `;
	lista.appendChild(novoItem);
	salvarEstado();
}

/**
 * Adiciona um novo item ao inventário.
 * Cada item possui nome, quantidade e espaço ocupado.
 */
function adicionarItemLinha() {
	const lista = document.getElementById("lista-inventario");
	const novoItem = document.createElement("li");
	novoItem.className = "item-inventario-linha";
	novoItem.innerHTML = `
		<input type="text" class="item-nome" placeholder="Nome do Item">
		<input type="number" class="item-qtd" value="1" min="0" step="0.01">
		<small class="input-note" title="Quantidade" style="margin-left: 0.4em">Qtd</small>
		<input type="number" class="item-espaco" value="0" min="0" step="0.01">
		<small class="input-note" title="Espaços ocupados" style="margin-left: 0.4em">Espaços</small>
		<button type="button" class="btn-remover-item" onclick="this.parentElement.remove(); calcularTudo(); salvarEstado();">Remover</button>
	`;
	lista.appendChild(novoItem);
	salvarEstado();
}

/**
 * Adiciona uma nova linha de ataque na tabela de ataques.
 * Mantém os mesmos campos e comportamento de remoção existentes.
 */
function adicionarAtaqueLinha() {
	const lista = document.getElementById("lista-ataques");
	const novaLinha = document.createElement("tr");
	novaLinha.className = "ataque-linha";
	novaLinha.innerHTML = `
        <td><input type="text" class="ataque-nome" placeholder="Nome da Arma"></td>
        <td>
            <select class="ataque-pericia">
                <option value="luta" selected>Luta (Corpo a Corpo)</option>
                <option value="pontaria">Pontaria (À Distância)</option>
                <option value="nenhum">Nenhum (Apenas Bônus)</option>
            </select>
        </td>
        <td><input type="number" class="ataque-bonus-extra" value="0"></td>
        <td><input type="number" class="ataque-total" readonly value="0"></td>
        <td><input type="text" class="ataque-dano" placeholder="Dano"></td>
        <td><input type="text" class="ataque-critico" placeholder="Crítico"></td>
        <td><input type="text" class="ataque-tipo" placeholder="Tipo"></td>
        <td><input type="text" class="ataque-alcance" placeholder="Alcance"></td>
        <td><button type="button" class="btn-remover-ataque" onclick="this.parentElement.parentElement.remove(); calcularTudo();">✖</button></td>
    `;
	lista.appendChild(novaLinha);
	calcularTudo(); // Roda o cálculo para atualizar a nova linha instantaneamente
	salvarEstado();
}

/* --------------------- Inicializadores e seletores --------------------- */
/**
 * Cria ou atualiza o seletor de atributo para cada perícia na tabela.
 * Essa função permite alterar o atributo chave usado no cálculo de cada perícia.
 */
function inicializarAtributosDasPericias() {
	const atributos = [
		{ value: "forca", label: "Força (For)" },
		{ value: "destreza", label: "Destreza (Des)" },
		{ value: "constituicao", label: "Constituição (Con)" },
		{ value: "inteligencia", label: "Inteligência (Int)" },
		{ value: "sabedoria", label: "Sabedoria (Sab)" },
		{ value: "carisma", label: "Carisma (Car)" },
	];

	const abreviacoes = {
		forca: "For",
		destreza: "Des",
		constituicao: "Con",
		inteligencia: "Int",
		sabedoria: "Sab",
		carisma: "Car",
	};

	document.querySelectorAll(".pericia-linha").forEach((linha) => {
		let select = linha.querySelector(".pericia-atributo-seletor");
		const atributoPadrao = linha.getAttribute("data-atributo") || "forca";

		if (!select) {
			select = document.createElement("select");
			select.className = "pericia-atributo-seletor";
			atributos.forEach((atributo) => {
				const option = document.createElement("option");
				option.value = atributo.value;
				option.textContent = atributo.label;
				select.appendChild(option);
			});

			const nomeCelula = linha.querySelector("td:nth-child(2)");
			if (nomeCelula) {
				const separador = document.createElement("br");
				nomeCelula.appendChild(separador);
				nomeCelula.appendChild(select);
			}
		}

		select.value = atributoPadrao;
		linha.setAttribute("data-atributo", atributoPadrao);

		const atualizarTag = () => {
			const tag = linha.querySelector(".attr-tag");
			if (tag) tag.textContent = `(${abreviacoes[select.value]})`;
			linha.setAttribute("data-atributo", select.value);
			calcularTudo();
		};

		select.addEventListener("change", atualizarTag);
		atualizarTag();
	});
}

/* --------------------- Import / Export (backup JSON) ------------------- */
/**
 * Gera um backup JSON com todos os dados da ficha e inicia o download.
 */
function exportarFichaJSON() {
	const fichaDados = coletarFichaEmObjeto();
	const dataStr =
		"data:text/json;charset=utf-8," +
		encodeURIComponent(JSON.stringify(fichaDados, null, 2));
	const downloadAnchor = document.createElement("a");
	downloadAnchor.setAttribute("href", dataStr);
	downloadAnchor.setAttribute(
		"download",
		`Ficha_${fichaDados.dadosBasicos.nome || "Personagem"}_Lvl:${fichaDados.dadosBasicos.nivel}.json`,
	);
	document.body.appendChild(downloadAnchor);
	downloadAnchor.click();
	downloadAnchor.remove();
}

/**
 * Lê um backup JSON e preenche todos os campos da ficha.
 * Aceita um `File` a partir de um input do tipo file e realiza mapeamentos
 * de compatibilidade para versões antigas antes de popular a ficha.
 */
function importarFichaJSON(evento) {
	// Recebe o arquivo selecionado no input tipo file.
	const arquivo = evento.target.files[0];
	if (!arquivo) return;

	const leitor = new FileReader();
	leitor.onload = function (e) {
		try {
			const dados = JSON.parse(e.target.result);

			// Compatibilidade: mapeia chaves camelCase antigas para o formato atual
			if (dados && dados.configClasse) {
				const configMap = {
					pvInicial: "pv-inicial",
					pmInicial: "pm-inicial",
					pvPorNivel: "pv-por-nivel",
					pmPorNivel: "pm-por-nivel",
					pvAtributoChave: "pv-atributo-chave",
					pmAtributoChave: "pm-atributo-chave",
					pvAtual: "pv-atual",
					pvTemporario: "pv-temporario",
					pmAtual: "pm-atual",
					pmTemporario: "pm-temporario",
				};
				const novoConfig = {};
				for (let chave in dados.configClasse) {
					const id = configMap[chave] || chave;
					novoConfig[id] = dados.configClasse[chave];
				}
				dados.configClasse = novoConfig;
			}

			popularFichaDeObjeto(dados);
			salvarEstado();
			alert("Ficha carregada com sucesso!");
		} catch (erro) {
			alert("Erro ao ler o arquivo de backup.");
		}
	};
	leitor.readAsText(arquivo);
}
