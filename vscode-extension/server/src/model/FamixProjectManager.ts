import { Project } from 'ts-morph';
import { FamixRepository, Importer, SourceFileChangeType } from 'ts2famix';
import { FamixModelExporter } from './FamixModelExporter';

export class FamixProjectManager {
    private _importer: Importer;
    private _famixRep: FamixRepository | undefined;
    private _modelExporter: FamixModelExporter;

    constructor(famixModelExporter: FamixModelExporter) {
        this._importer = new Importer();
        this._modelExporter = famixModelExporter;
    }

    public initializeFamixModel(project: Project): void {
        this._famixRep = this._importer.famixRepFromProject(project);
    }

    public async generateFamixModelFromScratch(project: Project): Promise<void> {
        this._importer = new Importer();
        this._famixRep = this._importer.famixRepFromProject(project);
        await this.generateNewJsonForFamixModel();
    }

    public async updateFamixModelIncrementally(fileChangesMap: ReadonlyMap<string, SourceFileChangeType>): Promise<void> {
        this._importer.updateFamixModelIncrementally(fileChangesMap);
    }

    public async generateNewJsonForFamixModel() {
        if (!this._famixRep) {
            throw new Error('Famix model is not initialized.');
        }
        await this._modelExporter.exportModelToFile(this._famixRep);
    }
}
