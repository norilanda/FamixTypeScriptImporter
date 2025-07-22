import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";
import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModel, getFqnForClass } from "../incrementalUpdateTestHelper";

const sourceFileName = 'sourceCode.ts';
const existingClassName = 'ExistingClass';

const sourceCodeBefore = `
  class ${existingClassName} {
    property1: string;
    method1() {}
  }
`;

describe('Modify classes in a single file', () => {
  it('should add new method into the Famix class', () => {
    // arrange
    const sourceCodeAfter = `
        class ${existingClassName} {
            property1: string;
            method1() {}
            method2(): number {
                return 42;
            }
        }
    `;

    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeBefore);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeAfter);
        
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const existingClass = famixRep._getFamixClass(getFqnForClass(sourceFileName, existingClassName));

    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeAfter);

    expect(existingClass).not.toBeUndefined();
    expect(existingClass!.methods.size).toEqual(2);
    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should add new property into the Famix class', () => {
    // arrange
    const sourceCodeAfter = `
        class ${existingClassName} {
            property1: string;
            property2: number;
            method1() {}
        }
    `;

    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeBefore);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeAfter);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const existingClass = famixRep._getFamixClass(getFqnForClass(sourceFileName, existingClassName));

    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeAfter);

    expect(existingClass).not.toBeUndefined();
    expect(existingClass!.properties.size).toEqual(2);
    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should rename the Famix class', () => {
    // arrange
    const newClassName = 'RenamedExistingClass';
    const sourceCodeAfter = `
        class ${newClassName} {
            property1: string;
            method1() {}
        }
    `;

    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeBefore);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeAfter);
     
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const oldClass = famixRep._getFamixClass(getFqnForClass(sourceFileName, existingClassName));
    const renamedClass = famixRep._getFamixClass(getFqnForClass(sourceFileName, newClassName));

    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeAfter);

    expect(oldClass).toBeUndefined();
    expect(renamedClass).not.toBeUndefined();
    expect(renamedClass!.name).toEqual(newClassName);
    expect(renamedClass!.properties.size).toEqual(1);
    expect(renamedClass!.methods.size).toEqual(1);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});