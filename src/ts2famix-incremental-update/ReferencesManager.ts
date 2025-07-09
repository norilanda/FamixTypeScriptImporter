/* eslint-disable @typescript-eslint/no-unused-vars */
import { SourceFile } from "ts-morph";
import { EntityDictionary } from "./EntityDictionary";

export class ReferencesManager {
    private entityDictionary: EntityDictionary;

    constructor(entityDictionary: EntityDictionary) {
        this.entityDictionary = entityDictionary;
    }

    public findChangedSourceFiles(sourceFiles: SourceFile[]): SourceFile[] {
        throw new Error("Method not implemented.");
    }

    public removeAssociationsForFilePath(filePath: string): void {
        throw new Error("Method not implemented.");
    }
}