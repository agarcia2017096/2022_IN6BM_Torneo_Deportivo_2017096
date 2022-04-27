//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var UsuariosSchema = Schema({
    nombre: String,
    apellido: String,
    email: String,
    password: String,
    rol: String,
    imagen:String
});

module.exports = mongoose.model('Usuarios',UsuariosSchema);