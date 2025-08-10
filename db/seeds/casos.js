/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const rommel = await knex('agentes').where({ nome: 'Rommel Carneiro' }).first();
  const ana = await knex('agentes').where({ nome: 'Ana Oliveira' }).first();
  const carlos = await knex('agentes').where({ nome: 'Carlos Silva' }).first();
  const fernanda = await knex('agentes').where({ nome: 'Fernanda Souza' }).first();
  const roberto = await knex('agentes').where({ nome: 'Roberto Lima' }).first();
  const domynic = await knex('agentes').where({ nome: 'Domynic Barros Lima' }).first();

  await knex('casos').insert([
    { titulo: "Homicídio no Bairro União", descricao: "Disparos foram reportados...", status: "aberto", agente_id: rommel.id },
    { titulo: "Furto de Veículo", descricao: "Um carro modelo sedan foi furtado...", status: "solucionado", agente_id: ana.id },
    { titulo: "Roubo ao Banco Central", descricao: "Um grupo armado invadiu o cofre principal...", status: "aberto", agente_id: rommel.id },
    { titulo: "Desaparecimento Misterioso", descricao: "Cientista renomado desaparece...", status: "solucionado", agente_id: carlos.id },
    { titulo: "Fraude em Licitação", descricao: "Suspeita de manipulação em processo licitatório...", status: "aberto", agente_id: fernanda.id },
    { titulo: "Assalto a Mão Armada", descricao: "Bandidos armados invadem loja de eletrônicos...", status: "aberto", agente_id: roberto.id },
    { titulo: "Vazamento de Dados", descricao: "Informações confidenciais foram expostas...", status: "aberto", agente_id: domynic.id }
  ]);
};