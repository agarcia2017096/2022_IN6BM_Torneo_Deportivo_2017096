//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const Empleados = require('../models/empleados.model');
const Empresas = require('../models/empresas.model');


//2. Puede crear, editar y eliminar empleados por empresa.
//********************************* 2.1. AGREGAR EMPLEADO ********************************* */
function AgregarEmpleados(req, res){
    var parametros = req.body

    var empleadoModel = new Empleados()

    if ( req.user.rol != "ROL_EMPRESA" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a agregar empleados. Solamente la empresa puede hacerlo'});

    if(parametros.nombre && parametros.apellido && 
    parametros.email && parametros.telefono && parametros.departamento && parametros.puesto){
        empleadoModel.nombre = parametros.nombre;
        empleadoModel.apellido = parametros.apellido;
        empleadoModel.email = parametros.email;
        empleadoModel.telefono = parametros.telefono;
        empleadoModel.departamento = parametros.departamento;
        empleadoModel.puesto = parametros.puesto;
        empleadoModel.idEmpresa = req.user.sub;

        Empleados.find({email:parametros.email },{telefono:parametros.telefono }, (err, empresaEncontrada) =>{
            if ( empresaEncontrada.length == 0 ) {
                Empleados.find({telefono:parametros.telefono},(err, empresaEncontrada) =>{
                    if ( empresaEncontrada.length == 0 ) {
                        empleadoModel.save( (err, empleadoGuardado) => {
                            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                            if(!empleadoGuardado) return res.status(500).send({ mensaje: "Error al guardar el curso"});
                            
                            return res.status(200).send({ empleado: empleadoGuardado });
                        })
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Este telefono, ya  se encuentra registrado. Utilice otro' });
                    }
                })
                

            } else {
                return res.status(500)
                    .send({ mensaje: 'Este correo, ya  se encuentra registrado. Utilice otro' });
            }
        })
    } else{
        return res.status(500).send({ mensaje: "Debe rellenar los campos necesarios (nombre, apellido, email, telefono, departamento y puesto)." });
    }
}

//********************************* 2.2. EDITAR EMPLEADO ********************************* */
function EditarEmpleados(req, res){
    var idEmp = req.params.idEmpleado

    var parametros = req.body

    if ( req.user.rol != "ROL_EMPRESA" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a editar empleados. Solamente la empresa puede hacerlo'});

    Empleados.findOne({_id:idEmp,idEmpresa:req.user.sub}, (err, empleadoEncontrado) => {
        if(err) return res.status(500).send({ mensaje:"El empleado no existe. Verifique el ID"})
        if(!empleadoEncontrado){
            return res.send({ mensaje:"Unicamente puede editar empleados de su empresa"})
        }else{
        

            if(parametros.nombre || parametros.apellido|| parametros.departamento
                || parametros.puesto|| parametros.email|| parametros.telefono){

                    if(parametros.nombre==""|| parametros.apellido==""|| parametros.email==""
                    && parametros.telefono==""|| parametros.departamento==""|| parametros.puesto=="")return res.status(500).
                    send({ mensaje: "Valores de los parametros no son válidos. (No puede ingresar vacio '')" });

                    if(parametros.email){

                        Empleados.find({email:parametros.email }, (err, emailEncontrado) =>{
                        if ( emailEncontrado.length == 0 ) {
                                Empleados.findByIdAndUpdate(idEmp, parametros, {new : true},
                                    (err, empleadoActualizado)=>{
                                        if(err) return res.status(500)
                                            .send({ mensaje: 'Error en la peticion' });
                                        if(!empleadoActualizado) return res.status(500)
                                            .send({ mensaje: 'Error al editar el Usuario'});
                                        
                                        return res.status(200).send({empleado : empleadoActualizado})
                        
                                    }).populate("idEmpresa","nombreEmpresa actividadEconomica")

                        }else{
                            return res.status(500)
                                .send({ mensaje: 'Este correo, ya  se encuentra registrado. Utilice otro' });
                        }
                        })
                    }else{
                        if(parametros.telefono){
                            Empleados.find({telefono:parametros.telefono }, (err, telefonoEncontrado) =>{
                                if ( telefonoEncontrado.length == 0 ) {
                                        Empleados.findByIdAndUpdate(idEmp, parametros, {new : true},
                                            (err, empleadoActualizado)=>{
                                                if(err) return res.status(500)
                                                    .send({ mensaje: 'Error en la peticion' });
                                                if(!empleadoActualizado) return res.status(500)
                                                    .send({ mensaje: 'Error al editar el Usuario'});
                                                
                                                return res.status(200).send({empleado : empleadoActualizado})
                                
                                            }).populate("idEmpresa","nombreEmpresa actividadEconomica")
        
                                }else{
                                    return res.status(500)
                                        .send({ mensaje: 'Este telefono, ya  se encuentra registrado. Utilice otro' });
                                }
                                })                            
                        }else{
                            Empleados.findByIdAndUpdate(idEmp, parametros, {new : true},
                                (err, empleadoActualizado)=>{
                                    if(err) return res.status(500)
                                        .send({ mensaje: 'No se puede editar idEmpresa u otro parametro no existente' });
                                    if(!empleadoActualizado) return res.status(500)
                                        .send({ mensaje: 'Error al editar el Usuario'});
                                    
                                    return res.status(200).send({empleado : empleadoActualizado})
                                }).populate("idEmpresa","nombreEmpresa actividadEconomica")
                        }
                    }
                } else{
                    return res.status(500).send({ mensaje: "Llene los parametros y recuerde que no se puede modificar el ID de la empresa,." });
                }
        }
    })
}

//********************************* 2.3. ELIMINAR EMPLEADO ********************************* */
function EliminarEmpleados(req,res){
    var idEmp = req.params.idEmpleado

    if ( req.user.rol != "ROL_EMPRESA" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a eliminar empleados. Solamente la empresa puede hacerlo'});

    Empleados.findOne({_id:idEmp,idEmpresa:req.user.sub}, (err, empleadoEncontrado) => {
        if(err) return res.status(500).send({ mensaje:"El empleado no existe. Verifique el ID"})

        if(!empleadoEncontrado){
            return res.status(500).send({ mensaje:"Unicamente puede eliminar empleados de su empresa"})
        }else{
           Empleados.findByIdAndDelete(idEmp, (err, empleadoEliminado)=>{
               if(err) return res.status(404).send({mensaje: "Error en la peticion"})
               if(!empleadoEliminado) return res.status(500).send({mensaje: "Error al eliminar"})

              return res.status(200).send({empleado:empleadoEliminado})

           })
        }
    })
}

//3. Se tendrá que llevar control del personal laborando por empresa
//actualmente y la cantidad de los mismos por empresa.
//********************************* 3.1. BUSCAR CANTIDAD DE EMPLEADOS DE LA EMPRESA ********************************* */
function CantidadEmpleadosActuales (req,res){
    
    if ( req.user.rol != "ROL_EMPRESA" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar empleados. Solamente la empresa puede hacerlo'});

    Empleados.find({idEmpresa:req.user.sub},(err,empleadosEcontrados)=>{
        if(err) return res.status(404).send({mensaje:"Error en la peticion"})
        if(!empleadosEcontrados){
            return res.status(500).send({mensaje:"No existen empleados de su empresa"})

        }else{
            return res.status(200).send({ EmpleadosActuales: empleadosEcontrados.length})
        }
    })
}
//4. Búsqueda del empleado por:Id, Nombre, Puesto, Departamento, Todos los Empleados

//OBTENER EMPLEADOS POR ID
function ObtenerUsuarioID(req, res){
    var idEmp =req.params.idEmpleado;

    if ( req.user.rol != "ROL_EMPRESA" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar empleados. Solamente la empresa puede hacerlo'});

    Empleados.findOne({_id:idEmp,idEmpresa: req.user.sub},(err,empleadoEncontrado)=>{
        if(err) return res.status(500).send({mensaje: "El empleado no existe. Error en la peticion. Verifique el ID"})
        if(!empleadoEncontrado) return res.status(500).send({mensaje: "El empleado no existe en la empresa. Verifique el ID"})
        console.log(empleadoEncontrado)
        return res.status(200).send({empleado: empleadoEncontrado})

    }).populate("idEmpresa","nombreEmpresa actividadEconomica")
}

//BUSCAR POR NOMBRE DE USUARIO
function ObtenerNombreEmpleados(req, res) {
    var nombrEmp= req.params.nombreEmpleado;

    if ( req.user.rol != "ROL_EMPRESA" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar empleados. Solamente la empresa puede hacerlo'});

    Empleados.find({ nombre : { $regex: nombrEmp, $options: 'i' },idEmpresa:req.user.sub },(err, empleadoEncontrado)=>{
        console.log(empleadoEncontrado)
        if(err)return res.status(500).send({mensaje: "El empleado no existe en la empresa. Verifique el nombre "});

        if(empleadoEncontrado.length==0) return res.status(404).send({mensaje: "No existen empleados con este nombre en la empresa"});

        return res.status(200).send({empleado: empleadoEncontrado})
    }).populate("idEmpresa","nombreEmpresa actividadEconomica")
}

//BUSCAR POR PUESTO DE EMPLEADO
function ObtenerPuestoEmpleados(req, res) {
    var puestoEmp= req.params.puestoEmpleado;

    if ( req.user.rol != "ROL_EMPRESA" ) return res.status(500)
    .send({ mensaje: 'No tiene acceso a buscar empleados. Solamente la empresa puede hacerlo'});

    Empleados.find({ puesto : { $regex: puestoEmp, $options: 'i' },idEmpresa:req.user.sub },(err, empleadoEncontrado)=>{
        if(err)return res.status(500).send({mensaje: "El empleado no existe en la empresa. Verifique el puesto "});
        if(empleadoEncontrado.length==0)return res.status(404).send({mensaje: "No existen empleados con este puesto en la empresa"});
        return res.status(200).send({empleado: empleadoEncontrado})
    }).populate("idEmpresa","nombreEmpresa actividadEconomica")
}


//BUSCAR POR DEPARTAMENTO DE EMPLEADO
function ObtenerDepartamentoEmpleados(req, res) {
    var deptoEmpleado= req.params.departamentoEmpleado;

    Empleados.find({ departamento : { $regex: deptoEmpleado, $options: 'i' },idEmpresa:req.user.sub },(err, empleadoEncontrado)=>{
        if(err)return res.status(500).send({mensaje: "El empleado no existe en la empresa. Verifique el departamento "});
        if(empleadoEncontrado.length==0)return res.status(404).send({mensaje: "No existen empleados con este departamento en la empresa"});
        return res.status(200).send({empleado: empleadoEncontrado})
    }).populate("idEmpresa","nombreEmpresa actividadEconomica")
}

//BUSCAR TODOS LOS EMPLEADOS DE LA EMPRESA
function ObtenerTodosEmpleados(req, res) {
    var emailUser= req.params.emailUsuario;

    Empleados.find({idEmpresa:req.user.sub },(err, empleadoEncontrado)=>{
        if(err)return res.status(500).send({mensaje: "Error en la peticion"});
        if(!empleadoEncontrado)return res.status(404).send({mensaje: "Error, el usuario no existe"});
        return res.status(200).send({empleado: empleadoEncontrado})
    }).populate("idEmpresa","nombreEmpresa actividadEconomica")
}

//********************************* EXPORTAR ********************************* */
//EXPORTAR

module.exports ={
    AgregarEmpleados,
    EditarEmpleados,
    EliminarEmpleados,
    EditarEmpleados,
    CantidadEmpleadosActuales,
    ObtenerUsuarioID,
    ObtenerNombreEmpleados,
    ObtenerPuestoEmpleados,
    ObtenerDepartamentoEmpleados,
    ObtenerTodosEmpleados
    
    

}