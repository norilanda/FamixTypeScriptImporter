 
import {
    createConnection,
} from 'vscode-languageserver/node';
import { findTypeScriptProject } from './utils';
import { getTsMorphProject } from 'ts2famix';
import { FamixProjectManager } from './model';

const methodName = 'generateModelForProject';

export const registerCommandHandlers = (connection: ReturnType<typeof createConnection>, famixProjectManager: FamixProjectManager) => {
    connection.onRequest(methodName, async () => {
        try {
            const result = await findTypeScriptProject(connection);
            if (result.isErr()) {
                return { success: false, error: result.error.message };
            }
            const { tsConfigPath, baseUrl } = result.value;
            const tsMorphProject = getTsMorphProject(tsConfigPath, baseUrl);
            await famixProjectManager.generateFamixModelFromScratch(tsMorphProject);
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            connection.console.error(`Error generating model: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    });
};
