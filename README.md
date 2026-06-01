# Fichário de Arton

![Tormenta 20](https://img.shields.io/badge/RPG-Tormenta%2020-red?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JS-blue?style=for-the-badge)

Uma aplicação web interativa, responsiva e automatizada para gerenciamento de fichas de personagem do sistema **Tormenta 20**. Desenvolvida com foco na praticidade durante as sessões de RPG de mesa, eliminando o uso de papel e caneta enquanto mantém a identidade visual clássica do cenário de Arton.

Desenvolvida como Projeto da cadeira de Códigos Alta Perfomance Web da UNINASSAU

Turma: Ciências da Computação (3º Período)

Alunos:
- Alyson Coutinho 01812644
- Arthur Fernandes 01848451
- Beatriz Jordão 01812582
- Julia Evelyn 01803734
- Lívia Moreno 01800123

---

## Visual & Identidade

O design da aplicação foi diretamente inspirado na ficha oficial impressa de Tormenta 20. Conta com:
* **Paleta de Cores Temática:** Uso marcante de vermelho carmim, preto sólido e fundos estilo pergaminho claro.
* **Tipografia Épica:** Títulos estilizados com as fontes de fantasia *Metamorphous* e *Cinzel*.
* **Interface Otimizada:** Organização em seções colapsáveis (sanfonas) para facilitar a navegação em telas de celulares ou tablets durante a jogatina.

---

## Funcionalidades Principais

* **Cálculos Automatizados:** 
  * Atualização automática dos modificadores de Atributos ($FOR$, $DES$, $CON$, $INT$, $SAB$, $CAR$).
  * Cálculo dinâmico do total das Perícias com base na metade do nível, atributos e bônus de treino.
  * Cálculo automático de Defesa e limite de carga do Inventário.
* **Gerenciador de Status Vital:** Controle ágil de Pontos de Vida (PV) e Pontos de Mana (PM), incluindo mecânica de descanso para recuperação rápida.
* **Inventário e Grimório Dinâmicos:** Adicione, edite e remova itens, equipamentos e magias em tempo real.
* **Sistema de Backup (Importar/Exportar):** Exporte sua ficha em formato `.json` para guardar no PC ou envie para o mestre da mesa importar no próprio navegador.

---

## Tecnologias Utilizadas

Este projeto foi construído puramente com tecnologias nativas da Web (*Vanilla Web Tech*), sem a necessidade de frameworks pesados, garantindo leveza e carregamento instantâneo:

* **HTML5:** Estruturação semântica da ficha (utilizando tags modernas como `<details>` e `<summary>`).
* **CSS3:** Estilização temática customizada, fontes do Google Fonts, variáveis globais e layout responsivo.
* **JavaScript (ES6):** Manipulação de DOM, escutadores de eventos para cálculos dinâmicos e persistência de dados.
* **NodeJS:** Criação de host local para execução da página.

---

## Estrutura do Projeto

```text
├── public/
│   ├── style.css     # Estilização temática Tormenta 20
│   └── script.js     # Lógica, automações e localStorage
├── index.html        # Estrutura principal da ficha
└── README.md         # Documentação do projeto
└── server.js         # Host local da webpágina

