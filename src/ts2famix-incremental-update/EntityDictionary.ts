/* eslint-disable @typescript-eslint/no-unused-vars */
import { FamixBaseElement } from "src/lib/famix/famix_base_element";
import * as Famix from "../lib/famix/model/famix";
import { ClassDeclaration } from "ts-morph";

/**
 * Maps ts-morph entities to Famix entities.
 */
export class EntityDictionary {
    private famixRepository = new FamixRepository();

    private fmxClassMap = new Map<string, Famix.Class | Famix.ParametricClass>();

    public removeSourceFileEntities(sourceFilePath: string): void {
        this.famixRepository.removeSourceFileEntities(sourceFilePath);
        this.fmxClassMap.forEach((value, key) => {
            const currentSrcFilePath = key; // get src file path
            if (currentSrcFilePath === sourceFilePath) {
                this.fmxClassMap.delete(key);
            }
        });
    }

    public createOrGetFamixClass(cls: ClassDeclaration): Famix.Class | Famix.ParametricClass {
        throw new Error("Method not implemented.");
    }

    // ...
}

export class FamixRepository {
    private elements = new Set<FamixBaseElement>();
    private elementsBySourceFile = new Map<string, Set<FamixBaseElement>>();

    public removeSourceFileEntities(sourceFilePath: string): void {
        const elements = this.elementsBySourceFile.get(sourceFilePath);
        if (elements) {
            elements.forEach(element => this.elements.delete(element));
            this.elementsBySourceFile.delete(sourceFilePath);
        }
    }
    // ...
}