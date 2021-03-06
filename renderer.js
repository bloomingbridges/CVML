
// Dependencies ///////////////////////////////////////////////////////////////

var md = require("markdown").markdown
  , PDFDocument = require("pdfkit")



// CVMLRenderer ///////////////////////////////////////////////////////////////

var CVMLRenderer = function(data, prototype) {
    this.data = data;
    this.description = "Generic CV Renderer";
    this.author = "bloomingbridges";
    if (prototype)
      this.extend(prototype);
    this.document = this.beginDocument(this.styles.dimensions);
};

CVMLRenderer.prototype.styles = {
              dimensions: {
                    size: "a4",
                 margins: { 
                     top: 50, 
                   right: 45, 
                  bottom: 15, 
                    left: 15
                          }
                          },
                textFont: "Helvetica",
                decoFont: "Helvetica",
                boldFont: "Helvetica-Bold",
              italicFont: "Helvetica-Oblique",
              textColour: '#000',
             labelColour: '#666',
         separatorColour: '#EDEDED',
              linkColour: '#666',
     linkUnderlineColour: '#8847DE',
     sectionHeaderColour: '#D289E3',
                fontSize: 12,
           highlightSize: 18,
   sectionHeaderFontSize: 22,
             textLeading: 6,
  sectionHeaderThickness: 3,
      separatorThickness: 1,
        labelColumnWidth: 120
};

CVMLRenderer.prototype.extend = function(prototype) {
  if (prototype.styles) {
    this.applyStylesheet(prototype.styles);
    delete prototype.styles;
  }
  for (method in prototype) {
    this[method] = prototype[method];
  }
};

CVMLRenderer.prototype.applyStylesheet = function(stylesheet) {
  for (s in stylesheet) {
    this.styles[s] = stylesheet[s];
  }
};

CVMLRenderer.prototype.beginDocument = function(dimensions) {
  var doc =  new PDFDocument( dimensions );
  doc.info.Title = this.data.metadata.title;
  // TODO: Add the remaining metadata fields
  return doc;
};

// Override to see how the title is displayed
CVMLRenderer.prototype.renderTitle = function() {
  this.document.fillColor(this.styles.labelColour);
  this.document.fontSize(this.styles.highlightSize);
  this.document.text("Curriculum Vitae", { align: 'right' });
};

// Don't override if you want to live!
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

// Override to change the appearance of section headers
CVMLRenderer.prototype.beginSection = function(title) {
  this.document.fillColor(this.styles.textColour);
  this.document.fontSize(this.styles.sectionHeaderFontSize);
  this.document.moveDown();
  this.document.text(title, { align: 'right' });
  this.document.rect( this.styles.labelColumnWidth + 25
                    , this.document.y
                    , 700
                    , this.styles.sectionHeaderThickness);
  this.document.fill(this.styles.sectionHeaderColour);
  this.document.moveDown(1.5);
};

// Unlikely anything to override here..
CVMLRenderer.prototype.renderItem = function(item) {
  
  if (item.hasOwnProperty("type") && item.type === "emphasis") {
    this.document.fontSize(this.styles.highlightSize);
  }
  else if (item.hasOwnProperty("type") && item.type === "separator") {
    this.renderSeparator();
  }
  else if (item.hasOwnProperty("type") && item.type === "pagebreak") {
    this.document.addPage();
  }
  else {
    this.document.fontSize(this.styles.fontSize);
    this.document.fillColor(this.styles.textColour);
  }

  if (item.label) {
    this.renderLabel(item.label);
  }

  this.document.fillColor(this.styles.textColour);

  var contentStack = this.parseMarkdownContent(item.content);
  if (contentStack) {
    var stack = contentStack.stack;
    switch (contentStack.container) {
      case "para":
        if (stack.length === 1 && typeof stack[0] === 'string')
          this.renderText(stack.pop(), false);
        else
          this.renderComplexItem(stack);
        break;
      case "bulletlist":
        this.beginListItem();
        stack = stack[0];
        stack.shift();
        // console.log("\n"+contentStack.container+" >>>>\n", stack);
        this.renderComplexItem(stack);
        // console.log("<<<<\n");
        break;
    }
  }
};

CVMLRenderer.prototype.parseMarkdownContent = function(content) {
  var contentStack = { container: "", stack: null};
  if (content !== "") {
    var results = md.parse(content);
    results.shift();
    results = results[0];
    contentStack.container = results[0];
    results.shift();
    contentStack.stack = results;
    return contentStack;
  }
  else
    return false;
};

CVMLRenderer.prototype.renderComplexItem = function(stack) {
  for (var p = 0; p < stack.length; p++) {
    var continued = (p === stack.length-1) ? undefined : true;
    this.renderRichParagraphItem(stack[p], continued);
  }
};

CVMLRenderer.prototype.beginListItem = function() {
  this.document.rect( this.styles.labelColumnWidth + 25
                      , this.document.y - this.document.currentLineHeight() - this.styles.textLeading
                      , 1
                      , this.document.currentLineHeight() + (this.styles.textLeading / 2));
  this.document.fill(this.styles.separatorColour);
  this.document.fillColor(this.styles.textColour);
};

// Don't override if you want to live!
CVMLRenderer.prototype.renderRichParagraphItem = function(item, ultimate) {
  if (item[0] === "link") {
    var link = item[1];
    this.document.fillColor(this.styles.linkColour);
    this.renderText(item[2], ultimate);
    var width = this.document.widthOfString(item[2]);
    var height = this.document.currentLineHeight();
    this.document.underline( this.document.x + this.styles.labelColumnWidth + 20
                           , this.document.y - ( height * 3 ) + 5
                           , width
                           , height
                           , { color: this.styles.linkUnderlineColour });
    this.document.link( this.document.x + this.styles.labelColumnWidth + 20
                      , this.document.y - ( height * 3 )
                      , width
                      , height
                      , link.href);
  } else if (item[0] === "strong") {
    this.document.font(this.styles.boldFont);
    this.renderText(item[1], ultimate);
  } else if (item[0] === "em") {
    this.document.font(this.styles.italicFont);
    this.renderText(item[1], ultimate);
  } else if (typeof item === "string") {
    this.document.font(this.styles.textFont);
    this.document.fillColor(this.styles.textColour);
    this.renderText(item, ultimate);
  } else {
    console.log("WARNING Unrecognised Item:", item);
  }
};

// Override to change the look of separators other than their properties
CVMLRenderer.prototype.renderSeparator = function(label) {
    this.document.rect( 140
                      , this.document.y - 5
                      , 580
                      , this.styles.separatorThickness);
    this.document.fill(this.styles.separatorColour);
    this.document.moveDown();
};

// Override if you want to change the appearance (not the layout) of labels
CVMLRenderer.prototype.renderLabel = function(label) {
  this.document.font(this.styles.textFont);
  this.document.fillColor(this.styles.labelColour);
  this.document.text( label
                    , {  width: this.styles.labelColumnWidth
                      , align: 'right' 
                      , continued: false });
};

// Nothing to override here
CVMLRenderer.prototype.renderText = function(text, continued) {
  this.document.save();
  this.document.moveUp();
  this.document.translate(this.styles.labelColumnWidth + 20, 0);
  this.document.text( text
                    , { width: this.document.page.width 
                             - this.styles.labelColumnWidth 
                             - this.styles.dimensions.margins.left 
                             - this.styles.dimensions.margins.right
                      , lineGap: this.styles.textLeading
                      , continued: continued });
  this.document.moveDown();
  this.document.restore();
};

// Override this function if you need extra whitespace after each section
CVMLRenderer.prototype.endSection = function() {};

// Override this if you want to add a signature to the end of your document
CVMLRenderer.prototype.signDocument = function() {};

// Override this function if you want a custom file naming format
CVMLRenderer.prototype.getFilename = function() {
  return "output/" + this.data.metadata.name.replace(/ /gi, "_")+'_CV.pdf'
};

// Nothing to override here
CVMLRenderer.prototype.producePDF = function() {
  this.renderTitle();
  this.processDataTree();
  this.signDocument();
  this.document.write(this.getFilename());
};

  

// Exports ////////////////////////////////////////////////////////////////////

module.exports = CVMLRenderer;


