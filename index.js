//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const mongoose = require('mongoose');
const app = require('./app');
const Usuarios = require('./src/models/usuarios.model');
const bcrypt = require("bcrypt-nodejs");

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/IN6BM2_TORNEO_DEPORTIVO_2017096',{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log('Se encuentra conectado a la base de datos.');
    app.listen(3000,function(req, res){
        console.log('IN6BM, eL servidor esta corriendo correctamente (puerto 3000)');
        RegistrarAdministradorDefault();    
    })
}).catch(error =>console.log(error))



//********************** 1. REGISTRAR ADMINISTRADOR POR DEFECTO ************** */
function RegistrarAdministradorDefault(req, res) {

    Usuarios.findOne({email:"ADMIN"}, (err, AdministradorEncontrados) => {
        if(!AdministradorEncontrados==null){
            console.log('El administrador ya se encuentra registrado')
        }

        if(err) console.log('error en la peticion de MongoDB')

        if(!AdministradorEncontrados){
            //Agregar por defecto
            var usuarioModel = new Usuarios();
                usuarioModel.nombre = "ADMIN";
                   usuarioModel.apellido = "ADMIN";
                   usuarioModel.password = "deportes123";
                    usuarioModel.email = "ADMIN";
                    usuarioModel.rol = 'ROL_ADMINISTRADOR';
                    usuarioModel.imagen = null;
        
                    Usuarios.find({ email: "ADMIN"}, (err, usuarioEncontrado) => {
                        if ( usuarioEncontrado.length == 0 ) {
        
                            bcrypt.hash("deportes123", null, null, (err, passwordEncriptada) => {
                                usuarioModel.password = passwordEncriptada;
        
                                usuarioModel.save((err, usuarioGuardado) => {
                                    if (err) console.log('Error en la peticion');
                                    if(!usuarioGuardado) console.log('Error al agregar el Usuario') 
                                        console.log('--El administrador se ha registrado registrado--')

                                });
                            });                    
                        }
                    })        
        }else {
            console.log('*El usuario por defecto ya está registrado*' );
        }

    })
} 