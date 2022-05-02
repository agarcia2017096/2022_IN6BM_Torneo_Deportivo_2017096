//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const jornadasController = require('../controllers/jornadas.controller')
const md_autentificacion = require('../middlewares/autentication')


//RUTAS
var api = express.Router();

 //******************* CRUD JORNADAS - FUNCIONES USUARIO ****************** */
//REGISTRAR LIGAS
api.post('/registrarJornadas',md_autentificacion.Auth, jornadasController.RegistrarJornadas2);

module.exports = api
