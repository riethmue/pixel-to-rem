import * as vscode from "vscode";
let decorators: vscode.TextEditorDecorationType[] = [];
let isActivating = false;
export async function activate(context: vscode.ExtensionContext) {
  // Clean up any existing decorators
  decorators.forEach((decorator) => decorator.dispose());
  decorators = [];

  let disposable = vscode.workspace.onDidSaveTextDocument(
    async (textDocument) => {
      if (isActivating) {
        return;
      }
      if (
        textDocument.languageId === "css" ||
        textDocument.languageId === "scss" ||
        textDocument.languageId === "html"
      ) {
        isActivating = true;
        await activate(context);
        isActivating = false;
      }
    }
  );

  // Dispose the event listener when your extension is deactivated
  context.subscriptions.push(disposable);

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

  if (
    editor.document.languageId === "css" ||
    editor.document.languageId === "scss"
  ) {
    const remRegex = /(\d*\.?\d+)rem/g;
    const emRegex = /(\d*\.?\d+)em/g;
    const pxRegex = /(\d*\.?\d+)px/g;
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
  } else if (editor.document.languageId === "html") {
    let match;
    const tailwindRegex =
      /(m|mt|ml|mr|mb|p|pl|pr|pb|pl|pt|px|px|py)-\d*\.?\d+/g;
    // Find all instances of `px` units in the text and calculate the equivalent pixel value
    while ((match = tailwindRegex.exec(text))) {
      const start = editor.document.positionAt(match.index);
      const end = editor.document.positionAt(match.index + match[0].length);
      const num = match[0].split("-")[1];
      const rem = num * 0.25;
      const pixels = rem * 16;
      decorations.push({
        range: new vscode.Range(start, end),
        renderOptions: {
          after: {
            contentText: `(${rem}rem ${pixels}px)`,
          },
        },
      });
    }
  }

  // Save decorator for cleanup
  decorators.push(decorator);
  // Apply the decorations to the text editor
  editor.setDecorations(decorator, decorations);
}

export function deactivate() {}
