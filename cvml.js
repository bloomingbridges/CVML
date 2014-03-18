
// Dependencies ///////////////////////////////////////////////////////////////

var fs = require("fs")
  , cmd = require("commander")
  , Hogan  = require("hogan.js");



// Modules ////////////////////////////////////////////////////////////////////

var cvp = require("./parser.js")
  , cvr = require("./renderer.js");



// Globals ////////////////////////////////////////////////////////////////////

var content, template, stylesheet, renderer, rendererExtension;



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

function loadRendererExtension(file) {
  if ( fs.existsSync(file) ) {
    return require(file);
  } else {
    console.log("### ERROR Couldn't locate renderer at '" + file + "'");
    return null;
  }
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

function generatePDF(renderer) {
  renderer.producePDF();
  if (cmd.verbose) console.log("### DONE!");
}



// CLI ////////////////////////////////////////////////////////////////////////

cmd
  .usage('[options] <file ...>')
  .option('-v, --verbose', 'Enable "Verbose Output"')
  // .option('-t, --template [template]', 'Provide a custom HTML template', 'template')
  .option('-r, --renderer [extension]', 'Use a custom PDF renderer')
  .option('-s, --style [stylesheet]', 'Provide a custom stylesheet ( JSON | CSS )')
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

if (cmd.renderer) {
  if (cmd.renderer === true)
    console.log("### ERROR No renderer specified!");
  else
    rendererExtension = loadRendererExtension(cmd.renderer);
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

  if (cmd.renderer) {
    renderer = new cvr(content, rendererExtension);
    if (cmd.verbose) console.log("### USING CUSTOM RENDERER: '" 
               + renderer.description 
               + "' by " 
               + renderer.author);
  } else {
    renderer = new cvr(content, rendererExtension);
    if (cmd.verbose) console.log("### USING '" 
                                + renderer.description 
                                + "' by " 
                                + renderer.author);
  }

  if (stylesheet) {
    if (cmd.verbose) console.log("### USING CUSTOM STYLESHEET");
    renderer.applyStylesheet(JSON.parse(stylesheet));
  }

  generatePDF(renderer);

}


