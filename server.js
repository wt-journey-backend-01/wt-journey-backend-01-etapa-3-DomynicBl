// server.js
const app = require('./app'); // Importa a configuração do app do novo arquivo

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em http://localhost:${PORT}`);
    console.log(`Documentação da API disponível em http://localhost:${PORT}/docs`);
});