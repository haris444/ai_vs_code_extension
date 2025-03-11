import * as vscode from 'vscode';
import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = '';

// Create a persistent chat history store
interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

// Maintain a global chat history
let chatHistory: ChatMessage[] = [
    { role: "system", content: "You are a helpful coding assistant." }
];

// Function to reset chat history
export function resetChatHistory(): void {
    chatHistory = [
        { role: "system", content: "You are a helpful coding assistant." }
    ];
}

// Helper function to log API requests without exposing API key
function logApiRequest(url: string, payload: any): void {
    console.log('OUTBOUND API REQUEST:');
    console.log('URL:', url);
    console.log('Headers:', { 
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vscode-extension',
        'Authorization': 'Bearer sk-***' // Masked for security
    });
    console.log('Payload:', JSON.stringify(payload, null, 2));
}

// Helper function to log API responses
function logApiResponse(response: any): void {
    console.log('INBOUND API RESPONSE:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
}

// Function to fetch completions from OpenRouter (completions don't need chat history)
export async function fetchCompletionsFromOpenRouter(document: vscode.TextDocument, position: vscode.Position) {
    try {
        const text = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        
        // Create request payload - completions are independent from chat history
        const requestPayload = {
            messages: [
                { role: "system", content: "You are a helpful Python coding assistant." },
                { role: "user", content: `Complete this Python code by providing only the code missing to finish the last line: ${text}` }
            ],
            model: "qwen/qwen2.5-vl-72b-instruct:free", // Free model
            max_tokens: 50
        };
        
        logApiRequest(OPENROUTER_API_URL, requestPayload);
        
        const response = await axios.post(OPENROUTER_API_URL, requestPayload, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://vscode-extension', // Recommended by OpenRouter
            },
        });
        
        logApiResponse(response);

        // Check if the expected structure exists
        if (response.data.choices && response.data.choices.length > 0) {
            const suggestions = response.data.choices[0].message.content.split('\n');
            
            return suggestions.map((suggestion: string) => {
                const item = new vscode.CompletionItem(suggestion.trim(), vscode.CompletionItemKind.Text);
                item.insertText = suggestion.trim();
                return item;
            });
        }
        
        return [];
    } catch (error) {
        console.error('ERROR CALLING OPENROUTER API:');
        
        if (axios.isAxiosError(error) && error.response) {
            // Server responded with a non-2xx status code
            console.error(`OpenRouter API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            return [];
        } else if (axios.isAxiosError(error) && error.request) {
            // No response received
            console.error('No response received from OpenRouter API. Is OpenRouter running?');
            return [];
        } else if (error instanceof Error) {
            // Other errors
            console.error(`Error fetching completions: ${error.message}`);
            return [];
        } else {
            console.error('An unknown error occurred.');
            return [];
        }
    }
}

export async function fetchExplanationFromOpenRouter(code: string, webview: vscode.Webview | null): Promise<string> {
    try {
        // Add user message to history
        const userMessage = `Please explain the following code in detail:\n\n${code}\n\nExplanation:`;
        chatHistory.push({ role: "user", content: userMessage });
        
        // Create request payload with full chat history
        const requestPayload = {
            messages: [...chatHistory],
            model: "qwen/qwen2.5-vl-72b-instruct:free", // Free model
            max_tokens: 150
        };

        logApiRequest(OPENROUTER_API_URL, requestPayload);

        const response = await axios.post(OPENROUTER_API_URL, requestPayload, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://vscode-extension'
            }
        });

        logApiResponse(response);

        if (response.data.choices && response.data.choices.length > 0) {
            const assistantResponse = response.data.choices[0].message.content;
            
            // Add assistant response to history
            chatHistory.push({ role: "assistant", content: assistantResponse });
            
            return assistantResponse;
        }

        return 'No explanation available.';
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Server responded with a non-2xx status code
            console.error(`OpenRouter API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            return `Error explaining code: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        } else if (axios.isAxiosError(error) && error.request) {
            // No response received
            console.error('No response received from OpenRouter API. Is OpenRouter running?');
            return 'Error: No response received from OpenRouter. Please make sure OpenRouter is running on your system.';
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

export async function fetchChatResponseFromOpenRouter(message: string): Promise<string> {
    try {
        // Add user message to history
        chatHistory.push({ role: "user", content: message });
        
        // Create request payload with full chat history
        const requestPayload = {
            messages: [...chatHistory],
            model: "qwen/qwen2.5-vl-72b-instruct:free", // Free model
            max_tokens: 150
        };

        logApiRequest(OPENROUTER_API_URL, requestPayload);

        const response = await axios.post(OPENROUTER_API_URL, requestPayload, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://vscode-extension'
            }
        });

        logApiResponse(response);

        if (response.data.choices && response.data.choices.length > 0) {
            const assistantResponse = response.data.choices[0].message.content;
            
            // Add assistant response to history
            chatHistory.push({ role: "assistant", content: assistantResponse });
            
            return assistantResponse;
        }

        return 'No response available.';
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Server responded with a non-2xx status code
            console.error(`OpenRouter API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            return `Error with chat: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        } else if (axios.isAxiosError(error) && error.request) {
            // No response received
            console.error('No response received from OpenRouter API. Is OpenRouter running?');
            return 'Error: No response received from OpenRouter. Please try again later.';
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

// Function to get the current chat history (for debugging or display purposes)
export function getChatHistory(): ChatMessage[] {
    return [...chatHistory];
}

// Function to add a system message to the chat history
export function addSystemMessage(content: string): void {
    chatHistory.push({ role: "system", content });
}
