//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var EquiposSchema = Schema({
    nombreEquipo: String,
    entrenador: String,
    idLiga: { type: Schema.Types.ObjectId, ref: 'Ligas'},
    idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuarios'}

});

module.exports = mongoose.model('Equipos',EquiposSchema);