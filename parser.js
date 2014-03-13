
var DEBUG = true;

// Dependencies ///////////////////////////////////////////////////////////////

var fm = require("front-matter")
  , marked = require("marked");



// CVMLParser /////////////////////////////////////////////////////////////////

var CVMLParser = function() {
  this.document = {
    metadata: {},
    contents: []
  };
};

CVMLParser.prototype.modifiers = {
     PLAIN: "   ",
     LABEL: "  -",
  EMPHASIS: " --",
   SECTION: "===",
      RULE: "  =",
     TITLE: "  /"
};

CVMLParser.prototype.identifyModifier = function(stub) {

}

CVMLParser.prototype.parseMetaData = function(document) {
  var content = fm(document);
  for (a in content.attributes) {
    this.document.metadata[a] = content.attributes[a];
  }
  return content.body;
};

CVMLParser.prototype.parseContents = function(contents) {
  var lines = contents.split("\n")
    , sections = []
    , l = 0;

  console.log("Lines of CVML to parse:", lines.length);

  while (l < lines.length) {
    var line = this.parseLine(lines[l]);
    l++;
  }
  return true;
};

CVMLParser.prototype.parseLine = function(line) {

  var type = "UNRECOGNISED"
    , content = "";

  if (line.length > 3) {
    type = this.identifyModifier( line.substring(0,3) );
    content = line.substr(4);

    if (DEBUG) {
      console.log("");
      console.log("##############################################################");
      console.log(content);
      console.log("--------------------------------------------------------------");
      console.log("TYPE: " + type + ", Length: " + content.length + " characters.")
      console.log("==============================================================");
      console.log("");
    }

    return { type: type, content: content };
  }
};



// Exports ////////////////////////////////////////////////////////////////////

module.exports = function(markup) {
  var parser = new CVMLParser()
    , document = {};

  var stub = parser.parseMetaData(markup);
  if (parser.parseContents(stub))
    return parser.document;
  else
    return undefined;
};