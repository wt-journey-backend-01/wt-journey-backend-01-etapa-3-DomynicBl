// agentesController.js
const agentesRepository = require('../repositories/agentesRepository');
const errorHandler = require('../utils/errorHandler');

// Função auxiliar para validar os dados de um agente
function validarDadosAgente(dados) {
    const errors = {};
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    if ('id' in dados) {
        errors.id = "O campo 'id' não pode ser alterado.";
    }

    if (!dados.nome) errors.nome = "O campo 'nome' é obrigatório.";
    if (!dados.dataDeIncorporacao) {
        errors.dataDeIncorporacao = "O campo 'dataDeIncorporacao' é obrigatório.";
    } else if (!dateFormat.test(dados.dataDeIncorporacao)) {
        errors.dataDeIncorporacao = "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'.";
    } else {
        const dataIncorp = new Date(dados.dataDeIncorporacao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
        if (dataIncorp > hoje) {
            errors.dataDeIncorporacao = "Data de incorporação não pode ser no futuro.";
        }
    }
    if (!dados.cargo) errors.cargo = "O campo 'cargo' é obrigatório.";

    return errors;
}

// CORRIGIDO: Passando todos os filtros para o repositório
async function getAllAgentes(req, res) {
    try {
        // Passa todos os query params para o repositório lidar com os filtros
        const agentes = await agentesRepository.findAll(req.query);
        res.status(200).json(agentes);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// CORRIGIDO: Validação do ID
async function getAgenteById(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });
        }
        
        const agente = await agentesRepository.findById(id);
        if (!agente) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }
        res.status(200).json(agente);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function createAgente(req, res) {
    try {
        const errors = validarDadosAgente(req.body);
        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }

        const novoAgente = await agentesRepository.create(req.body);
        res.status(201).json(novoAgente);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// CORRIGIDO: Validação do ID
async function updateAgente(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });
        }

        if (!(await agentesRepository.findById(id))) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }
        
        const errors = validarDadosAgente(req.body);
        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }

        const agenteAtualizado = await agentesRepository.update(id, req.body);
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// CORRIGIDO: Validação robusta para o PATCH
async function patchAgente(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });
        }

        const dadosParciais = req.body;

        if (!(await agentesRepository.findById(id))) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }
        
        if ('id' in dadosParciais) {
            return errorHandler.sendInvalidParameterError(res, { id: "O campo 'id' não pode ser alterado." });
        }

        if (!dadosParciais || Object.keys(dadosParciais).length === 0) {
            return errorHandler.sendInvalidParameterError(res, { body: "Corpo da requisição para atualização parcial (PATCH) não pode estar vazio." });
        }

        if (dadosParciais.dataDeIncorporacao) {
            const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateFormat.test(dadosParciais.dataDeIncorporacao)) {
                return errorHandler.sendInvalidParameterError(res, {
                    dataDeIncorporacao: "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'."
                });
            }
        }

        const agenteAtualizado = await agentesRepository.patch(id, dadosParciais);
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

// CORRIGIDO: Validação do ID
async function deleteAgente(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });
        }

        if (!(await agentesRepository.findById(id))) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }
        
        await agentesRepository.remove(id);
        res.status(204).send();
    } catch (error) {
        if (error.code === '23503') { 
            return errorHandler.sendInvalidParameterError(res, {
                delecao: 'Não é possível excluir o agente pois ele está associado a casos existentes.'
            });
        }
        errorHandler.sendInternalServerError(res, error);
    }
}

// CORRIGIDO: Validação do ID
async function getCasosDoAgente(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });
        }

        if (!(await agentesRepository.findById(id))) {
            return errorHandler.sendNotFoundError(res, 'Agente não encontrado.');
        }
        
        const casos = await agentesRepository.findCasosByAgenteId(id);
        res.status(200).json(casos);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

module.exports = {
    getAllAgentes,
    getAgenteById,
    createAgente,
    updateAgente,
    patchAgente,
    deleteAgente,
    getCasosDoAgente
};