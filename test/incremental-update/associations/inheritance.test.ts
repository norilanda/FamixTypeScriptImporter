import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";
import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModel } from "../incrementalUpdateTestHelper";

const sourceFileName = 'sourceCode.ts';
const superClassName = 'SuperClass';
const subClassName = 'SubClass';

const superClassCode = `
    class ${superClassName} {
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

const subClassWithInheritanceCode = `
    class ${subClassName} extends ${superClassName} {
        method2(): number {
            return 42;
        }
    }
`;


const superClassChangedCode = `
    class ${superClassName} {
        protected property1: number;
        protected method1Changed() {}
    }
`;

const sourceCodeWithoutInheritance = `
    ${superClassCode}
    
    ${subClassWithoutInheritanceCode}
  `;

const sourceCodeWithInheritance = `
    ${superClassCode}

    ${subClassWithInheritanceCode}
  `;

const sourceCodeWithInheritanceChanged = `
    ${superClassChangedCode}

    ${subClassWithInheritanceCode}
  `;

describe('Change the inheritance in a single file', () => {

  it('should add new inheritance association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithoutInheritance);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithInheritance);
      
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithInheritance);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should remove the inheritance association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithInheritance);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithoutInheritance);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithoutInheritance);

    // ! There is a bug where the createOrGetFamixClass is called during the inheritance creation:
    // the 2 indexAncrots are added
    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should retain the inheritance association when the superclass is modified', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithInheritance);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithInheritanceChanged);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithInheritanceChanged);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should retain the inheritance association when the superclass is modified 2 times', () => {
    // arrange
    const sourceCodeWithInheritanceChangedTwice = `
        class ${superClassName} {
            protected property1: number;
        }
    
        ${subClassWithInheritanceCode}
      `;

    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithInheritance);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithInheritanceChanged);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);
    testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithInheritanceChangedTwice);
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithInheritanceChangedTwice);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});