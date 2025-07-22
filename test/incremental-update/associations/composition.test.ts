import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";
import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModel } from "../incrementalUpdateTestHelper";

const sourceFileName = 'sourceCode.ts';
const classNameThatContainsOtherClass = 'ClassThatContainsOther';
const classThatIsUsedByOther = 'ClassUsedByOther';

const sourceCodeWithoutComposition = `
    class ${classNameThatContainsOtherClass} {
        protected property1: string;
        protected method1() {}
    }
  
    class ${classThatIsUsedByOther} {
        method2(): number {
            return 42;
        }
    }
`;

const sourceCodeWithComposition = `
    class ${classNameThatContainsOtherClass} {
        protected property1: string;
        protected method1() {}
        private other: ${classThatIsUsedByOther};
    }
  
    class ${classThatIsUsedByOther} {
        method2(): number {
            return 42;
        }
    }
`;

const sourceCodeWithCompositionChanged = `
    class ${classNameThatContainsOtherClass} {
        protected property1: number;
        protected method1() {}
        private otherChanged: ${classThatIsUsedByOther};
    }
  
    class ${classThatIsUsedByOther} {
        method2Changed(): number {
            return 42;
        }
    }
`;

describe('Change the composition in a single file', () => {
  it('should add new composition association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithoutComposition);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithComposition);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithComposition);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should remove the composition association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithComposition);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithoutComposition);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithoutComposition);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should retain the composition association when the containing class is modified', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithComposition);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithCompositionChanged);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithCompositionChanged);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});