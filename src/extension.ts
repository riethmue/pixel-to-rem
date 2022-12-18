import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // Create a decorator type that we will use to decorate the text
  const decoratorType = vscode.window.createTextEditorDecorationType({
    after: {
      margin: "0 0 0 2ch",
      color: "#575757",
      backgroundColor: "#3033337f",
      contentText: "$1",
      fontStyle: "italic",
    },
  });

  // Get the active text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  // Get the document text
  const text = editor.document.getText();

  // Use a regular expression to find all instances of `rem` and `em` units in the text
  const remRegex = /(\d*\.?\d+)rem/g;
  const emRegex = /(\d*\.?\d+)em/g;
  const pxRegex = /(\d*\.?\d+)px/g;

  // Create an array of decorations that we will apply to the text editor
  const decorations: vscode.DecorationOptions[] = [];

  // Find all instances of `rem` units in the text and calculate the equivalent pixel value
  let match;
  while ((match = remRegex.exec(text))) {
    const start = editor.document.positionAt(match.index);
    const end = editor.document.positionAt(match.index + match[0].length);
    const pixels = parseFloat(match[1]) * 16;
    decorations.push({
      range: new vscode.Range(start, end),
      renderOptions: {
        after: {
          contentText: `(${pixels}px)`,
        },
      },
    });
  }

  // Find all instances of `em` units in the text and calculate the equivalent pixel value
  while ((match = emRegex.exec(text))) {
    const start = editor.document.positionAt(match.index);
    const end = editor.document.positionAt(match.index + match[0].length);
    const pixels = parseFloat(match[1]) / 16;
    decorations.push({
      range: new vscode.Range(start, end),
      renderOptions: {
        after: {
          contentText: `(${pixels}px)`,
        },
      },
    });
  }

  // Find all instances of `px` units in the text and calculate the equivalent pixel value
  while ((match = pxRegex.exec(text))) {
    const start = editor.document.positionAt(match.index);
    const end = editor.document.positionAt(match.index + match[0].length);
    const rem = parseFloat(match[1]) * 16;
    const em = parseFloat(match[1]) * 16;
    decorations.push({
      range: new vscode.Range(start, end),
      renderOptions: {
        after: {
          contentText: `(${rem}rem)`,
        },
      },
    });
  }

  // Apply the decorations to the text editor
  editor.setDecorations(decoratorType, decorations);
}

export function deactivate() {}
