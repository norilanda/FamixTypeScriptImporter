import {
    createConnection,
} from 'vscode-languageserver/node';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import { err, ok, Result } from 'neverthrow';

const extensionSectionName = 'ts2famix';
const tsConfigFileExtension = 'tsconfig.json';

export async function getOutputFilePath(connection: ReturnType<typeof createConnection>): Promise<string> {
    const config = await connection.workspace.getConfiguration({ section: extensionSectionName });
    return config.FamixModelOutputFilePath || '';
}

export async function findTypeScriptProject(connection: ReturnType<typeof createConnection>
): Promise<Result<{ tsConfigPath: string, baseUrl: string }, Error>> {
    const workspaceFolders = await connection.workspace.getWorkspaceFolders();
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return err(new Error('No workspace folders found'));
    }
    const baseUrl = url.fileURLToPath(workspaceFolders[0].uri);
    const tsConfigPath = getTsConfigFilePath(baseUrl);
        
    // TODO: Should we scan all workspace folders? Should we check inner folders?
    if (!fs.existsSync(tsConfigPath)) {
        return err(new Error(`TypeScript configuration file not found: ${tsConfigPath}`));
    }
        
    return ok({ 
        tsConfigPath: tsConfigPath,
        baseUrl: baseUrl
    });
}

export function getTsConfigFilePath(baseUrl: string): string {
    return baseUrl.endsWith(tsConfigFileExtension)
        ? baseUrl
        : path.join(baseUrl, tsConfigFileExtension);
}
