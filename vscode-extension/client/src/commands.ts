import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

const commandName = 'ts2famix.generateModelForProject';
const serverMethodName = 'generateModelForProject';

export const registerCommands = (context: vscode.ExtensionContext, client: LanguageClient) => {
    const generateModelForCurrentFile = vscode.commands.registerCommand(commandName, async () => {		
        if (client) {
            if (!client.isRunning()) {
                await client.start();
            }
            client.sendRequest(serverMethodName);
            vscode.window.showInformationMessage('Model generation command sent for current file.');
        }
    });
    context.subscriptions.push(generateModelForCurrentFile);
};


