
var DEBUG = false;

// Dependencies ///////////////////////////////////////////////////////////////

var fm = require("front-matter")
  , md = require("markdown").markdown;



// CVMLModifier ///////////////////////////////////////////////////////////////

var CVMLModifier = function(label, stub) {
  this.label  = label || "UNRECOGNISED"; 
  this.stub   = stub || "";
  return this;
};

CVMLModifier.UNRECOGNISED = -1;
CVMLModifier.PLAIN        = 0;
CVMLModifier.LABEL        = 1;
CVMLModifier.EMPHASIS     = 2;
CVMLModifier.SECTION      = 3;
CVMLModifier.RULE         = 4;
CVMLModifier.TITLE        = 5;
CVMLModifier.PAGEBREAK    = 6;



// CVMLParser /////////////////////////////////////////////////////////////////

var CVMLParser = function() {
  this.modifiers = [];
  this.document = {
    metadata: {},
    contents: []
  };
  this.registerDefaultModifiers();
};

CVMLParser.prototype.registerDefaultModifiers = function() {
  if (DEBUG) console.log("### REGISTERING DEFAULT MODIFIERS..");
  this.modifiers = [
       new CVMLModifier("PLAIN", "   "),
       new CVMLModifier("LABEL", "  -"),
    new CVMLModifier("EMPHASIS", " --"),
     new CVMLModifier("SECTION", "==="),
        new CVMLModifier("RULE", "  ="),
       new CVMLModifier("TITLE", "  /"),
   new CVMLModifier("PAGEBREAK", "  .")
  ];
  // if (DEBUG) console.log(this.modifiers);
};

CVMLParser.prototype.identifyModifier = function(stub) {
  for (var m=this.modifiers.length-1; m>=0; m--) {
    if (this.modifiers[m].stub === stub) {
      return this.modifiers[m];
    }
  }
  return -1;
}


CVMLParser.prototype.parseMetaData = function(document) {
  var content = fm(document);
  for (a in content.attributes) {
    this.document.metadata[a] = content.attributes[a];
  }
  return content.body;
};

CVMLParser.prototype.parseContents = function(buffer) {
  var lines = buffer.split("\n")
    , contents = []
    , section
    , item = { label: "", content: "", type: "text" }
    , line
    , l = 0;

  if (DEBUG) console.log("### LINES OF CVML TO PARSE:", lines.length);

  while (l < lines.length) {
    line = lines[l];
    if (line.length > 3) {
      // console.log("LINE (" + l + ")", line);
      line = this.parseLine(line);

      switch (CVMLModifier[line.type.label]) {

        case CVMLModifier.SECTION:
          if (typeof section === "object" && section.items.length > 0) {
            if (item.content !== "") {
              section.items.push(item);
            }
            contents.push(section);
          }
          section = { section: line.body, items: [] };
          break;

        case CVMLModifier.EMPHASIS:
          item.label = line.body;
          item.type = "emphasis";
          break;

        case CVMLModifier.LABEL:
          if (item.label !== "") {
            section.items.push(item);
            item = {};
          } else {
            item.label = line.body;
          }
          break;

        case CVMLModifier.RULE: 
          if (line.body.indexOf('=') !== -1) {
            item = { type: "separator", label: "", content: "" };
            section.items.push(item);
            item = { label: "", content: "", type: "text" };
          }
          break;

        case CVMLModifier.PAGEBREAK:
          if (line.body.indexOf('.') !== -1) {
            item = { type: "pagebreak", label: "", content: "" };
            section.items.push(item);
            item = { label: "", content: "", type: "text" };
          }
          break;

        case CVMLModifier.PLAIN: 
            item.content += line.body;
          break;

        default:
          // console.log("### SKIPPING..");
      }
      if (item.content !== "") {
        section.items.push(item);
        item = { label: "", content: "", type: "text" };
      }
    } 
    l++;
  }
  contents.push(section);
  if (DEBUG) console.log("Successfully parsed " + lines.length + " of CVML!");
  this.document.contents = contents;
  return contents;
};

CVMLParser.prototype.parseLine = function(line) {

  var type = {}
    , content = "";

  type = this.identifyModifier( line.substring(0,3) ) || CVMLModifier.UNRECOGNISED;
  content = line.substr(4);

  if (DEBUG) {
    console.log("");
    if (type.label === "SECTION") {
      // console.log("==============================================================");
      console.log("");
      console.log("##############################################################");
      console.log(content);
      console.log("##############################################################");
    } else if (type.label === "LABEL") {
      console.log("[[[ "+content+" ]]]");
    } else if (type.label === "EMPHASIS") {
      console.log("<<<[[[ "+content+" ]]]>>>");
    } else if (type.label === "RULE") {
      console.log("\n= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =\n");
    } else {
      console.log(content);
      // console.log("--------------------------------------------------------------");
      // console.log("TYPE: " + type.label + ", Length: " + content.length + " characters.")
      // console.log("");
    }
  }

  return { type: type, body: content };

};

CVMLParser.prototype.webify = function() {
  var section;
  for (var i = 0; i < this.document.contents.length; i++) {
    section = this.document.contents[i];
    for (var j = 0; j < section.items.length; j++) {
      if (section.items[j].label !== "")
        section.items[j].label = md.toHTML(section.items[j].label);
      if (section.items[j].content !== "")
      section.items[j].content = md.toHTML(section.items[j].content);
    }
    this.document.contents[i] = section;
  }
  if (DEBUG) console.log("### MARKDOWN HAS BEEN CONVERTED TO HTML.");
}



// Exports ////////////////////////////////////////////////////////////////////

module.exports = function(markup, toHTML) {
  var parser = new CVMLParser();
  var stub = parser.parseMetaData(markup);
  parser.parseContents(stub);
  if (toHTML) parser.webify();
  return parser.document;
};


