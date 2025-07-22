
import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";
import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModel } from "../incrementalUpdateTestHelper";

const sourceFileName = 'sourceCode.ts';

const genericClassName = 'GenericClass';
const concreteClassName = 'ConcreteClass';

const genericClassCode = `
    class ${genericClassName}<T> {
        property: T;
        method(param: T): T {
            return param;
        }
    }
`;

const concreteClassCode = `
    class ${concreteClassName} extends ${genericClassName}<string> {
        additionalProperty: number;
    }
`;

const sourceCodeWithoutConcretisation = `
    ${genericClassCode}
    
    class ${concreteClassName} {
        additionalProperty: number;
    }
`;

const sourceCodeWithConcretisation = `
    ${genericClassCode}
    ${concreteClassCode}
`;

const sourceCodeWithConcretisationChanged = `
    class ${genericClassName}<T> {
        property: T;
        newProperty: boolean;
        method(param: T): T {
            return param;
        }
        newMethod(): void {}
    }
    ${concreteClassCode}
`;

const sourceCodeWithConcreteClassChanged = `
    ${genericClassCode}
    
    class ${concreteClassName} extends ${genericClassName}<string> {
        additionalProperty: number;
        newConcreteProperty: boolean;
        newConcreteMethod(): void {}
    }
`;

const sourceCodeWithConcretisationChangedTwice = `
    class ${genericClassName}<T> {
        property: T;
        newProperty: boolean;
        anotherNewProperty: string;
        method(param: T): T {
            return param;
        }
        newMethod(): void {}
        anotherNewMethod(): string {
            return "test";
        }
    }
    ${concreteClassCode}
`;

const sourceCodeWithDifferentConcretisation = `
    ${genericClassCode}
    
    class DifferentConcretisationClass extends ${genericClassName}<number> {
        additionalProperty: number;
    }
`;

describe('Change the concretisation in a single file', () => {
  it('should add new concretisation association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithoutConcretisation);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithConcretisation);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithConcretisation);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should remove the concretisation association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithConcretisation);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithoutConcretisation);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithoutConcretisation);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should retain the concretisation association when the generic class is modified', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithConcretisation);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithConcretisationChanged);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithConcretisationChanged);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should retain the concretisation association when the concrete class is modified', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithConcretisation);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithConcreteClassChanged);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithConcreteClassChanged);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should retain the concretisation association when the generic class is modified 2 times', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithConcretisation);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithConcretisationChanged);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);
    testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithConcretisationChangedTwice);
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithConcretisationChangedTwice);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should update concretisation when changing from one concrete type to another', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithConcretisation);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithDifferentConcretisation);
    
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithDifferentConcretisation);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});