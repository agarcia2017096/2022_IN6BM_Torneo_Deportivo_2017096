//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var LigasSchema = Schema({
    nombreLiga: String,
    patrocinador:String,
    idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuarios'},
});

module.exports = mongoose.model('Ligas',LigasSchema);