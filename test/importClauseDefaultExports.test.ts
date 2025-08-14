import { Class, ImportClause, Module, StructuralEntity } from '../src';
import { Importer } from '../src/analyze';
import { createProject } from './testUtils';

describe('Import Clause Default Exports', () => {
    it("should work with default exports", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `export default class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import Animal from './exportingFile';
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
        expect(importClauses[0].importedEntity.fullyQualifiedName).toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with default exports with custom names", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `export default class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import Pet from './exportingFile';
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
        expect(importClauses[0].importedEntity.fullyQualifiedName).toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with default exports when the entity is not exported as default", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import Animal from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 1;
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
        expect(importClauses[0].importedEntity.fullyQualifiedName).not.toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with multiple default exports", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/moduleA.ts",
            `export default class ClassA {}
        `);

        project.createSourceFile("/moduleB.ts",
            `export default function helperB() {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import ClassA from './moduleA';
            import helperB from './moduleB';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 3;
        const NUMBER_OF_IMPORT_CLAUSES = 2;
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
        
        const classAImport = importClauses.find(ic => ic.importedEntity.name === 'ClassA');
        const helperBImport = importClauses.find(ic => ic.importedEntity.name === 'helperB');
        
        expect(classAImport).toBeTruthy();
        expect(helperBImport).toBeTruthy();
        expect(classAImport?.importingEntity?.name).toBe('importingFile.ts');
        expect(helperBImport?.importingEntity?.name).toBe('importingFile.ts');
    });

    it("should work with default exports for constants", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `const config = { apiUrl: 'https://api.example.com' };
            export default config;
        `);

        project.createSourceFile("/importingFile.ts",
            `import appConfig from './exportingFile';
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

    it("should work with named default exports (import { default as SomeValue })", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `export default class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import { default as Pet } from './exportingFile';
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
        expect(importClauses[0].importedEntity.fullyQualifiedName).toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with named default exports when entity is not exported as default", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/exportingFile.ts",
            `class Animal {}
        `);

        project.createSourceFile("/importingFile.ts",
            `import { default as Pet } from './exportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 1;
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
        expect(importClauses[0].importedEntity.fullyQualifiedName).not.toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with default exports and re-export", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/originalFile.ts",
            `export default class Animal {}
        `);

        project.createSourceFile("/reExportingFile.ts",
            `export { default } from './originalFile';
        `);

        project.createSourceFile("/importingFile.ts",
            `import Animal from './reExportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 3;
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
        expect(importClauses[0].importedEntity.fullyQualifiedName).toBe(classesList[0].fullyQualifiedName);
    });

    it("should work with default exports re-exported with alias", () => {
        const importer = new Importer();
        const project = createProject();

        project.createSourceFile("/originalFile.ts",
            `export default class Animal {}
        `);

        project.createSourceFile("/reExportingFile.ts",
            `export { default as Pet } from './originalFile';
        `);

        project.createSourceFile("/importingFile.ts",
            `import { Pet } from './reExportingFile';
        `);

        const fmxRep = importer.famixRepFromProject(project);

        const NUMBER_OF_MODULES = 3;
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
        expect(importClauses[0].importedEntity.fullyQualifiedName).toBe(classesList[0].fullyQualifiedName);
    });
});