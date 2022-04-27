//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Usuarios = require('../models/usuarios.model');
const Empresas = require('../models/empresas.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

//1. Al iniciar la aplicación se creará un usuario administrador con lo siguiente:
//a. Usuario: Admin
//b. UsuarioContraseña: 123456
//3. El administrador puede logearse 

/* | | | | | | | | | | | | | | | | | | | | | LOGIN DEL PROYECTO | | | | | | | | | | | | | | | | | | | | |*/
//********************************* LOGIN ********************************* */
function Login(req, res) {
    var parametros = req.body;

 if(!parametros.email&&!parametros.password) return res.status(500)
 .send({ mensaje: 'Debe llenar los campos necesario'});

    Usuarios.findOne({ email : parametros.email }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(usuarioEncontrado){
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword)=>{//TRUE OR FALSE
                    if ( verificacionPassword ) {
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                                .send({ token: jwt.crearToken(usuarioEncontrado) })
                        } else {
                            usuarioEncontrado.password = undefined;
                            return  res.status(200)
                                .send({ usuario: usuarioEncontrado })
                        }
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Las contraseña no es válida'});
                    }
                })

        
        } else {
            return res.status(500)
                .send({ mensaje: 'Error, el correo no se encuentra registrado. Verifique los datos'})
        }

    })
}

//• FUNCIONES DE ADMIN
function RegistrarAdmin(req, res) {
    var parametros = req.body;
    var usuarioModel = new Usuarios();

    if ( req.user.rol == "ROL_USUARIO" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a registar Admin. Únicamente el Administrador puede hacerlo.'});

    if(parametros.nombre && parametros.apellido && 
        parametros.email && parametros.password &&parametros.nombre!="" && parametros.apellido!="" && 
        parametros.email!="" && parametros.password!="" ) {
            usuarioModel.nombre = parametros.nombre;
            usuarioModel.apellido = parametros.apellido;
            usuarioModel.email = parametros.email;
            usuarioModel.rol = 'ROL_ADMINISTRADOR';
            usuarioModel.imagen = null;

            Usuarios.find({ email : parametros.email }, (err, alumnoEncontrado) => {
                if ( alumnoEncontrado.length == 0 ) {

                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!usuarioGuardado) return res.status(500)
                                .send({ mensaje: 'Error al agregar el Usuario'});
                            
                            return res.status(200).send({ mensaje:"REGISTRO DE ADMINISTRADOR EXITOSO",usuario: usuarioGuardado });
                        });
                    });                    
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este correo, ya  se encuentra utilizado' });
                }
            })
    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios (nombre, apellido, email, password)'});
    }
}

//• Eliminar el usuario si su rol es usuario
//********************************* ELIMINAR USUARIOS ********************************* */
 //ELIMINAR USUARIOS
 function EliminarUsuarios(req, res){
    var idUser = req.params.idUsuario

    Usuarios.findOne({_id:idUser},(err,usuarioBuscado)=>{
       if(err||!usuarioBuscado) return res.status(500).send({mensaje: "Error, el usuario no existe. Verifique el ID"});

       if(usuarioBuscado.rol=="ROL_ADMINISTRADOR"){
           return res.status(500).send({ mensaje: 'No es posible eliminar Administradores'});
       }
       
       if(req.user.rol=="ROL_USUARIO"){
           //ELIMINAR PROPIA CUENTA
           console.log(idUser)
           console.log(req.user.sub)

           if(idUser == req.user.sub){
               Usuarios.findByIdAndDelete({_id:req.user.sub},(err,usuarioEliminado)=>{
                   if(err) return res.status(500).send({mensaje: "Error, el usuario no existe"});
                   if(!usuarioEliminado) return res.status(404).send({mensaje: "Error, el usuario no existe"})
           
                   return  res.status(200).send({mensaje:"ELIMINACION EXITOSA",usuario:usuarioEliminado});
               })
           }else{
               return res.status(500).send({ mensaje: 'No puede eliminar otros clientes'});
           }
           //ELIMINACION DEL ADMINITRADOR
       }else{
           Usuarios.findByIdAndDelete({_id:idUser},(err,usuarioEliminado)=>{
               if(err) return res.status(500).send({mensaje: "Error, el usuario no existe"});
               if(!usuarioEliminado) return res.status(404).send({mensaje: "Error, el usuario no existe"})
       
               return  res.status(200).send({mensaje:"ELIMINACION EXITOSA",usuario:usuarioEliminado});
           })
       }
    })
}

//********************************* BUSCAR ********************************* */
//BUSCAR TODO LOS USUARIOS
function ObtenerUsuarios (req, res) {
    console.log(req.user.sub)
    if(req.user.rol=="ROL_USUARIO"){
        return res.status(500).send({ mensaje: 'No es posible visualizar los usuarios existentes. Solamente el ADMINISTRADOR puede hacerlo'});
    }
    Usuarios.find((err,usuariosObtenidos)=>{
        if(err||!usuariosObtenidos) return res.status(500).send({mensaje: "No existen usuarios"});


        return res.send({mensaje:"USUARIO ACTUALES",usuarios: usuariosObtenidos})
    })
}

//• FUNCIONES DE USUARIO
//*********************************  REGISTRAR USUARIO ********************************* */
function RegistrarUsuario(req, res) {
    var parametros = req.body;
    var usuarioModel = new Usuarios();

    if(parametros.nombre && parametros.apellido && 
        parametros.email && parametros.password &&parametros.nombre!="" && parametros.apellido!="" && 
        parametros.email!="" && parametros.password!="" ) {
            usuarioModel.nombre = parametros.nombre;
            usuarioModel.apellido = parametros.apellido;
            usuarioModel.email = parametros.email;
            usuarioModel.rol = 'ROL_USUARIO';
            usuarioModel.imagen = null;

            Usuarios.find({ email : parametros.email }, (err, alumnoEncontrado) => {
                if ( alumnoEncontrado.length == 0 ) {

                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!usuarioGuardado) return res.status(500)
                                .send({ mensaje: 'Error al agregar el Usuario'});
                            
                            return res.status(200).send({ mensaje:"REGISTRO DE USUARIO EXITOSO",usuario: usuarioGuardado });
                        });
                    });                    
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este correo, ya  se encuentra utilizado' });
                }
            })
    }else{
        return res.status(500)
        .send({ mensaje: 'Debe llenar los campos necesarios (nombre, apellido, email, password)'});
    }
}


//• Puede modificar a que rol pertenecer ese usuario (Administrador o Cliente).
//• Editar los datos de un usuario solamente si es un usuario de rol cliente.
//**************************** 2. EDITAR USUARIOS ******************************* */
function EditarPerfilUsuario(req, res) {
    var idUser = req.params.idUsuario;
    var parametros = req.body;

    Usuarios.findOne({_id:idUser},(err,usuarioBuscado)=>{
        if(err) return res.status(500).send({mensaje: "Error, el usuario no existe. Verifique el ID"});
        if(!usuarioBuscado) return res.status(404).send({mensaje: "Error, el usuario no existe. Verifique el ID"})

        if(usuarioBuscado.rol=="ROL_ADMINISTRADOR"){
            return res.status(500).send({ mensaje: 'No es posible editar Administradores'});
        }else{//Acepta solo ID de clientes
            if(req.user.rol=="ROL_ADMINISTRADOR"){//Administrador puede editar usuarios
                if(parametros.email || parametros.password|| parametros.email==""
                || parametros.password==""){
                    return res.status(500)
                    .send({ mensaje: 'No puede modificar los campos necesarios para el logueo,solamente nombre, apellido y rol'});
            
                }else{
                    if(parametros.rol||parametros.rol==''){
                        if(parametros.rol=="ROL_ADMINISTRADOR"){
                            Usuarios.findByIdAndUpdate(idUser, parametros, { new: true } ,(err, usuarioActualizado) => {
                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                                if(!usuarioActualizado) return res.status(404).send( { mensaje: 'Error al editar cliente'});
                    
                                return res.status(200).send({ empresa: usuarioActualizado});
                            });
                        } else{
                            return res.status(500)
                            .send({ mensaje: 'El rol ingresado no es válido (Ingrese: ROL_ADMINISTRADOR)'});
                        }
                    }else{
                        Usuarios.findByIdAndUpdate(idUser, parametros, { new: true } ,(err, usuarioActualizado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                            if(!usuarioActualizado) return res.status(404).send( { mensaje: 'Error al editar la empresa'});
                            return res.status(200).send({ empresa: usuarioActualizado});
                        });
                    }
                }

            }else{//El CLiente solo puede editar perfil
                console.log(usuarioBuscado._id)

                if(usuarioBuscado._id==req.user.sub){
                    console.log(usuarioBuscado._id)
                    if(parametros.email || parametros.password|| parametros.email==""
                    || parametros.password==""||parametros.rol||parametros.rol==""){
                        return res.status(500)
                        .send({ mensaje: 'No puede modificar los campos necesarios para el logueo, solamente nombre y apellido'});
                    }
                    Usuarios.findByIdAndUpdate(idUser, parametros, { new: true } ,(err, usuarioActualizado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
                        if(!usuarioActualizado) return res.status(404).send( { mensaje: 'Error al editar la empresa'});
                        return res.status(200).send({ usuario: usuarioActualizado});
                    });

                }else{
                    return res.status(500)
                    .send({ mensaje: 'No puede editar otros usuarios, solamnete su perfil de usuario'});
                }
            }
        }
    })
}


//********************************* EXPORTAR ********************************* */
module.exports ={
    Login,
    RegistrarUsuario,
    RegistrarAdmin,
    EliminarUsuarios,
    EditarPerfilUsuario,
    ObtenerUsuarios

}