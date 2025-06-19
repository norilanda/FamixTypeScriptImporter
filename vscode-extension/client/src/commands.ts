import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { getBaseUrl } from './utils';

export const registerCommands = (context: vscode.ExtensionContext, client: LanguageClient) => {
	const generateModelForCurrentFile = vscode.commands.registerCommand('ts2famix.generateModelForProject', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No active editor found.');
			return;
		}
		const document = editor.document;
		if (document.languageId !== 'typescript') {
			vscode.window.showWarningMessage('The current file is not a TypeScript file.');
			return;
		}
		const filePath = getBaseUrl(document);
		if (!filePath) {
			vscode.window.showErrorMessage('Could not determine the base URL for the current file.');
			return;
		}
		
		if (client) {
			await client.start(); // Ensure client is started
			client.sendRequest('generateModelForProject', { filePath });
			vscode.window.showInformationMessage('Model generation command sent for current file.');
		}
	});
	context.subscriptions.push(generateModelForCurrentFile);
};


