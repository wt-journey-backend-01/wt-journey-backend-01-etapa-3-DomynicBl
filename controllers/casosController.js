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
    if (dados.agente_id === undefined) {
        errors.agente_id = "O campo 'agente_id' é obrigatório.";
    }
    return errors;
}

async function getAllCasos(req, res) {
    try {
        const filtros = {
            status: req.query.status,
            agente_id: req.query.agente_id,
            q: req.query.q,
            page: req.query.page,
            pageSize: req.query.pageSize
        };
        const casos = await casosRepository.findAll(filtros);
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
        const id = Number(req.params.id);
        if (isNaN(id)) return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });

        const caso = await casosRepository.findById(id);
        if (!caso) return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        
        res.status(200).json(caso);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function createCaso(req, res) {
    try {
        const errors = validarDadosCaso(req.body);
        if (Object.keys(errors).length > 0) return errorHandler.sendInvalidParameterError(res, errors);

        const agenteId = Number(req.body.agente_id);
        if (isNaN(agenteId)) return errorHandler.sendInvalidParameterError(res, { agente_id: "O campo 'agente_id' deve ser um número válido." });
        
        if (!(await agentesRepository.findById(agenteId))) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${agenteId}' não encontrado.`);
        }
        
        const { id, ...dadosParaCriar } = req.body;
        const novoCaso = await casosRepository.create(dadosParaCriar);
        res.status(201).json(novoCaso);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function updateCaso(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });
        
        if (!(await casosRepository.findById(id))) return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');

        const errors = validarDadosCaso(req.body);
        if (Object.keys(errors).length > 0) return errorHandler.sendInvalidParameterError(res, errors);

        const agenteId = Number(req.body.agente_id);
        if (isNaN(agenteId)) return errorHandler.sendInvalidParameterError(res, { agente_id: "O campo 'agente_id' deve ser um número válido." });
        
        if (!(await agentesRepository.findById(agenteId))) {
            return errorHandler.sendNotFoundError(res, `Agente com id '${agenteId}' não encontrado.`);
        }

        const { id: idDoBody, ...dadosParaAtualizar } = req.body;
        const casoAtualizado = await casosRepository.update(id, dadosParaAtualizar);
        res.status(200).json(casoAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function patchCaso(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });

        const dadosParciais = req.body;
        if (!(await casosRepository.findById(id))) return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        
        if (dadosParciais.agente_id !== undefined) {
            const agenteId = Number(dadosParciais.agente_id);
            if (isNaN(agenteId)) return errorHandler.sendInvalidParameterError(res, { agente_id: "O campo 'agente_id' deve ser um número válido." });
            if (!(await agentesRepository.findById(agenteId))) {
                return errorHandler.sendNotFoundError(res, `Agente com id '${agenteId}' não encontrado.`);
            }
        }
        
        if (dadosParciais.status && !['aberto', 'solucionado'].includes(dadosParciais.status)) {
            return errorHandler.sendInvalidParameterError(res, { status: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'." });
        }
        
        const { id: idDoBody, ...dadosParaAtualizar } = dadosParciais;
        const casoAtualizado = await casosRepository.patch(id, dadosParaAtualizar);
        res.status(200).json(casoAtualizado);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function deleteCaso(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });

        if (!(await casosRepository.findById(id))) return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        
        await casosRepository.remove(id);
        res.status(204).send();
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

async function getAgenteByCasoId(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return errorHandler.sendInvalidParameterError(res, { id: "O ID deve ser um número válido." });
        
        const caso = await casosRepository.findById(id);
        if (!caso) return errorHandler.sendNotFoundError(res, 'Caso não encontrado.');
        
        const agente = await agentesRepository.findById(caso.agente_id);
        if (!agente) return errorHandler.sendNotFoundError(res, 'Agente associado ao caso não foi encontrado.');
        
        res.status(200).json(agente);
    } catch (error) {
        errorHandler.sendInternalServerError(res, error);
    }
}

module.exports = {
    getAllCasos,
    getCasoById,
    createCaso,
    updateCaso,
    patchCaso,
    deleteCaso,
    getAgenteByCasoId
};