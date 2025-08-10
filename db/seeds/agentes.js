// db/seeds/agentes.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('agentes').insert([
    { nome: "Rommel Carneiro", dataDeIncorporacao: "1992-10-04", cargo: "delegado" },
    { nome: "Carlos Silva", dataDeIncorporacao: "2010-07-19", cargo: "agente" },
    { nome: "Ana Oliveira", dataDeIncorporacao: "2015-03-12", cargo: "inspetor" },
    { nome: "Fernanda Souza", dataDeIncorporacao: "2018-11-25", cargo: "perito" },
    { nome: "Roberto Lima", dataDeIncorporacao: "2020-05-30", cargo: "agente" },
    { nome: "Domynic Barros Lima", dataDeIncorporacao: "2023-07-22", cargo: "delegado" }
  ]);
};