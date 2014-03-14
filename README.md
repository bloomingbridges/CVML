# CVML
**Curriculum Vitae Markup Language**

The aim of this project is to replace the need for expensive and cumbersome desktop publishing applications for when you just want to make that quick change to your CV before sending it off one more time.

_CVML_ is a markup language for the [pdfkit](http://pdfkit.org) module, but can also be rendered as _HTML_ (and styled via _CSS_) if need be.


### FAQ

- Do you really think YOUR (two column) CV layout is the ultimate layout there is?
  
    No, I don't. There will be means of creating your own layout if you wish. This project was started primarily out of a need that I have discovered for myself, which explains why things look a certain way, but doesn't mean I wasn't open for suggestions.

- Is this really necessary? Why not just use plain / _markdown_ flavour XY instead?

    Markdown alone simply doesn't cut it for me. One feature of _CVML_ is denoting how important a row of information is, which then can be addressed in the stylesheet. Littering markdown with unnecesary _HTML_ fragments to add classes to elements isn't intuitive enough. Besides, every text node in _CVML_ will be interpreted as _markdown_ anyway, I'm not reinventing the wheel here.

### Syntax

    ---
    name: Edgar Exampleson
    title: Curriculum Vitae - Edgar Exampleson
    cssPath: default.css
    --- <-- YAML metadata

    === Personal Details <-- Start a new section

     -- Name <-- Important row
        Edgar Exampleson

      - Born <-- Standard row
        05.05.2000, Examplestad (Sweden)

      = = <-- Separator

      - Email
        [e.ex@example.com](mailto:e.ex@example.com) <-- markdown link

      . . <-- Denotes a Page Break (PDF only)

Preview output using default template:

![Example output](http://drop.lostwith.us/preview/cvml_example_output.png)

### (Envisioned) Usage

    $ node cvml.js [options] <myfilename.cvml>

    -h, --help                 output usage information
    -v, --verbose              Enable "Verbose Output"
    -t, --template [template]  Define a HTML template other than the default one

    -p, --pdf                  Produces a PDF (default)
    -w, --html                 Produces a HTML document instead

### TODO

- Finalise _CVML_ syntax and features
- Fix parsing / display of inline formatting (WTF bold text?)
- Write tutorial on how to extend the default PDF renderer in order to make your custom layout
- Package everything up in a nice little NPM module and make it work from everywhere
- (Add a print stylesheet to the HTML example)
- (Clean up after myself..)
