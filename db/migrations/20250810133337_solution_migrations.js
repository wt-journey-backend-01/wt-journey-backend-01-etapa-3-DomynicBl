// 20250810133337_solution_migrations.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('agentes', function (table) {
      table.increments('id').primary(); // ID auto-incremental e chave primária
      table.string('nome', 255).notNullable();
      table.date('dataDeIncorporacao').notNullable();
      table.string('cargo', 100).notNullable();
    })
    .createTable('casos', function (table) {
      table.increments('id').primary();
      table.string('titulo', 255).notNullable();
      table.text('descricao').notNullable();
      table.string('status', 50).notNullable();
      
      // Chave Estrangeira
      table.integer('agente_id')
           .unsigned() // Garante que o número não seja negativo
           .notNullable()
           .references('id')
           .inTable('agentes')
           .onUpdate('CASCADE') // Se o id do agente mudar, atualiza nos casos também
           .onDelete('RESTRICT'); // Impede deletar um agente se ele tiver casos em aberto
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // A ordem de remoção é a inversa da criação por causa da chave estrangeira
  return knex.schema
    .dropTableIfExists('casos')
    .dropTableIfExists('agentes');
};