
// Dependencies ///////////////////////////////////////////////////////////////

var md = require("markdown").markdown
  , PDFDocument = require("pdfkit")



// CVMLRenderer ///////////////////////////////////////////////////////////////

var CVMLRenderer = function(data) {
    this.data = data;
    this.author = "bloomingbridges";
    this.document = this.beginDocument({});
    this.processDataTree();
};

CVMLRenderer.prototype.styles = {

};

CVMLRenderer.prototype.beginDocument = function(options) {
  var doc =  new PDFDocument( { size: "a4", margins: { top: 50, right: 20, bottom: 15, left: 15 } } );
  doc.info.Title = this.data.metadata.title;
  doc.fillColor('#666');
  doc.fontSize(18);
  doc.text("Curriculum Vitae", { align: 'right' });
  doc.fillColor('#000');
  return doc;
};

CVMLRenderer.prototype.processDataTree = function() {
  for (var i=0; i < this.data.contents.length; i++) {
    var section = this.data.contents[i];
    this.beginSection(section.section);
    for (var j=0; j < section.items.length; j++) {
      this.renderItem(section.items[j]);
    }
    this.endSection();
  }
};

CVMLRenderer.prototype.beginSection = function(title) {
  this.document.fontSize(22);
  this.document.moveDown();
  this.document.text(title, { align: 'right' });
  this.document.rect(0,this.document.y,700,3);
  this.document.fill('#D289E3');
  this.document.moveDown();
};

CVMLRenderer.prototype.renderItem = function(item) {
  
  if (item.hasOwnProperty("type") && item.type === "emphasis") {
    this.document.fontSize(18);
  }
  else if (item.hasOwnProperty("type") && item.type === "separator") {
    this.renderSeparator();
  }
  else if (item.hasOwnProperty("type") && item.type === "pagebreak") {
    this.document.addPage();
  }
  else {
    this.document.fontSize(12);
  }

  if (item.label)
    this.renderLabel(item.label);

  var contentStack = md.parse(item.content);
  contentStack.shift();
  for (var i = 0; i < contentStack.length; i++) {
    var element = contentStack[i];
    if (element[0] === "para" && typeof element[1] === 'string')
      this.renderText(element[1], false);
    else {
      element.shift();
      var paragraph = element;
      for (var p = 0; p < paragraph.length; p++) {
        this.renderRichParagraphItem(paragraph[p], p === paragraph.length-1);
      }
    }
  }

};

CVMLRenderer.prototype.renderRichParagraphItem = function(item, ultimate) {
  if (item[0] === "link") {
    var link = item[1];
    this.document.fillColor('#666');
    this.renderText(item[2], ultimate);
    var width = this.document.widthOfString(item[2]);
    var height = this.document.currentLineHeight();
    this.document.underline(this.document.x + 140, this.document.y - (height*3) + 5, width, height, { color: '#8847de' });
    this.document.link(this.document.x + 140, this.document.y - (height*3), width, height, link.href);
  } else if (item[0] === "strong") {
    this.document.fillColor('#8847de');
    this.renderText(item[1], ultimate);
  } else if (typeof item === "string") {
    this.document.fillColor('#000');
    this.renderText(item, ultimate);
  }
};

CVMLRenderer.prototype.renderSeparator = function(label) {
    this.document.rect(140,this.document.y-5,580,1);
    this.document.fill('#ededed');
    this.document.moveDown();
};

CVMLRenderer.prototype.renderLabel = function(label) {
  this.document.fillColor('#666');
  this.document.text(label, { width: 120, align: 'right' });
};

CVMLRenderer.prototype.renderText = function(text, continued) {
  this.document.save();
  this.document.moveUp();
  this.document.translate(140, 0);
  this.document.text(text, { width: 400, lineGap: 6 });
  this.document.moveDown();
  this.document.restore();
};

CVMLRenderer.prototype.endSection = function() {
  // Override this function if you fancy it
};

CVMLRenderer.prototype.getFilename = function() {
  return this.data.metadata.name.replace(/ /gi, "_")+'_CV.pdf'
};

CVMLRenderer.prototype.producePDF = function() {
  this.document.write(this.getFilename());
};

  

// Exports ////////////////////////////////////////////////////////////////////

module.exports = CVMLRenderer;


