# CVML : Curriculum Vitae Markup Language

The aim of this project is to replace the need for expensive and cumbersome desktop publishing applications for when you just want to make that quick change to your CV before sending it off one more time.

_CVML_ is a markup language for the _pdfkit_ module, but can also be rendered as HTML (and styled via CSS) if need be.


### FAQ

- Do you really think YOUR (two column, borderless) CV layout is the ultimate layout there is?
  
        No, I don't. There will be means of creating your own layout if you wish. This project was started primarily out of a need that I have discovered for myself, which explains why things look a certain why, but doesn't mean that I wasn't open for suggestions.

- Is this really necessary? Why not just use plain / _markdown_ flavour XY instead?

        Markdown alone simply doesn't cut it for me. One feature of _CVML_ is denoting how important a row of information is, which then can be addressed in the stylesheet. Littering markdown with unnecesary HTML fragments to add classes to elements isn't intuitive enough. Besides, every text node in _CVML_ will be interpreted as _markdown_ anyway, I'm not reinventing the wheel here.

### Syntax

    ---
    name: Florian Brueckner
    title: Curriculum Vitae - Florian Brueckner
    cssPath: bloomingbridges.css
    --- <-- YAML metadata

        # Curriculum Vitae <-- Plain markdown heading

    === Personal Details <-- Start a new section

     -- Name <-- Important row
        Edgar Exampleson

      - Born <-- Standard row
        05.05.2000, Examplestad (Sweden)

      = = <-- Separator

      - Email
        [e.ex@example.com](mailto:e.ex@example)



### (Envisioned) Usage

    $ cvml file.cvml [options]

    -t [template]  Give name or path to template file
    -v             Verbose Mode

    --html         Produces a HTML preview (default)
    --pdf          Produces a PDF file instead