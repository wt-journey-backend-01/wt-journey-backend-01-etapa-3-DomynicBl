// casos.test.js

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

describe('Endpoints de /casos', () => {

  describe('GET /casos', () => {
    it('Deve listar todos os 7 casos da seed', async () => {
      const res = await request(app).get('/casos');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(7);
    });

    it('Deve filtrar casos pelo agente_id', async () => {
      const agente = await db('agentes').where({ nome: 'Rommel Carneiro' }).first();
      const res = await request(app).get(`/casos?agente_id=${agente.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('Deve retornar erro 400 para um status de filtro inválido', async () => {
      const res = await request(app).get('/casos?status=pendente');
      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toHaveProperty('status');
      expect(res.body.errors.status).toContain('inválido');
    });
  });

  describe('POST /casos', () => {
    it('Deve criar um novo caso com sucesso', async () => {
      const agente = await db('agentes').first();
      const novoCaso = { titulo: 'Novo K_so', descricao: 'Desc', status: 'aberto', agente_id: agente.id };
      const res = await request(app).post('/casos').send(novoCaso);
      expect(res.statusCode).toBe(201);
      expect(res.body.titulo).toBe('Novo K_so');
    });

    it('Deve retornar 404 ao tentar criar um caso com um agente_id que não existe', async () => {
      const novoCaso = { titulo: 'Caso Órfão', descricao: 'Desc', status: 'aberto', agente_id: 9999 };
      const res = await request(app).post('/casos').send(novoCaso);
      expect(res.statusCode).toBe(404);
    });

    it('Deve retornar 400 se o status for inválido', async () => {
        const agente = await db('agentes').first();
        const novoCaso = { titulo: 'Caso Inválido', descricao: 'Desc', status: 'errado', agente_id: agente.id };
        const res = await request(app).post('/casos').send(novoCaso);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toHaveProperty('status');
    });
  });
  
  describe('PUT /casos/:id', () => {
    it('Deve atualizar um caso por completo (PUT)', async () => {
        const caso = await db('casos').first();
        const agente = await db('agentes').orderBy('id', 'desc').first();
        const dadosAtualizados = { 
            titulo: 'Título Atualizado via PUT', 
            descricao: 'Descrição totalmente nova.', 
            status: 'solucionado', 
            agente_id: agente.id 
        };
        const res = await request(app).put(`/casos/${caso.id}`).send(dadosAtualizados);
        expect(res.statusCode).toBe(200);
        expect(res.body.titulo).toBe('Título Atualizado via PUT');
        expect(res.body.agente_id).toBe(agente.id);
    });

    it('Deve retornar 400 se faltar um campo obrigatório no PUT', async () => {
        const caso = await db('casos').first();
        const agente = await db('agentes').first();
        const dadosIncompletos = { descricao: 'Incompleto', status: 'solucionado', agente_id: agente.id };
        const res = await request(app).put(`/casos/${caso.id}`).send(dadosIncompletos);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toHaveProperty('titulo');
    });
  });

  describe('GET /casos/:id/agente', () => {
    it('Deve retornar os dados completos do agente responsável pelo caso', async () => {
        const caso = await db('casos').where({ titulo: 'Fraude em Licitação' }).first();
        const res = await request(app).get(`/casos/${caso.id}/agente`);
        expect(res.statusCode).toBe(200);
        expect(res.body.nome).toBe('Fernanda Souza');
    });

    it('Deve retornar 404 se o caso não existir', async () => {
        const res = await request(app).get('/casos/9999/agente');
        expect(res.statusCode).toBe(404);
    });
  });
});