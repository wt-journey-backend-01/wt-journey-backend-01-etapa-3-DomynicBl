// casosRoutes.js
const express = require('express');
const router = express.Router();
const casosController = require('../controllers/casosController');

router.get('/casos', casosController.getAllCasos);
router.get('/casos/:id', casosController.getCasoById);
router.post('/casos', casosController.createCaso);
router.put('/casos/:id', casosController.updateCaso);
router.patch('/casos/:id', casosController.patchCaso);
router.delete('/casos/:id', casosController.deleteCaso);
router.get('/casos/:id/agente', casosController.getAgenteByCasoId);

module.exports = router;