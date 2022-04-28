//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Ligas = require('../models/ligas.model');

//El administrador puede registrar, editar y eliminar ligas.
/* | | | | | | | | | | | | | | | | | | | | | LIGAS CRUD - OPCIONES DE ADMINISTRADOR| | | | | | | | | | | | | | | | | | | | |*/
//*************************** REGISTRAR LIGAS *************************** */
function RegistrarLigas(req, res) {

    var parametros = req.body;
    var ligasModel = new Ligas();

    if(parametros.nombreLiga && parametros.patrocinador && parametros.nombreLiga!="" && parametros.patrocinador!="") {
            ligasModel.nombreLiga = parametros.nombreLiga;
            ligasModel.patrocinador = parametros.patrocinador;
            ligasModel.idUsuario = req.user.sub;

            Ligas.findOne({ nombreLiga : parametros.nombreLiga }, (err, ligaEncontrada) => {
                if ( ligaEncontrada == null) {
                        ligasModel.save((err, ligaGuardada) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                            if(!ligaGuardada) return res.status(500).send({ mensaje: 'Error al agregar la liga'});
                            
                            return res.status(200).send({mensaje:"REGISTRO DE LIGA EXITOSO", liga: ligaGuardada });
                        });
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Esta liga ya se encuentra registarada. Verifique los datos' });
                }
            })
    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios (nombre y patrocinador de la liga)'});
    }
}

//****************************. EDITAR LIGAS ******************************* */
function EditarLigas(req, res) {
    var idLig = req.params.idLiga;
    var parametros = req.body;

    Ligas.findById(idLig, (err,ligaEncontrada)=>{
        
        if(err||!ligaEncontrada)return res.status(404).send( { mensaje: 'La liga no existe, verifique el ID'});
        if(req.user.rol=='ROL_ADMINISTRADOR'){//Editar como Administrador
            if(parametros.nombreLiga || parametros.patrocinador || parametros.nombreLiga!="" || parametros.patrocinador!="") {
                
                Ligas.findOne({ nombreLiga : parametros.nombreLiga }, (err, ligaEncontrada) => {//VERIFICA SI EXISTE EL NOMBRE
                    if ( ligaEncontrada == null) {
                        Ligas.findByIdAndUpdate(idLig, parametros, { new: true } ,(err, ligaActualizada) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                            if(!ligaActualizada) return res.status(404).send( { mensaje: 'Error al editar la liga'});
                    
                            return res.status(200).send({mensaje:"EDICIÓN DE LIGA EXITOSA (ADMINISTRADOR)", liga: ligaActualizada});
                        });                        

                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Esta liga ya se encuentra registarada. Verifique los datos' });
                    }
                })  

            }else{
                return res.status(500).send({ mensaje: 'Solamente se puede editar el nombre de la liga y el patrocinador. Verifique los datos'});
            }

        }else{//Editar como Usuario
            if(ligaEncontrada.idUsuario==req.user.sub){

                if(parametros.nombreLiga || parametros.patrocinador || parametros.nombreLiga!="" || parametros.patrocinador!="") {
                
                    Ligas.findOne({ nombreLiga : parametros.nombreLiga }, (err, ligaEncontrada) => {//VERIFICA SI EXISTE EL NOMBRE
                        if ( ligaEncontrada == null) {
                            Ligas.findByIdAndUpdate(idLig, parametros, { new: true } ,(err, ligaActualizada) => {
                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                                if(!ligaActualizada) return res.status(404).send( { mensaje: 'Error al editar la liga'});
                        
                                return res.status(200).send({mensaje:"EDICIÓN DE LIGA EXITOSA (USUARIO)", empresa: ligaActualizada});
                            });                        

                        } else {
                            return res.status(500)
                                .send({ mensaje: 'Esta liga ya se encuentra registarada. Verifique los datos' });
                        }
                    })  

                }else{
                    return res.status(500).send({ mensaje: 'Solamente se puede editar el nombre de la liga y el patrocinador. Verifique los datos'});
                }
            }else{
                return res.status(500)
                .send({ mensaje: 'No puede editar las ligas creadas por otros usuarios. Verifique el ID'});
            }
        }
    })
}

//*********************************  BUSCAR TODAS LAS LIGAS ********************************* */
function ObtenerLigas(req, res) {

    if ( req.user.rol == "ROL_ADMINISTRADOR" ){
        Ligas.find({idEmpresa:req.user.sub}, (err, ligasEncontradas) => {
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!ligasEncontradas) return res.status(500).send({ mensaje: "No existen ligas creadas por el administrador."});
            return res.status(200).send({mensaje:"LIGAS ACTUALES", ligas: ligasEncontradas });
        })
    }else{//Obtener Ligas de Usuarios
        Ligas.find({idUsuario:req.user.sub}, (err, ligasUsuario) => {
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!ligasUsuario) return res.status(500).send({ mensaje: "No existen ligas creadas por el usuario."});
            return res.status(200).send({mensaje:"LIGAS ACTUALES DEL USUARIO", ligas: ligasUsuario });
        })
    }
}

//********************************* ELIMINAR LIGA ********************************* */
function EliminarLigas(req, res){
    const idLig = req.params.idLiga;

    Ligas.findOne({_id:idLig},(err,ligaEncontrada)=>{
        if(err||!ligaEncontrada) return res.status(500).send({mensaje: "Error, la liga no existe. Verifique el ID"});
 
        
        if(req.user.rol=="ROL_USUARIO"){
            //ELIMINAR PROPIA LIGA
 
            if(ligaEncontrada.idUsuario == req.user.sub){
                Ligas.findByIdAndDelete({_id:idLig},(err,ligaELiminada)=>{
                    if(err) return res.status(500).send({mensaje: "Error, la liga no existe"});
                    if(!ligaELiminada) return res.status(404).send({mensaje: "Error, liga liga no existe"})
            
                    return  res.status(200).send({mensaje:"ELIMINACIÓN EXITOSA (USUARIO)",liga:ligaELiminada});
                })
            }else{
                return res.status(500).send({ mensaje: 'No puede eliminar la liga de otros usuarios'});
            }
            //ELIMINACIÓN DEL ADMINITRADOR
        }else{
            Ligas.findByIdAndDelete({_id:idLig},(err,ligaELiminada)=>{
                if(err) return res.status(500).send({mensaje: "Error, la liga no existe"});
                if(!ligaELiminada) return res.status(404).send({mensaje: "Error, la liga  no existe"})
        
                return  res.status(200).send({mensaje:"ELIMINACIÓN EXITOSA (ADMINISTRADOR)",liga:ligaELiminada});
            })
        }
     })

}
        
//********************************* EXPORTAR ********************************* */
//EXPORTAR

module.exports ={
    RegistrarLigas,
    EditarLigas,
    ObtenerLigas,
    EliminarLigas
    

}