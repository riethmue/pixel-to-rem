import * as vscode from "vscode";
let decorators: vscode.TextEditorDecorationType[] = [];
export function activate(context: vscode.ExtensionContext) {
  // Clean up any existing decorators
  decorators.forEach((decorator) => decorator.dispose());
  decorators = [];

  // Create a decorator type that we will use to decorate the text
  const decorator = vscode.window.createTextEditorDecorationType({
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

  // Create an array of decorations that we will apply to the text editor
  const decorations: vscode.DecorationOptions[] = [];

  // Use a single regular expression with character classes to match all three CSS unit types
  const unitRegex = /(?>([\d.]+)(rem|em|px))++/g;
  let match;
  while ((match = unitRegex.exec(text))) {
    const start = editor.document.positionAt(match.index);
    const end = editor.document.positionAt(match.index + match[0].length);
    const value = parseFloat(match[1]);
    let pixels;
    if (match[2] === "rem") {
      pixels = value * 16;
    } else if (match[2] === "em") {
      pixels = value * 16;
    } else {
      pixels = value;
    }
    decorations.push({
      range: new vscode.Range(start, end),
      renderOptions: {
        after: {
          contentText: `(${pixels}px)`,
        },
      },
    });
  }

  // Apply the decorations to the text editor
  editor.setDecorations(decorator, decorations);

  // Add the decorator to the list of decorators that need to be disposed when the extension is deactivated
  decorators.push(decorator);
}
