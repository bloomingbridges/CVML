
// Dependencies ///////////////////////////////////////////////////////////////

var fs = require("fs")
  , cmd = require("commander")
  , Hogan  = require("hogan.js");



// Modules ////////////////////////////////////////////////////////////////////

var cvp = require("./parser.js")
  , cvr = require("./renderer.js");



// Globals ////////////////////////////////////////////////////////////////////

var content, template, stylesheet;



// Fixtures ///////////////////////////////////////////////////////////////////

// var exampleData = {
//   metadata: {
//     name: "Edgar Exampleson",
//     title: "Curriculum Vitae",
//     cssPath: "layouts/default.css"
//   },
//   contents: [
//     {
//       section: "Personal Details",
//       items: [
//         { label: "Name", content: "**Edgar Exampleson**" },
//         { label: "Born", content: "05.05.1000, Exempelstad (Sweden)" }
//       ]
//     },
//     {
//       section: "Employment History",
//       items: [
//         { label: "Position", content: "This is a job description" },
//         { label: "Responsibilities", content: "This is a list of responsibilities and duties that I.." },
//         { type: "pagebreak" }
//       ]
//     },
//     {
//       section: "Education",
//       items: [
//         { label: "Period", content: "2000 - 3000" },
//         { label: "Institution", content: "University of Examplemouth" },
//         { label: "Qualification", content: "This is a Qualification" }
//       ]
//     },
//     {
//       section: "References",
//       items: [{ label: "Name", content: "This is a reference" }]
//     }
//   ]
// };



// Functions //////////////////////////////////////////////////////////////////

function loadTemplate(name) {
  var filename = (name) ? name + ".hgn" : "default.hgn";
  if (cmd.verbose) console.log("### LOADING / USING \"" + filename + "\"..");
  var templateString = fs.readFileSync("layouts/"+filename, { encoding: "utf8" });
  return templateString;
}

function loadMarkup(file) {
  var data;
  if (cmd.verbose) console.log("### READING FILE..");
  
  if ( fs.existsSync(file) ) {
    data = fs.readFileSync("./"+file, 'utf8');
  } else {
    console.log("### ERROR CVML file not found! Proceeding using example data..");
    data = fs.readFileSync("examples/example.cvml", 'utf8');
  }
  
  if (cmd.verbose) console.log("### PARSING MARKUP..");
  return cvp(data, cmd.html);
}

function loadStylesheet(file) {
  if ( fs.existsSync(file) ) {
    return fs.readFileSync("./"+file, 'utf8');
  } else {
    console.log("### ERROR Couldn't locate stylesheet at '" + file + "'");
    return null;
  }
}

function generateHTML(template, data) {
  var buffer = template.render(data);
  // if (cmd.verbose) console.log("### PREVIEW\n", buffer, "\n### EOF");
  fs.writeFile("output/" + data.metadata.name.replace(/ /gi, "_")+'_CV.html', buffer, function (err) {
    if (err) throw err;
    console.log("### HTML GENERATED!");
  });
}

function generatePDF(renderer, data) {
  var myRenderer = new renderer(data);
  myRenderer.producePDF();
  if (cmd.verbose) console.log("### DONE!");
}



// CLI ////////////////////////////////////////////////////////////////////////

cmd
  .usage('[options] <file ...>')
  .option('-v, --verbose', 'Enable "Verbose Output"')
  .option('-t, --template [template]', 'Define a HTML template other than the default one', 'template')
  .option('-s, --style [stylesheet]', 'Provide a stylesheet in JSON format or override cssPath property in document.')
  .option('-p, --pdf', 'Produces a PDF (default)')
  .option('-w, --html', 'Produces a HTML document instead')
  .parse(process.argv);

if (cmd.args.length > 0) {
  var file = cmd.args.shift();
  content = loadMarkup(file);
} else {
  console.log("### ERROR No CVML file specified! Proceeding using example data..");
  content = loadMarkup("examples/example.cvml");
}

if (cmd.style) {
  var extension = cmd.style.match(/^.*\.(json|css)$/);
  if (extension && extension[1] === "json") {
    stylesheet = loadStylesheet(cmd.style);
  } else if (extension && extension[1] === "css") {
    content.metadata.cssPath = cmd.style;
  } else {
    console.log("### ERROR Couldn't determine stylesheet format.");
  }
}

if (cmd.html) {
  var template = Hogan.compile(loadTemplate());
  if (!content.metadata.cssPath)
    content.metadata.cssPath = "layouts/default.css";
  stylesheet = loadStylesheet(content.metadata.cssPath);
  content.styles = stylesheet;
  generateHTML(template, content);
} 
else {
  if (cmd.verbose) console.log("### PRODUCING PDF..");
  if (stylesheet)
    cvr.prototype.styles = JSON.parse(stylesheet);
  generatePDF(cvr, content);
}


