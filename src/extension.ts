"use strict";

import * as vscode from "vscode";
import * as child_process from "child_process";

class PandocFormatEditsProvider
  implements
    vscode.DocumentFormattingEditProvider,
    vscode.DocumentRangeFormattingEditProvider {
  pandocAvailable: boolean = false;
  enable: boolean = true;
  command: string = "pandoc";
  arguments: Array<string> = [];

  constructor() {
    this.configure();
  }

  configure() {
    const config = vscode.workspace.getConfiguration("pandoc-format");
    let args = config.get("command", "pandoc").split(" ");

    this.enable = config.get("enable", true);
    this.command = args[0];
    this.arguments = args.slice(1);

    if (this.enable) {
      let result = child_process.spawnSync(this.command, ["--version"], {
        shell: true
      });
      if (!result.error) {
        this.pandocAvailable = true;

        console.log("pandoc-format: using executable: " + this.command);
      } else {
        this.pandocAvailable = false;
        this.catchExecError(result.error);
      }
    }
  }

  formatPandoc(text: string) {
    let result = child_process.spawnSync(this.command, this.arguments, {
      input: text,
      shell: true
    });

    if (result.error) {
      this.catchExecError(result.error);
      return "";
    }

    if (!result.status) {
      return result.stdout.toString();
    } else {
      vscode.window.showWarningMessage(result.stderr.toString().split("\n")[0]);
      return "";
    }
  }

  provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.TextEdit[] | Thenable<vscode.TextEdit[]> {
    let formatted = this.formatPandoc(document.getText());
    if (formatted != "") {
      let range = document.validateRange(
        new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE)
      );
      return [vscode.TextEdit.replace(range, formatted)];
    } else {
      return [];
    }
  }

  provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): vscode.TextEdit[] | Thenable<vscode.TextEdit[]> {
    let formatted = this.formatPandoc(document.getText(range));
    if (formatted !== "") {
      return [vscode.TextEdit.replace(range, formatted)];
    } else {
      return [];
    }
  }

  catchExecError(error: NodeJS.ErrnoException) {
    let message = error.message;
    if (error.code === "ENOENT") {
      message = `pandoc-format: Could not execute ${
        this.command
      }. Try specifying the pandoc-format.command setting?`;
    }
    vscode.window.showErrorMessage(message);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("pandoc-format: active!");
  let pandocFormatProvider = new PandocFormatEditsProvider();

  if (pandocFormatProvider.pandocAvailable) {
    vscode.languages.registerDocumentFormattingEditProvider(
      "markdown",
      pandocFormatProvider
    );
    console.log("pandoc-format: registered document formatting provider");

    vscode.languages.registerDocumentRangeFormattingEditProvider(
      "markdown",
      pandocFormatProvider
    );
    console.log("pandoc-format: registered selection formatting provider");

    vscode.commands.registerTextEditorCommand(
      "pandoc-format.format",
      (
        textEditor: vscode.TextEditor,
        edit: vscode.TextEditorEdit,
        args: any[]
      ) => {
        let range = textEditor.selection.with();
        if (range.isEmpty) {
          range = textEditor.document.validateRange(
            new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE)
          );
        }
        let formatted = pandocFormatProvider.formatPandoc(
          textEditor.document.getText(range)
        );
        if (formatted !== "") {
          edit.replace(range, formatted);
        }
      }
    );
    console.log("pandoc-format: registered palette command");
  }
}

export function deactivate() {}
