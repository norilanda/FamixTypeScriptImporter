import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";
import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModel } from "../incrementalUpdateTestHelper";

const sourceFileName = 'sourceCode.ts';
const existingClassName = 'ExistingClass';
const newClassName = 'NewClass';

describe('Add new classes to a single file', () => {
  const sourceCodeWithOneClass = `
    class ${existingClassName} {
      property1: string;
      method1() {}
    }
  `;

  const sourceCodeWithTwoClasses = `
    class ${existingClassName} {
      property1: string;
      method1() {}
    }

    class ${newClassName} {
      property2: number;
      method2() {}
    }
  `;

  it('should create new classes in the Famix representation', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithOneClass);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithTwoClasses);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithTwoClasses);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});