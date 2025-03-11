import axios from 'axios';
import * as vscode from 'vscode';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate'; // Standard Ollama API endpoint

// Function to fetch completions from Ollama
export async function fetchCompletionsFromOllama(document: vscode.TextDocument, position: vscode.Position) {
    const text = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const completion = await completeCode(text); // Use the new completeCode function
    return completion.split('\n88').map((line: string) => {
        const item = new vscode.CompletionItem(line.trim(), vscode.CompletionItemKind.Text);
        item.insertText = line.trim();
        return item;
    });
}

export async function fetchExplanationFromOllama(code: string, webview: vscode.Webview | null, model: string = 'qwen2.5-coder:0.5b'): Promise<string> {
    try {
        const response = await axios.post(OLLAMA_API_URL, {
            model: model,
            prompt: `Please explain the following code in detail:\n\n${code}\n\nExplanation:`,
            stream: true
        }, {
            responseType: 'stream'
        });

        let explanation = '';
        response.data.on('data', (chunk: Buffer) => {
            const text = chunk.toString();
            try {
                const json = JSON.parse(text);
                if (json.response) {
                    explanation += json.response;
                    if (webview) {
                        webview.postMessage({ type: 'explanation', text: explanation });
                    }
                }
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        });

        return new Promise((resolve, reject) => {
            response.data.on('end', () => resolve(explanation));
            response.data.on('error', reject);
        });
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Server responded with a non-2xx status code
            console.error(`Ollama API error: ${error.response.status} - ${safeStringify(error.response.data)}`);
            return `Error explaining code: ${error.response.status} - ${safeStringify(error.response.data)}`;
        } else if (axios.isAxiosError(error) && error.request) {
            // No response received
            console.error('No response received from Ollama API. Is Ollama running?');
            return 'Error: No response received from Ollama. Please make sure Ollama is running on your system.';
        } else if (error instanceof Error) {
            // Other errors
            console.error(`Error explaining code: ${error.message}`);
            return `Error explaining code: ${error.message}`;
        } else {
            console.error('An unknown error occurred.');
            return 'An unknown error occurred.';
        }
    }
}

export async function fetchChatResponseFromOllama(message: string, model: string = 'qwen2.5-coder:0.5b'): Promise<string> {
    try {
        const requestPayload = {
            model: model,
            prompt: `User: ${message}\nAssistant:`,
            stream: true
        };

        // Log outbound request
        console.log('OUTBOUND CHAT API REQUEST:');
        console.log('URL:', OLLAMA_API_URL);
        console.log('Headers:', {
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://vscode-extension'
        });
        console.log('Payload:', JSON.stringify(requestPayload, null, 2));

        const response = await axios.post(OLLAMA_API_URL, requestPayload, {
            headers: {
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://vscode-extension'
            },
            responseType: 'stream'
        });

        let chatResponse = '';
        response.data.on('data', (chunk: Buffer) => {
            const text = chunk.toString();
            try {
                const json = JSON.parse(text);
                if (json.response) {
                    chatResponse += json.response;
                }
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        });

        return new Promise((resolve, reject) => {
            response.data.on('end', () => {
                // Log inbound response
                console.log('INBOUND CHAT API RESPONSE:');
                console.log('Response:', chatResponse);
                resolve(chatResponse);
            });
            response.data.on('error', reject);
        });
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Server responded with a non-2xx status code
            console.error(`Ollama API error: ${error.response.status} - ${safeStringify(error.response.data)}`);
            return `Error with chat: ${error.response.status} - ${safeStringify(error.response.data)}`;
        } else if (axios.isAxiosError(error) && error.request) {
            // No response received
            console.error('No response received from Ollama API. Is Ollama running?');
            return 'Error: No response received from Ollama. Please make sure Ollama is running on your system.';
        } else if (error instanceof Error) {
            // Other errors
            console.error(`Error with chat: ${error.message}`);
            return `Error with chat: ${error.message}`;
        } else {
            console.error('An unknown error occurred.');
            return 'An unknown error occurred.';
        }
    }
}

export async function completeCode(code: string, model: string = 'qwen2.5-coder:1.5b'): Promise<string> {
    try {
        const requestPayload = {
            model: model,
            prompt: `Respond ONLY with the missing part:\n\n${code}\n\nCompletion:`,
            stream: true,
            suffix: "return result"
        };

        // Log outbound request
        console.log('OUTBOUND API REQUEST:');
        console.log('URL:', OLLAMA_API_URL);
        console.log('Headers:', {
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://vscode-extension'
        });
        console.log('Payload:', JSON.stringify(requestPayload, null, 2));

        const response = await axios.post(OLLAMA_API_URL, requestPayload, {
            headers: {
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://vscode-extension'
            },
            responseType: 'stream'
        });

        let completion = '';
        response.data.on('data', (chunk: Buffer) => {
            const text = chunk.toString();
            try {
                const json = JSON.parse(text);
                if (json.response) {
                    completion += json.response;
                }
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        });

        return new Promise((resolve, reject) => {
            response.data.on('end', () => {
                // Log inbound response
                console.log('INBOUND API RESPONSE:');
                console.log('Completion - Inline:', completion);
                resolve(completion);
            });
            response.data.on('error', reject);
        });
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Server responded with a non-2xx status code
            console.error(`Ollama API error: ${error.response.status} - ${safeStringify(error.response.data)}`);
            return `Error completing code: ${error.response.status} - ${safeStringify(error.response.data)}`;
        } else if (axios.isAxiosError(error) && error.request) {
            // No response received
            console.error('No response received from Ollama API. Is Ollama running?');
            return 'Error: No response received from Ollama. Please make sure Ollama is running on your system.';
        } else if (error instanceof Error) {
            // Other errors
            console.error(`Error completing code: ${error.message}`);
            return `Error completing code: ${error.message}`;
        } else {
            console.error('An unknown error occurred.');
            return 'An unknown error occurred.';
        }
    }
}

function safeStringify(obj: any): string {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    });
}