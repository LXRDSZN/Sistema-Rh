import express from 'express';
import * as areasController from '../controllers/areas.controllers.js';

const router = express.Router();

/**
 * RUTAS DE ÁREAS
 * 
 * Endpoints para gestionar las áreas de la empresa
 */

// GET - Obtener todas las áreas
// Endpoint: GET /api/areas
router.get('/areas', areasController.getAllAreas);

// GET - Obtener un área específica por ID
// Endpoint: GET /api/areas/:id
router.get('/areas/:id', areasController.getAreaById);

// POST - Crear una nueva área
// Endpoint: POST /api/areas
router.post('/areas', areasController.createArea);

// PUT - Actualizar un área
// Endpoint: PUT /api/areas/:id
router.put('/areas/:id', areasController.updateArea);

// DELETE - Eliminar un área
// Endpoint: DELETE /api/areas/:id
router.delete('/areas/:id', areasController.deleteArea);

export default router;
