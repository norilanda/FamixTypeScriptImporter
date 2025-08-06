import { createConnection, DidChangeWatchedFilesParams } from 'vscode-languageserver/node';
import { FileChangesMap } from '../model/FileChangesMap';
import { FamixProjectManager } from '../model/FamixProjectManager';

export const onDidChangeWatchedFiles = async (
    params: DidChangeWatchedFilesParams,
    connection: ReturnType<typeof createConnection>, 
    fileChangesMap: FileChangesMap,
    famixProjectManager: FamixProjectManager
) => {
    for (const change of params.changes) {
        fileChangesMap.addFile(change);
    }

    const mapSlice = fileChangesMap.getAndClearFileChangesMap();
    // TODO: ensure that there is no race condition (when new changes are added while we are processing the previous ones)
    try {
        await famixProjectManager.updateFamixModelIncrementally(mapSlice);

        const exportResult = await famixProjectManager.generateNewJsonForFamixModel();
        if (exportResult.isErr()) {
            connection.window.showErrorMessage(exportResult.error.message);
            return;
        }
    } catch {
        connection.window.showErrorMessage(`Error processing file changes.`);
        return;
    }
};
