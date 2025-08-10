require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const agentesRouter = require('./routes/agentesRoutes');
const casosRouter = require('./routes/casosRoutes');

const app = express();

// Carrega o arquivo YAML de especificação da API
const swaggerDocument = YAML.load(path.join(__dirname, './docs/api-spec.yaml'));

app.use(express.json());

// Rota para a documentação da API
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da API
app.use(agentesRouter);
app.use(casosRouter);

// Middleware para tratamento de erros genéricos
// ATENÇÃO: removi o app.listen daqui e adicionei o module.exports
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
});

module.exports = app; // A linha mais importante! Exporta o app para ser usado em outros arquivos.