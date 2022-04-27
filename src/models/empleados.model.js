const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var EmpleadosSchema = Schema({
    nombre: String,
    apellido: String,
    email: String,
    telefono: String,
    departamento:String,
    puesto:String,
    idEmpresa: { type: Schema.Types.ObjectId, ref: 'Empresas'}
});

module.exports = mongoose.model('Empleados',EmpleadosSchema);