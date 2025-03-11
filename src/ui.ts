export function getWebviewContent(): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Insights</title>
            <style>
                :root {
                    --vscode-bg: #1e1e1e;
                    --vscode-fg: #d4d4d4;
                    --vscode-border: #444444;
                    --vscode-primary: #0e639c;
                    --vscode-primary-hover: #1177bb;
                    --vscode-active: #007acc;
                    --vscode-input-bg: #3c3c3c;
                    --vscode-hover: #264f78;
                    --vscode-header-bg: #252526;
                    --user-msg-bg: #2d3748;
                    --assistant-msg-bg: #1a365d;
                    --code-bg: #1e1e1e;
                    --code-fg: #f8f8f2;
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    background-color: var(--vscode-bg);
                    color: var(--vscode-fg);
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }
                
                header {
                    background-color: var(--vscode-header-bg);
                    padding: 0.8rem 1.2rem;
                    border-bottom: 1px solid var(--vscode-border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                h1 {
                    font-size: 1.2rem;
                    font-weight: 500;
                    margin: 0;
                }

                .tabs {
                    display: flex;
                    margin-top: 0.5rem;
                }

                .tab {
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    font-weight: 500;
                }

                .tab.active {
                    border-bottom: 2px solid var(--vscode-active);
                    color: var(--vscode-active);
                }
                
                main {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    overflow: hidden;
                    padding: 0;
                }
                
                #explanation-container {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    overflow: hidden;
                }
                
                #explanation {
                    flex: 1;
                    padding: 1.5rem;
                    overflow-y: auto;
                    background-color: var(--vscode-bg);
                    line-height: 1.6;
                    font-size: 0.95rem;
                    white-space: pre-wrap;
                }
                
                pre {
                    background-color: var(--code-bg);
                    border-radius: 4px;
                    padding: 1rem;
                    overflow-x: auto;
                    margin: 1rem 0;
                    border: 1px solid var(--vscode-border);
                }
                
                code {
                    font-family: 'Fira Code', Menlo, Monaco, 'Courier New', monospace;
                    color: var(--code-fg);
                    font-size: 0.9rem;
                }
                
                #chat-container {
                    display: flex;
                    flex-direction: column;
                    flex: 1; /* Changed from height: 40% to flex: 1 to take up available space */
                    border-top: 1px solid var(--vscode-border);
                    overflow: hidden; /* Added to contain scrollable content */
                }
                
                #chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    background-color: var(--vscode-header-bg);
                    border-bottom: 1px solid var(--vscode-border);
                }
                
                #chat-title {
                    font-weight: 500;
                    font-size: 0.9rem;
                }
                
                #chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .message {
                    display: flex;
                    flex-direction: column;
                    max-width: 90%;
                    padding: 0.8rem 1rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    animation: fadeIn 0.3s ease;
                }
                
                .message.user {
                    background-color: var(--user-msg-bg);
                    align-self: flex-end;
                    border-bottom-right-radius: 2px;
                }
                
                .message.assistant {
                    background-color: var(--assistant-msg-bg);
                    align-self: flex-start;
                    border-bottom-left-radius: 2px;
                }
                
                .message-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.4rem;
                    font-size: 0.8rem;
                    opacity: 0.7;
                }
                
                .message-content {
                    word-break: break-word;
                }
                
                #chat-input-container {
                    display: flex;
                    padding: 1rem;
                    background-color: var(--vscode-header-bg);
                    border-top: 1px solid var(--vscode-border);
                }
                
                #message {
                    flex: 1;
                    padding: 0.8rem 1rem;
                    border: 1px solid var(--vscode-border);
                    border-radius: 4px;
                    background-color: var(--vscode-input-bg);
                    color: var(--vscode-fg);
                    font-size: 0.9rem;
                    transition: border-color 0.2s ease;
                }
                
                #message:focus {
                    outline: none;
                    border-color: var(--vscode-active);
                }
                
                #send {
                    margin-left: 0.5rem;
                    padding: 0.8rem 1.2rem;
                    background-color: var(--vscode-active);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                #send:hover {
                    background-color: var(--vscode-primary-hover);
                }
                
                #send:active {
                    transform: translateY(1px);
                }
                
                #send:disabled {
                    background-color: var(--vscode-border);
                    cursor: not-allowed;
                }
                
                .typing-indicator {
                    display: flex;
                    align-items: center;
                    margin-top: 0.5rem;
                }
                
                .typing-dot {
                    width: 8px;
                    height: 8px;
                    background-color: var(--vscode-fg);
                    border-radius: 50%;
                    margin-right: 4px;
                    opacity: 0.6;
                    animation: typingAnimation 1.4s infinite ease-in-out;
                }
                
                .typing-dot:nth-child(1) {
                    animation-delay: 0s;
                }
                
                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                    margin-right: 0;
                }
                
                @keyframes typingAnimation {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .hidden {
                    display: none !important;
                }

                .expand-button {
                    background: transparent;
                    border: none;
                    color: var(--vscode-fg);
                    cursor: pointer;
                    font-size: 1.2rem;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }

                .expand-button:hover {
                    opacity: 1;
                }

                #explanation pre {
                    position: relative;
                }

                #explanation pre::before {
                    content: "code";
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: var(--vscode-active);
                    color: white;
                    padding: 0.2rem 0.5rem;
                    font-size: 0.7rem;
                    border-bottom-left-radius: 4px;
                }

                .loader {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: var(--vscode-active);
                    animation: spin 1s ease-in-out infinite;
                    margin-right: 10px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                #status-message {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background-color: var(--vscode-active);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: opacity 0.3s, transform 0.3s;
                    z-index: 100;
                }

                #status-message.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Add styling for code blocks within chat messages */
                .message-content pre,
                .message-content code {
                    background-color: rgba(0, 0, 0, 0.3);
                    padding: 0.2rem;
                    border-radius: 3px;
                }

                .message-content pre {
                    padding: 0.5rem;
                    margin: 0.5rem 0;
                    overflow-x: auto;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>Code Insights</h1>
                <div class="tabs">
                    <div class="tab active" data-tab="explanation">Explanation</div>
                    <div class="tab" data-tab="chat">Chat</div>
                </div>
            </header>
            <main>
                <div id="explanation-container">
                    <div id="explanation"></div>
                </div>
                <div id="chat-container" class="hidden">
                    <div id="chat-header">
                        <div id="chat-title">Ask follow-up questions about your code</div>
                        <button class="expand-button" id="toggle-chat">▲</button>
                    </div>
                    <div id="chat-messages"></div>
                    <div id="chat-input-container">
                        <input type="text" id="message" placeholder="Type your question about the code...">
                        <button id="send">Ask</button>
                    </div>
                </div>
                <div id="status-message"></div>
            </main>
            <script>
                const vscode = acquireVsCodeApi();
                let isLoading = false;
                
                // Tab switching
                const tabs = document.querySelectorAll('.tab');
                const explanationContainer = document.getElementById('explanation-container');
                const chatContainer = document.getElementById('chat-container');
                
                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        tabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        
                        const tabName = tab.getAttribute('data-tab');
                        if (tabName === 'explanation') {
                            explanationContainer.classList.remove('hidden');
                            chatContainer.classList.add('hidden');
                        } else if (tabName === 'chat') {
                            explanationContainer.classList.add('hidden');
                            chatContainer.classList.remove('hidden');
                            
                            // Ensure chat messages scroll to bottom when switching to chat tab
                            const chatMessages = document.getElementById('chat-messages');
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                    });
                });
                
                // Toggle chat expansion button functionality
                // Now toggles between minimizing and maximizing
                const toggleChatBtn = document.getElementById('toggle-chat');
                toggleChatBtn.addEventListener('click', () => {
                    // Instead of changing height percentage, we'll toggle a class
                    if (toggleChatBtn.textContent === '▼') {
                        // Minimize
                        toggleChatBtn.textContent = '▲';
                    } else {
                        // Maximize 
                        toggleChatBtn.textContent = '▼';
                    }
                    
                    // Scroll chat to bottom after toggling
                    const chatMessages = document.getElementById('chat-messages');
                    setTimeout(() => {
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 100); // Small delay to allow UI to update
                });
                
                // Format code blocks in explanation
                function formatCodeBlocks(text) {
                    // Simple regex to wrap code blocks in <pre><code> tags
                    const formatted = text.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
                    return formatted;
                }
                
                function showStatus(message, duration = 3000) {
                    const statusEl = document.getElementById('status-message');
                    statusEl.textContent = message;
                    statusEl.classList.add('visible');
                    
                    setTimeout(() => {
                        statusEl.classList.remove('visible');
                    }, duration);
                }
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.type) {
                        case 'explanation':
                            const formattedExplanation = formatCodeBlocks(message.text);
                            document.getElementById('explanation').innerHTML = formattedExplanation;
                            isLoading = false;
                            document.getElementById('send').disabled = false;
                            break;
                            
                        case 'chatMessage':
                            isLoading = false;
                            document.getElementById('send').disabled = false;
                            
                            const chatMessages = document.getElementById('chat-messages');
                            const typingIndicator = document.querySelector('.typing-indicator');
                            
                            if (typingIndicator) {
                                typingIndicator.remove();
                            }
                            
                            const messageElement = document.createElement('div');
                            messageElement.className = 'message assistant';
                            
                            const messageHeader = document.createElement('div');
                            messageHeader.className = 'message-header';
                            messageHeader.textContent = 'Assistant';
                            
                            const messageContent = document.createElement('div');
                            messageContent.className = 'message-content';
                            
                            // Simple text content without trying to format code blocks
                            messageContent.textContent = message.text;
                            
                            messageElement.appendChild(messageHeader);
                            messageElement.appendChild(messageContent);
                            chatMessages.appendChild(messageElement);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                            break;
                    }
                });
                
                document.getElementById('message').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
                
                document.getElementById('send').addEventListener('click', sendMessage);
                
                function sendMessage() {
                    if (isLoading) return;
                    
                    const input = document.getElementById('message');
                    const text = input.value.trim();
                    
                    if (!text) return;
                    
                    // Show user message
                    const chatMessages = document.getElementById('chat-messages');
                    const userMessageElement = document.createElement('div');
                    userMessageElement.className = 'message user';
                    
                    const messageHeader = document.createElement('div');
                    messageHeader.className = 'message-header';
                    messageHeader.textContent = 'You';
                    
                    const messageContent = document.createElement('div');
                    messageContent.className = 'message-content';
                    messageContent.textContent = text;
                    
                    userMessageElement.appendChild(messageHeader);
                    userMessageElement.appendChild(messageContent);
                    chatMessages.appendChild(userMessageElement);
                    
                    // Add typing indicator
                    const typingIndicator = document.createElement('div');
                    typingIndicator.className = 'message assistant typing-indicator';
                    typingIndicator.innerHTML = \`
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    \`;
                    chatMessages.appendChild(typingIndicator);
                    
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    
                    // Send to extension
                    vscode.postMessage({ type: 'chatMessage', text });
                    input.value = '';
                    
                    isLoading = true;
                    document.getElementById('send').disabled = true;
                    
                    // Switch to chat tab if sending from elsewhere
                    if (document.querySelector('.tab[data-tab="chat"]').classList.contains('active') === false) {
                        document.querySelector('.tab[data-tab="chat"]').click();
                    }
                    
                    showStatus('Processing your question...');
                }
                
                // Initial rendering of any existing content
                const initialExplanation = document.getElementById('explanation').textContent;
                if (initialExplanation) {
                    document.getElementById('explanation').innerHTML = formatCodeBlocks(initialExplanation);
                }
            </script>
        </body>
        </html>
    `;
}