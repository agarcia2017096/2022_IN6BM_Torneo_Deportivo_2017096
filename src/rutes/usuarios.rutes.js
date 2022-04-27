//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const usuariosController = require('../controllers/usuarios.controller')
const md_autentificacion = require('../middlewares/autentication')

//RUTAS
var api = express.Router();

//OBTENER USUARIOS
api.get('/obtenerUsuarios',md_autentificacion.Auth,usuariosController.ObtenerUsuarios)

//LOGIN DE LA APLICACIÓN 
api.post('/login', usuariosController.Login);

//REGISTRAR USUARIO 
api.post('/registrarUsuarios', usuariosController.RegistrarUsuario);

//EDITAR USUARIO CON VERIFICACIONES
api.put('/editarUsuarios/:idUsuario',md_autentificacion.Auth, usuariosController.EditarPerfilUsuario)


//REGISTRAR USUARIO  ADMINISTRADOR
api.post('/registrarAdministradores', md_autentificacion.Auth, usuariosController.RegistrarUsuario);

//ELIMINAR USUARIO 
api.delete('/eliminarUsuarios/:idUsuario',md_autentificacion.Auth,usuariosController.EliminarUsuarios)

module.exports = api