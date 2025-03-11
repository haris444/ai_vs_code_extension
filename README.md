# AI VS Code Extension

This is the AI VS Code Extension, a powerful tool that integrates AI capabilities into Visual Studio Code to enhance your coding experience. This extension provides features such as inline code completions, code explanations, and a chat interface to ask questions about your code.

## Features

- **Inline Code Completions**: Get code suggestions as you type, powered by your choice of AI provider.
- **Code Explanations**: Select a piece of code and get a detailed explanation of what it does.
- **Chat Interface**: Ask questions about your code and get responses from the AI.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/ai-vs-code-extension.git
    ```
2. Navigate to the extension directory:
    ```sh
    cd ai-vs-code-extension
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```
4. Open the extension in Visual Studio Code:
    ```sh
    code .
    ```
5. Press `F5` to open a new VS Code window with the extension loaded.

## Usage

### Inline Code Completions

1. Open a Python file in VS Code.
2. Start typing and the extension will provide inline code completions based on the selected AI provider.

### Code Explanations

1. Select a piece of code in your editor.
2. Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on macOS) to trigger the "Explain Code" command.
3. A new panel will open with the explanation of the selected code.

### Chat Interface

1. After triggering the "Explain Code" command, you can use the chat interface in the explanation panel to ask further questions about your code.
2. Type your question in the input box and press "Send".
3. The AI will respond to your question in the chat interface.

## Configuration

You can configure the extension to use different AI providers for completions, explanations, and chat. The available providers are `OpenRouter` and `Ollama`.

To configure the extension, go to `File > Preferences > Settings` and search for `aiVsCodeExtension`. You can set the following options:

- `aiVsCodeExtension.inlineCompletionApiProvider`: Select the API provider for inline completions.
- `aiVsCodeExtension.codeExplanationApiProvider`: Select the API provider for code explanations.
- `aiVsCodeExtension.chatApiProvider`: Select the API provider for chat messages.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Visual Studio Code](https://code.visualstudio.com/)
- [OpenRouter](https://openrouter.com/)
- [Ollama](https://ollama.com/)
