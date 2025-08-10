// db.js
const knexConfig = require('../knexfile');
const knex = require('knex');

// Define o ambiente com base na variável de ambiente NODE_ENV, padrão para 'development'
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

module.exports = db;