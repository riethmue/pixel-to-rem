import * as vscode from "vscode";
let decorators: vscode.TextEditorDecorationType[] = [];
let isActivating = false;
export async function activate(context: vscode.ExtensionContext) {
  let disposableSave = vscode.workspace.onDidSaveTextDocument(
    async (textDocument) => createDisposable()
  );

  let disposableOpen = vscode.workspace.onDidOpenTextDocument(
    async (textDocument) => createDisposable()
  );

  context.subscriptions.push(disposableSave);
  context.subscriptions.push(disposableOpen);
}

function createDisposable() {
  // Clean up any existing decorators
  decorators.forEach((decorator) => decorator.dispose());
  decorators = [];
  if (isActivating) {
    return;
  }
  isActivating = true;

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
    decorations.push(...getCSSDecorations(editor));
  } else if (editor.document.languageId === "html") {
    decorations.push(...getHTMLDecorations(editor));
  }

  applyDecorations(editor, decorations);

  isActivating = false;
}

function applyDecorations(
  editor: vscode.TextEditor,
  decorations: vscode.DecorationOptions[]
) {
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

  // Add the decorations to the active text editor
  editor.setDecorations(decorator, decorations);

  // Save the decorator for later disposal
  decorators.push(decorator);
}

function getCSSDecorations(
  editor: vscode.TextEditor
): vscode.DecorationOptions[] {
  const text = editor.document.getText();
  const decorations: vscode.DecorationOptions[] = [];

  // Combine the regexes into a single regex
  const unitsRegex = /(\d*\.?\d+)rem|(\d*\.?\d+)em|(\d*\.?\d+)px/g;

  // Find all instances of units in the text
  let match;
  while ((match = unitsRegex.exec(text))) {
    // Extract the value and unit of the matched string
    const value = match[1] || match[2] || match[3];
    const unit = match[1] ? "rem" : match[2] ? "em" : "px";

    // Calculate the equivalent pixel value
    let converted;
    let result = "";
    if (unit === "rem" || unit === "em") {
      converted = Math.round(parseFloat(value) * 16 * 100) / 100;
      result = `(${converted}px)`;
    } else if (unit === "px") {
      converted = Math.round((parseFloat(value) / 16) * 100) / 100;
      result = `(${converted}rem)`;
    }

    // Add a decoration for the matched string
    const start = editor.document.positionAt(match.index);
    const end = editor.document.positionAt(match.index + match[0].length);
    decorations.push({
      range: new vscode.Range(start, end),
      renderOptions: {
        after: {
          contentText: result,
        },
      },
    });
  }

  return decorations;
}

function getHTMLDecorations(
  editor: vscode.TextEditor
): vscode.DecorationOptions[] {
  const text = editor.document.getText();
  const decorations: vscode.DecorationOptions[] = [];

  let match;
  const tailwindRegex = /(m|mt|ml|mr|mb|p|pl|pr|pb|pl|pt|px|px|py)-\d*\.?\d+/g;
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
          contentText: `(${pixels}px)`,
        },
      },
    });
  }

  return decorations;
}

export function deactivate() {}
