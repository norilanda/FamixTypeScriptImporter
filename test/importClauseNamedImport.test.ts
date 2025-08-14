import { Class, ImportClause, Module, NamedEntity } from '../src';
import { Importer } from '../src/analyze';
import { createProject } from './testUtils';

describe('Import Clause Named Imports', () => {
    it("should work with named imports", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `export class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import { Animal } from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 2;
        const NUMBER_OF_IMPORT_CLAUSES = 1;
        const NUMBER_OF_NAMED_ENTITIES = 0;
        const NUMBER_OF_CLASSES = 1;

        const importClauses = Array.from(fmxRep._getAllEntitiesWithType("ImportClause")) as Array<ImportClause>;
        const moduleList = Array.from(fmxRep._getAllEntitiesWithType('Module')) as Array<Module>;
        const namedEntityList = Array.from(fmxRep._getAllEntitiesWithType('NamedEntity')) as Array<NamedEntity>;
        const classesList = Array.from(fmxRep._getAllEntitiesWithType('Class')) as Array<Class>;

        expect(moduleList.length).toBe(NUMBER_OF_MODULES);
        expect(importClauses.length).toBe(NUMBER_OF_IMPORT_CLAUSES);
        expect(namedEntityList.length).toBe(NUMBER_OF_NAMED_ENTITIES);
        expect(classesList.length).toBe(NUMBER_OF_CLASSES);
        expect(importClauses[0].importedEntity.fullyQualifiedName).toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with named imports with aliases", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `export class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import { Animal as Pet } from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 2;
        const NUMBER_OF_IMPORT_CLAUSES = 1;
        const NUMBER_OF_NAMED_ENTITIES = 0;
        const NUMBER_OF_CLASSES = 1;

        const importClauses = Array.from(fmxRep._getAllEntitiesWithType("ImportClause")) as Array<ImportClause>;
        const moduleList = Array.from(fmxRep._getAllEntitiesWithType('Module')) as Array<Module>;
        const namedEntityList = Array.from(fmxRep._getAllEntitiesWithType('NamedEntity')) as Array<NamedEntity>;
        const classesList = Array.from(fmxRep._getAllEntitiesWithType('Class')) as Array<Class>;

        expect(moduleList.length).toBe(NUMBER_OF_MODULES);
        expect(importClauses.length).toBe(NUMBER_OF_IMPORT_CLAUSES);
        expect(namedEntityList.length).toBe(NUMBER_OF_NAMED_ENTITIES);
        expect(classesList.length).toBe(NUMBER_OF_CLASSES);
        expect(importClauses[0].importedEntity.fullyQualifiedName).toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with named imports when the entity is not exported", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import { Animal } from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 1;
        const NUMBER_OF_IMPORT_CLAUSES = 1;
        const NUMBER_OF_NAMED_ENTITIES = 1;
        const NUMBER_OF_CLASSES = 1;

        const importClauses = Array.from(fmxRep._getAllEntitiesWithType("ImportClause")) as Array<ImportClause>;
        const moduleList = Array.from(fmxRep._getAllEntitiesWithType('Module')) as Array<Module>;
        const namedEntityList = Array.from(fmxRep._getAllEntitiesWithType('NamedEntity')) as Array<NamedEntity>;
        const classesList = Array.from(fmxRep._getAllEntitiesWithType('Class')) as Array<Class>;

        expect(moduleList.length).toBe(NUMBER_OF_MODULES);
        expect(importClauses.length).toBe(NUMBER_OF_IMPORT_CLAUSES);
        expect(namedEntityList.length).toBe(NUMBER_OF_NAMED_ENTITIES);
        expect(classesList.length).toBe(NUMBER_OF_CLASSES);
        expect(importClauses[0].importedEntity.fullyQualifiedName).not.toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with named imports with aliases when the entity is not exported", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import { Animal as Pet } from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 1;
        const NUMBER_OF_IMPORT_CLAUSES = 1;
        const NUMBER_OF_NAMED_ENTITIES = 1;
        const NUMBER_OF_CLASSES = 1;

        const importClauses = Array.from(fmxRep._getAllEntitiesWithType("ImportClause")) as Array<ImportClause>;
        const moduleList = Array.from(fmxRep._getAllEntitiesWithType('Module')) as Array<Module>;
        const namedEntityList = Array.from(fmxRep._getAllEntitiesWithType('NamedEntity')) as Array<NamedEntity>;
        const classesList = Array.from(fmxRep._getAllEntitiesWithType('Class')) as Array<Class>;

        expect(moduleList.length).toBe(NUMBER_OF_MODULES);
        expect(importClauses.length).toBe(NUMBER_OF_IMPORT_CLAUSES);
        expect(namedEntityList.length).toBe(NUMBER_OF_NAMED_ENTITIES);
        expect(classesList.length).toBe(NUMBER_OF_CLASSES);
        expect(importClauses[0].importedEntity.fullyQualifiedName).not.toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with named imports and re-export", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `export class Animal {}`
        );

        project.createSourceFile("/reExportingFile.ts",
            `export { Animal } from './exportingFile';`
        );

        project.createSourceFile("/importingFile.ts",
            `import { Animal } from './reExportingFile';`
        );

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 3;
        const NUMBER_OF_IMPORT_CLAUSES = 1;
        const NUMBER_OF_NAMED_ENTITIES = 0;
        const NUMBER_OF_CLASSES = 1;

        const importClauses = Array.from(fmxRep._getAllEntitiesWithType("ImportClause")) as Array<ImportClause>;
        const moduleList = Array.from(fmxRep._getAllEntitiesWithType('Module')) as Array<Module>;
        const namedEntityList = Array.from(fmxRep._getAllEntitiesWithType('NamedEntity')) as Array<NamedEntity>;
        const classesList = Array.from(fmxRep._getAllEntitiesWithType('Class')) as Array<Class>;

        expect(moduleList.length).toBe(NUMBER_OF_MODULES);
        expect(importClauses.length).toBe(NUMBER_OF_IMPORT_CLAUSES);
        expect(namedEntityList.length).toBe(NUMBER_OF_NAMED_ENTITIES);
        expect(classesList.length).toBe(NUMBER_OF_CLASSES);
        expect(importClauses[0].importedEntity.fullyQualifiedName).toBe(classesList[0].fullyQualifiedName);
    });
});
