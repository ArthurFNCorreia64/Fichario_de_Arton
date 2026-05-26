/**
 * 🧙‍♂️ SCRIPT LÓGICO - FICHA DIGITAL TORMENTA 20 (JdoA)
 */

document.addEventListener("DOMContentLoaded", () => {
    calcularTudo();

    const formulario = document.getElementById("ficha-form");
    formulario.addEventListener("input", calcularTudo);
    formulario.addEventListener("change", calcularTudo);

    // Monitora a mudança do nível para auto-minimizar, mas sem travar o re-acesso do usuário
    document.getElementById("nivel").addEventListener("change", (evento) => {
        const nivelAtual = parseInt(evento.target.value) || 1;
        const subBlocoClasse = document.getElementById("configurador-vida-mana");
        
        if (nivelAtual > 1) {
            subBlocoClasse.open = false; // Fecha a sanfona mantendo o título <h3> visível
        }
    });

    document.getElementById("btn-adicionar-magia").addEventListener("click", adicionarMagiaLinha);
    document.getElementById("btn-adicionar-item").addEventListener("click", adicionarItemLinha);
    document.getElementById("btn-salvar").addEventListener("click", exportarFichaJSON);
    document.getElementById("input-carregar").addEventListener("change", importarFichaJSON);
});

function calcularTudo() {
    const nivel = parseInt(document.getElementById("nivel").value) || 1;
    const metadeNivel = Math.floor(nivel / 2);

    let bonusTreino = 2;
    if (nivel >= 7 && nivel <= 14) bonusTreino = 4;
    if (nivel >= 15) bonusTreino = 6;

    const forca = parseInt(document.getElementById("forca").value) || 0;
    const destreza = parseInt(document.getElementById("destreza").value) || 0;
    const constituicao = parseInt(document.getElementById("constituicao").value) || 0;
    const inteligencia = parseInt(document.getElementById("inteligencia").value) || 0;
    const sabedoria = parseInt(document.getElementById("sabedoria").value) || 0;
    const carisma = parseInt(document.getElementById("carisma").value) || 0;

    const mapaAtributos = { forca, destreza, constituicao, inteligencia, sabedoria, carisma };

    const pvInicial = parseInt(document.getElementById("pv-inicial").value) || 0;
    const pvPorNivel = parseInt(document.getElementById("pv-por-nivel").value) || 0;
    const pmInicial = parseInt(document.getElementById("pm-inicial").value) || 0;
    const pmPorNivel = parseInt(document.getElementById("pm-por-nivel").value) || 0;

    const pvMaximo = pvInicial + (pvPorNivel * (nivel - 1)) + (constituicao * nivel);
    const pmMaximo = pmInicial + (pmPorNivel * (nivel - 1));

    document.getElementById("pv-max").value = pvMaximo;
    document.getElementById("pm-max").value = pmMaximo;

    const bonusArmadura = parseInt(document.getElementById("bonus-armadura").value) || 0;
    const bonusEscudo = parseInt(document.getElementById("bonus-escudo").value) || 0;
    const outrosDefesa = parseInt(document.getElementById("outros-defesa").value) || 0;
    const ignorarDestreza = document.getElementById("ignorar-destreza").checked;
    const penalidadeArmadura = parseInt(document.getElementById("penalidade-armadura").value) || 0;

    const desNaDefesa = ignorarDestreza ? 0 : destreza;
    const defesaTotal = 10 + desNaDefesa + bonusArmadura + bonusEscudo + outrosDefesa;
    document.getElementById("defesa-total").value = defesaTotal;

    const cdAtributoChave = document.getElementById("cd-atributo-chave").value;
    const cdOutros = parseInt(document.getElementById("cd-outros").value) || 0;
    const modCDAtributo = mapaAtributos[cdAtributoChave] || 0;

    const cdTotal = 10 + metadeNivel + modCDAtributo + cdOutros;
    document.getElementById("cd-total").value = cdTotal;

    const linhasPericias = document.querySelectorAll(".pericia-linha");
    linhasPericias.forEach(linha => {
        const attrChave = linha.getAttribute("data-atributo");
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
                totalPericia = modAtributo + metadeNivel + bonusTreino + outrosBonus - penalidadeAplicada;
            } else {
                totalPericia = modAtributo + outrosBonus - penalidadeAplicada;
            }
            inputTotal.value = totalPericia;
        }
    });

    const cargaMaxima = 10 + (forca * 2);
    document.getElementById("carga-maxima").innerText = cargaMaxima;

    let cargaAtualAcumulada = 0;
    const itensInventario = document.querySelectorAll("#lista-inventario .item-inventario-linha");
    itensInventario.forEach(item => {
        const qtd = parseInt(item.querySelector(".item-qtd").value) || 0;
        const espaco = parseInt(item.querySelector(".item-espaco").value) || 0;
        cargaAtualAcumulada += (qtd * espaco);
    });
    document.getElementById("carga-atual").innerText = cargaAtualAcumulada;
}

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
            tamanho: document.getElementById("tamanho").value
        },
        atributos: {
            forca: document.getElementById("forca").value,
            destreza: document.getElementById("destreza").value,
            constituicao: document.getElementById("constituicao").value,
            inteligencia: document.getElementById("inteligencia").value,
            sabedoria: document.getElementById("sabedoria").value,
            carisma: document.getElementById("carisma").value
        },
        configClasse: {
            pvInicial: document.getElementById("pv-inicial").value,
            pmInicial: document.getElementById("pm-inicial").value,
            pvPorNivel: document.getElementById("pv-por-nivel").value,
            pmPorNivel: document.getElementById("pm-por-nivel").value,
            pvAtual: document.getElementById("pv-atual").value,
            pmAtual: document.getElementById("pm-atual").value
        },
        defesaCD: {
            bonusArmadura: document.getElementById("bonus-armadura").value,
            bonusEscudo: document.getElementById("bonus-escudo").value,
            outrosDefesa: document.getElementById("outros-defesa").value,
            ignorarDestreza: document.getElementById("ignorar-destreza").checked,
            penalidadeArmadura: document.getElementById("penalidade-armadura").value,
            cdAtributoChave: document.getElementById("cd-atributo-chave").value,
            cdOutros: document.getElementById("cd-outros").value
        },
        periciasOutros: {},
        inventario: [],
        magias: [],
        poderes: document.getElementById("poderes").value,
        anotacoes: document.getElementById("anotacoes").value
    };

    document.querySelectorAll(".pericia-linha").forEach(linha => {
        const checkbox = linha.querySelector("input[id$='-treinada']");
        const inputOutros = linha.querySelector("input[id$='-outros']");
        if (checkbox && inputOutros) {
            fichaDados.periciasOutros[checkbox.id] = {
                treinada: checkbox.checked,
                outros: inputOutros.value
            };
        }
    });

    document.querySelectorAll("#lista-inventario .item-inventario-linha").forEach(item => {
        fichaDados.inventario.push({
            nome: item.querySelector(".item-nome").value,
            qtd: item.querySelector(".item-qtd").value,
            espaco: item.querySelector(".item-espaco").value
        });
    });

    document.querySelectorAll("#lista-magias .magia-item").forEach(magia => {
        fichaDados.magias.push({
            nome: magia.querySelector(".magia-nome").value,
            custo: magia.querySelector(".magia-custo").value,
            execucao: magia.querySelector(".magia-execucao").value,
            alcance: magia.querySelector(".magia-alcance").value,
            duracao: magia.querySelector(".magia-duracao").value,
            resistencia: magia.querySelector(".magia-resistencia").value,
            descricao: magia.querySelector(".magia-descricao").value
        });
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fichaDados, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Ficha_${fichaDados.dadosBasicos.nome || "Personagem"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importarFichaJSON(evento) {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(e) {
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
            for (let chave in dados.configClasse) {
                const el = document.getElementById(chave);
                if (el) el.value = dados.configClasse[chave];
            }

            document.getElementById("bonus-armadura").value = dados.defesaCD.bonusArmadura;
            document.getElementById("bonus-escudo").value = dados.defesaCD.bonusEscudo;
            document.getElementById("outros-defesa").value = dados.defesaCD.outrosDefesa;
            document.getElementById("ignorar-destreza").checked = dados.defesaCD.ignorarDestreza;
            document.getElementById("penalidade-armadura").value = dados.defesaCD.penalidadeArmadura;
            document.getElementById("cd-atributo-chave").value = dados.defesaCD.cdAtributoChave;
            document.getElementById("cd-outros").value = dados.defesaCD.cdOutros;

            for (let id in dados.periciasOutros) {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                    checkbox.checked = dados.periciasOutros[id].treinada;
                    const inputOutros = document.getElementById(id.replace("-treinada", "-outros"));
                    if (inputOutros) inputOutros.value = dados.periciasOutros[id].outros;
                }
            }

            const listaInventario = document.getElementById("lista-inventario");
            listaInventario.innerHTML = "";
            dados.inventario.forEach(item => {
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

            const listaMagias = document.getElementById("lista-magias");
            listaMagias.innerHTML = "";
            dados.magias.forEach(magia => {
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