/**
 * 🧙‍♂️ SCRIPT LÓGICO - FICHA DIGITAL TORMENTA 20 (JdoA)
 *
 * Este arquivo controla toda a lógica da ficha, incluindo cálculos automáticos,
 * adição de itens e magias, e a leitura/gravação de backups em JSON.
 */

document.addEventListener("DOMContentLoaded", () => {
	// Faz a página calcular todos os valores assim que o HTML estiver carregado.
	calcularTudo();

	// Sempre que qualquer campo do formulário mudar, recalcula os totais.
	const formulario = document.getElementById("ficha-form");
	formulario.addEventListener("input", calcularTudo);
	formulario.addEventListener("change", calcularTudo);

	// Inicializa os menus suspensos de atributo para cada perícia.
	inicializarAtributosDasPericias();

	// Liga os botões da interface às funções que adicionam itens, adicionam magias,
	// salvam o backup e carregam o backup.
	document
		.getElementById("btn-adicionar-magia")
		.addEventListener("click", adicionarMagiaLinha);
	document
		.getElementById("btn-adicionar-item")
		.addEventListener("click", adicionarItemLinha);
	document
		.getElementById("btn-salvar")
		.addEventListener("click", exportarFichaJSON);
	document
		.getElementById("input-carregar")
		.addEventListener("change", importarFichaJSON);
});

/**
 * Recalcula todos os valores automáticos da ficha.
 *
 * Esta função atualiza PV, PM, defesa, CD, perícias e carga do inventário.
 * Ela é chamada sempre que algum campo do formulário mudar.
 */
function calcularTudo() {
	// Lê o nível atual. Se não houver valor válido, usa 1.
	const nivel = parseInt(document.getElementById("nivel").value) || 1;
	// Metade do nível é usada em muitos cálculos de Tormenta.
	const metadeNivel = Math.floor(nivel / 2);

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
			: 0;
	const modPMAtributo =
		pmAtributoChave && mapaAtributos[pmAtributoChave]
			? mapaAtributos[pmAtributoChave]
			: 0;
    if (modPMAtributo < 0) modPMAtributo = 0;

    const pvNivel = (pvPorNivel + modPVAtributo) * (nivel - 1) ;
        if (pvNivel < 0) pvNivel = 1;

    const pmNivel = pmPorNivel * (nivel - 1)

	const pvMaximo = (pvInicial + modPVAtributo) + pvNivel;

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

	// Se a armadura exige ignorar destreza, não usamos o modificador de destreza.
	const desNaDefesa = ignorarDestreza ? 0 : destreza;
	// Definição básica de defesa: 10 + destreza + armadura + escudo + outros bônus.
	const defesaTotal =
		10 + desNaDefesa + bonusArmadura + bonusEscudo + outrosDefesa;
	document.getElementById("defesa-total").value = defesaTotal;

	// Define a CD base com o atributo chave escolhido pelo jogador.
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
				totalPericia =
					modAtributo +
					metadeNivel +
					bonusTreino +
					outrosBonus -
					penalidadeAplicada;
			} else {
				if (linha.getAttribute("data-apenas-treinada") === "true") {
					totalPericia = 0; // Perícia sem treino não tem valor se for "apenas treinada"
				} else {
				totalPericia =
					modAtributo + metadeNivel + outrosBonus - penalidadeAplicada;
			}}
			inputTotal.value = totalPericia;
		}
	});

	const cargaMaxima = 10 + forca * 2;
	document.getElementById("carga-maxima").innerText = cargaMaxima;

	let cargaAtualAcumulada = 0;
	const itensInventario = document.querySelectorAll(
		"#lista-inventario .item-inventario-linha",
	);
	itensInventario.forEach((item) => {
		const qtd = parseInt(item.querySelector(".item-qtd").value) || 0;
		const espaco = parseInt(item.querySelector(".item-espaco").value) || 0;
		cargaAtualAcumulada += qtd * espaco;
	});
	document.getElementById("carga-atual").innerText = cargaAtualAcumulada;
}

/**
 * Adiciona uma nova linha na lista de magias.
 * O jogador pode preencher os campos dessa nova magia.
 */
function adicionarMagiaLinha() {
	const lista = document.getElementById("lista-magias");
	const novoItem = document.createElement("li");
	novoItem.className = "magia-item";
	novoItem.innerHTML = `
        <div class="magia-dados-linha">
            <input type="text" class="magia-nome" placeholder="Nome da Magia">
            <input type="number" class="magia-custo" placeholder="PM" min="0">
            <input type="text" class="magia-execucao" placeholder="Execução">
            <input type="text" class="magia-alcance" placeholder="Alcance">
        </div>
        <div class="magia-dados-linha">
            <input type="text" class="magia-duracao" placeholder="Duração">
            <input type="text" class="magia-resistencia" placeholder="Resistência">
        </div>
        <textarea class="magia-descricao" rows="2" placeholder="Efeito..."></textarea>
        <button type="button" class="btn-remover-magia" onclick="this.parentElement.remove(); calcularTudo();">Remover Magia</button>
    `;
	lista.appendChild(novoItem);
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
        <input type="number" class="item-qtd" value="1" min="1">
        <input type="number" class="item-espaco" value="0" min="0">
        <button type="button" class="btn-remover-item" onclick="this.parentElement.remove(); calcularTudo();">Remover</button>
    `;
	lista.appendChild(novoItem);
}

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

/**
 * Gera um backup JSON com todos os dados da ficha e inicia o download.
 */
function exportarFichaJSON() {
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
		poderes: document.getElementById("poderes").value,
		anotacoes: document.getElementById("anotacoes").value,
	};

	// Inclui também o estado das perícias (treinada, atributo e bônus extras) no backup.
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

	// Copia o inventário atual para o objeto que será salvo em JSON.
	document
		.querySelectorAll("#lista-inventario .item-inventario-linha")
		.forEach((item) => {
			fichaDados.inventario.push({
				nome: item.querySelector(".item-nome").value,
				qtd: item.querySelector(".item-qtd").value,
				espaco: item.querySelector(".item-espaco").value,
			});
		});

	// Adiciona cada magia com todos os seus campos ao objeto de backup.
	document.querySelectorAll("#lista-magias .magia-item").forEach((magia) => {
		fichaDados.magias.push({
			nome: magia.querySelector(".magia-nome").value,
			custo: magia.querySelector(".magia-custo").value,
			execucao: magia.querySelector(".magia-execucao").value,
			alcance: magia.querySelector(".magia-alcance").value,
			duracao: magia.querySelector(".magia-duracao").value,
			resistencia: magia.querySelector(".magia-resistencia").value,
			descricao: magia.querySelector(".magia-descricao").value,
		});
	});

	// Converte o objeto em texto JSON e baixa como arquivo.
	const dataStr =
		"data:text/json;charset=utf-8," +
		encodeURIComponent(JSON.stringify(fichaDados, null, 2));
	const downloadAnchor = document.createElement("a");
	downloadAnchor.setAttribute("href", dataStr);
	downloadAnchor.setAttribute(
		"download",
		`Ficha_${fichaDados.dadosBasicos.nome || "Personagem"}.json`,
	);
	document.body.appendChild(downloadAnchor);
	downloadAnchor.click();
	downloadAnchor.remove();
}

/**
 * Lê um backup JSON e preenche todos os campos da ficha.
 *
 * Se o arquivo não puder ser lido, exibe uma mensagem de erro.
 */
function importarFichaJSON(evento) {
	const arquivo = evento.target.files[0];
	if (!arquivo) return;

	const leitor = new FileReader();
	leitor.onload = function (e) {
		try {
			const dados = JSON.parse(e.target.result);

			for (let chave in dados.dadosBasicos) {
				const el = document.getElementById(chave);
				if (el) el.value = dados.dadosBasicos[chave];
			}
			for (let chave in dados.atributos) {
				const el = document.getElementById(chave);
				if (el) el.value = dados.atributos[chave];
			}
			const configClasseMap = {
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
			for (let chave in dados.configClasse) {
				const id = configClasseMap[chave] || chave;
				const el = document.getElementById(id);
				if (el) el.value = dados.configClasse[chave];
			}

			document.getElementById("bonus-armadura").value =
				dados.defesaCD.bonusArmadura;
			document.getElementById("bonus-escudo").value =
				dados.defesaCD.bonusEscudo;
			document.getElementById("outros-defesa").value =
				dados.defesaCD.outrosDefesa;
			document.getElementById("ignorar-destreza").checked =
				dados.defesaCD.ignorarDestreza;
			document.getElementById("penalidade-armadura").value =
				dados.defesaCD.penalidadeArmadura;
			document.getElementById("cd-atributo-chave").value =
				dados.defesaCD.cdAtributoChave;
			document.getElementById("cd-outros").value = dados.defesaCD.cdOutros;

			// Restaura os valores de perícias treinadas, seus atributos e bônus extras.
			if (dados.periciasOutros) {
				for (let id in dados.periciasOutros) {
					const checkbox = document.getElementById(id);
					if (checkbox) {
						checkbox.checked = dados.periciasOutros[id].treinada;
						const inputOutros = document.getElementById(
							id.replace("-treinada", "-outros"),
						);
						if (inputOutros)
							inputOutros.value = dados.periciasOutros[id].outros;

						const linhaPericia = checkbox.closest(".pericia-linha");
						if (linhaPericia) {
							const atributoSelecao = linhaPericia.querySelector(
								".pericia-atributo-seletor",
							);
							if (atributoSelecao) {
								atributoSelecao.value =
									dados.periciasOutros[id].atributo || atributoSelecao.value;
								linhaPericia.setAttribute(
									"data-atributo",
									atributoSelecao.value,
								);
							}
						}
					}
				}
			}

			inicializarAtributosDasPericias();

			const listaInventario = document.getElementById("lista-inventario");
			listaInventario.innerHTML = "";
			dados.inventario.forEach((item) => {
				const novoItem = document.createElement("li");
				novoItem.className = "item-inventario-linha";
				novoItem.innerHTML = `
                    <input type="text" class="item-nome" value="${item.nome}">
                    <input type="number" class="item-qtd" value="${item.qtd}" min="1">
                    <input type="number" class="item-espaco" value="${item.espaco}" min="0">
                    <button type="button" class="btn-remover-item" onclick="this.parentElement.remove(); calcularTudo();">Remover</button>
                `;
				listaInventario.appendChild(novoItem);
			});

			// Limpa e recria a lista de magias com os valores salvos no JSON.
			const listaMagias = document.getElementById("lista-magias");
			listaMagias.innerHTML = "";
			dados.magias.forEach((magia) => {
				const novoItem = document.createElement("li");
				novoItem.className = "magia-item";
				novoItem.innerHTML = `
                    <div class="magia-dados-linha">
                        <input type="text" class="magia-nome" value="${magia.nome}">
                        <input type="number" class="magia-custo" value="${magia.custo}" min="0">
                        <input type="text" class="magia-execucao" value="${magia.execucao}">
                        <input type="text" class="magia-alcance" value="${magia.alcance}">
                    </div>
                    <div class="magia-dados-linha">
                        <input type="text" class="magia-duracao" value="${magia.duracao}">
                        <input type="text" class="magia-resistencia" value="${magia.resistencia}">
                    </div>
                    <textarea class="magia-descricao" rows="2">${magia.descricao}</textarea>
                    <button type="button" class="btn-remover-magia" onclick="this.parentElement.remove(); calcularTudo();">Remover Magia</button>
                `;
				listaMagias.appendChild(novoItem);
			});

			document.getElementById("poderes").value = dados.poderes || "";
			document.getElementById("anotacoes").value = dados.anotacoes || "";

			calcularTudo();
			alert("Ficha carregada com sucesso!");
		} catch (erro) {
			alert("Erro ao ler o arquivo de backup.");
		}
	};
	leitor.readAsText(arquivo);
}
