//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2
const ExcelJS = require('exceljs');
const fs = require("fs");
const Empresas = require("../models/empresas.model");
const Empleados = require("../models/empleados.model");

function BuscarDatos (req,res){
    Empresas.findOne({_id:req.user.sub},(err,nombreIdEncontrado)=>{
        if(err)return res.status(500).send({mensaje: "Error en la peticion"});

        Empleados.find({idEmpresa:req.user.sub },(err, empresaEncontrada)=>{
            if(err)return res.status(500).send({mensaje: "Error en la peticion"});

            if(!empresaEncontrada)return res.status(404).send({mensaje: "Error, enla peticion"});

            CrearExcel(nombreIdEncontrado,empresaEncontrada)

            return res.status(200).send({empresa: "El Excel de la empresa "+nombreIdEncontrado.nombreEmpresa+ " se ha creado exitosamente" })        
        })
 
    })
}

function CrearExcel(empresaEncontrada, empleadoEncontrado){
    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet(empresaEncontrada.nombreEmpresa);
    if(empleadoEncontrado.length == 0){
        sheet.columns  = [
            {header: '', key: 'id'},
            {header: '', key: 'nombre'},
            {header: '', key: 'apellido'},
            {header: 'REGISTRO', key: 'email'},
            {header: '', key: 'telefono'},
            {header: '', key: 'departamento'},
            {header: '', key: 'puesto'},
        ]
    
        sheet.addRow({
            id:'Empresa: '+empresaEncontrada.nombreEmpresa,

        })

        sheet.addRow({
            id:'Actividad: '+empresaEncontrada.actividadEconomica,

        })

        sheet.addRow({
            id:'Email: '+empresaEncontrada.email,
        })

        sheet.addRow({
            nombre:'',
        })

        sheet.addRow({
            id:'ID ',
            nombre:'NOMBRE ',
            apellido:'APELLIDO',
            email:'EMAIL',
            telefono:'TELEFONO',
            departamento:'DEPTO.',
            puesto:'PUESTO',
        })
    
            sheet.addRow({
                id: "NO EXISTEN EMPLEADOS",
            })

            sheet.addRow({
                nombre:'',
            })
    
            sheet.addRow({
                id:'Empleados: '+empleadoEncontrado.length,
            })
    
            sheet.addRow({
                telefono:'Alejandro Garcia',
                departamento:'2017096',
                puesto:'IN6BM2',
            })    
        
    }else{

        sheet.columns  = [
            {header: '', key: 'id'},
            {header: '', key: 'nombre'},
            {header: '', key: 'apellido'},
            {header: 'REGISTRO', key: 'email'},
            {header: '', key: 'telefono'},
            {header: '', key: 'departamento'},
            {header: '', key: 'puesto'},
        ]
    
        sheet.addRow({
            id:'Empresa: '+empresaEncontrada.nombreEmpresa,

        })

        sheet.addRow({
            id:'Actividad: '+empresaEncontrada.actividadEconomica,

        })

        sheet.addRow({
            id:'Email: '+empresaEncontrada.email,
        })

        sheet.addRow({
            nombre:'',
        })

        sheet.addRow({
            id:'ID ',
            nombre:'NOMBRE ',
            apellido:'APELLIDO',
            email:'EMAIL',
            telefono:'TELEFONO',
            departamento:'DEPTO.',
            puesto:'PUESTO',
        })

        for (let i = 0; i< empleadoEncontrado.length; i++) {
    
            sheet.addRow({
                id: empleadoEncontrado[i]._id,
                nombre: empleadoEncontrado[i].nombre,
                apellido: empleadoEncontrado [i]. apellido,
                email: empleadoEncontrado [i]. email,
                telefono: empleadoEncontrado [i]. telefono,
                departamento: empleadoEncontrado[i].departamento,
                puesto: empleadoEncontrado[i].puesto,
            })
        }

        sheet.addRow({
            nombre:'',
        })

        sheet.addRow({
            id:'Empleados: '+empleadoEncontrado.length,
        })

        sheet.addRow({
            telefono:'Alejandro Garcia',
            departamento:'2017096',
            puesto:'IN6BM2',
        })


    }

       sheet.getCell('D1').font = {
        name: 'Arial Black',
        color: { argb: 'FFDC143C' },
        size: 12,
        italic: true,
        bold: true,
      };

      sheet.getRow('6').font = {
        name: 'Arial Black',
        color: { argb: 'FFFFD700' },
        size: 11,
      };

      sheet.getRow('6').alignment = { vertical: 'top', horizontal: 'center' };


      sheet.getRow('6').border = {
        top: {style:'double', color: {argb:'FF4682B4'}},
        left: {style:'double', color: {argb:'FF4682B4'}},
        bottom: {style:'double', color: {argb:'FF4682B4'}},
      };

        sheet.getCell("D1").fill = {
             type: 'pattern',
            pattern: 'solid',
            bgColor: {argb: 'FF4682B4'},
        }

         sheet.workbook.xlsx.writeFile('./src/docExcel/'+empresaEncontrada.nombreEmpresa+'.xlsx')

}

module.exports = {
    CrearExcel,
    BuscarDatos
  };