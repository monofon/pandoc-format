'use strict';

import * as vscode from 'vscode';
import * as child_process from 'child_process';

class PandocFormatEditsProvider implements
  vscode.DocumentFormattingEditProvider,
  vscode.DocumentRangeFormattingEditProvider {
  command: string;
  arguments: Array<string>;

  constructor() {
    const config = vscode.workspace.getConfiguration('pandocFormat');
    const commandline = config.get('command', 'pandoc');
    const args = commandline.split(' ');

    this.command = args[0];
    this.arguments = args.slice(1);

    console.log(args);
  }

  formatPandoc(text: string) {
    let result =
      child_process.spawnSync(this.command, this.arguments, { 'input': text });
    console.log("formatting ...");
    if (!result.status) {
      console.log("... successfull.");
      return result.stdout.toString();
    } else {
      console.log("... failed!");
      vscode.window.showErrorMessage(result.stderr.toString());
      return text;
    }
  }

  provideDocumentFormattingEdits(
    document: vscode.TextDocument, options: vscode.FormattingOptions,
    token: vscode.CancellationToken):
    vscode.TextEdit[] | Thenable<vscode.TextEdit[]> {
    console.log("About to format:");
    let formatted = this.formatPandoc(document.getText());
    if (formatted != '') {
      console.log("formatting returned result.");
      return [vscode.TextEdit.replace(
        document.validateRange(new vscode.Range(0, 0, Infinity, Infinity)), formatted)];
    }
    else {
      console.log("formatting result empty!");
      return [];
    }
  }

  provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument, range: vscode.Range,
    options: vscode.FormattingOptions, token: vscode.CancellationToken):
    vscode.TextEdit[] | Thenable<vscode.TextEdit[]> {
    let formatted = this.formatPandoc(document.getText(range));
    if (formatted != '')
      return [vscode.TextEdit.replace(range, formatted)];
    else
      return [];
  }
}

export function activate(context: vscode.ExtensionContext) {
  // TODO Check for pandoc executable and version
  vscode.languages.registerDocumentFormattingEditProvider(
    'markdown', new PandocFormatEditsProvider);
  vscode.languages.registerDocumentRangeFormattingEditProvider(
    'markdown', new PandocFormatEditsProvider);
}

export function deactivate() { }