
var fs = require("fs")
  // , yamljs = require("yamljs")
  // , marked = require("marked") 
  , Hogan  = require("hogan.js");

var exampleData = {
  metadata: {
    name: "Edgar Exampleson",
    title: "Curriculum Vitae",
    cssPath: "layouts/bloomingbridges.css"
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

var verbose = (process.argv[2] === "-v") ? true : false;

var template = Hogan.compile(loadTemplate());
generateHTML(template, exampleData);

function loadTemplate(name) {
  var filename = (name) ? name + ".hgn" : "default.hgn";
  if (verbose) console.log("### LOADING / USING \"" + filename + "\"..");
  var templateString = fs.readFileSync("layouts/"+filename, { encoding: "utf8" });
  return templateString;
}

function generateHTML(template, data) {
  var buffer = template.render(data);
  if (verbose) console.log("### PREVIEW\n", buffer, "\n### EOF");
  fs.writeFile(data.metadata.name.replace(/ /gi, "_")+'_CV.html', buffer, function (err) {
    if (err) throw err;
    console.log("### HTML GENERATED!");
  });
}

