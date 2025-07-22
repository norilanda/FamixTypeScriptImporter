import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";
import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModelForSeveralFiles } from "../incrementalUpdateTestHelper";

const sourceFileNameUsesSuper = 'sourceCodeUsesSuper.ts';
const superClassName = 'SuperClass';
const subClassName = 'SubClass';
const sourceFileNameSuperClass = `${superClassName}.ts`;
const sourceFileNameSubClass = `${subClassName}.ts`;

const exportSuperClassCode = `
    export class ${superClassName} {
        protected property1: string;
        protected method1() {}
    }
`;

const subClassWithoutInheritanceCode = `
    class ${subClassName} {
        method2(): number {
            return 42;
        }
    }
`;

const importSubClassWithInheritanceCode = `
    import { ${superClassName} } from './${superClassName}';
    class ${subClassName} extends ${superClassName} {
        method2(): number {
            return 42;
        }
    }
`;

const exportSuperClassChangedCode = `
    export class ${superClassName} {
        protected property1: number;
        protected method1Changed() {}
    }
`;

const fileCodeThatUsesSuperClass = `
    import { ${superClassName} } from './${superClassName}';
    
    const instance = new ${superClassName}();
`;

describe('Change the inheritance between several files', () => {
  it('should add new inheritance association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameSuperClass, exportSuperClassCode)
      .addSourceFile(sourceFileNameSubClass, subClassWithoutInheritanceCode);
    const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameSubClass, importSubClassWithInheritanceCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameSuperClass, exportSuperClassCode],
        [sourceFileNameSubClass, importSubClassWithInheritanceCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should remove the inheritance association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameSuperClass, exportSuperClassCode)
      .addSourceFile(sourceFileNameSubClass, importSubClassWithInheritanceCode);
      const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameSubClass, subClassWithoutInheritanceCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameSuperClass, exportSuperClassCode],
        [sourceFileNameSubClass, subClassWithoutInheritanceCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should retain the inheritance association when the superclass is modified', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameSubClass, importSubClassWithInheritanceCode)
      .addSourceFile(sourceFileNameSuperClass, exportSuperClassCode);

    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder
      .changeSourceFile(sourceFileNameSuperClass, exportSuperClassChangedCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameSuperClass, exportSuperClassChangedCode],
        [sourceFileNameSubClass, importSubClassWithInheritanceCode]
    ]);

    // it seems that the issue is connected with the createOrGetFamixInterfaceStub
    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should handle 3-file project with inheritance when superclass changes', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameSuperClass, exportSuperClassCode)
      .addSourceFile(sourceFileNameSubClass, importSubClassWithInheritanceCode)
      .addSourceFile(sourceFileNameUsesSuper, fileCodeThatUsesSuperClass);
      const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder
      .changeSourceFile(sourceFileNameSuperClass, exportSuperClassChangedCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameSuperClass, exportSuperClassChangedCode],
        [sourceFileNameSubClass, importSubClassWithInheritanceCode],
        [sourceFileNameUsesSuper, fileCodeThatUsesSuperClass]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should handle a chain of the classes with inheritance when super class changed', () => {
    // arrange
    const classACode = `export class classA {
      private a: boolean;
    }`;
    const classACodeChanged = `export class classA {
      private a: number;
    }`;
    const classAFileName = 'classA.ts';

    const classBCode = `import { classA } from './classA';
    export class classB extends classA {}`;
    const classBFileName = 'classB.ts';

    const classCCode = `import { classB } from './classB';
    export class classC extends classB {}`;
    const classCFileName = 'classC.ts';


    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(classAFileName, classACode)
      .addSourceFile(classBFileName, classBCode)
      .addSourceFile(classCFileName, classCCode);
    const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder
      .changeSourceFile(classAFileName, classACodeChanged);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [classAFileName, classACodeChanged],
        [classBFileName, classBCode],
        [classCFileName, classCCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should handle a chain of the classes with inheritance when super class changed 2 times', () => {
    // arrange
    const classACode = `export class classA {
      private a: boolean = true;
    }`;
    const classACodeChanged = `export class classA {
      private a: number = 42;
    }`;
    const classACodeChangedTwice = `export class classA {
      private a: string = 'hello';
    }`;
    const classAFileName = 'classA.ts';

    const classBCode = `import { classA } from './classA';
    export class classB extends classA {
      private assignVariable(): void {
        const assignedVariable = this.a;
      }
    }`;
    const classBFileName = 'classB.ts';

    const classCCode = `import { classB } from './classB';
    export class classC extends classB {}`;
    const classCFileName = 'classC.ts';


    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(classAFileName, classACode)
      .addSourceFile(classBFileName, classBCode)
      .addSourceFile(classCFileName, classCCode);
    const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder
      .changeSourceFile(classAFileName, classACodeChanged);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);
    testProjectBuilder.changeSourceFile(classAFileName, classACodeChangedTwice);
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [classAFileName, classACodeChangedTwice],
        [classBFileName, classBCode],
        [classCFileName, classCCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});