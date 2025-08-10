// casosRepository.js

const db = require('../db/db');

// Lista de status permitidos para o recurso 'casos'
const STATUS_VALIDOS = ['aberto', 'solucionado'];

function findAll(filtros = {}) {
    
    if (filtros.status && !STATUS_VALIDOS.includes(filtros.status.toLowerCase())) {
        const error = new Error(`O status '${filtros.status}' é inválido.`);
        error.name = 'ValidationError'; // Damos um nome ao erro para identificá-lo
        throw error;
    }

    // Define valores padrão para paginação
    const page = parseInt(filtros.page, 10) || 1;
    const pageSize = parseInt(filtros.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;

    let query = db('casos').select('*');

    if (filtros.agente_id) {
        query.where({ agente_id: filtros.agente_id });
    }

    if (filtros.status) {
        query.where({ status: filtros.status });
    }

    if (filtros.q) {
        query.where(function() {
            this.where('titulo', 'ilike', `%${filtros.q}%`)
                .orWhere('descricao', 'ilike', `%${filtros.q}%`);
        });
    }

    query.limit(pageSize).offset(offset);

    return query;
}

function findById(id) {
    return db('casos').where({ id }).first();
}

async function create(caso) {
    const [novoCaso] = await db('casos').insert(caso).returning('*');
    return novoCaso;
}

async function update(id, casoAtualizado) {
    const [caso] = await db('casos').where({ id }).update(casoAtualizado).returning('*');
    return caso;
}

async function patch(id, dadosParciais) {
    const [caso] = await db('casos').where({ id }).update(dadosParciais).returning('*');
    return caso;
}

function remove(id) {
    return db('casos').where({ id }).del();
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    patch,
    remove
};