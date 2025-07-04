import {
    createConnection,
} from 'vscode-languageserver/node';
import * as path from 'path';
import * as url from 'url';

const extensionSectionName = 'ts2famix';
const tsConfigFileExtension = 'tsconfig.json';

export async function getOutputFilePath(connection: ReturnType<typeof createConnection>): Promise<string> {
    const config = await connection.workspace.getConfiguration({ section: extensionSectionName });
    return config.FamixModelOutputFilePath || '';
}

export async function findTypeScriptProject(connection: ReturnType<typeof createConnection>): Promise<{ tsConfigPath: string, baseUrl: string }> {
    const workspaceFolders = await connection.workspace.getWorkspaceFolders();
    
    if (workspaceFolders && workspaceFolders.length > 0) {
        const baseUrl = url.fileURLToPath(workspaceFolders[0].uri);
        const tsConfigPath = getTsConfigFilePath(baseUrl);
        return { 
            tsConfigPath: tsConfigPath,
            baseUrl: baseUrl
        };
    }

    throw new Error('No workspace folders found');
}

export function getTsConfigFilePath(baseUrl: string): string {
    return baseUrl.endsWith(tsConfigFileExtension)
        ? baseUrl
        : path.join(baseUrl, tsConfigFileExtension);
}
