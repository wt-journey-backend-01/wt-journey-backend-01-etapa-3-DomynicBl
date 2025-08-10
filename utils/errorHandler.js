// errorHandler.js

/**
 * Envia uma resposta de erro com status 400 (Bad Request).
 * Usado para erros de validação de entrada do usuário.
 * @param {object} res - O objeto de resposta do Express.
 * @param {object} errors - Um objeto onde cada chave é um campo e o valor é a mensagem de erro.
 */
function sendInvalidParameterError(res, errors) {
    return res.status(400).json({
        status: 400,
        message: "Parâmetros inválidos",
        errors: errors
    });
}

/**
 * Envia uma resposta de erro com status 404 (Not Found).
 * Usado quando um recurso específico não é encontrado.
 * @param {object} res - O objeto de resposta do Express.
 * @param {string} message - A mensagem de erro.
 */
function sendNotFoundError(res, message) {
    return res.status(404).json({
        status: 404,
        message: message || "Recurso não encontrado."
    });
}

/**
 * Envia uma resposta de erro com status 500 (Internal Server Error).
 * Usado para erros inesperados no servidor.
 * @param {object} res - O objeto de resposta do Express.
 * @param {Error} error - O objeto de erro capturado.
 */
function sendInternalServerError(res, error) {
    console.error(error); // Log do erro para depuração no console do servidor
    return res.status(500).json({
        status: 500,
        message: "Ocorreu um erro interno no servidor."
    });
}

module.exports = {
    sendInvalidParameterError,
    sendNotFoundError,
    sendInternalServerError
};