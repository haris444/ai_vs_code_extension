import * as vscode from 'vscode';
import axios from 'axios';
import {getWebviewContent} from './ui'
import { 
    fetchCompletionsFromOllama, 
    fetchExplanationFromOllama, 
    fetchChatResponseFromOllama 
} from './ollama';
import { 
    fetchCompletionsFromOpenRouter, 
    fetchExplanationFromOpenRouter,
    fetchChatResponseFromOpenRouter
} from './openrouter';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "ai-vs-code-extension" is now active!');

    const disposable = vscode.commands.registerCommand('ai-vs-code-extension.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from AI VS Code Extension!');
    });

    context.subscriptions.push(disposable);


    // Function to fetch completions based on the selected API provider
    async function fetchCompletions(document: vscode.TextDocument, position: vscode.Position) {
        const config = vscode.workspace.getConfiguration('aiVsCodeExtension');
        const apiProvider = config.get<string>('inlineCompletionApiProvider', 'OpenRouter');

        if (apiProvider === 'Ollama') {
            return fetchCompletionsFromOllama(document, position);
        } else {
            return fetchCompletionsFromOpenRouter(document, position);
        }
    }

    // Define trigger characters
    const triggerCharacters = ['.', ',', '[', '(', '='];

    // Register the provider for specific trigger characters only
    const autoTriggerProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'python' },
        {
            async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
                // Check if we have a trigger character from context
                const isTriggerCharacter = context.triggerKind === vscode.CompletionTriggerKind.TriggerCharacter;
                
                // Only proceed if this was triggered by a character AND it's one of our specified characters
                if (!isTriggerCharacter || !context.triggerCharacter || !triggerCharacters.includes(context.triggerCharacter)) {
                    return undefined;
                }
                
                console.log(`Triggered by character: ${context.triggerCharacter}`);
                // At this point we're sure it was triggered by one of our characters
                return fetchCompletions(document, position);
            }
        },
        ...triggerCharacters
    );

    // Properly dispose both providers when needed
    context.subscriptions.push(autoTriggerProvider);

    // Function to fetch explanation based on the selected API provider
    async function fetchExplanation(code: string, webview: vscode.Webview | null): Promise<string> {
        const config = vscode.workspace.getConfiguration('aiVsCodeExtension');
        const apiProvider = config.get<string>('codeExplanationApiProvider', 'OpenRouter');

        if (apiProvider === 'Ollama') {
            return fetchExplanationFromOllama(code, webview);
        } else {
            return fetchExplanationFromOpenRouter(code, webview);
        }
    }

    // Function to fetch chat responses based on the selected API provider
    async function fetchChatResponse(message: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('aiVsCodeExtension');
        const apiProvider = config.get<string>('chatApiProvider', 'OpenRouter');

        if (apiProvider === 'Ollama') {
            return fetchChatResponseFromOllama(message);
        } else {
            return fetchChatResponseFromOpenRouter(message);
        }
    }

    // Register the "explain my code" command
    const explainCodeDisposable = vscode.commands.registerCommand('ai-vs-code-extension.explainCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            if (text) {
                const panel = vscode.window.createWebviewPanel(
                    'explainCode',
                    'Explain Code',
                    vscode.ViewColumn.Beside,
                    { enableScripts: true }
                );

                panel.webview.html = getWebviewContent();

                const explanation = await fetchExplanation(text, panel.webview);
                panel.webview.postMessage({ type: 'explanation', text: explanation });

                // Handle chat messages
                panel.webview.onDidReceiveMessage(async message => {
                    if (message.type === 'chatMessage') {
                        const response = await fetchChatResponse(message.text);
                        panel.webview.postMessage({ type: 'chatMessage', text: response });
                    }
                });
            } else {
                vscode.window.showInformationMessage('Please select some code to explain.');
            }
        }
    });

    context.subscriptions.push(explainCodeDisposable);
}

export function deactivate() {}
