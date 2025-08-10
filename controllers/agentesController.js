// agentesController.js
const agentesRepository = require('../repositories/agentesRepository');
const errorHandler = require('../utils/errorHandler');

// Função de validação completa para POST e PUT
function validarDadosAgente(dados) {
    const errors = {};
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    
    if ('id' in dados) {
        errors.id = "O campo 'id' não pode ser alterado.";
    }
    if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim() === '') {
        errors.nome = "O campo 'nome' é obrigatório e deve ser uma string não vazia.";
    }
    if (!dados.dataDeIncorporacao) {
        errors.dataDeIncorporacao = "O campo 'dataDeIncorporacao' é obrigatório.";
    } else if (!dateFormat.test(dados.dataDeIncorporacao)) {
        errors.dataDeIncorporacao = "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'.";
    } else {
        const dataIncorp = new Date(dados.dataDeIncorporacao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        if (dataIncorp > hoje) {
            errors.dataDeIncorporacao = "Data de incorporação não pode ser no futuro.";
        }
    }
    if (!dados.cargo || typeof dados.cargo !== 'string' || dados.cargo.trim() === '') {
        errors.cargo = "O campo 'cargo' é obrigatório e deve ser uma string não vazia.";
    }
    return errors;
}

// NOVA FUNÇÃO: Validação específica e mais flexível para PATCH
function validarDadosParciaisAgente(dados) {
    const errors = {};
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    if ('id' in dados) {
        errors.id = "O campo 'id' não pode ser alterado.";
    }
    if (dados.dataDeIncorporacao && !dateFormat.test(dados.dataDeIncorporacao)) {
        errors.dataDeIncorporacao = "Campo 'dataDeIncorporacao' deve seguir a formatação 'YYYY-MM-DD'.";
    }
    if (dados.nome !== undefined && (typeof dados.nome !== 'string' || dados.nome.trim() === '')) {
        errors.nome = "O campo 'nome' deve ser uma string não vazia.";
    }
    if (dados.cargo !== undefined && (typeof dados.cargo !== 'string' || dados.cargo.trim() === '')) {
        errors.cargo = "O campo 'cargo' deve ser uma string não vazia.";
    }
    return errors;
}


async function getAllAgentes(req, res) {
    try {
        const filtros = {
            cargo: req.query.cargo,
            dataDeIncorporacao_gte: req.query.dataDeIncorporacao_gte,
            dataDeIncorporacao_lte: req.query.dataDeIncorporacao_lte,
            sort: req.query.sort,
            page: req.query.page,
            pageSize: req.query.pageSize,
        };
        const agentes = await agentesRepository.findAll(filtros);
        res.status(200).json(agentes);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

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
        // CORREÇÃO FINAL: Removendo explicitamente o ID antes de criar
        const { id, ...dadosParaCriar } = req.body;
        const novoAgente = await agentesRepository.create(dadosParaCriar);
        res.status(201).json(novoAgente);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

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
        // CORREÇÃO FINAL: Removendo explicitamente o ID antes de atualizar
        const { id: idDoBody, ...dadosParaAtualizar } = req.body;
        const agenteAtualizado = await agentesRepository.update(id, dadosParaAtualizar);
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

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
        if (!dadosParciais || Object.keys(dadosParciais).length === 0) {
            return errorHandler.sendInvalidParameterError(res, { body: "Corpo da requisição para atualização parcial (PATCH) não pode estar vazio." });
        }
        // CORREÇÃO FINAL: Usando a nova função de validação parcial
        const errors = validarDadosParciaisAgente(dadosParciais);
        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }
        const agenteAtualizado = await agentesRepository.patch(id, dadosParciais);
        res.status(200).json(agenteAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

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