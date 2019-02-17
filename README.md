pandoc-format README
====================

This extensions uses [Pandoc] to format Markdown source code. It
supports the standard *Format Document* and *Format Selection* actions.

Features
--------

The palette command *Pandoc: Format Document or Selection* is provided.
If multiple formatters are registered for Markdown documents, this
command can be used to invoke this specific formatter.

Requirements
------------

This extension requires at least [Pandoc] version 2.0 to be installed.

Extension Settings
------------------

This extension contributes the following settings:

-   `pandoc-format.enable`: enable/disable this extension (default:
    `true`)
-   `pandoc-format.command`: set the path to the `pandoc` executable
    including command line arguments (default: `pandoc`)

Extension Command
-----------------

This extension contributes the following command:

-   `pandoc-format.format`: Pandoc: Format Document or Selection

  [Pandoc]: http://pandoc.org
