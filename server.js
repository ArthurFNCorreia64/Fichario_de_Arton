// Importa os módulos nativos do Node.js necessários para
// criar o servidor HTTP, ler arquivos do sistema e montar caminhos.
const http = require("http");
const fs = require("fs");
const path = require("path");

// Define a porta em que o servidor vai escutar.
const PORT = 3000;

// Cria o servidor e define o comportamento para cada requisição.
// A função recebe o objeto de requisição (req) e o objeto de resposta (res).
const server = http.createServer((req, res) => {
	// Se a URL for '/', devolve o arquivo inicial 'index.html'.
	// Para outras URLs, remove a barra inicial e monta o caminho relativo à pasta do projeto.
	const requestedFile = req.url === "/" ? "index.html" : req.url.slice(1);
	let filePath = path.join(__dirname, requestedFile);

	// Descobre a extensão do arquivo para enviar o Content-Type correto.
	const extname = path.extname(filePath);
	let contentType = "text/html";

	switch (extname) {
		case ".js":
			contentType = "text/javascript";
			break;
		case ".css":
			contentType = "text/css";
			break;
		case ".json":
			contentType = "application/json";
			break;
	}

	// Lê o arquivo do disco usando fs.readFile.
	// Se houver erro, devolve o código apropriado (404 ou 500).
	fs.readFile(filePath, (error, content) => {
		if (error) {
			if (error.code === "ENOENT") {
				// Arquivo não existe no disco: envia 404 para o navegador.
				res.writeHead(404, { "Content-Type": "text/html" });
				res.end("<h1>Erro 404: Arquivo não encontrado</h1>", "utf-8");
			} else {
				// Outro erro de leitura de arquivo: problema interno do servidor.
				res.writeHead(500);
				res.end(`Erro no servidor: ${error.code}`);
			}
		} else {
			// Arquivo encontrado: envia o conteúdo com o tipo MIME correto.
			res.writeHead(200, { "Content-Type": contentType });
			res.end(content, "utf-8");
		}
	});
});

// Inicia o servidor ouvindo na porta configurada.
// Quando o servidor sobe, mostra um log com a URL para acesso local.
server.listen(PORT, () => {
	console.log(`Servidor rodando com sucesso em: http://localhost:${PORT}`);
});
