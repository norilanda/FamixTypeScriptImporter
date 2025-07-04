import { DidChangeWatchedFilesParams } from 'vscode-languageserver/node';
import { FileChangeAction, FileChangesMap } from '../model.ts/FileChangesMap';
import { FileSystemRefreshResult, Project } from 'ts-morph';
import * as url from 'url';

export const onDidChangeWatchedFiles = async (
    params: DidChangeWatchedFilesParams, fileChangesMap: FileChangesMap,
    tsMorphProject: Project
) => {
    for (const change of params.changes) {
        fileChangesMap.addFile(change);
    }

    const mapSlice = fileChangesMap.getAndClearFileChangesMap();
    // TODO: ensure that there is no race condition (when new changes are added while we are processing the previous ones)
    const famixChangesToBeDone = await updateTsMorphProject(mapSlice, tsMorphProject);

};

const updateTsMorphProject = async (fileChangesMap: ReadonlyMap<string, FileChangeAction>, tsMorphProject: Project) => {
    const refreshPromises = Array.from(fileChangesMap.entries()).map(async ([filePath, _change]) => {
        const normalizedPath = url.fileURLToPath(filePath);
        let sourceFile = tsMorphProject.getSourceFile(normalizedPath);
        if (sourceFile) {
            const result = await sourceFile.refreshFromFileSystem();
            if (result !== FileSystemRefreshResult.NoChange) {
                return { filePath: normalizedPath, change: _change };
            }
            return null;
        }
        sourceFile = tsMorphProject.addSourceFileAtPath(normalizedPath);
        return { filePath: normalizedPath, change: _change };
    });

    return (await Promise.all(refreshPromises))
        .filter(result => result !== null);
};