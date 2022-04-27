//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const express = require('express');
const empleadosController = require('../controllers/empleados.controller')
const md_autentificacion = require('../middlewares/autentication')

//RUTAS
var api = express.Router();

 //********************************* EMPLEADOS - FUNCIONES EMPRESA ********************************* */
//AGREGAR EMPLEADOS
api.post('/agregarEmpleados',md_autentificacion.Auth,empleadosController.AgregarEmpleados)

//EDITAR EMPLEADOS
api.put('/editarEmpleados/:idEmpleado',md_autentificacion.Auth,empleadosController.EditarEmpleados)

//ELIMINAR EMPLEADOS
api.delete('/eliminarEmpleados/:idEmpleado',md_autentificacion.Auth,empleadosController.EliminarEmpleados)

//OBTENER LA CATIDAD DE EMPLEADOS POR EMPRESA
api.get('/empleadosActualesCantidad',md_autentificacion.Auth,empleadosController.CantidadEmpleadosActuales)

//BUSQUEDA DE EMPLEADOS
//BUSCAR POR ID
api.get('/empleadosId/:idEmpleado',md_autentificacion.Auth, empleadosController.ObtenerUsuarioID)
//BUSCAR POR NOMBRE
api.get('/empleadosNombre/:nombreEmpleado',md_autentificacion.Auth,empleadosController.ObtenerNombreEmpleados)
//BUSCAR POR PUESTO
api.get('/empleadosPuesto/:puestoEmpleado',md_autentificacion.Auth,empleadosController.ObtenerPuestoEmpleados)
//BUSCAR POR DEPARTAMENTO
api.get('/empleadosDepartamento/:departamentoEmpleado',md_autentificacion.Auth,empleadosController.ObtenerDepartamentoEmpleados)
//BUSCAR TODOS LOS EMPLEADOS
api.get('/empleradosActualesTodos',md_autentificacion.Auth,empleadosController.ObtenerTodosEmpleados)


module.exports = api