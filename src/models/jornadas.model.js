//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const mongoose = require('mongoose')
var Schema = mongoose.Schema;

var JornadasSchema = Schema({
    informacion: [
        {
            partidos:{
                local: {type:Schema.Types.ObjectId,ref:'Equipos'},
                visitante: {type:Schema.Types.ObjectId,ref:'Equipos'},
                golesLocal:Number,
                golesVisitante:Number
            }

        }

    ],

    idLiga: { type: Schema.Types.ObjectId, ref: 'Ligas'},
    idUsuario: { type: Schema.Types.ObjectId, ref: 'Usuarios'},
});

module.exports = mongoose.model('Jornadas',JornadasSchema);