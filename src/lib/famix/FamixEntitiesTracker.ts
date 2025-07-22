import { FamixBaseElement } from "./famix_base_element";
import * as Famix from "./model/famix";

type SharedEntityType = Famix.PrimitiveType;

export class FamixEntitiesTracker {
    private _currentSourceFileToAdd: string | undefined;
    private _entitiesBySourceFile: Map<string, Set<FamixBaseElement>> = new Map();
    private _sharedEntities: Map<SharedEntityType, Set<string>> = new Map();

    public set currentSourceFileToAdd(value: string | undefined) {
        this._currentSourceFileToAdd = value;
    }
    
    public addEntity(entity: FamixBaseElement): void {
        if (!this._currentSourceFileToAdd) {
            return;
        }
        // TODO: Check if only SourcedEntity can be added here
        if (!(entity instanceof Famix.SourcedEntity)) {
            return;
        }
        if (this.isEntityShared(entity)) {
            const sharedEntity = entity as SharedEntityType;
            const sourceFilesWhereUsed = this._sharedEntities.get(sharedEntity) || new Set<string>();
            sourceFilesWhereUsed.add(this._currentSourceFileToAdd);
            this._sharedEntities.set(sharedEntity, sourceFilesWhereUsed);
        } else {
            const entitiesForSourceFile = this._entitiesBySourceFile.get(this._currentSourceFileToAdd) || new Set<FamixBaseElement>();
            entitiesForSourceFile.add(entity);
            this._entitiesBySourceFile.set(this._currentSourceFileToAdd, entitiesForSourceFile);
        }
    }

    public getEntitiesBySourceFile(sourceFile: string): Set<FamixBaseElement> | undefined {
        return this._entitiesBySourceFile.get(sourceFile);
    }

    public removeEntitiesBySourceFile(sourceFile: string): Set<FamixBaseElement> {
        const entitiesToReturn = this._entitiesBySourceFile.get(sourceFile) || new Set<FamixBaseElement>();
        this._entitiesBySourceFile.delete(sourceFile);

        for (const [sharedEntity, sourceFiles] of this._sharedEntities.entries()) {
            if (sourceFiles.has(sourceFile)) {
                sourceFiles.delete(sourceFile);
                
                if (sourceFiles.size === 0) {
                    this._sharedEntities.delete(sharedEntity);
                    entitiesToReturn.add(sharedEntity);
                }
            }
        }

        return entitiesToReturn;
    } 

    private isEntityShared(entity: FamixBaseElement): boolean {
        return entity instanceof Famix.PrimitiveType;
    }
}
