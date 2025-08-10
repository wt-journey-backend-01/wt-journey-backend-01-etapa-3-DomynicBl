// casosController.js
const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');
const errorHandler = require('../utils/errorHandler');

function validarDadosCaso(dados) {
    const errors = {};

    if ('id' in dados) {
        errors.id = "O campo 'id' não pode ser alterado.";
    }

    if (!dados.titulo) errors.titulo = "O campo 'titulo' é obrigatório.";
    if (!dados.descricao) errors.descricao = "O campo 'descricao' é obrigatória.";
    if (!dados.status || !['aberto', 'solucionado'].includes(dados.status)) {
        errors.status = "O campo 'status' é obrigatório e deve ser 'aberto' ou 'solucionado'.";
    }
    if (!dados.agente_id) errors.agente_id = "O campo 'agente_id' é obrigatório.";
    return errors;
}

async function getAllCasos(req, res) {
    try {
        const casos = await casosRepository.findAll(req.query);
        res.status(200).json(casos);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return errorHandler.sendInvalidParameterError(res, { status: error.message });
        }
        errorHandler.sendInternalServerError(res, error);
    }
}

async function getCasoById(req, res) {
    try {
        const { id } = req.params;
        const caso = await casosRepository.findById(id);
        if (!caso) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }
        res.status(200).json(caso);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function createCaso(req, res) {
    try {
        const errors = validarDadosCaso(req.body);
        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }
        if (!(await agentesRepository.findById(req.body.agente_id))) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${req.body.agente_id}' não encontrado.`);
        }
        const novoCaso = await casosRepository.create(req.body);
        res.status(201).json(novoCaso);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function updateCaso(req, res) {
    try {
        const { id } = req.params;
        if (!(await casosRepository.findById(id))) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }
        const errors = validarDadosCaso(req.body);
        if (Object.keys(errors).length > 0) {
            return errorHandler.sendInvalidParameterError(res, errors);
        }
        if (!(await agentesRepository.findById(req.body.agente_id))) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${req.body.agente_id}' não encontrado.`);
        }
        const casoAtualizado = await casosRepository.update(id, req.body);
        res.status(200).json(casoAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function patchCaso(req, res) {
    try {
        const { id } = req.params;
        const dadosParciais = req.body;

        if (!(await casosRepository.findById(id))) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }

        if (dadosParciais.agente_id && !(await agentesRepository.findById(dadosParciais.agente_id))) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${dadosParciais.agente_id}' não encontrado.`);
        }
        
        if (dadosParciais.status && !['aberto', 'solucionado'].includes(dadosParciais.status)) {
            return errorHandler.sendInvalidParameterError(res, { 
                status: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'." 
            });
        }
        const casoAtualizado = await casosRepository.patch(id, req.body);
        res.status(200).json(casoAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function deleteCaso(req, res) {
    try {
        const { id } = req.params;
        if (!(await casosRepository.findById(id))) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }
        await casosRepository.remove(id);
        res.status(204).send();
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function getAgenteByCasoId(req, res) {
    try {
        const { id } = req.params;
        const caso = await casosRepository.findById(id);
        if (!caso) {
            return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        }
        const agente = await agentesRepository.findById(caso.agente_id);
        if (!agente) {
            return errorHandler.sendNotFoundError(res, 'Agente associado ao caso não foi encontrado.');
        }
        res.status(200).json(agente);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }}

module.exports = {
    getAllCasos,
    getCasoById,
    createCaso,
    updateCaso,
    patchCaso,
    deleteCaso,
    getAgenteByCasoId
};