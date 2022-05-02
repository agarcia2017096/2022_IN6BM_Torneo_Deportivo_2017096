//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Ligas = require('../models/ligas.model');
const Equipos = require('../models/equipos.model');
const Jornadas = require('../models/jornadas.model');




//VERIFICACION DE JORNADAS Y EQUIPOS
/* | | | | | | | | | | | | | | | | | | | | | CRUD DE LOS PARTIDOS Y JORNADAS - OPCIONES DE USUARIO| | | | | | | | | | | | | | | | | | | | |*/
//*************************** REGISTRAR LIGAS *************************** */
function RegistrarJornadas(req, res) {
    var parametros = req.body;
    var jornadasModel = new Jornadas();

    if ( req.user.rol != "ROL_USUARIO" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Equipos. Únicamente el Usuario puede hacerlo.'});

    //parametros.nombreLiga, parametros.equipo1, parametros.equipo2, parametros.golesEquipo1, parametros.golesEquipo2

    //VERIFICA QUE TODOS LOS PARAMETROS SEAN INGRESADOS
    if(parametros.nombreLiga && parametros.local &&  parametros.visitante && 
        parametros.golesLocal && parametros.golesVisitante 
        && parametros.nombreLiga!="" && parametros.local!=""&& parametros.visitante!="" && 
         parametros.golesLocal!="" && parametros.golesVisitante!="") {

            //VERIFICA SI EL NOMBRE DE LA LIGA EXISTE DENTRO DE LAS CREADAS POR EL USUARIO
            Ligas.findOne({ nombreLiga : parametros.nombreLiga, idUsuario: req.user.sub }, (err, ligaEncontradaUser) => {
                if ( ligaEncontradaUser == null) {//LIGA NO EXISTE
                    return res.status(500)
                    .send({ mensaje: 'Esta liga no existe dentro de su registro. Verifique los datos' });
                } else {//EL NOMBRE SI EXISTE

                    //VERIFICA EL NUMERO DE JORNADAS ACPETADAS POR LA LIGA DEL USUARIOS DEL
                    Equipos.find({idLiga:ligaEncontradaUser._id},(err,cantidadEquiposLiga)=>{
                        if(err||cantidadEquiposLiga.length==0) return res.status(500).send({mensaje:'*No existen equipos en la liga*', informacion:'Para gestionar los partidos de las jornadas debe agregar equipos.'})

                        console.log('CANTIDAD DE EQUIPOS EN LA LIGA:  '+ cantidadEquiposLiga.length)

                        var equiposCant = parseInt(cantidadEquiposLiga.length)

                        if(equiposCant==1) return res.status(500).send({mensaje:'*La cantidad de equipos es insuficiente*', informacion:'Para gestionar los partidos de las jornadas debe agregar más equipos.'})

                        if((equiposCant%2)==0){//CANTIDAD DE EQUIPOS PAR
                            //CANTIDAD DE JORNADAS
                            var numeroJornadas = equiposCant-1

                            Jornadas.find({idLiga:ligaEncontradaUser._id},(err,numerodeJornadasActuales)=>{
                                if(numerodeJornadasActuales.length==0){//NO HAY JORNADAS
                                    console.log("NO HAY JORNADAS AGREGADAS")

                                    if(parametros.local==parametros.visitante)  return res.status(500).send({ mensaje: 'El local y el visitante deben ser equipos diferentes' });

                                    Equipos.findOne({ nombreEquipo : parametros.local, idLiga:ligaEncontradaUser._id }, (err, localEncontrado) => {
                                        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})

                                        Equipos.findOne({ nombreEquipo : parametros.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontrado) => {
                                            if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                                            //VERIFICACIONES DE PARAMETROS
                                            if ( localEncontrado == null) {
                                                return res.status(500)
                                                .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                            }

                                            if ( visitanteEncontrado == null) {
                                                return res.status(500)
                                                .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                            }

                                            if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                return res.status(500)
                                                .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                            }

                                            var jornadasModel = new Jornadas();
                                            jornadasModel.idLiga = ligaEncontradaUser._id
                                            jornadasModel.idUsuario = req.user.sub

                                            jornadasModel.save((err, nuevaJornada) => {
                                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                                if(!nuevaJornada) return res.status(500).send({ mensaje: 'Error al agregar la carrito'});
                                                console.log(nuevaJornada._id)
                                                
                                                //MODIFICA EL ARRAY Y AGAREGA LA JORNADA
                                                Jornadas.findByIdAndUpdate({_id:nuevaJornada._id},{ 
                                                    $push: {
                                                        informacion: [{
                                                            partidos:
                                                            {local:localEncontrado._id, visitante:visitanteEncontrado._id, golesLocal: parametros.golesLocal,
                                                            golesVisitante: parametros.golesVisitante}

                                                        }]
                                                    } 
                                                }, { new: true},  
        
                                                    (err, jornadaActualizada)=>{  
                                                        if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar jornada-"});
                                                        console.log(err)
                                                        if(!jornadaActualizada) return res.status(500).send({ mensaje: 'Error al modificar la informacion'});
                                
                                                        //EQUIPO LOCAL GANA
                                                        if(parametros.golesLocal>parametros.golesVisitante){
                                                            var ganador = parametros.local
                                                            var perdedor = parametros.visitante
                                                            var diferenciaGanador = (parametros.golesLocal - parametros.golesVisitante)
                                                            var diferenciaPerdedor = (parametros.golesVisitante - parametros.golesLocal)


                                                            Equipos.findOneAndUpdate({ nombreEquipo: ganador, idUsuario: req.user.sub }, { 
                                                                $inc: { partidosJugados: 1,partidosGanados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                ,diferenciaGoles: diferenciaGanador,puntos:3} },
                                                                
                                                                { new: true }, (err, equipoModificado) => {
                                                                if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo1' });
                                                                if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });

                                                                Equipos.findOneAndUpdate({ nombreEquipo: perdedor, idUsuario: req.user.sub }, { 
                                                                    $inc: { partidosJugados: 1,partidosPerdidos:1,golesFavor:parametros.golesVisitante,golesContra:parametros.golesLocal 
                                                                    ,diferenciaGoles: diferenciaPerdedor} },
                                                                    
                                                                    { new: true }, (err, equipoModificado2) => {
                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo2' });
                                                                    if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
    
    
                                                                })
                                                            })
                                                        }

                                                        //EQUIPO VISITANTE GANA
                                                        if(parametros.golesLocal<parametros.golesVisitante){
                                                            var ganador = parametros.visitante
                                                            var perdedor = parametros.local
                                                            var diferenciaGanador = (parametros.golesVisitante - parametros.golesLocal)
                                                            var diferenciaPerdedor = (parametros.golesLocal - parametros.golesVisitante)

                                                            //MODIFICA GANADOR
                                                            Equipos.findOneAndUpdate({ nombreEquipo: ganador, idUsuario: req.user.sub }, { 
                                                                $inc: { partidosJugados: 1,partidosGanados:1,golesFavor:parametros.golesVisitante,golesContra:parametros.golesLocal
                                                                ,diferenciaGoles: diferenciaGanador,puntos:3 } },
                                                                
                                                                { new: true }, (err, equipoModificado) => {
                                                                if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo3' });
                                                                if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                                                                
                                                                //MODIFICA PERDEDOR

                                                                Equipos.findOneAndUpdate({ nombreEquipo: perdedor, idUsuario: req.user.sub }, { 
                                                                    $inc: { partidosJugados: 1,partidosPerdidos:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                    ,diferenciaGoles: diferenciaPerdedor } },
                                                                    
                                                                    { new: true }, (err, equipoModificado2) => {
                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo4' });
                                                                    if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
    
    
                                                                })
                                                            })
                                                        }

                                                        //EQUIPO EMPATAN 
                                                        if(parametros.golesLocal==parametros.golesVisitante){

                                                            //MODIFICA LOCAL
                                                            Equipos.findOneAndUpdate({ nombreEquipo: parametros.local, idUsuario: req.user.sub }, { 
                                                                $inc: { partidosJugados: 1,partidosEmpatados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                ,puntos:1} },
                                                                
                                                                { new: true }, (err, equipoModificado) => {
                                                                if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo5' });
                                                                if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                                                                    //MODIFICA VISITANTE
                                                                Equipos.findOneAndUpdate({ nombreEquipo: parametros.visitante, idUsuario: req.user.sub }, { 
                                                                    $inc: { partidosJugados: 1,partidosEmpatados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                    ,puntos:1 } },
                                                                    
                                                                    { new: true }, (err, equipoModificado2) => {
                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo6' });
                                                                    if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
    
    
                                                                })
                                                            })
                                                        }
                
                                                        return res.status(200).send({ mensaje:"SE HA CREADO LA JORNADA",jornada: jornadaActualizada })


                                                }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  

                                            })

                                            
                                        })

                                    })


                                }else{//SI HAY JORNADAS
                                    //VERIFICA SI NO HA LLEGADO AL MAXIMO DE JORNADAS PERMITE AGREGAR
                                    if( numerodeJornadasActuales.length < numeroJornadas){
                                        console.log("JORNADAS ACTUALES " +  numerodeJornadasActuales.length)

                                        var partidosPar = (equiposCant/2)
                                        console.log("PARTIDOS POR JORNADA " +  partidosPar)

                                        if(parametros.local==parametros.visitante)  return res.status(500).send({ mensaje: 'El local y el visitante deben ser equipos diferentes' });

                                                Jornadas.findOne({idUsuario:req.user.sub,idLiga:ligaEncontradaUser._id}, (err, jornadaEncontrada)=>{
                                                    //return res.status(500).send({mensaje:'Ejemplo'+jornadaEncontrada.informacion.length+jornadaEncontrada._id+' partidosPar '+partidosPar})
                                                    //VERIFICA SI SE PUEDE AGREGAR MAS PARTIDOS
                                                    console.log('Ejemplo'+jornadaEncontrada.informacion.length+'   '+jornadaEncontrada._id+' partidosPar '+partidosPar)

                                                    if(jornadaEncontrada.informacion.length<partidosPar){
                                                        var encontrado = false

                                                        for (let i = 0; i <jornadaEncontrada.informacion.length;i++){

                                                            Equipos.findOne({ _id : jornadaEncontrada.informacion[i].partidos.local, idLiga:ligaEncontradaUser._id }, (err, localEncontrado) => {
                                                                if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                        
                                                                Equipos.findOne({ _id : jornadaEncontrada.informacion[i].partidos.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontrado) => {
                                                                    if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                                                                    //VERIFICACIONES DE PARAMETROS

                                                                    if ( localEncontrado == null) {
                                                                        return res.status(500)
                                                                        .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                    }
                        
                                                                    if ( visitanteEncontrado == null) {
                                                                        return res.status(500)
                                                                        .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                    }
                        
                                                                    if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                        return res.status(500)
                                                                        .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                    }
                                                                     //VERIFICA SI EL LOCAL SE ENCUNATRA EN EL ARRAY
                                                                    if ( localEncontrado.nombreEquipo  == parametros.local ||visitanteEncontrado.nombreEquipo ==parametros.local ) {
                                                                        encontrado = true

                                                                        return res.status(500).send({mensaje:'El local ingresado ya ha jugado su partido correspondiente a esta jornada.',
                                                                        informacion:'Un equipo solo puede jugar una vez por jornada. Ingrese otro equipo.' })
                                                                    }

                                                                    //VERIFICA SI EL VISITANTE SE ENCUNTAR EN EL ARRAY
                                                                    if (visitanteEncontrado.nombreEquipo == parametros.visitante || localEncontrado.nombreEquipo  == parametros.visitante) {
                                                                        encontrado = true

                                                                        return res.status(500).send({mensaje:'El visitante ingresado ya ha jugado su partido correspondiente a esta jornada.',
                                                                        informacion:'Un equipo solo puede jugar una vez por jornada. Ingrese otro equipo.' })

                                                                    }
                                                                })
                                                            })
                                                        }
                                                        //DESPUES DE FOR AGREGA
                                                        Equipos.findOne({ nombreEquipo : parametros.local, idLiga:ligaEncontradaUser._id }, (err, localEncontradoAdd) => {
                                                            if(err) return res.status(500).send({ mensaje: 'Error en la peticion*'})
                    
                                                            Equipos.findOne({ nombreEquipo : parametros.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontradoAdd) => {
                                                                if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                                                                //VERIFICACIONES DE PARAMETROS

                                                                if ( localEncontradoAdd == null) {
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                }
                    
                                                                if ( visitanteEncontradoAdd == null) {
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                }
                    
                                                                if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                }

                                                                console.log("JORNADA A AGREGAR"+jornadaEncontrada._id)
                                                                //AGREGA EL PARTIDO
                                                                Jornadas.findByIdAndUpdate({_id:jornadaEncontrada._id},{ 
                                                                    $push: {
                                                                        informacion: [{
                                                                            partidos:
                                                                            {local:localEncontradoAdd._id, visitante:visitanteEncontradoAdd._id, golesLocal: parametros.golesLocal,
                                                                            golesVisitante: parametros.golesVisitante}

                                                                        }]
                                                                    } 
                                                                }, { new: true},  
                        
                                                                    (err, jornadaActualizadaAdd)=>{  
                                                                        if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar jornada-"});
                                                                        console.log(err)
                                                                        if(!jornadaActualizadaAdd) return res.status(500).send({ mensaje: 'Error al modificar la informacion'});
                                                
                                                                        //EQUIPO LOCAL GANA
                                                                        if(parametros.golesLocal>parametros.golesVisitante){
                                                                            var ganador = parametros.local
                                                                            var perdedor = parametros.visitante
                                                                            var diferenciaGanador = (parametros.golesLocal - parametros.golesVisitante)
                                                                            var diferenciaPerdedor = (parametros.golesVisitante - parametros.golesLocal)


                                                                            Equipos.findOneAndUpdate({ nombreEquipo: ganador, idUsuario: req.user.sub }, { 
                                                                                $inc: { partidosJugados: 1,partidosGanados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                ,diferenciaGoles: diferenciaGanador,puntos:3} },
                                                                                
                                                                                { new: true }, (err, equipoModificado) => {
                                                                                if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo1' });
                                                                                if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });

                                                                                Equipos.findOneAndUpdate({ nombreEquipo: perdedor, idUsuario: req.user.sub }, { 
                                                                                    $inc: { partidosJugados: 1,partidosPerdidos:1,golesFavor:parametros.golesVisitante,golesContra:parametros.golesLocal 
                                                                                    ,diferenciaGoles: diferenciaPerdedor} },
                                                                                    
                                                                                    { new: true }, (err, equipoModificado2) => {
                                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo2' });
                                                                                    if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                    
                    
                                                                                })
                                                                            })
                                                                        }

                                                                        //EQUIPO VISITANTE GANA
                                                                        if(parametros.golesLocal<parametros.golesVisitante){
                                                                            var ganador = parametros.visitante
                                                                            var perdedor = parametros.local
                                                                            var diferenciaGanador = (parametros.golesVisitante - parametros.golesLocal)
                                                                            var diferenciaPerdedor = (parametros.golesLocal - parametros.golesVisitante)

                                                                            //MODIFICA GANADOR
                                                                            Equipos.findOneAndUpdate({ nombreEquipo: ganador, idUsuario: req.user.sub }, { 
                                                                                $inc: { partidosJugados: 1,partidosGanados:1,golesFavor:parametros.golesVisitante,golesContra:parametros.golesLocal
                                                                                ,diferenciaGoles: diferenciaGanador,puntos:3 } },
                                                                                
                                                                                { new: true }, (err, equipoModificado) => {
                                                                                if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo3' });
                                                                                if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                                                                                
                                                                                //MODIFICA PERDEDOR

                                                                                Equipos.findOneAndUpdate({ nombreEquipo: perdedor, idUsuario: req.user.sub }, { 
                                                                                    $inc: { partidosJugados: 1,partidosPerdidos:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                    ,diferenciaGoles: diferenciaPerdedor } },
                                                                                    
                                                                                    { new: true }, (err, equipoModificado2) => {
                                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo4' });
                                                                                    if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                    
                    
                                                                                })
                                                                            })
                                                                        }

                                                                        //EQUIPO EMPATAN 
                                                                        if(parametros.golesLocal==parametros.golesVisitante){

                                                                            //MODIFICA LOCAL
                                                                            Equipos.findOneAndUpdate({ nombreEquipo: parametros.local, idUsuario: req.user.sub }, { 
                                                                                $inc: { partidosJugados: 1,partidosEmpatados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                ,puntos:1} },
                                                                                
                                                                                { new: true }, (err, equipoModificado) => {
                                                                                if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo5' });
                                                                                if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                                                                                    //MODIFICA VISITANTE
                                                                                Equipos.findOneAndUpdate({ nombreEquipo: parametros.visitante, idUsuario: req.user.sub }, { 
                                                                                    $inc: { partidosJugados: 1,partidosEmpatados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                    ,puntos:1 } },
                                                                                    
                                                                                    { new: true }, (err, equipoModificado2) => {
                                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo6' });
                                                                                    if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                    
                    
                                                                                })
                                                                            })
                                                                        }
                                
                                                                        return res.status(200).send({ mensaje:"SE HA AGRAGADO EL PARTIDO A LA JORNADA",jornada: jornadaActualizadaAdd })


                                                                        }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  

                                                                })
                                                            })                                                               
                                                    }else{
                                                        console.log('JORNADA LLENA')
                                                        console.log("JORNADAS ACTUALES " +  numerodeJornadasActuales.length)
                                                        console.log("JORNADAS MÁXIMAS " +  numeroJornadas)
                                                        //VERIFICA SI NO HA LLEGADO AL MAXIMO DE JORNADAS PERMITE AGREGAR
                                                        if( numerodeJornadasActuales.length < numeroJornadas){
                                                            
                                                        }else{
                                                            return res.status(500).send({mensaje:'*No es posible agregar más jornadas*', informacion:'Se ha llegado al número máximo de jornadas en la liga: '+ligaEncontradaUser.nombreLiga})

                                                        }


                                                    }
        
                                                } ).sort({  _id:-1})
        




                                        

                                    }else{//MENSAJE DE YA NO SE PUEDE AGREGAR MÁS JORNADAS
                                        return res.status(500).send({mensaje:'*No es posible agregar más jornadas*', informacion:'Se ha llegado al número máximo de jornadas en la liga: '+ligaEncontradaUser.nombreLiga})
                                    }

                                }

                            })

                        }else{//CANTIDAD DE EQUIPOS IMPAR
                            //CANTIDAD DE JORNADAS
                            var numeroJornadas = equiposCant




                        }

                    })

                }
            })

    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios (nombreLiga, equipo1, equipo2, golesEquipo1 y golesEquipo2)'});
    }
}



//VERIFICACION DE JORNADAS Y EQUIPOS
/* | | | | | | | | | | | | | | | | | | | | | CRUD DE LOS PARTIDOS Y JORNADAS - OPCIONES DE USUARIO| | | | | | | | | | | | | | | | | | | | |*/
//*************************** REGISTRAR LIGAS *************************** */
function RegistrarJornadas2(req, res) {
    var parametros = req.body;
    var jornadasModel = new Jornadas();

    if ( req.user.rol != "ROL_USUARIO" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Equipos. Únicamente el Usuario puede hacerlo.'});

    //parametros.nombreLiga, parametros.equipo1, parametros.equipo2, parametros.golesEquipo1, parametros.golesEquipo2

    //VERIFICA QUE TODOS LOS PARAMETROS SEAN INGRESADOS
    if(parametros.nombreLiga && parametros.local &&  parametros.visitante && 
        parametros.golesLocal && parametros.golesVisitante 
        && parametros.nombreLiga!="" && parametros.local!=""&& parametros.visitante!="" && 
         parametros.golesLocal!="" && parametros.golesVisitante!="") {

            //VERIFICA SI EL NOMBRE DE LA LIGA EXISTE DENTRO DE LAS CREADAS POR EL USUARIO
            Ligas.findOne({ nombreLiga : parametros.nombreLiga, idUsuario: req.user.sub }, (err, ligaEncontradaUser) => {
                if ( ligaEncontradaUser == null) {//LIGA NO EXISTE
                    return res.status(500)
                    .send({ mensaje: 'Esta liga no existe dentro de su registro. Verifique los datos' });
                } else {//EL NOMBRE SI EXISTE

                    //VERIFICA EL NUMERO DE JORNADAS ACPETADAS POR LA LIGA DEL USUARIOS DEL
                    Equipos.find({idLiga:ligaEncontradaUser._id},(err,cantidadEquiposLiga)=>{
                        if(err||cantidadEquiposLiga.length==0) return res.status(500).send({mensaje:'*No existen equipos en la liga*', informacion:'Para gestionar los partidos de las jornadas debe agregar equipos.'})

                        console.log('CANTIDAD DE EQUIPOS EN LA LIGA:  '+ cantidadEquiposLiga.length)

                        var equiposCant = parseInt(cantidadEquiposLiga.length)

                        if(equiposCant==1) return res.status(500).send({mensaje:'*La cantidad de equipos es insuficiente*', informacion:'Para gestionar los partidos de las jornadas debe agregar más equipos.'})
///////////////////////////////////////////
                        if((equiposCant%2)==0){//CANTIDAD DE EQUIPOS PAR
                            //CANTIDAD DE JORNADAS
                            var numeroJornadas = equiposCant-1

                            var partidosPar = (equiposCant/2)
                            console.log('PARTIDOS POR JORNADA* '+partidosPar)
                            console.log('NUMERO TOTAL DE JORNADAS DISPONIBLES* '+numeroJornadas)

/////////////////////////////////////////
                                console.log("JORNADAS ACTUALES "+numerodeJornadasActuales.length)

                                 while(numerodeJornadasActuales.length < numeroJornadas){
                                    Jornadas.find({idUsuario:req.user.sub,idLiga:ligaEncontradaUser._id},(err,numerodeJornadasActuales)=>{

                                    console.log("SUMA "+numerodeJornadasActuales.length++)

                                    console.log("hola")

                                                Jornadas.findOne({idUsuario:req.user.sub,idLiga:ligaEncontradaUser._id}, (err, jornadaEncontrada)=>{
                                                    console.log(err)
                                                    //VERIFICA SI SE PUEDE AGREGAR JORNADA NUEVA
                                                    console.log('JORNADA ANTERIOR *SIZE*'+numerodeJornadasActuales.informacion.length)
                                                    console.log('PARTIDOS POR JORNADA*'+partidosPar)

                                                    console.log(numerodeJornadasActuales.informacion.length)
                                                    
                                                    //VERIFICA PRIMER JORNADA SIZE = 0 Y NUEVA JORNADA ANTERIOR = PARTIDOS
                                                    if(numerodeJornadasActuales.informacion.length==0||numerodeJornadasActuales.informacion.length==partidosPar){
                                                        for (let i = 0; i <numerodeJornadasActuales.informacion.length;i++){

                                                            Equipos.findOne({ _id : jornadaEncontrada.informacion[i].partidos.local, idLiga:ligaEncontradaUser._id }, (err, localEncontrado) => {
                                                                if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                        
                                                                Equipos.findOne({ _id : jornadaEncontrada.informacion[i].partidos.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontrado) => {
                                                                    if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                                                                    //VERIFICACIONES DE PARAMETROS

                                                                    if ( localEncontrado == null) {
                                                                        return res.status(500)
                                                                        .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                    }
                        
                                                                    if ( visitanteEncontrado == null) {
                                                                        return res.status(500)
                                                                        .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                    }
                        
                                                                    if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                        return res.status(500)
                                                                        .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                    }
                                                                     //VERIFICA SI EL LOCAL SE ENCUNATRA EN EL ARRAY
                                                                    if ( localEncontrado.nombreEquipo  == parametros.local ||visitanteEncontrado.nombreEquipo ==parametros.local ) {
                                                                        encontrado = true

                                                                        return res.status(500).send({mensaje:'El local ingresado ya ha jugado su partido correspondiente a esta jornada.',
                                                                        informacion:'Un equipo solo puede jugar una vez por jornada. Ingrese otro equipo.' })
                                                                    }

                                                                    //VERIFICA SI EL VISITANTE SE ENCUNTAR EN EL ARRAY
                                                                    if (visitanteEncontrado.nombreEquipo == parametros.visitante || localEncontrado.nombreEquipo  == parametros.visitante) {
                                                                        encontrado = true

                                                                        return res.status(500).send({mensaje:'El visitante ingresado ya ha jugado su partido correspondiente a esta jornada.',
                                                                        informacion:'Un equipo solo puede jugar una vez por jornada. Ingrese otro equipo.' })

                                                                    }
                                                                })
                                                            })
                                                        }
                                                        //DESPUES DE FOR AGREGA
                                                        Equipos.findOne({ nombreEquipo : parametros.local, idLiga:ligaEncontradaUser._id }, (err, localEncontradoAdd) => {
                                                            if(err) return res.status(500).send({ mensaje: 'Error en la peticion*'})
                    
                                                            Equipos.findOne({ nombreEquipo : parametros.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontradoAdd) => {
                                                                if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                                                                //VERIFICACIONES DE PARAMETROS

                                                                if ( localEncontradoAdd == null) {
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                }
                    
                                                                if ( visitanteEncontradoAdd == null) {
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                }
                    
                                                                if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                }

                                                                console.log("JORNADA NUEVA")
                                                                //AGREGA EL JORNADA
                                                                var jornadasModel = new Jornadas();
                                                                jornadasModel.idLiga = ligaEncontradaUser._id
                                                                jornadasModel.idUsuario = req.user.sub
                    
                                                                jornadasModel.save((err, nuevaJornada) => {
                                                                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                                                    if(!nuevaJornada) return res.status(500).send({ mensaje: 'Error al agregar la carrito'});
                                                                    console.log(nuevaJornada._id)
                                                                    
                                                                    //MODIFICA EL ARRAY Y AGAREGA LA JORNADA
                                                                    Jornadas.findByIdAndUpdate({_id:nuevaJornada._id},{ 
                                                                        $push: {
                                                                            informacion: [{
                                                                                partidos:
                                                                                {local:localEncontrado._id, visitante:visitanteEncontrado._id, golesLocal: parametros.golesLocal,
                                                                                golesVisitante: parametros.golesVisitante}
                    
                                                                            }]
                                                                        } 
                                                                    }, { new: true},  
                            
                                                                        (err, jornadaActualizada)=>{  
                                                                            if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar jornada-"});
                                                                            console.log(err)
                                                                            if(!jornadaActualizada) return res.status(500).send({ mensaje: 'Error al modificar la informacion'});
                                                    
                                                                            //EQUIPO LOCAL GANA
                                                                            if(parametros.golesLocal>parametros.golesVisitante){
                                                                                var ganador = parametros.local
                                                                                var perdedor = parametros.visitante
                                                                                var diferenciaGanador = (parametros.golesLocal - parametros.golesVisitante)
                                                                                var diferenciaPerdedor = (parametros.golesVisitante - parametros.golesLocal)
                    
                    
                                                                                Equipos.findOneAndUpdate({ nombreEquipo: ganador, idUsuario: req.user.sub }, { 
                                                                                    $inc: { partidosJugados: 1,partidosGanados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                    ,diferenciaGoles: diferenciaGanador,puntos:3} },
                                                                                    
                                                                                    { new: true }, (err, equipoModificado) => {
                                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo1' });
                                                                                    if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                    
                                                                                    Equipos.findOneAndUpdate({ nombreEquipo: perdedor, idUsuario: req.user.sub }, { 
                                                                                        $inc: { partidosJugados: 1,partidosPerdidos:1,golesFavor:parametros.golesVisitante,golesContra:parametros.golesLocal 
                                                                                        ,diferenciaGoles: diferenciaPerdedor} },
                                                                                        
                                                                                        { new: true }, (err, equipoModificado2) => {
                                                                                        if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo2' });
                                                                                        if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                        
                        
                                                                                    })
                                                                                })
                                                                            }
                    
                                                                            //EQUIPO VISITANTE GANA
                                                                            if(parametros.golesLocal<parametros.golesVisitante){
                                                                                var ganador = parametros.visitante
                                                                                var perdedor = parametros.local
                                                                                var diferenciaGanador = (parametros.golesVisitante - parametros.golesLocal)
                                                                                var diferenciaPerdedor = (parametros.golesLocal - parametros.golesVisitante)
                    
                                                                                //MODIFICA GANADOR
                                                                                Equipos.findOneAndUpdate({ nombreEquipo: ganador, idUsuario: req.user.sub }, { 
                                                                                    $inc: { partidosJugados: 1,partidosGanados:1,golesFavor:parametros.golesVisitante,golesContra:parametros.golesLocal
                                                                                    ,diferenciaGoles: diferenciaGanador,puntos:3 } },
                                                                                    
                                                                                    { new: true }, (err, equipoModificado) => {
                                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo3' });
                                                                                    if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                                                                                    
                                                                                    //MODIFICA PERDEDOR
                    
                                                                                    Equipos.findOneAndUpdate({ nombreEquipo: perdedor, idUsuario: req.user.sub }, { 
                                                                                        $inc: { partidosJugados: 1,partidosPerdidos:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                        ,diferenciaGoles: diferenciaPerdedor } },
                                                                                        
                                                                                        { new: true }, (err, equipoModificado2) => {
                                                                                        if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo4' });
                                                                                        if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                        
                        
                                                                                    })
                                                                                })
                                                                            }
                    
                                                                            //EQUIPO EMPATAN 
                                                                            if(parametros.golesLocal==parametros.golesVisitante){
                    
                                                                                //MODIFICA LOCAL
                                                                                Equipos.findOneAndUpdate({ nombreEquipo: parametros.local, idUsuario: req.user.sub }, { 
                                                                                    $inc: { partidosJugados: 1,partidosEmpatados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                    ,puntos:1} },
                                                                                    
                                                                                    { new: true }, (err, equipoModificado) => {
                                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo5' });
                                                                                    if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                                                                                        //MODIFICA VISITANTE
                                                                                    Equipos.findOneAndUpdate({ nombreEquipo: parametros.visitante, idUsuario: req.user.sub }, { 
                                                                                        $inc: { partidosJugados: 1,partidosEmpatados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                        ,puntos:1 } },
                                                                                        
                                                                                        { new: true }, (err, equipoModificado2) => {
                                                                                        if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo6' });
                                                                                        if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                        
                        
                                                                                    })
                                                                                })
                                                                            }
                                    
                                                                            return res.status(200).send({ mensaje:"SE HA CREADO LA JORNADA",jornada: jornadaActualizada })
                    
                    
                                                                    }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  
                    
                                                                })
                                                                })
                                                        })                                                           
                                                    }else{
                                                        if(numerodeJornadasActuales.informacion.length<partidosPar ){
                                                            var encontrado = false
    
                                                            for (let i = 0; i <jornadaEncontrada.informacion.length;i++){
    
                                                                Equipos.findOne({ _id : jornadaEncontrada.informacion[i].partidos.local, idLiga:ligaEncontradaUser._id }, (err, localEncontrado) => {
                                                                    if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                            
                                                                    Equipos.findOne({ _id : jornadaEncontrada.informacion[i].partidos.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontrado) => {
                                                                        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                                                                        //VERIFICACIONES DE PARAMETROS
    
                                                                        if ( localEncontrado == null) {
                                                                            return res.status(500)
                                                                            .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                        }
                            
                                                                        if ( visitanteEncontrado == null) {
                                                                            return res.status(500)
                                                                            .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                        }
                            
                                                                        if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                            return res.status(500)
                                                                            .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                        }
                                                                         //VERIFICA SI EL LOCAL SE ENCUNATRA EN EL ARRAY
                                                                        if ( localEncontrado.nombreEquipo  == parametros.local ||visitanteEncontrado.nombreEquipo ==parametros.local ) {
                                                                            encontrado = true
    
                                                                            return res.status(500).send({mensaje:'El local ingresado ya ha jugado su partido correspondiente a esta jornada.',
                                                                            informacion:'Un equipo solo puede jugar una vez por jornada. Ingrese otro equipo.' })
                                                                        }
    
                                                                        //VERIFICA SI EL VISITANTE SE ENCUNTAR EN EL ARRAY
                                                                        if (visitanteEncontrado.nombreEquipo == parametros.visitante || localEncontrado.nombreEquipo  == parametros.visitante) {
                                                                            encontrado = true
    
                                                                            return res.status(500).send({mensaje:'El visitante ingresado ya ha jugado su partido correspondiente a esta jornada.',
                                                                            informacion:'Un equipo solo puede jugar una vez por jornada. Ingrese otro equipo.' })
    
                                                                        }
                                                                    })
                                                                })
                                                            }
                                                            //DESPUES DE FOR AGREGA
                                                            Equipos.findOne({ nombreEquipo : parametros.local, idLiga:ligaEncontradaUser._id }, (err, localEncontradoAdd) => {
                                                                if(err) return res.status(500).send({ mensaje: 'Error en la peticion*'})
                        
                                                                Equipos.findOne({ nombreEquipo : parametros.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontradoAdd) => {
                                                                    if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
                                                                    //VERIFICACIONES DE PARAMETROS
    
                                                                    if ( localEncontradoAdd == null) {
                                                                        return res.status(500)
                                                                        .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                    }
                        
                                                                    if ( visitanteEncontradoAdd == null) {
                                                                        return res.status(500)
                                                                        .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. Verifique los datos' });
                                                                    }
                        
                                                                    if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                        return res.status(500)
                                                                        .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                    }
    
                                                                    console.log("JORNADA A AGREGAR"+jornadaEncontrada._id)
                                                                    //AGREGA EL PARTIDO
                                                                    Jornadas.findByIdAndUpdate({_id:jornadaEncontrada._id},{ 
                                                                        $push: {
                                                                            informacion: [{
                                                                                partidos:
                                                                                {local:localEncontradoAdd._id, visitante:visitanteEncontradoAdd._id, golesLocal: parametros.golesLocal,
                                                                                golesVisitante: parametros.golesVisitante}
    
                                                                            }]
                                                                        } 
                                                                    }, { new: true},  
                            
                                                                        (err, jornadaActualizadaAdd)=>{  
                                                                            if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar jornada-"});
                                                                            console.log(err)
                                                                            if(!jornadaActualizadaAdd) return res.status(500).send({ mensaje: 'Error al modificar la informacion'});
                                                    
                                                                            //EQUIPO LOCAL GANA
                                                                            if(parametros.golesLocal>parametros.golesVisitante){
                                                                                var ganador = parametros.local
                                                                                var perdedor = parametros.visitante
                                                                                var diferenciaGanador = (parametros.golesLocal - parametros.golesVisitante)
                                                                                var diferenciaPerdedor = (parametros.golesVisitante - parametros.golesLocal)
    
    
                                                                                Equipos.findOneAndUpdate({ nombreEquipo: ganador, idUsuario: req.user.sub }, { 
                                                                                    $inc: { partidosJugados: 1,partidosGanados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                    ,diferenciaGoles: diferenciaGanador,puntos:3} },
                                                                                    
                                                                                    { new: true }, (err, equipoModificado) => {
                                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo1' });
                                                                                    if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
    
                                                                                    Equipos.findOneAndUpdate({ nombreEquipo: perdedor, idUsuario: req.user.sub }, { 
                                                                                        $inc: { partidosJugados: 1,partidosPerdidos:1,golesFavor:parametros.golesVisitante,golesContra:parametros.golesLocal 
                                                                                        ,diferenciaGoles: diferenciaPerdedor} },
                                                                                        
                                                                                        { new: true }, (err, equipoModificado2) => {
                                                                                        if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo2' });
                                                                                        if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                        
                        
                                                                                    })
                                                                                })
                                                                            }
    
                                                                            //EQUIPO VISITANTE GANA
                                                                            if(parametros.golesLocal<parametros.golesVisitante){
                                                                                var ganador = parametros.visitante
                                                                                var perdedor = parametros.local
                                                                                var diferenciaGanador = (parametros.golesVisitante - parametros.golesLocal)
                                                                                var diferenciaPerdedor = (parametros.golesLocal - parametros.golesVisitante)
    
                                                                                //MODIFICA GANADOR
                                                                                Equipos.findOneAndUpdate({ nombreEquipo: ganador, idUsuario: req.user.sub }, { 
                                                                                    $inc: { partidosJugados: 1,partidosGanados:1,golesFavor:parametros.golesVisitante,golesContra:parametros.golesLocal
                                                                                    ,diferenciaGoles: diferenciaGanador,puntos:3 } },
                                                                                    
                                                                                    { new: true }, (err, equipoModificado) => {
                                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo3' });
                                                                                    if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                                                                                    
                                                                                    //MODIFICA PERDEDOR
    
                                                                                    Equipos.findOneAndUpdate({ nombreEquipo: perdedor, idUsuario: req.user.sub }, { 
                                                                                        $inc: { partidosJugados: 1,partidosPerdidos:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                        ,diferenciaGoles: diferenciaPerdedor } },
                                                                                        
                                                                                        { new: true }, (err, equipoModificado2) => {
                                                                                        if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo4' });
                                                                                        if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                        
                        
                                                                                    })
                                                                                })
                                                                            }
    
                                                                            //EQUIPO EMPATAN 
                                                                            if(parametros.golesLocal==parametros.golesVisitante){
    
                                                                                //MODIFICA LOCAL
                                                                                Equipos.findOneAndUpdate({ nombreEquipo: parametros.local, idUsuario: req.user.sub }, { 
                                                                                    $inc: { partidosJugados: 1,partidosEmpatados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                    ,puntos:1} },
                                                                                    
                                                                                    { new: true }, (err, equipoModificado) => {
                                                                                    if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo5' });
                                                                                    if (!equipoModificado) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                                                                                        //MODIFICA VISITANTE
                                                                                    Equipos.findOneAndUpdate({ nombreEquipo: parametros.visitante, idUsuario: req.user.sub }, { 
                                                                                        $inc: { partidosJugados: 1,partidosEmpatados:1,golesFavor:parametros.golesLocal,golesContra:parametros.golesVisitante
                                                                                        ,puntos:1 } },
                                                                                        
                                                                                        { new: true }, (err, equipoModificado2) => {
                                                                                        if (err) return res.status(500).send({ message: 'Error en la peticion de editar equipo6' });
                                                                                        if (!equipoModificado2) return res.status(404).send({ message: 'Error. No se encontraron equipos para editar' });
                        
                        
                                                                                    })
                                                                                })
                                                                            }
                                    
                                                                            return res.status(200).send({ mensaje:"SE HA AGRAGADO EL PARTIDO A LA JORNADA",jornada: jornadaActualizadaAdd })
    
    
                                                                            }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  
    
                                                                    })
                                                            })                                                               
                                                        }else{
                                                            console.log('JORNADA LLENA')
                                                            console.log("JORNADAS ACTUALES " +  numerodeJornadasActuales.length)
                                                            console.log("JORNADAS MÁXIMAS " +  numeroJornadas)
                                                            numerodeJornadasActuales.length++
                                                            console.log("SUMA "+numerodeJornadasActuales.length++)
                                                        }
                                                    }
        
                                                } ).sort({  _id:-1})  
                                            })
  
                                }
                        }else{//CANTIDAD DE EQUIPOS IMPAR
                            //CANTIDAD DE JORNADAS
                            var numeroJornadas = equiposCant

                        }

                    })

                }
            })

    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios (nombreLiga, equipo1, equipo2, golesEquipo1 y golesEquipo2)'});
    }
}
//********************************* EXPORTAR ********************************* */
//EXPORTAR

module.exports ={
    RegistrarJornadas2,

    

}