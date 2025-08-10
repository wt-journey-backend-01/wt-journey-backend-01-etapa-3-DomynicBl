// agentes.test.js

const request = require('supertest');
const app = require('../app');
const db = require('../db/db');

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  // 1. Limpa a tabela 'casos' primeiro (por causa da chave estrangeira)
  await db('casos').del();
  // 2. Limpa a tabela 'agentes'
  await db('agentes').del();
  // 3. Agora, com o banco limpo, executa os seeds
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
});

describe('Endpoints de /agentes', () => {

  describe('GET /agentes', () => {
    it('Deve listar todos os 6 agentes da seed', async () => {
      const res = await request(app).get('/agentes');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(6);
      expect(res.body[0]).toHaveProperty('id');
    });

    it('Deve filtrar agentes pelo cargo "agente"', async () => {
      const res = await request(app).get('/agentes?cargo=agente');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('Deve retornar um array vazio para um cargo que não existe', async () => {
      const res = await request(app).get('/agentes?cargo=inexistente');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it('Deve ordenar agentes por data de incorporação descendente', async () => {
      const res = await request(app).get('/agentes?sort=-dataDeIncorporacao');
      expect(res.statusCode).toBe(200);
      expect(res.body[0].nome).toBe('Domynic Barros Lima'); // Mais recente
      expect(res.body[5].nome).toBe('Rommel Carneiro');   // Mais antigo
    });

    it('Deve paginar os resultados, mostrando 3 agentes na página 2', async () => {
        const res = await request(app).get('/agentes?pageSize=3&page=2');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(3);
        expect(res.body[0].nome).toBe('Fernanda Souza'); // O 4º agente na ordem padrão
    });
  });

  describe('GET /agentes/:id', () => {
    it('Deve retornar um agente específico pelo ID', async () => {
        const agente = await db('agentes').where({ nome: 'Ana Oliveira' }).first();
        const res = await request(app).get(`/agentes/${agente.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.nome).toBe('Ana Oliveira');
    });

    it('Deve retornar 404 para um ID de agente que não existe', async () => {
        const res = await request(app).get('/agentes/9999');
        expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /agentes', () => {
    it('Deve criar um novo agente com sucesso', async () => {
      const novoAgente = { nome: 'Mariana Costa', dataDeIncorporacao: '2024-01-10', cargo: 'analista' };
      const res = await request(app).post('/agentes').send(novoAgente);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.nome).toBe('Mariana Costa');
      
      const agenteNoBanco = await db('agentes').where({ id: res.body.id }).first();
      expect(agenteNoBanco).toBeDefined();
    });

    it('Deve retornar 400 se o nome não for fornecido', async () => {
        const novoAgente = { dataDeIncorporacao: '2024-01-10', cargo: 'analista' };
        const res = await request(app).post('/agentes').send(novoAgente);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toHaveProperty('nome');
    });

    it('Deve retornar 400 se a data estiver em formato inválido', async () => {
        const novoAgente = { nome: 'Mariana Costa', dataDeIncorporacao: '10-01-2024', cargo: 'analista' };
        const res = await request(app).post('/agentes').send(novoAgente);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toHaveProperty('dataDeIncorporacao');
    });

    it('Deve retornar 400 se a data de incorporação for no futuro', async () => {
        const dataFutura = new Date();
        dataFutura.setDate(dataFutura.getDate() + 5);
        const dataFuturaString = dataFutura.toISOString().split('T')[0];
        const novoAgente = { nome: 'Viajante do Tempo', dataDeIncorporacao: dataFuturaString, cargo: 'observador' };

        const res = await request(app).post('/agentes').send(novoAgente);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors.dataDeIncorporacao).toBe('Data de incorporação não pode ser no futuro.');
    });
  });

  describe('PATCH /agentes/:id', () => {
    it('Deve atualizar parcialmente um agente', async () => {
        const agente = await db('agentes').where({ nome: 'Carlos Silva' }).first();
        const res = await request(app).patch(`/agentes/${agente.id}`).send({ cargo: 'agente especial' });
        expect(res.statusCode).toBe(200);
        expect(res.body.cargo).toBe('agente especial');
        expect(res.body.nome).toBe('Carlos Silva');
    });

    it('Deve retornar 400 se o corpo da requisição estiver vazio', async () => {
        const agente = await db('agentes').first();
        const res = await request(app).patch(`/agentes/${agente.id}`).send({});
        expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /agentes/:id', () => {
    it('Deve deletar um agente que não possui casos', async () => {
        const agenteParaDeletar = await db('agentes').insert({ nome: 'Agente Descartável', dataDeIncorporacao: '2025-01-01', cargo: 'temporario' }).returning('id');
        const res = await request(app).delete(`/agentes/${agenteParaDeletar[0].id}`);
        expect(res.statusCode).toBe(204);
    });
    
    it('Deve retornar erro 400 ao tentar deletar um agente com casos associados', async () => {
        const agenteComCasos = await db('agentes').where({ nome: 'Rommel Carneiro' }).first();
        const res = await request(app).delete(`/agentes/${agenteComCasos.id}`);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors.delecao).toContain('associado a casos existentes');
    });
  });

  describe('GET /agentes/:id/casos', () => {
    it('Deve listar os 2 casos do agente Rommel Carneiro', async () => {
        const agente = await db('agentes').where({ nome: 'Rommel Carneiro' }).first();
        const res = await request(app).get(`/agentes/${agente.id}/casos`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    it('Deve retornar uma lista vazia para um agente sem casos', async () => {
        const novoAgente = await db('agentes').insert({ nome: 'Agente Novo', dataDeIncorporacao: '2025-01-01', cargo: 'recruta' }).returning('id');
        const res = await request(app).get(`/agentes/${novoAgente[0].id}/casos`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(0);
    });
  });
});