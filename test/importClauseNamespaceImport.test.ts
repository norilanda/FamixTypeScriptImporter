import { Class, ImportClause, Module, StructuralEntity } from '../src';
import { Importer } from '../src/analyze';
import { createProject } from './testUtils';

describe('Import Clause Namespace Imports', () => {
    it("should work with namespace imports", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `export class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import * as Utils from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 2;
        const NUMBER_OF_IMPORT_CLAUSES = 1;
        const NUMBER_OF_STUB_ENTITIES = 0;
        const NUMBER_OF_CLASSES = 1;

        const importClauses = Array.from(fmxRep._getAllEntitiesWithType("ImportClause")) as Array<ImportClause>;
        const moduleList = Array.from(fmxRep._getAllEntitiesWithType('Module')) as Array<Module>;
        const stubEntityList = Array.from(fmxRep._getAllEntitiesWithType('StructuralEntity')) as Array<StructuralEntity>;
        const classesList = Array.from(fmxRep._getAllEntitiesWithType('Class')) as Array<Class>;

        expect(moduleList.length).toBe(NUMBER_OF_MODULES);
        expect(importClauses.length).toBe(NUMBER_OF_IMPORT_CLAUSES);
        expect(stubEntityList.length).toBe(NUMBER_OF_STUB_ENTITIES);
        expect(classesList.length).toBe(NUMBER_OF_CLASSES);
        expect(importClauses[0].importedEntity.fullyQualifiedName).not.toBe(classesList[0].fullyQualifiedName);
        expect(importClauses[0].importingEntity?.name).toBe('importingFile.ts');
    });

    it("should work with namespace imports from exported namespace", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `export namespace Utils {
                export class Helper {}
            }
        `);

        project.createSourceFile("/importingFile.ts",
            `import * as MyUtils from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 2;
        const NUMBER_OF_IMPORT_CLAUSES = 1;
        const NUMBER_OF_STUB_ENTITIES = 0;

        const importClauses = Array.from(fmxRep._getAllEntitiesWithType("ImportClause")) as Array<ImportClause>;
        const moduleList = Array.from(fmxRep._getAllEntitiesWithType('Module')) as Array<Module>;
        const stubEntityList = Array.from(fmxRep._getAllEntitiesWithType('StructuralEntity')) as Array<StructuralEntity>;

        expect(moduleList.length).toBe(NUMBER_OF_MODULES);
        expect(importClauses.length).toBe(NUMBER_OF_IMPORT_CLAUSES);
        expect(stubEntityList.length).toBe(NUMBER_OF_STUB_ENTITIES);
        expect(importClauses[0].importingEntity?.name).toBe('importingFile.ts');
    });

    it("should work with namespace imports when module has no exports", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import * as Utils from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 2;
        const NUMBER_OF_IMPORT_CLAUSES = 1;
        const NUMBER_OF_STUB_ENTITIES = 1;
        const NUMBER_OF_CLASSES = 1;

        const importClauses = Array.from(fmxRep._getAllEntitiesWithType("ImportClause")) as Array<ImportClause>;
        const moduleList = Array.from(fmxRep._getAllEntitiesWithType('Module')) as Array<Module>;
        const stubEntityList = Array.from(fmxRep._getAllEntitiesWithType('StructuralEntity')) as Array<StructuralEntity>;
        const classesList = Array.from(fmxRep._getAllEntitiesWithType('Class')) as Array<Class>;

        expect(moduleList.length).toBe(NUMBER_OF_MODULES);
        expect(importClauses.length).toBe(NUMBER_OF_IMPORT_CLAUSES);
        expect(stubEntityList.length).toBe(NUMBER_OF_STUB_ENTITIES);
        expect(classesList.length).toBe(NUMBER_OF_CLASSES);
        expect(importClauses[0].importingEntity?.name).toBe('importingFile.ts');
    });

    it("should work with namespace imports for re-exports", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/baseModule.ts",
            `export class BaseClass {}
            export function baseFunction() {}
        `);

        project.createSourceFile("/exportingFile.ts",
            `export * from './baseModule';
            export class AdditionalClass {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import * as AllUtils from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 3;
        const NUMBER_OF_IMPORT_CLAUSES = 1;
        const NUMBER_OF_STUB_ENTITIES = 0;
        const NUMBER_OF_CLASSES = 2;

        const importClauses = Array.from(fmxRep._getAllEntitiesWithType("ImportClause")) as Array<ImportClause>;
        const moduleList = Array.from(fmxRep._getAllEntitiesWithType('Module')) as Array<Module>;
        const stubEntityList = Array.from(fmxRep._getAllEntitiesWithType('StructuralEntity')) as Array<StructuralEntity>;
        const classesList = Array.from(fmxRep._getAllEntitiesWithType('Class')) as Array<Class>;

        expect(moduleList.length).toBe(NUMBER_OF_MODULES);
        expect(importClauses.length).toBe(NUMBER_OF_IMPORT_CLAUSES);
        expect(stubEntityList.length).toBe(NUMBER_OF_STUB_ENTITIES);
        expect(classesList.length).toBe(NUMBER_OF_CLASSES);
        expect(importClauses[0].importingEntity?.name).toBe('importingFile.ts');
    });
});