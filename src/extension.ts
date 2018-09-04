import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  const ideaDiffDirectories = vscode.commands.registerCommand('ssenkit.ideaDiffDirectories', (main: vscode.Uri, selected: vscode.Uri[]) => {
    new Promise<[vscode.Uri, vscode.Uri]>((resolve, reject) => {
      if (!selected || selected.length === 0) {
        vscode.window.showOpenDialog({
          openLabel: 'Select first directory to compare',
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false
        }).then(uri1 => {
          if (uri1) {
            vscode.window.showOpenDialog({
              openLabel: 'Select second directory to compare',
              canSelectFiles: false,
              canSelectFolders: true,
              canSelectMany: false
            }).then(uri2 => {
              if (uri2) {
                resolve([uri1[0], uri2[0]]);
              } else {
                reject(new Error('Failed folder open'));
              }
            });
          } else {
            reject(new Error('Failed folder open'));
          }
        });
      } else if (selected.length === 1) {
        vscode.window.showOpenDialog({
          openLabel: 'Select second directory to compare',
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false
        }).then(uri => {
          if (uri) {
            resolve([selected[0], uri[0]]);
          } else {
            reject(new Error('Failed folder open'));
          }
        });
      } else if (selected.length === 2 && selected.every(s => fs.statSync(s.fsPath).isDirectory())) {
        resolve([selected[0], selected[1]]);
      } else {
        reject(new Error('Select one or two folder'));
      }
    })
      .then(([dir1, dir2]) => {
        const term: vscode.Terminal = vscode.window.terminals.find(term => term.name === 'idea diff') || vscode.window.createTerminal('idea diff');
        term.show();
        term.sendText(`idea diff "${dir1.fsPath}" "${dir2.fsPath}"`);
      })
      .catch(err => {
        vscode.window.showInformationMessage(`idea diff failed: ${err.toString()}`);
      });
  });

  context.subscriptions.push(
    ideaDiffDirectories,
  );
}

export function deactivate() {
}
