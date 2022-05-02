//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var EquiposSchema = Schema({
    nombreEquipo: String,
    entrenador: String,

    partidosJugados: Number,
    partidosGanados: Number,
    partidosEmpatados: Number,
    partidosPerdidos: Number,
    golesFavor: Number,
    golesContra: Number,
    diferenciaGoles: Number,
    puntos: Number,
    
    idLiga: { type: Schema.Types.ObjectId, ref: 'Ligas'},
    idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuarios'}

});

module.exports = mongoose.model('Equipos',EquiposSchema);