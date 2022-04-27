//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const fs = require("fs");
const PDFDocument = require("pdfkit");
const Empresas = require("../models/empresas.model");
const Empleados = require("../models/empleados.model");
const imagen = "./src/generarPDF/images/LCS KINAL.png"


function empresasPDF(req, res){
  if ( req.user.rol == "ROL_ADMINISTRADOR" ) return res.status(500)
  .send({ mensaje: 'No tiene acceso a generar PDF de empresas. Únicamente el cada empresa puede hacerlo'});


  Empresas.findOne({_id:req.user.sub},(err,nombreIdEncontrado)=>{
    Empresas.find({_id:req.user.sub },(err, empresaEncontrada)=>{
      if(err) return res.status(500).send({ error: `Error en la peticion ${err}`})
      if(empresaEncontrada !== null){
          var nombreDoc=nombreIdEncontrado.nombreEmpresa;

          // DIRECCIONAMIENTO
          var path = "./src/docPDF/"+nombreDoc+".pdf";
          Empleados.find({idEmpresa: req.user.sub},(err, empleadosEncontrados)=>{
            if(err) return res.status(500).send({ error: `Error en la peticion ${err}`})
            if(empleadosEncontrados === null) return res.status(404)
            .send({error: `Error al entrar al empleado`})
            
            estructuraDocumento(empresaEncontrada,empleadosEncontrados, path);
            return res.status(200).send({empresa: "El PDf de la empresa "+ nombreDoc +" se ha creado exitosamente"})
          })
      }
    })
  })

}


function estructuraDocumento(empresa,empleados, path) {
  let doc = new PDFDocument({ size: "A4", margin: 20 });
  cabeceraDocumento(doc,empresa);
  informacionEmpresa(doc, empresa);
  encabezadoTabla(doc, empleados);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}


function cabeceraDocumento(doc,empresa) {
  empresa.forEach(element=>{
    doc
    .image("./src/generarPDF/images/FondoDocumentoPDF.png",2,2, { width: 591,height: 837, align: "center"})
     .image(imagen, 70, 45, { width: 60 })
    .fillColor("#212F3C")
    .fontSize(9)
    .font('Helvetica-BoldOblique')
    .text(fechaDocumento(new Date()), 220, 40, { align: "right" })
    .text("Facturación Venta Online", 220, 90, { align: "right" })
    .text("Alejandro García - 2017096", 220, 110, { align: "right" })
    .text(" PE6BM2", 220, 130, { align: "right" })


    .moveDown();
  })
}

function informacionEmpresa(doc, empresa) {
  doc
    .fillColor("#B03A2E")
    .fontSize(34)
    .font('Courier-BoldOblique')
    .text("Registro de", 22, 50,{ align: "center" })
    .text("Empleados", 22, 95,{ align: "center" });

  separadorEmpresa(doc, 170);

  empresa.forEach(element=>{
    doc
    .fillColor("#273746")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("ID:", 70, 180)
      .font("Helvetica")
      .text(element._id, 190, 180)
      .font("Helvetica-Bold")
      .text("Empresa:", 70, 200)
      .font("Helvetica")
      .text(element.nombreEmpresa, 190, 200)
      .font("Helvetica-Bold")
      .text("Actividad económica:", 70, 220)
      .font("Helvetica")
      .text(element.actividadEconomica, 190, 220)
      .font("Helvetica-Bold")
      .text("Email:", 70, 240)
      .font("Helvetica")
      .text(element.email,190,240)
      .image("./src/generarPDF/images/IconoEMpresa.png", 475, 180, { width: 70, align: "right"})
      .moveDown();
  })

  separadorEmpresa(doc, 258);
}

function encabezadoTabla ( doc, empleados) {
    let i;
    const invoiceTableTop = 300;

    doc.font("Helvetica-BoldOblique")
       .fontSize(15)
       .fillColor("#1F618D");
       filaRegistro(
      doc,
      invoiceTableTop,
      "Nombre",
      "Apellido",
      "Email",
      "Telefono",
      "Departamento",
      "Puesto"
      );
      separadorSubtitulos(doc, invoiceTableTop + 20);
    doc.font("Helvetica")
       .fontSize(10)
       .fillColor("black");

       if(empleados.length == 0){

        for (i = 0; i < 1; i++) {
          const position = invoiceTableTop + (i + 1) * 30;
          filaRegistro(
            doc,
            position,
            "*NOTA: No existen empleados en la empresa",
            "",
            "",
            ""
          );
    
          separadorRegistros(doc, position + 30);
        } 
      }else{
        for (i = 0; i < empleados.length; i++) {
          const item = empleados[i];
          const position = invoiceTableTop + (i + 1) * 50;
    
          filaRegistro(
            doc,
            position,
            empleados[i].nombre,
            empleados[i].apellido,
            empleados[i].email,
            empleados[i].telefono,
            empleados[i].departamento,
            empleados[i].puesto
          );
    
          separadorRegistros(doc, position + 30);
        }
        }  
}

function generateFooter(doc) {
  doc
    .image("./src/generarPDF/images/LLS KINAL.png", 35, 770, { width: 70, align: "left"})
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(
      "Sexto Perito en Informática - Ciclo Diversificado 2022",
      50,
      785,
      { align: "center", width: 500 }
    )
    .font("Helvetica-Oblique")
    .fillColor("#1C2833")
    .text("Ciudad de Guatemala", 50, 800, { align: "center" })
    .image("./src/generarPDF/images/LLS KINAL.png", 490, 770, { width: 70, align: "right"})

}

function filaRegistro(
  doc,
  y,
  nombre,
  apellido,
  email,
  telefono,
  departamento,
  puesto
) {
  doc
    .fontSize(10)
    .text(nombre, 25, y)
    .text(apellido, 95, y)
    .text(email, 160, y)
    .text(telefono, 315, y)
    .text(departamento, 390, y)
    .text(puesto, 506, y)
}

function separadorEmpresa(doc, y) {
  doc
    .strokeColor("#154360")
    .lineWidth(1)
    .moveTo(15, y)
    .lineTo(580, y)
    .stroke();
}

function separadorSubtitulos(doc, y) {
  doc
    .strokeColor("#17202A")
    .lineWidth(2)
    .moveTo(15, y)
    .lineTo(580, y)
    .stroke();
}

function separadorRegistros(doc, y) {
  doc
    .strokeColor("#B2BABB")
    .lineWidth(0.5)
    .moveTo(15, y)
    .lineTo(580, y)
    .stroke();
}

function fechaDocumento(date) {
  
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return day + "/" + month + "/" + year;

}

module.exports = {
  empresasPDF
};