import { DidChangeWatchedFilesParams } from 'vscode-languageserver/node';
import { FileChangesMap } from '../model/FileChangesMap';
import { FamixProjectManager } from '../model/FamixProjectManager';

export const onDidChangeWatchedFiles = async (
    params: DidChangeWatchedFilesParams, fileChangesMap: FileChangesMap,
    famixProjectManager: FamixProjectManager
) => {
    for (const change of params.changes) {
        fileChangesMap.addFile(change);
    }

    const mapSlice = fileChangesMap.getAndClearFileChangesMap();
    // TODO: ensure that there is no race condition (when new changes are added while we are processing the previous ones)
    const famixChangesToBeDone = await famixProjectManager.updateTsMorphProject(mapSlice);
    famixProjectManager.updateFamixModel(famixChangesToBeDone);
    await famixProjectManager.generateNewJsonForFamixModel();
};
