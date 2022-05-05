//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const ligasController = require('../controllers/ligas.controller')
const md_autentificacion = require('../middlewares/autentication')
const pdfController = require('../GenerarPDF/generarPDF')

//RUTAS
var api = express.Router();

 //******************* CRUD LIGAS - FUNCIONES ADMINISTRADOR ****************** */
//REGISTRAR LIGAS
api.post('/registrarLigas',md_autentificacion.Auth, ligasController.RegistrarLigas);

//EDITAR LIGAS
api.put('/editarLigas/:idLiga',md_autentificacion.Auth, ligasController.EditarLigas);

//OBTENER LAS LIGAS DEL ADMINISTRADOR
api.get('/obtenerLigas', md_autentificacion.Auth, ligasController.ObtenerLigas);

//ELIMINAR LIGAS
api.delete('/eliminarLigas/:idLiga', md_autentificacion.Auth, ligasController.EliminarLigas);

//GENERACIÓN DE LA LIGA Y VERIFICACIÓN DE TOKEN
api.get("/generaraPDF/:idLiga",md_autentificacion.Auth,pdfController.TablaLigaPDF)



module.exports = api
