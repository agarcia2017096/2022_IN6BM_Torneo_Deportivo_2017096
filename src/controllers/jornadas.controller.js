//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Ligas = require('../models/ligas.model');
const Equipos = require('../models/equipos.model');
const Jornadas = require('../models/jornadas.model');
const Registros = require('../models/registros.model');

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

                        //console.log('1.INFORMACION\n   CANTIDAD DE EQUIPOS EN LA LIGA:  '+ cantidadEquiposLiga.length)

                        var equiposCant = parseInt(cantidadEquiposLiga.length)

                        if(equiposCant==1) return res.status(500).send({mensaje:'*La cantidad de equipos es insuficiente*', informacion:'Para gestionar los partidos de las jornadas debe agregar más equipos.'})

                        if((equiposCant%2)==0){//CANTIDAD DE EQUIPOS PAR
                            //CANTIDAD DE JORNADAS
                            var numeroJornadas = equiposCant-1

                            var partidosPar = (equiposCant/2)
                            //console.log('2. INFORMACIONPARTIDOS POR JORNADA* '+partidosPar)
                            //console.log('3. NUMERO TOTAL DE JORNADAS DISPONIBLES* '+numeroJornadas)

                            Jornadas.find({idLiga:ligaEncontradaUser._id, idUsuario: req.user.sub},(err,existenciaJornada)=>{

                                //PRIMERA JORADA// FULL VERIFICACIONES
                                if(existenciaJornada.length==0){
                                    //console.log("*******************************************************************        PRIMERA JORNADA DE LA LIGA")
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
                                                //console.log(nuevaJornada._id)
                                                
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
                                                        //console.log(err)
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

                                                        Registros.findOne({localRegistro:localEncontrado.nombreEquipo,visitanteRegistro:visitanteEncontrado.nombreEquipo, 
                                                            idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                            (err, registroEncontradoL)=>{
                                                                
                                                                Registros.findOne({localRegistro:visitanteEncontrado.nombreEquipo,visitanteRegistro:localEncontrado.nombreEquipo, 
                                                                    idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                    (err, registroEncontradoV)=>{
            
                                                        
                                                                        Registros.find({idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},(err,resgistrosActuales)=>{
                                                                            if(err) return res.status(500).send({ message: "ERORR"})
                                                                            //console.log(resgistrosActuales.length)
                                                        
                                                        
                                                                            if(registroEncontradoL==null && registroEncontradoL==null  || resgistrosActuales.length == 0){
                                                                                var modelRegistro = new Registros()
                                                                                modelRegistro.localRegistro =  localEncontrado.nombreEquipo
                                                                                modelRegistro.visitanteRegistro =  visitanteEncontrado.nombreEquipo
                                                        
                                                                                modelRegistro.golesLocalRegistro =  parametros.golesLocal
                                                                                modelRegistro.golesVisitanteRegistro =  parametros.golesVisitante
                                                        
                                                                                modelRegistro.idLigaRegistro =  ligaEncontradaUser._id
                                                                                modelRegistro.idUsuarioRegistro =  req.user.sub
                                                                                modelRegistro.idJornadaRegistro =  nuevaJornada._id

                                                        
                                                                                modelRegistro.save((err,partidoRegistrado)=>{
                                                                    
                                                                                })   
                                                                            }

                                                                            return res.status(200).send({ mensaje:"SE HA CREADO LA JORNADA",jornada: jornadaActualizada })

                                                                        })
                                        
                                                        
                                                                })
                                                             
                                                        })
                            
                            
                            
                                                }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  
                            
                                            })

                            
                                            
                                        })
                            
                                    })                                
                                }else{//YA HAY JORNADAS 
                                    //console.log("************************************ HAY MAS JORNADA Y EMPIEZA A VERIFICAR *************************************")
                                      
                                    Equipos.find({idLiga:ligaEncontradaUser._id},(err,cantidadEquiposLiga)=>{
                                        if(err||cantidadEquiposLiga.length==0) return res.status(500).send({mensaje:'*No existen equipos en la liga*', informacion:'Para gestionar los partidos de las jornadas debe agregar equipos.'})
                                        var equiposCantidad = parseInt(cantidadEquiposLiga.length)
                                        var confirpartidosPar = (equiposCantidad/2)
                                        if(parametros.local==parametros.visitante)  return res.status(500).send({ mensaje: 'El local y el visitante deben ser equipos diferentes' });

                                            Jornadas.findOne({idUsuario:req.user.sub,idLiga:ligaEncontradaUser._id}, (err, jornadaEncontrada)=>{
                                                    //VERIFICA SI SE PUEDE AGREGAR MAS PARTIDOS EN LA JORNADA ANTERIOR

                                                    //console.log("3.     PARTIDOS DE LA JORNADA ANTERIOR "+jornadaEncontrada.informacion.length+' MAXIMO '+confirpartidosPar)
                                                    //VERIFICA SI EN LA ANTERIO PUEDE AGREGAR
                                                    //console.log("66666666666666666666666666666666666666666666666666666666666"+jornadaEncontrada._id+ " cant de partidos"+jornadaEncontrada.informacion.length+" posibles" +confirpartidosPar)
                                                    if(jornadaEncontrada.informacion.length < confirpartidosPar){

                                                        //console.log("+++++++++++++++++++++ PUEDE AGREGAR M[AS PARTIDOS A LA ANTERIOR")
                                                        var repetir = false

                                                        // VERIFICA SI EL EQUIPO INGRESADO EXISTE
                                                        Equipos.findOne({ nombreEquipo : parametros.local, idLiga:ligaEncontradaUser._id }, (err, localEncontrado) => {                                    
                                                                           
                                                            Equipos.findOne({ nombreEquipo : parametros.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontrado) => {
                                                                //VERIFICACIONES DE PARAMETROS
                                                                if ( localEncontrado == null) {  
                                                                    repetir = true
                                                                    //console.log("El local solamnete puede ser un equipo que usted haya creado. Verifique los datos****************************************************************************************************************")
                                                                    
                                                                    return res.status(500)
                                                                    
                                                                    .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. *Verifique los datos*' });
                                                                }
                     
                                                                if ( visitanteEncontrado == null) {
                                                                     repetir = true
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. *Verifique los datos*' });
                                                                }

                                                                if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                    repetir = true
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                }

                                                                Registros.findOne({localRegistro:parametros.local,visitanteRegistro:parametros.visitante, 
                                                                    idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                    (err, registroEncontradoOp1)=>{

                                                                    Registros.findOne({localRegistro:parametros.visitante,visitanteRegistro:parametros.local, 
                                                                        idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                        (err, registroEncontradoOp2)=>{

                                                                        if(registroEncontradoOp1!=null||registroEncontradoOp2!=null){
                                                                                return res.status(500).send({mensaje:'-Este partido ya se ha registrado en la liga.',
                                                                            informacion:'Los equipos no se pueden volver a enfrentar' })    
                                                                        }else{

                                                                            Registros.find({ $or: [{localRegistro:parametros.local},{visitanteRegistro:parametros.local}] 
                                                                              ,idJornadaRegistro:jornadaEncontrada._id},

                                                                                (err, elLocalEnRegistroJornada)=>{
                                                                                    
            
                                                                                Registros.find({ $or: [{localRegistro:parametros.visitante},{visitanteRegistro:parametros.visitante}] 
                                                                                ,idJornadaRegistro:jornadaEncontrada._id},
                                                                                
                                                                                    (err, elVisitanteEnRegistroJornada)=>{



                                                                                        if(elLocalEnRegistroJornada.length != 0){
                                                                                                        return res.status(500).send({mensaje:'-El local ya ha jugado en esta jornada.',
                                                                                                        informacion:'Un equipo solamnete puede jugar una vez por jornada. -Verifique los datos-' }) 
                                                                                        } 

                                                                                        
                                                                                        if(elVisitanteEnRegistroJornada.length != 0){
                                                                                            return res.status(500).send({mensaje:'-El visitante ya ha jugado en esta jornada.',
                                                                                            informacion:'Un equipo solamnete puede jugar una vez por jornada. -Verifique los datos-' }) 
                                                                                        } 

                                                                                        if(elLocalEnRegistroJornada.length==0&&elVisitanteEnRegistroJornada.length == 0){
                                                                                            //console.log("AGREGA A LA JORNADA MAS PARTIDOS")
                                                                                                            //AGREGA EL PARTIDO
                                                                                                            //console.log(" Id a dond emodificar "+ jornadaEncontrada._id)
                                                                                                            Jornadas.findByIdAndUpdate({_id:jornadaEncontrada._id},{ 
                                                                                                                $push: {
                                                                                                                    informacion: [{
                                                                                                                        partidos:
                                                                                                                        {local:localEncontrado._id, visitante:visitanteEncontrado._id, golesLocal: parametros.golesLocal,
                                                                                                                        golesVisitante: parametros.golesVisitante}
                                
                                                                                                                    }]
                                                                                                                } 
                                                                                                            }, { new: true},  
                                                                        
                                                                                                            (err, jornadaActualizadaAdd)=>{  
                                                                                                                if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar jornada-"});
                                                                                                                //console.log(err)
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
                                                                                
                                                                                                                var modelRegistro = new Registros()
                                                                                                                modelRegistro.localRegistro =  localEncontrado.nombreEquipo
                                                                                                                modelRegistro.visitanteRegistro =  visitanteEncontrado.nombreEquipo
                                                                                        
                                                                                                                modelRegistro.golesLocalRegistro =  parametros.golesLocal
                                                                                                                modelRegistro.golesVisitanteRegistro =  parametros.golesVisitante
                                                                                        
                                                                                                                modelRegistro.idLigaRegistro =  ligaEncontradaUser._id
                                                                                                                modelRegistro.idUsuarioRegistro =  req.user.sub
                                                                                                                modelRegistro.idJornadaRegistro =  jornadaEncontrada._id
                                
                                                                                        
                                                                                                                modelRegistro.save((err,partidoRegistrado)=>{
                                
                                                                                                    
                                                                                                                })   
                                                                                                                return res.status(200).send({ mensaje:"SE HA AGRAGADO EL PARTIDO A LA JORNADA",jornada: jornadaActualizadaAdd })
                                
                                
                                                                                                            }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  
                                

                                                                                        }
                                                                                    })


                                                                                    

                                                                                
                                                                            })

                                                                        }
                                                                    })
                                                                     
                                                                })
                                                            })
                                                        })
                                                         
                                                    }else{ //SI YA NO PUEDE AHGREGAR NE LA ANTERIO CREA UNA NUEVA JORNADA
                                                        //VERIFICA SI NO HA LLEGADO AL MAXIMO DE JORNADAS PERMITE AGREGAR
                                                        if( existenciaJornada.length < numeroJornadas){
                                                            //console.log("INFOMACION JORANDA \N  1. JORNADAS ACTUALES " +  existenciaJornada.length)

                                                            var partidosPar = (equiposCant/2)
                                                            //console.log("2.     PARTIDOS POR JORNADA " +  partidosPar)
                                                            //console.log("+++++++++++++++++++++JORNADA ANTERIOR LLENA / AGREGA UNA NUEVA JORNADA ++++++++++++++++++++++")
                                                            //console.log("JORNADAS ACTUALES " +  existenciaJornada.length)
                                                            //console.log("JORNADAS MÁXIMAS " +  numeroJornadas)

                                                        //VERIFICA SI NO HA LLEGADO AL MAXIMO DE JORNADAS PERMITE AGREGAR
                                                            if( existenciaJornada.length < numeroJornadas){

                                                                if(parametros.local==parametros.visitante)  return res.status(500).send({ mensaje: 'El local y el visitante deben ser equipos diferentes' });

                                                                
                                                                // VERIFICA SI EL EQUIPO INGRESADO EXISTE
                                                                Equipos.findOne({ nombreEquipo : parametros.local, idLiga:ligaEncontradaUser._id }, (err, localEncontrado) => {                                    
                                                                                
                                                                    Equipos.findOne({ nombreEquipo : parametros.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontrado) => {
                                                                        //VERIFICACIONES DE PARAMETROS
                                                                        if ( localEncontrado == null) {  
                                                                            repetir = true
                                                                            //console.log("El local solamnete puede ser un equipo que usted haya creado. Verifique los datos****************************************************************************************************************")
                                                                            
                                                                            return res.status(500)
                                                                            
                                                                            .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. *Verifique los datos*' });
                                                                        }
                            
                                                                        if ( visitanteEncontrado == null) {
                                                                            repetir = true
                                                                            return res.status(500)
                                                                            .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. *Verifique los datos*' });
                                                                        }

                                                                        if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                            repetir = true
                                                                            return res.status(500)
                                                                            .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                        }

                                                                        Registros.findOne({localRegistro:parametros.local,visitanteRegistro:parametros.visitante, 
                                                                            idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                            (err, registroEncontradoOp1)=>{
        
                                                                            Registros.findOne({localRegistro:parametros.visitante,visitanteRegistro:parametros.local, 
                                                                                idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                                (err, registroEncontradoOp2)=>{
        
                                                                                if(registroEncontradoOp1!=null||registroEncontradoOp2!=null){
                                                                                        return res.status(500).send({mensaje:'-Este partido ya se ha registrado en la liga.',
                                                                                    informacion:'Los equipos no se pueden volver a enfrentar' })    

                                                                                }else{

                                                                                                    //console.log("AGREGA NUEVA JORNADA")
                                                                                                                    //AGREGA EL PARTIDO

                                                                                                                    var jornadasModel = new Jornadas();
                                                                                                                    jornadasModel.idLiga = ligaEncontradaUser._id
                                                                                                                    jornadasModel.idUsuario = req.user.sub
                                                                                                    
                                                                                                                    jornadasModel.save((err, nuevaJornada) => {
                                                                                                                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                                                                                                        if(!nuevaJornada) return res.status(500).send({ mensaje: 'Error al agregar la carrito'});
                                                                                                                        //console.log(nuevaJornada._id)
                                                                                                                        
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
                                                                                                                                //console.log(err)
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
                                                                        
                                                                                                                                Registros.findOne({localRegistro:localEncontrado.nombreEquipo,visitanteRegistro:visitanteEncontrado.nombreEquipo, 
                                                                                                                                    idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                                                                                    (err, registroEncontradoL)=>{
                                                                                                                                        
                                                                                                                                        Registros.findOne({localRegistro:visitanteEncontrado.nombreEquipo,visitanteRegistro:localEncontrado.nombreEquipo, 
                                                                                                                                            idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                                                                                            (err, registroEncontradoV)=>{
                                                                                    
                                                                                                                                
                                                                                                                                                Registros.find({idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},(err,resgistrosActuales)=>{
                                                                                                                                                    if(err) return res.status(500).send({ message: "ERORR"})
                                                                                                                                                    //console.log(resgistrosActuales.length)
                                                                                                                                
                                                                                                                                
                                                                                                                                                    if(registroEncontradoL==null && registroEncontradoL==null  || resgistrosActuales.length == 0){
                                                                                                                                                        var modelRegistro = new Registros()
                                                                                                                                                        modelRegistro.localRegistro =  localEncontrado.nombreEquipo
                                                                                                                                                        modelRegistro.visitanteRegistro =  visitanteEncontrado.nombreEquipo
                                                                                                                                
                                                                                                                                                        modelRegistro.golesLocalRegistro =  parametros.golesLocal
                                                                                                                                                        modelRegistro.golesVisitanteRegistro =  parametros.golesVisitante
                                                                                                                                
                                                                                                                                                        modelRegistro.idLigaRegistro =  ligaEncontradaUser._id
                                                                                                                                                        modelRegistro.idUsuarioRegistro =  req.user.sub
                                                                                                                                                        modelRegistro.idJornadaRegistro =  nuevaJornada._id
                                                                        
                                                                                                                                
                                                                                                                                                        modelRegistro.save((err,partidoRegistrado)=>{
                                                                        
                                                                                                                                            
                                                                                                                                                        })   
                                                                                                                                                    }
                                                                        
                                                                                                                                                    return res.status(200).send({ mensaje:"SE HA CREADO LA JORNADA",jornada: jornadaActualizada })
                                                                        
                                                                                                                                                })
                                                                                                                
                                                                                                                                
                                                                                                                                        })
                                                                                                                                    
                                                                                                                                })
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                                        }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  
                                                                                                    
                                                                                                                    })
        
                                                                                }
                                                                            })
                                                                            
                                                                        })
                                                                    })
                                                                })

                                                                

                                                            }else{ 
                                                                return res.status(500).send({mensaje:'*No es posible agregar más jornadas*', informacion:'Se ha llegado al número máximo de jornadas en la liga: '+ligaEncontradaUser.nombreLiga})

                                                            }
                                                        }else{//MENSAJE DE YA NO SE PUEDE AGREGAR MÁS JORNADAS
                                                            return res.status(500).send({mensaje:'*No es posible agregar más jornadas*', informacion:'Se ha llegado al número máximo de jornadas en la liga: '+ligaEncontradaUser.nombreLiga})
                                                        }
                                                    }
        
                                            } ).sort({  _id:-1})
    
                                        } )

                                }
                            }) 
                                   

                        }else{//CANTIDAD DE EQUIPOS IMPAR
                            //CANTIDAD DE JORNADAS
                            var numeroJornadasImpar = equiposCant

                            var partidosImpar = ((equiposCant-1)/2)
                            //console.log('2. INFORMACIONPARTIDOS POR JORNADA* '+partidosImpar)
                            //console.log('3. NUMERO TOTAL DE JORNADAS DISPONIBLES* '+numeroJornadasImpar)

                            Jornadas.find({idLiga:ligaEncontradaUser._id, idUsuario: req.user.sub},(err,existenciaJornada)=>{

                                //PRIMERA JORADA// FULL VERIFICACIONES
                                if(existenciaJornada.length==0){
                                    //console.log("*******************************************************************        PRIMERA JORNADA DE LA LIGA")
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
                                                //console.log(nuevaJornada._id)
                                                
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
                                                        //console.log(err)
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

                                                        Registros.findOne({localRegistro:localEncontrado.nombreEquipo,visitanteRegistro:visitanteEncontrado.nombreEquipo, 
                                                            idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                            (err, registroEncontradoL)=>{
                                                                
                                                                Registros.findOne({localRegistro:visitanteEncontrado.nombreEquipo,visitanteRegistro:localEncontrado.nombreEquipo, 
                                                                    idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                    (err, registroEncontradoV)=>{
            
                                                        
                                                                        Registros.find({idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},(err,resgistrosActuales)=>{
                                                                            if(err) return res.status(500).send({ message: "ERORR"})
                                                                            //console.log(resgistrosActuales.length)
                                                        
                                                        
                                                                            if(registroEncontradoL==null && registroEncontradoL==null  || resgistrosActuales.length == 0){
                                                                                var modelRegistro = new Registros()
                                                                                modelRegistro.localRegistro =  localEncontrado.nombreEquipo
                                                                                modelRegistro.visitanteRegistro =  visitanteEncontrado.nombreEquipo
                                                        
                                                                                modelRegistro.golesLocalRegistro =  parametros.golesLocal
                                                                                modelRegistro.golesVisitanteRegistro =  parametros.golesVisitante
                                                        
                                                                                modelRegistro.idLigaRegistro =  ligaEncontradaUser._id
                                                                                modelRegistro.idUsuarioRegistro =  req.user.sub
                                                                                modelRegistro.idJornadaRegistro =  nuevaJornada._id

                                                        
                                                                                modelRegistro.save((err,partidoRegistrado)=>{
                                                                    
                                                                                })   
                                                                            }

                                                                            return res.status(200).send({ mensaje:"SE HA CREADO LA JORNADA",jornada: jornadaActualizada })

                                                                        })
                                        
                                                        
                                                                })
                                                             
                                                        })
                            
                            
                            
                                                }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  
                            
                                            })

                            
                                            
                                        })
                            
                                    })                                
                                }else{//YA HAY JORNADAS 
                                    //console.log("************************************ HAY MAS JORNADA Y EMPIEZA A VERIFICAR *************************************")
                                      
                                    Equipos.find({idLiga:ligaEncontradaUser._id},(err,cantidadEquiposLiga)=>{
                                        if(err||cantidadEquiposLiga.length==0) return res.status(500).send({mensaje:'*No existen equipos en la liga*', informacion:'Para gestionar los partidos de las jornadas debe agregar equipos.'})
                                        var equiposCantidad = parseInt(cantidadEquiposLiga.length)
                                        var confirpartidosImpar = ((equiposCantidad-1)/2)
                                        if(parametros.local==parametros.visitante)  return res.status(500).send({ mensaje: 'El local y el visitante deben ser equipos diferentes' });

                                            Jornadas.findOne({idUsuario:req.user.sub,idLiga:ligaEncontradaUser._id}, (err, jornadaEncontrada)=>{
                                                    //VERIFICA SI SE PUEDE AGREGAR MAS PARTIDOS EN LA JORNADA ANTERIOR

                                                    //console.log("3.     PARTIDOS DE LA JORNADA ANTERIOR "+jornadaEncontrada.informacion.length+' MAXIMO '+confirpartidosImpar)
                                                    //VERIFICA SI EN LA ANTERIO PUEDE AGREGAR
                                                    //console.log("66666666666666666666666666666666666666666666666666666666666"+jornadaEncontrada._id+ " cant de partidos"+jornadaEncontrada.informacion.length+" posibles" +confirpartidosImpar)
                                                    if(jornadaEncontrada.informacion.length < confirpartidosImpar){

                                                        //console.log("+++++++++++++++++++++ PUEDE AGREGAR M[AS PARTIDOS A LA ANTERIOR")
                                                        var repetir = false

                                                        // VERIFICA SI EL EQUIPO INGRESADO EXISTE
                                                        Equipos.findOne({ nombreEquipo : parametros.local, idLiga:ligaEncontradaUser._id }, (err, localEncontrado) => {                                    
                                                                           
                                                            Equipos.findOne({ nombreEquipo : parametros.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontrado) => {
                                                                //VERIFICACIONES DE PARAMETROS
                                                                if ( localEncontrado == null) {  
                                                                    repetir = true
                                                                    //console.log("El local solamnete puede ser un equipo que usted haya creado. Verifique los datos****************************************************************************************************************")
                                                                    
                                                                    return res.status(500)
                                                                    
                                                                    .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. *Verifique los datos*' });
                                                                }
                     
                                                                if ( visitanteEncontrado == null) {
                                                                     repetir = true
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. *Verifique los datos*' });
                                                                }

                                                                if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                    repetir = true
                                                                    return res.status(500)
                                                                    .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                }

                                                                Registros.findOne({localRegistro:parametros.local,visitanteRegistro:parametros.visitante, 
                                                                    idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                    (err, registroEncontradoOp1)=>{

                                                                    Registros.findOne({localRegistro:parametros.visitante,visitanteRegistro:parametros.local, 
                                                                        idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                        (err, registroEncontradoOp2)=>{

                                                                        if(registroEncontradoOp1!=null||registroEncontradoOp2!=null){
                                                                                return res.status(500).send({mensaje:'-Este partido ya se ha registrado en la liga.',
                                                                            informacion:'Los equipos no se pueden volver a enfrentar' })    
                                                                        }else{

                                                                            Registros.find({ $or: [{localRegistro:parametros.local},{visitanteRegistro:parametros.local}] 
                                                                              ,idJornadaRegistro:jornadaEncontrada._id},

                                                                                (err, elLocalEnRegistroJornada)=>{
                                                                                    
            
                                                                                Registros.find({ $or: [{localRegistro:parametros.visitante},{visitanteRegistro:parametros.visitante}] 
                                                                                ,idJornadaRegistro:jornadaEncontrada._id},
                                                                                
                                                                                    (err, elVisitanteEnRegistroJornada)=>{



                                                                                        if(elLocalEnRegistroJornada.length != 0){
                                                                                                        return res.status(500).send({mensaje:'-El local ya ha jugado en esta jornada.',
                                                                                                        informacion:'Un equipo solamnete puede jugar una vez por jornada. -Verifique los datos-' }) 
                                                                                        } 

                                                                                        
                                                                                        if(elVisitanteEnRegistroJornada.length != 0){
                                                                                            return res.status(500).send({mensaje:'-El visitante ya ha jugado en esta jornada.',
                                                                                            informacion:'Un equipo solamnete puede jugar una vez por jornada. -Verifique los datos-' }) 
                                                                                        } 

                                                                                        if(elLocalEnRegistroJornada.length==0&&elVisitanteEnRegistroJornada.length == 0){
                                                                                            //console.log("AGREGA A LA JORNADA MAS PARTIDOS")
                                                                                                            //AGREGA EL PARTIDO
                                                                                                            //console.log(" Id a dond emodificar "+ jornadaEncontrada._id)
                                                                                                            Jornadas.findByIdAndUpdate({_id:jornadaEncontrada._id},{ 
                                                                                                                $push: {
                                                                                                                    informacion: [{
                                                                                                                        partidos:
                                                                                                                        {local:localEncontrado._id, visitante:visitanteEncontrado._id, golesLocal: parametros.golesLocal,
                                                                                                                        golesVisitante: parametros.golesVisitante}
                                
                                                                                                                    }]
                                                                                                                } 
                                                                                                            }, { new: true},  
                                                                        
                                                                                                            (err, jornadaActualizadaAdd)=>{  
                                                                                                                if(err) return res.status(500).send({ mensaje: "Error en la peticion de modificar jornada-"});
                                                                                                                //console.log(err)
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
                                                                                
                                                                                                                var modelRegistro = new Registros()
                                                                                                                modelRegistro.localRegistro =  localEncontrado.nombreEquipo
                                                                                                                modelRegistro.visitanteRegistro =  visitanteEncontrado.nombreEquipo
                                                                                        
                                                                                                                modelRegistro.golesLocalRegistro =  parametros.golesLocal
                                                                                                                modelRegistro.golesVisitanteRegistro =  parametros.golesVisitante
                                                                                        
                                                                                                                modelRegistro.idLigaRegistro =  ligaEncontradaUser._id
                                                                                                                modelRegistro.idUsuarioRegistro =  req.user.sub
                                                                                                                modelRegistro.idJornadaRegistro =  jornadaEncontrada._id
                                
                                                                                        
                                                                                                                modelRegistro.save((err,partidoRegistrado)=>{
                                
                                                                                                    
                                                                                                                })   
                                                                                                                return res.status(200).send({ mensaje:"SE HA AGRAGADO EL PARTIDO A LA JORNADA",jornada: jornadaActualizadaAdd })
                                
                                
                                                                                                            }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  
                                

                                                                                        }
                                                                                    })


                                                                                    

                                                                                
                                                                            })

                                                                        }
                                                                    })
                                                                     
                                                                })
                                                            })
                                                        })
                                                         
                                                    }else{ //SI YA NO PUEDE AHGREGAR NE LA ANTERIO CREA UNA NUEVA JORNADA
                                                        //VERIFICA SI NO HA LLEGADO AL MAXIMO DE JORNADAS PERMITE AGREGAR
                                                        if( existenciaJornada.length < numeroJornadasImpar){
                                                            //console.log("INFOMACION JORANDA \N  1. JORNADAS ACTUALES " +  existenciaJornada.length)

                                                             confirpartidosImpar = ((equiposCantidad-1)/2)
                                                            //console.log("2.     PARTIDOS POR JORNADA " +  confirpartidosImpar)
                                                            //console.log("+++++++++++++++++++++JORNADA ANTERIOR LLENA / AGREGA UNA NUEVA JORNADA ++++++++++++++++++++++")
                                                            //console.log("JORNADAS ACTUALES " +  existenciaJornada.length)
                                                            //console.log("JORNADAS MÁXIMAS " +  numeroJornadasImpar)

                                                        //VERIFICA SI NO HA LLEGADO AL MAXIMO DE JORNADAS PERMITE AGREGAR
                                                            if( existenciaJornada.length < numeroJornadasImpar){

                                                                if(parametros.local==parametros.visitante)  return res.status(500).send({ mensaje: 'El local y el visitante deben ser equipos diferentes' });

                                                                
                                                                // VERIFICA SI EL EQUIPO INGRESADO EXISTE
                                                                Equipos.findOne({ nombreEquipo : parametros.local, idLiga:ligaEncontradaUser._id }, (err, localEncontrado) => {                                    
                                                                                
                                                                    Equipos.findOne({ nombreEquipo : parametros.visitante, idLiga:ligaEncontradaUser._id }, (err, visitanteEncontrado) => {
                                                                        //VERIFICACIONES DE PARAMETROS
                                                                        if ( localEncontrado == null) {  
                                                                            repetir = true
                                                                            //console.log("El local solamnete puede ser un equipo que usted haya creado. Verifique los datos****************************************************************************************************************")
                                                                            
                                                                            return res.status(500)
                                                                            
                                                                            .send({ mensaje: 'El local solamnete puede ser un equipo que usted haya creado. *Verifique los datos*' });
                                                                        }
                            
                                                                        if ( visitanteEncontrado == null) {
                                                                            repetir = true
                                                                            return res.status(500)
                                                                            .send({ mensaje: 'El visitante solamnete puede ser un equipo que usted haya creado. *Verifique los datos*' });
                                                                        }

                                                                        if ( parametros.golesLocal <0 ||  parametros.golesVisitante <0 ) {
                                                                            repetir = true
                                                                            return res.status(500)
                                                                            .send({ mensaje: 'Los goles no pueden ser menores a 0. Verifique los datos' });
                                                                        }

                                                                        Registros.findOne({localRegistro:parametros.local,visitanteRegistro:parametros.visitante, 
                                                                            idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                            (err, registroEncontradoOp1)=>{
        
                                                                            Registros.findOne({localRegistro:parametros.visitante,visitanteRegistro:parametros.local, 
                                                                                idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                                (err, registroEncontradoOp2)=>{
        
                                                                                if(registroEncontradoOp1!=null||registroEncontradoOp2!=null){
                                                                                        return res.status(500).send({mensaje:'-Este partido ya se ha registrado en la liga.',
                                                                                    informacion:'Los equipos no se pueden volver a enfrentar' })    

                                                                                }else{

                                                                                                    //console.log("AGREGA NUEVA JORNADA")
                                                                                                                    //AGREGA EL PARTIDO

                                                                                                                    var jornadasModel = new Jornadas();
                                                                                                                    jornadasModel.idLiga = ligaEncontradaUser._id
                                                                                                                    jornadasModel.idUsuario = req.user.sub
                                                                                                    
                                                                                                                    jornadasModel.save((err, nuevaJornada) => {
                                                                                                                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                                                                                                        if(!nuevaJornada) return res.status(500).send({ mensaje: 'Error al agregar la carrito'});
                                                                                                                        //console.log(nuevaJornada._id)
                                                                                                                        
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
                                                                                                                                //console.log(err)
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
                                                                        
                                                                                                                                Registros.findOne({localRegistro:localEncontrado.nombreEquipo,visitanteRegistro:visitanteEncontrado.nombreEquipo, 
                                                                                                                                    idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                                                                                    (err, registroEncontradoL)=>{
                                                                                                                                        
                                                                                                                                        Registros.findOne({localRegistro:visitanteEncontrado.nombreEquipo,visitanteRegistro:localEncontrado.nombreEquipo, 
                                                                                                                                            idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},
                                                                                                                                            (err, registroEncontradoV)=>{
                                                                                    
                                                                                                                                
                                                                                                                                                Registros.find({idLiga:ligaEncontradaUser._id,idUsuario: req.user.sub},(err,resgistrosActuales)=>{
                                                                                                                                                    if(err) return res.status(500).send({ message: "ERORR"})
                                                                                                                                                    //console.log(resgistrosActuales.length)
                                                                                                                                
                                                                                                                                
                                                                                                                                                    if(registroEncontradoL==null && registroEncontradoL==null  || resgistrosActuales.length == 0){
                                                                                                                                                        var modelRegistro = new Registros()
                                                                                                                                                        modelRegistro.localRegistro =  localEncontrado.nombreEquipo
                                                                                                                                                        modelRegistro.visitanteRegistro =  visitanteEncontrado.nombreEquipo
                                                                                                                                
                                                                                                                                                        modelRegistro.golesLocalRegistro =  parametros.golesLocal
                                                                                                                                                        modelRegistro.golesVisitanteRegistro =  parametros.golesVisitante
                                                                                                                                
                                                                                                                                                        modelRegistro.idLigaRegistro =  ligaEncontradaUser._id
                                                                                                                                                        modelRegistro.idUsuarioRegistro =  req.user.sub
                                                                                                                                                        modelRegistro.idJornadaRegistro =  nuevaJornada._id
                                                                        
                                                                                                                                
                                                                                                                                                        modelRegistro.save((err,partidoRegistrado)=>{
                                                                        
                                                                                                                                            
                                                                                                                                                        })   
                                                                                                                                                    }
                                                                        
                                                                                                                                                    return res.status(200).send({ mensaje:"SE HA CREADO LA JORNADA",jornada: jornadaActualizada })
                                                                        
                                                                                                                                                })
                                                                                                                
                                                                                                                                
                                                                                                                                        })
                                                                                                                                    
                                                                                                                                })
                                                                                                    
                                                                                                    
                                                                                                    
                                                                                                                        }).populate('idUsuario','nombre apellido ').populate('idLiga','nombreLiga');  
                                                                                                    
                                                                                                                    })
        
                                                                                }
                                                                            })
                                                                            
                                                                        })
                                                                    })
                                                                })

                                                                

                                                            }else{ 
                                                                return res.status(500).send({mensaje:'*No es posible agregar más jornadas*', informacion:'Se ha llegado al número máximo de jornadas en la liga: '+ligaEncontradaUser.nombreLiga})

                                                            }
                                                        }else{//MENSAJE DE YA NO SE PUEDE AGREGAR MÁS JORNADAS
                                                            return res.status(500).send({mensaje:'*No es posible agregar más jornadas*', informacion:'Se ha llegado al número máximo de jornadas en la liga: '+ligaEncontradaUser.nombreLiga})
                                                        }
                                                    }
        
                                            } ).sort({  _id:-1})
    
                                        } )

                                }
                            }) 

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