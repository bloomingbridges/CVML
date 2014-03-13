
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

CVMLParser.prototype.parseMetaData = function(document) {
  var content = fm(document);
  for (a in content.attributes) {
    this.document.metadata[a] = content.attributes[a];
  }
  return content.body;
};

CVMLParser.prototype.parseContents = function(contents) {
  var lines = contents.split("\n");
  console.log("Lines of CVML to parse:", lines.length);
  return true;
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