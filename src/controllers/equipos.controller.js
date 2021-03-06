//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Ligas = require('../models/ligas.model');
const Equipos = require('../models/equipos.model');

/* | | | | | | | | | | | | | | | | | | | | | EQUIPOS CRUD - OPCIONES DE USUARIO| | | | | | | | | | | | | | | | | | | | |*/
//*************************** REGISTRAR EQUIPOS *************************** */
function RegistrarEquipos(req, res) {

    var parametros = req.body;

    if(parametros.nombreEquipo && parametros.entrenador && parametros.nombreLiga && parametros.nombreEquipo!="" && parametros.entrenador!="" && parametros.nombreLiga!="") {

        Ligas.findOne({ nombreLiga : parametros.nombreLiga,idUsuario:req.user.sub }, (err, ligaEncontrada) => {//VERIFICA SI EXISTE EL NOMBRE DE LA LIGA

            if ( ligaEncontrada != null) {//LIGA EXISTE


                Equipos.findOne({ nombreEquipo : parametros.nombreEquipo, idLiga:ligaEncontrada._id }, (err, equipoEncontrado) => {

                    if ( equipoEncontrado == null) {

                        Equipos.find({idLiga:ligaEncontrada.id},(err,cantidadEquipos)=>{
                            //console.log("Existen>:"+ cantidadEquipos.length+" en la liga "+ ligaEncontrada.nombreLiga )
                            if(cantidadEquipos.length<10){
                                var equiposModel = new Equipos();
                                equiposModel.nombreEquipo = parametros.nombreEquipo;
                                equiposModel.entrenador = parametros.entrenador;
                                equiposModel.idLiga = ligaEncontrada._id;
                                equiposModel.idUsuario = req.user.sub;

                                equiposModel.partidosJugados = 0;
                                equiposModel.partidosGanados = 0;
                                equiposModel.partidosEmpatados = 0;
                                equiposModel.partidosPerdidos = 0;
                                equiposModel.golesFavor = 0;
                                equiposModel.golesContra = 0;
                                equiposModel.diferenciaGoles = 0;
                                equiposModel.puntos = 0;

                                equiposModel.save((err, equipoGuardado) => {
                                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                    if(!equipoGuardado) return res.status(500).send({ mensaje: 'Error al agregar el equipo'});
                                    
                                    return res.status(200).send({mensaje:"REGISTRO DEL EQUIPO EXITOSO", equipo: equipoGuardado });
                                })
                            }else{
                                return res.status(500)
                                .send({ mensaje: 'No puede agregar mas equipos a esta liga' });                                
                            }
                        }).populate('idUsuario', 'nombre apellido').populate('idLiga', 'nombreLiga')

                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Este equipo ya se encuentra registarado en la liga. Verifique los datos' });
                    }
                })
            } else {//LIGA NO EXISTE
                return res.status(500)
                    .send({ mensaje: 'La liga no pertenece al usuario. Verifique el nombre' });
            }
        })  

    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios (nombre y entrenador y nombre de la liga)'});
    }
}

//****************************. EDITAR EQUIPOS ******************************* */
function EditarEquipos(req, res) {

    var idEqui = req.params.idEquipo;
    var parametros = req.body;

    if(parametros.partidosJugados || parametros.partidosGanados ||parametros.partidosEmpatados || parametros.partidosPerdidos ||
        parametros.golesFavor || parametros.golesContra || parametros.diferenciaGoles || parametros.puntos ||
        parametros.partidosJugados=="" || parametros.partidosGanados=="" ||parametros.partidosEmpatados=="" || parametros.partidosPerdidos=="" ||
        parametros.golesFavor=="" || parametros.golesContra=="" || parametros.diferenciaGoles=="" || parametros.puntos==""
         ) return res.status(500).send({ mensaje:'No puede editar estos campos'})

    Equipos.findOne({_id:idEqui,idUsuario:req.user.sub}, (err,equipoEncontrado)=>{
        if(err||!equipoEncontrado)return res.status(500).send( { mensaje: 'El equipo no pertenece al usuario logueado. Verifique el ID'});
       
        //console.log(equipoEncontrado.idLiga) //LIGA A LA QUE PERTENCE EL EQUIPO
        
        //VERIFICA LAS LIGAS DEL USUARIO
        Ligas.find({_id: equipoEncontrado.idLiga,idUsuario:req.user.sub}, (err,ligasUsuario)=>{
            if(err||!ligasUsuario)return res.status(404).send( { mensaje: 'No puede editar los equipos de las ligas ligas creadas por otros usuarios. Verifique el ID'});

            if(parametros.nombreEquipo || parametros.entrenador || parametros.nombreEquipo!="" || parametros.entrenador!=""||parametros.nombreLiga|| parametros.nombreLiga!="") {
                

                    Ligas.findOne({ nombreLiga : parametros.nombreLiga, idUsuario: req.user.sub}, (err, ligaEncontrada) => {
                        if ( ligaEncontrada != null) {
                            Equipos.find({idLiga:ligaEncontrada.id},(err,cantidadEquipos)=>{
                                //console.log("Existen>:"+ cantidadEquipos.length+" en la liga "+ ligaEncontrada.nombreLiga )
                                if(cantidadEquipos.length<10){
 
                                    Equipos.findOne({ nombreEquipo : parametros.nombreEquipo, idLiga:equipoEncontrado.idLiga }, (err, equipoEditarNombre) => {
                                        if(err||equipoEditarNombre) {
                                            return res.status(404).send( { mensaje: 'Ya existe un equipo en la liga con este nombre. Verifique los datos (Utilice otro)'});

                                        }else{
                                            Equipos.findByIdAndUpdate(idEqui, parametros, { new: true } ,(err, equipoActualizada) => {
                                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                                                if(!equipoActualizada) return res.status(404).send( { mensaje: 'Error al editar el equipo'});
                                        
                                                return res.status(200).send({mensaje:"EDICI??N DEL EQUIPO EXITOSO", equipo: equipoActualizada});
                                            });  
                                        }
  
            
                                    })

                                }else{
                                    return res.status(500)
                                    .send({ mensaje: 'No puede agregar mas equipos a esta liga: '+ligaEncontrada.nombreLiga,informacion:'La cantidad m??xima de equipos por liga es: 10'});                                
                                }
                            })
                      
    
                        } else {
                            return res.status(500)
                            .send({ mensaje: 'La liga no pertenece al usuario. Verifique el nombre' });
                        }
                    })
                  

            }else{
                return res.status(500).send({ mensaje: 'Solamente se puede editar el nombre del equipo, el entrenador y el nombre de la liga'});
            } 
        })
    })
}

//*********************************  BUSCAR TODAS LOS EQUIPOS ********************************* */
function ObtenerEquiposCreados(req, res) {


        Equipos.find({idUsuario:req.user.sub}, (err, equiposUsuario) => {
            for(let i=0; i <equiposUsuario.length;i++){
                equiposUsuario[i].partidosJugados = undefined
                equiposUsuario[i].partidosGanados = undefined
                equiposUsuario[i].partidosEmpatados = undefined
                equiposUsuario[i].partidosPerdidos = undefined
                equiposUsuario[i].golesFavor = undefined
                equiposUsuario[i].golesContra = undefined
                equiposUsuario[i].diferenciaGoles = undefined
                equiposUsuario[i].puntos = undefined

            }
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!equiposUsuario) return res.status(500).send({ mensaje: "No existen equipos creados por el usuario."});
            return res.status(200).send({mensaje:"TODOS LOS EQUIPOS ACTUALES DEL USUARIO: "+req.user.nombre,informacion:"CANTIDAD DE EQUIPOS: "+equiposUsuario.length, equipos: equiposUsuario });
        }).populate('idUsuario', 'nombre apellido').populate('idLiga', 'nombreLiga')
}

//*********************************  BUSCAR EQUIPOS POR LIGAS********************************* */
function ObtenerEquiposLigas(req, res) {
    idLig = req.params.idLiga

    Ligas.findOne({_id:idLig,idUsuario:req.user.sub},(err,ligaEncontradaUser)=>{
        if(err||!ligaEncontradaUser) return res.status(500).send({ mensaje: "La liga no fue creada por su usuario. No puede visualizar los equipos. Verifique el ID."});

        Equipos.find({idUsuario:req.user.sub,idLiga:ligaEncontradaUser._id}, (err, equiposUsuario) => {
            for(let i=0; i <equiposUsuario.length;i++){
                equiposUsuario[i].partidosJugados = undefined
                equiposUsuario[i].partidosGanados = undefined
                equiposUsuario[i].partidosEmpatados = undefined
                equiposUsuario[i].partidosPerdidos = undefined
                equiposUsuario[i].golesFavor = undefined
                equiposUsuario[i].golesContra = undefined
                equiposUsuario[i].diferenciaGoles = undefined
                equiposUsuario[i].puntos = undefined

            }
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(equiposUsuario.length==0) return res.status(500).send({mensaje:"EQUIPOS DE LA LIGA: "+ ligaEncontradaUser.nombreLiga, informacion: "Actualmente no existen equipos en esta liga."});
            return res.status(200).send({mensaje:"EQUIPOS DE LA LIGA: "+ ligaEncontradaUser.nombreLiga,informacion:"CANTIDAD DE EQUIPOS: "+equiposUsuario.length, equipos: equiposUsuario });
        }).populate('idUsuario', 'nombre apellido').populate('idLiga', 'nombreLiga')
    })


}

//*********************************  BUSCAR EQUIPOS POR LIGAS********************************* */
function TablaLiga(req, res) {
    idLig = req.params.idLiga

    Ligas.findOne({_id:idLig,idUsuario:req.user.sub},(err,ligaEncontradaUser)=>{
        if(err||!ligaEncontradaUser) return res.status(500).send({ mensaje: "La liga no fue creada por su usuario. No puede visualizar los equipos. Verifique el ID."});

        Equipos.find({idUsuario:req.user.sub,idLiga:ligaEncontradaUser._id}, (err, equiposUsuario) => {
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(equiposUsuario.length==0) return res.status(500).send({mensaje:"EQUIPOS DE LA LIGA: "+ ligaEncontradaUser.nombreLiga, informacion: "Actualmente no existen equipos en esta liga."});
            return res.status(200).send({mensaje:"EQUIPOS DE LA LIGA: "+ ligaEncontradaUser.nombreLiga,informacion:"CANTIDAD DE EQUIPOS: "+equiposUsuario.length, equipos: equiposUsuario });
       
        }).sort({  puntos:-1,diferenciaGoles:-1}) //.populate('idUsuario', 'nombre apellido').populate('idLiga', 'nombreLiga')

    })
    

}

//********************************* ELIMINAR LIGA ********************************* */
function EliminarEquipos(req, res){


    const idEqui = req.params.idEquipo;

    Equipos.findOne({_id:idEqui,idUsuario:req.user.sub},(err,equipoUsuario)=>{
        if(err||!equipoUsuario) return res.status(500).send({mensaje: "No puede eliminar equipos de otros usuarios. Verifique el ID"});
 
                Equipos.findByIdAndDelete({_id:equipoUsuario._id},(err,equipoELiminado)=>{
                    if(err) return res.status(500).send({mensaje: "Error, el equipo no existe"});
                    if(!equipoELiminado) return res.status(404).send({mensaje: "Error, el equipo no existe"})
            
                    return  res.status(200).send({mensaje:"ELIMINACI??N EXITOSA",equipo:equipoELiminado});
                }).populate('idUsuario', 'nombre apellido').populate('idLiga', 'nombreLiga')
     })

}
        
//********************************* EXPORTAR ********************************* */
//EXPORTAR

module.exports ={
    RegistrarEquipos,
    EditarEquipos,
    ObtenerEquiposLigas,
    ObtenerEquiposCreados,
    EliminarEquipos,
    TablaLiga

}