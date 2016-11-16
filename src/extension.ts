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
    const commandline = config.get('command', '/usr/local/bin/pandoc');
    const args = commandline.split(' ');

    this.command = args[0];
    this.arguments = args.slice(1);
  }

  formatPandoc(text: string) {
    let result =
        child_process.spawnSync(this.command, this.arguments, {'input': text});
    if (!result.status) {
      return result.stdout.toString();
    } else {
      vscode.window.showErrorMessage(result.stderr.toString());
      return text;
    }
  }

  provideDocumentFormattingEdits(
      document: vscode.TextDocument, options: vscode.FormattingOptions,
      token: vscode.CancellationToken):
      vscode.TextEdit[]|Thenable<vscode.TextEdit[]> {
    let formatted = this.formatPandoc(document.getText());
    if (formatted != '')
      return [vscode.TextEdit.replace(
          /* TODO Find Range equivalent for [0, infinity] */
          new vscode.Range(0, 0, 1000, 1000), formatted)];
    else
      return [];
  }

  provideDocumentRangeFormattingEdits(
      document: vscode.TextDocument, range: vscode.Range,
      options: vscode.FormattingOptions, token: vscode.CancellationToken):
      vscode.TextEdit[]|Thenable<vscode.TextEdit[]> {
    let formatted = this.formatPandoc(document.getText(range));
    if (formatted != '')
      return [vscode.TextEdit.replace(range, formatted)];
    else
      return [];
  }
}

export function activate(context: vscode.ExtensionContext) {
  vscode.languages.registerDocumentFormattingEditProvider(
      'markdown', new PandocFormatEditsProvider);
  vscode.languages.registerDocumentRangeFormattingEditProvider(
      'markdown', new PandocFormatEditsProvider);
}

export function deactivate() {}