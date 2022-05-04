//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var RegistrosSchema = Schema({

    localRegistro: String,
    visitanteRegistro: String,
    golesLocalRegistro:Number,
    golesVisitanteRegistro:Number,
    idLigaRegistro: { type: Schema.Types.ObjectId, ref: 'Ligas'},
    idUsuarioRegistro: { type: Schema.Types.ObjectId, ref: 'Usuarios'},
    idJornadaRegistro: { type: Schema.Types.ObjectId, ref: 'Jornadas'}

});

module.exports = mongoose.model('Registros',RegistrosSchema);

