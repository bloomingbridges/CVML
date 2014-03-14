
// Dependencies ///////////////////////////////////////////////////////////////

var fs = require("fs")
  , cmd = require("commander")
  , Hogan  = require("hogan.js")
  , PDFDocument = require("pdfkit");



// Modules ////////////////////////////////////////////////////////////////////

var cvp = require("./parser.js")
  , cvr = require("./renderer.js");



// Fixtures ///////////////////////////////////////////////////////////////////

var exampleData = {
  metadata: {
    name: "Edgar Exampleson",
    title: "Curriculum Vitae",
    cssPath: "layouts/default.css"
  },
  contents: [
    {
      section: "Personal Details",
      items: [
        { label: "Name", content: "<strong>Edgar Exampleson</strong>" },
        { label: "Born", content: "05.05.1000, Exempelstad (Sweden)" }
      ]
    },
    {
      section: "Employment History",
      items: [
        { label: "Position", content: "This is a job description" },
        { label: "Responsibilities", content: "This is a crazy long list of responsibilities and duties that I.." }
      ]
    },
    {
      section: "Education",
      items: [
        { label: "Period", content: "2000 - 3000" },
        { label: "Institution", content: "University of Examplemouth" },
        { label: "Qualification", content: "This is a Qualification" }
      ]
    },
    {
      section: "References",
      items: [{ label: "Name", content: "This is a reference" }]
    }
  ]
};



// Functions //////////////////////////////////////////////////////////////////

function loadTemplate(name) {
  var filename = (name) ? name + ".hgn" : "default.hgn";
  if (cmd.verbose) console.log("### LOADING / USING \"" + filename + "\"..");
  var templateString = fs.readFileSync("layouts/"+filename, { encoding: "utf8" });
  return templateString;
}

function generateHTML(template, data) {
  var buffer = template.render(data);
  // if (cmd.verbose) console.log("### PREVIEW\n", buffer, "\n### EOF");
  fs.writeFile(data.metadata.name.replace(/ /gi, "_")+'_CV.html', buffer, function (err) {
    if (err) throw err;
    console.log("### HTML GENERATED!");
  });
}

function generatePDF(template, data) {
  var doc = new PDFDocument( { size: "a4", margins: { top: 50, right: 20, bottom: 15, left: 15 } } );
  doc.info.Title = data.metadata.title;
  doc.fillColor('#666');
  doc.fontSize(18);
  // doc.moveDown();
  doc.text("Curriculum Vitae", { align: 'right' });
  doc.fillColor('#000');
  for (var i=0; i < data.contents.length; i++) {
    var section = data.contents[i];
    doc.fontSize(22);
    doc.moveDown();
    doc.text(section.section, { align: 'right' });
    doc.rect(0,doc.y,700,3);
    doc.fill('#D289E3');
    doc.moveDown();
    for (var j=0; j < section.items.length; j++) {
      var item = section.items[j];
      if (item.hasOwnProperty("type") && item.type === "emphasis") {
        doc.fontSize(18);
      }
      else if (item.hasOwnProperty("type") && item.type === "separator") {
        doc.rect(140,doc.y-2,580,1);
        doc.fill('#ededed');
        doc.moveDown();
      }
      else if (item.hasOwnProperty("type") && item.type === "pagebreak") {
        doc.addPage();
      }
      else {
        doc.fontSize(12);
      }
      doc.fillColor('#666');
      doc.text(item.label, { width: 120, align: 'right' });
      doc.fillColor('#000');
      doc.save();
      doc.moveUp();
      doc.translate(140, 0);
      doc.text(item.content, { width: 400, lineGap: 6 });
      doc.restore();
      doc.moveDown();
    }
  }
  doc.write(data.metadata.name.replace(/ /gi, "_")+'_CV.pdf');
  if (cmd.verbose) console.log("### DONE!");
}



// CLI ////////////////////////////////////////////////////////////////////////

var content, template;

cmd
  .usage('[options] <file ...>')
  .option('-v, --verbose', 'Enable "Verbose Output"')
  .option('-t, --template [template]', 'Define a template other than the default one', 'template')
  .option('-p, --pdf', 'Produces a PDF (default)')
  .option('-w, --html', 'Produces a HTML document instead')
  .parse(process.argv);

if (cmd.args.length > 0) {

  var file = cmd.args.shift();

  if ( fs.existsSync(file) ) {
    if (cmd.verbose) console.log("### READING FILE..");
    var data = fs.readFileSync("./"+file, 'utf8');
    if (cmd.verbose) console.log("### PARSING MARKUP..");
    content = cvp(data, cmd.html);
    if (content && cmd.verbose) console.log("### MARKUP OKAY!");
  } else {
    console.log("### ERROR CVML file not found! Proceeding using example data..");
    content = exampleData;
  }
} else {
  console.log("### ERROR No CVML file specified! Proceeding using example data..");
  content = exampleData;
}

if (cmd.html) {
  var template = Hogan.compile(loadTemplate());
  generateHTML(template, content);
} 
else {
  if (cmd.verbose) console.log("### PRODUCING PDF..");
  generatePDF(null, content);
}


