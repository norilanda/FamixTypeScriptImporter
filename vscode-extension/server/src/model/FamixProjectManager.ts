import { FileChangeAction } from './../../dist/model.ts/FileChangesMap.d';
import { FileSystemRefreshResult, Project, SourceFile } from 'ts-morph';
import { FamixRepository, Importer } from 'ts2famix';
import * as url from 'url';
import * as fs from "fs";

export class FamixProjectManager {
    private _importer: Importer;
    private _project: Project | undefined;
    private _famixRep: FamixRepository | undefined;
    private _outputFilePath: string | undefined;

    private get project (): Project {
        if (!this._project) {
            throw new Error('FamixProjectManager is not initialized with a project.');
        }
        return this._project;
    }

    constructor() {
        this._importer = new Importer();
    }

    public initializeFamixModel(project: Project): void {
        this._project = project;
        this._famixRep = this._importer.famixRepFromProject(project);
    }

    public updateTsMorphProject = async (fileChangesMap: ReadonlyMap<string, FileChangeAction>): Promise<SourceFile[]> => {
        const refreshPromises = Array.from(fileChangesMap.entries()).map(async ([filePath, change]) => {
            const normalizedPath = url.fileURLToPath(filePath);
            let sourceFile = this.project.getSourceFile(normalizedPath);
            if (sourceFile) {
                if (change === 'delete') {
                    this.project.removeSourceFile(sourceFile);
                    return { sourceFile, change };
                }
                const result = await sourceFile.refreshFromFileSystem();
                if (result !== FileSystemRefreshResult.NoChange) {
                    return { sourceFile, change };
                }
                return null;
            }
            sourceFile = this.project.addSourceFileAtPath(filePath);
            return { sourceFile, change };
        });

        const results = (await Promise.all(refreshPromises))
            .filter(result => result !== null) as { sourceFile: SourceFile; change: FileChangeAction }[];

        return results.map(result => result.sourceFile);

        // TODO: it the file change action is not needed - then just return an array of SourceFiles
        // const getResultMap = () => {
        //     const resultMap = new Map<FileChangeAction, SourceFile[]>();
        //     for (const result of results) {
        //         if (!resultMap.has(result.change)) {
        //             resultMap.set(result.change, []);
        //         }
        //         resultMap.get(result.change)!.push(result.sourceFile);
        //     }
    
        //     return resultMap;
        // };

        // return getResultMap();
    };

    public updateFamixModel(filesToUpdate: SourceFile[]): void {
        this._importer.updateFamixModelIncrementally(filesToUpdate);
    }

    public async generateNewJsonForFamixModel() {
        if (!this._famixRep) {
            throw new Error('Famix model is not initialized.');
        } else if (!this._outputFilePath) {
            throw new Error('Output file path is not set.');
        }
        const jsonOutput = this._famixRep.export({ format: "json" });

        await fs.promises.writeFile(this._outputFilePath, jsonOutput);
    }

    public setOutputFilePath(outputFilePath: string) {
        this._outputFilePath = outputFilePath;
    }
}