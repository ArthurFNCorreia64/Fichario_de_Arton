const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Se o usuário acessar a raiz "/", nós entregamos o index.html
    let filePath = req.url === '/' 
        ? path.join(__dirname, 'public', 'index.html') 
        : path.join(__dirname, 'public', req.url);

    // Pega a extensão do arquivo para definir o tipo de conteúdo (Content-Type)
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
    }

    // Lê o arquivo no disco e envia para o navegador
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Arquivo não encontrado (404)
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>Erro 404: Arquivo nao encontrado</h1>', 'utf-8');
            } else {
                // Erro interno do servidor (500)
                res.writeHead(500);
                res.end(`Erro no servidor: ${error.code}`);
            }
        } else {
            // Sucesso (200) - Entrega o arquivo solicitado
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso em: http://localhost:${PORT}`);
});