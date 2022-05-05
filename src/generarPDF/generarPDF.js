//ALEJANDRO JAVIER GARCIA GARCIA -2017096 - PE6BM2

const fs = require("fs");
const PDFDocument = require("pdfkit");
const Ligas = require("../models/ligas.model");
const Equipos = require("../models/equipos.model");
const imagen = "./src/generarPDF/images/LCS KINAL.png"


function TablaLigaPDF(req, res){
  var idLig = req.params.idLiga


  Ligas.find({_id:idLig,idUsuario: req.user.sub},(err,ligaEncontrada)=>{
    if(ligaEncontrada.length==0) return res.status(500).send({ error: `La liga ingresada no existe dentro de su registro de usuario. Verifique el ID.`})

    Equipos.find({idLiga:idLig,idUsuario: req.user.sub },(err, equiposLiga)=>{

      if(equiposLiga.length==0) return res.status(500).send({ error: `No existen equipos en la liga. Agregue equipos a la liga y gestiones las jornadas para generar el PDF.`})

      if(equiposLiga.length !== 0){

          Ligas.findOne({_id:idLig,idUsuario: req.user.sub},(err,nombreDocumento)=>{

            var nombreDoc=nombreDocumento.nombreLiga;

            // DIRECCIONAMIENTO
            var path = "./src/docPDF/"+nombreDocumento.nombreLiga+".pdf";
            
            estructuraDocumento(ligaEncontrada,equiposLiga, path);
            return res.status(200).send({liga: "El PDf de "+ nombreDoc +" se ha creado exitosamente"})
          })


      }
    }).sort({  puntos:-1,diferenciaGoles:-1})
  })

}

function estructuraDocumento(liga,equipos, path) {
  let doc = new PDFDocument({ size: "A4", margin: 20 });
  cabeceraDocumento(doc,liga);
  informacionLiga(doc, liga);
  encabezadoTabla(doc, equipos);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}


function cabeceraDocumento(doc,liga) {
  liga.forEach(element=>{
    doc
    .image("./src/generarPDF/images/FondoDocumentoPDF.png",2,2, { width: 591,height: 837, align: "center"})
     .image(imagen, 50, 45, { width: 60 })
    .fillColor("#212F3C")
    .fontSize(9)
    .font('Helvetica-BoldOblique')
    .text(fechaDocumento(new Date()), 220, 40, { align: "right" })
    .text("Torneo Deportivo", 220, 90, { align: "right" })
    .text("Alejandro García - 2017096", 220, 110, { align: "right" })
    .text(" PE6BM2", 220, 130, { align: "right" })


    .moveDown();
  })
}

function informacionLiga(doc, liga) {
  doc
    .fillColor("#B03A2E")
    .fontSize(34)
    .font('Courier-BoldOblique')
    .text("Tabla de ", 30, 60,{ align: "center" })
    .text("posiciones", 20, 105,{ align: "center" });

  separadorEmpresa(doc, 170);

  liga.forEach(element=>{
    doc
    .fillColor("#273746")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("ID:", 80, 185)
      .font("Helvetica")
      .text(element._id, 165, 185)
      .font("Helvetica-Bold")
      .text("Liga:", 80, 210)
      .font("Helvetica")
      .text(element.nombreLiga, 165, 210)
      .font("Helvetica-Bold")
      .text("Patrocinador:", 80, 235)
      .font("Helvetica")
      .text(element.patrocinador, 165, 235)
      .image("./src/generarPDF/images/logo.png", 460, 173, { width: 75, align: "right"})
      .moveDown();
  })

  separadorEmpresa(doc, 258);
}

function encabezadoTabla ( doc, equipos) {
    let i;
    const invoiceTableTop = 300;

    doc.font("Helvetica-BoldOblique")
       .fontSize(15)
       .fillColor("#1F618D");
       filaRegistro(
      doc,
      invoiceTableTop,
      "Nombre del equipo",
      "PJ",
      "G",
      "E",
      "P",
      "GF",
      "GC",
      "DG",
      "Pts",

      );
      separadorSubtitulos(doc, invoiceTableTop + 20);
    doc.font("Helvetica")
       .fontSize(10)
       .fillColor("black");

       if(equipos.length == 0){

        for (i = 0; i < 1; i++) {
          const position = invoiceTableTop + (i + 1) * 30;
          filaRegistro(
            doc,
            position,
            "*NOTA: No existen equipos en la empresa",
            "",
            "",
            ""
          );
    
          separadorRegistros(doc, position + 30);
        } 
      }else{
        for (i = 0; i < equipos.length; i++) {
          console.log(equipos[i])
          const item = equipos[i];
          const position = invoiceTableTop + (i + 1) * 50;
    
          filaRegistro(
            doc,
            position,
            item.nombreEquipo,
            item.partidosJugados,
            item.partidosGanados,
            item.partidosEmpatados,
            item.partidosPerdidos,
            item.golesFavor,
            item.golesContra,
            item.diferenciaGoles,
            item.puntos
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
  nombreEquipo,
  partidosJugados,
  partidosGanados,
  partidosEmpatados,
  partidosPerdidos,
  golesFavor,
  golesContra,
  diferenciaGoles,
  puntos,
) {
  doc
    .fontSize(10)
    .text(nombreEquipo, 50, y)
    .text(partidosJugados, 180, y)
    .text(partidosGanados, 230, y)
    .text(partidosEmpatados, 280, y)
    .text(partidosPerdidos, 330, y)
    .text(golesFavor, 380, y)
    .text(golesContra, 430, y)
    .text(diferenciaGoles, 480, y)
    .text(puntos, 530, y)


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
  TablaLigaPDF
};