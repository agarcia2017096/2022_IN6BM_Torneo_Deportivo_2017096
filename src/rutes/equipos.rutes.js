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

/*
//ELIMINAR EQUIPOS
api.delete('/eliminarEmpleados/:idEmpleado',md_autentificacion.Auth,equiposController.EliminarEmpleados)

//OBTENER LA CATIDAD DE EQUIPOS POR EMPRESA
api.get('/empleadosActualesCantidad',md_autentificacion.Auth,equiposController.CantidadEmpleadosActuales)

//BUSQUEDA DE EQUIPOS
//BUSCAR POR ID
api.get('/empleadosId/:idEmpleado',md_autentificacion.Auth, equiposController.ObtenerUsuarioID)
//BUSCAR POR NOMBRE
api.get('/empleadosNombre/:nombreEmpleado',md_autentificacion.Auth,equiposController.ObtenerNombreEmpleados)
//BUSCAR POR PUESTO
api.get('/empleadosPuesto/:puestoEmpleado',md_autentificacion.Auth,equiposController.ObtenerPuestoEmpleados)
//BUSCAR POR DEPARTAMENTO
api.get('/empleadosDepartamento/:departamentoEmpleado',md_autentificacion.Auth,equiposController.ObtenerDepartamentoEmpleados)
//BUSCAR TODOS LOS EQUIPOS
api.get('/empleradosActualesTodos',md_autentificacion.Auth,equiposController.ObtenerTodosEmpleados)

*/
module.exports = api