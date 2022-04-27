//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var EmpresasSchema = Schema({
    nombreEmpresa: String,
    actividadEconomica: String,
    email: String,
    password: String,
    rol: String,
    idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuarios'}

});

module.exports = mongoose.model('Empresas',EmpresasSchema);