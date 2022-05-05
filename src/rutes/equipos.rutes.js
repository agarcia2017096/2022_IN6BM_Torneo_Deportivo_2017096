//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const equiposController = require('../controllers/equipos.controller')
const md_autentificacion = require('../middlewares/autentication')

//RUTAS
var api = express.Router();

 //********************************* EQUIPOS - FUNCIONES  ********************************* */
//AGREGAR EQUIPOS
api.post('/agregarEquipos',md_autentificacion.Auth,equiposController.RegistrarEquipos)

//EDITAR EQUIPOS
api.put('/editarEquipos/:idEquipo',md_autentificacion.Auth,equiposController.EditarEquipos)

//OBTENER EQUIPOS CREADOS POR USUARIO
api.get('/obtenerEquipos',md_autentificacion.Auth,equiposController.ObtenerEquiposCreados)

//OBTENER EQUIPOS DE LA LIGA
api.get('/obtenerEquiposLiga/:idLiga',md_autentificacion.Auth,equiposController.ObtenerEquiposLigas)

//ELIMINAR EQUIPOS
api.delete('/eliminarEquipos/:idEquipo',md_autentificacion.Auth,equiposController.EliminarEquipos)

//OBTENER EQUIPOS DE LA LIGA
api.get('/tablaLiga/:idLiga',md_autentificacion.Auth,equiposController.TablaLiga)

module.exports = api