// solution_migrations.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  return knex.transaction(async (trx) => {
    // Limpa as tabelas dentro da transação.
    await trx.raw('TRUNCATE TABLE agentes, casos RESTART IDENTITY CASCADE');

    // Prepara os dados dos agentes.
    const agentesData = [
      { nome: "Rommel Carneiro", dataDeIncorporacao: "1992-10-04", cargo: "delegado" },
      { nome: "Carlos Silva", dataDeIncorporacao: "2010-07-19", cargo: "agente" },
      { nome: "Ana Oliveira", dataDeIncorporacao: "2015-03-12", cargo: "inspetor" },
      { nome: "Fernanda Souza", dataDeIncorporacao: "2018-11-25", cargo: "perito" },
      { nome: "Roberto Lima", dataDeIncorporacao: "2020-05-30", cargo: "agente" },
      { nome: "Domynic Barros Lima", dataDeIncorporacao: "2023-07-22", cargo: "delegado" }
    ];

    // Insere os agentes um por um para garantir a ordem e cria o mapa de IDs.
    const mapaAgentes = {};
    for (const agenteData of agentesData) {
      const [agenteInserido] = await trx('agentes').insert(agenteData).returning('*');
      mapaAgentes[agenteInserido.nome] = agenteInserido.id;
    }

    // Prepara os casos usando o mapa de IDs recém-criado e garantido.
    const casosParaInserir = [
      { titulo: "Homicídio no Bairro União", descricao: "Disparos foram reportados...", status: "aberto", agente_id: mapaAgentes["Rommel Carneiro"] },
      { titulo: "Furto de Veículo", descricao: "Um carro modelo sedan foi furtado...", status: "solucionado", agente_id: mapaAgentes["Ana Oliveira"] },
      { titulo: "Roubo ao Banco Central", descricao: "Um grupo armado invadiu o cofre principal...", status: "aberto", agente_id: mapaAgentes["Rommel Carneiro"] },
      { titulo: "Desaparecimento Misterioso", descricao: "Cientista renomado desaparece...", status: "solucionado", agente_id: mapaAgentes["Carlos Silva"] },
      { titulo: "Fraude em Licitação", descricao: "Suspeita de manipulação em processo licitatório...", status: "aberto", agente_id: mapaAgentes["Fernanda Souza"] },
      { titulo: "Assalto a Mão Armada", descricao: "Bandidos armados invadem loja de eletrônicos...", status: "aberto", agente_id: mapaAgentes["Roberto Lima"] },
      { titulo: "Vazamento de Dados", descricao: "Informações confidenciais foram expostas...", status: "aberto", agente_id: mapaAgentes["Domynic Barros Lima"] }
    ];

    // Insere os casos dentro da mesma transação.
    await trx('casos').insert(casosParaInserir);
  });
};