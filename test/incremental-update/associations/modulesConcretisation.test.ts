import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";
import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModelForSeveralFiles } from "../incrementalUpdateTestHelper";

const genericClassName = 'GenericClass';
const concreteClassName = 'ConcreteClass';

const sourceFileNameGeneric = `${genericClassName}.ts`;
const sourceFileNameConcrete = `${concreteClassName}.ts`;
const sourceFileNameChain = 'ChainClass.ts';
const sourceFileNameUtility = 'UtilityClass.ts';

const exportGenericClassCode = `
    export class ${genericClassName}<T> {
        property: T;
        method(param: T): T {
            return param;
        }
    }
`;

const exportGenericClassChangedCode = `
    export class ${genericClassName}<T> {
        property: T;
        newProperty: boolean;
        method(param: T): T {
            return param;
        }
        newMethod(): void {}
    }
`;

const exportGenericClassChangedTwiceCode = `
    export class ${genericClassName}<T> {
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
`;

const concreteClassWithoutConcretisationCode = `   
    class ${concreteClassName} {
        additionalProperty: number;
    }
`;

const importConcreteClassWithConcretisationCode = `
    import { ${genericClassName} } from './${genericClassName}';
    
    class ${concreteClassName} extends ${genericClassName}<string> {
        additionalProperty: number;
    }
`;

const chainClassCode = `
    import { ${concreteClassName} } from './${concreteClassName}';
    
    class ChainClass extends ${concreteClassName} {
        chainProperty: boolean;
    }
`;

const utilityClassCode = `
    import { ${genericClassName} } from './${genericClassName}';
    
    class UtilityClass {
        useGeneric(instance: ${genericClassName}<string>): void {
            // uses the generic class
        }
    }
`;

describe('Change the concretisation between several files', () => {
  it('should add new concretisation association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameGeneric, exportGenericClassCode)
      .addSourceFile(sourceFileNameConcrete, concreteClassWithoutConcretisationCode);
    const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameConcrete, importConcreteClassWithConcretisationCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameGeneric, exportGenericClassCode],
        [sourceFileNameConcrete, importConcreteClassWithConcretisationCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should remove the concretisation association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameGeneric, exportGenericClassCode)
      .addSourceFile(sourceFileNameConcrete, importConcreteClassWithConcretisationCode);
    const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameConcrete, concreteClassWithoutConcretisationCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameGeneric, exportGenericClassCode],
        [sourceFileNameConcrete, concreteClassWithoutConcretisationCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should retain the concretisation association when the generic class is modified', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameGeneric, exportGenericClassCode)
      .addSourceFile(sourceFileNameConcrete, importConcreteClassWithConcretisationCode);
    const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameGeneric, exportGenericClassChangedCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameGeneric, exportGenericClassChangedCode],
        [sourceFileNameConcrete, importConcreteClassWithConcretisationCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should handle 3-file project with generic class changes', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameGeneric, exportGenericClassCode)
      .addSourceFile(sourceFileNameConcrete, importConcreteClassWithConcretisationCode)
      .addSourceFile(sourceFileNameUtility, utilityClassCode);
    const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameGeneric, exportGenericClassChangedCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameGeneric, exportGenericClassChangedCode],
        [sourceFileNameConcrete, importConcreteClassWithConcretisationCode],
        [sourceFileNameUtility, utilityClassCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should handle a chain of the classes with concretisation when generic class changed', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameGeneric, exportGenericClassCode)
      .addSourceFile(sourceFileNameConcrete, importConcreteClassWithConcretisationCode)
      .addSourceFile(sourceFileNameChain, chainClassCode);
    const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameGeneric, exportGenericClassChangedCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameGeneric, exportGenericClassChangedCode],
        [sourceFileNameConcrete, importConcreteClassWithConcretisationCode],
        [sourceFileNameChain, chainClassCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should handle a chain of the classes with concretisation when generic class changed 2 times', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameGeneric, exportGenericClassCode)
      .addSourceFile(sourceFileNameConcrete, importConcreteClassWithConcretisationCode)
      .addSourceFile(sourceFileNameChain, chainClassCode);
    const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameGeneric, exportGenericClassChangedCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);
    testProjectBuilder.changeSourceFile(sourceFileNameGeneric, exportGenericClassChangedTwiceCode);
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameGeneric, exportGenericClassChangedTwiceCode],
        [sourceFileNameConcrete, importConcreteClassWithConcretisationCode],
        [sourceFileNameChain, chainClassCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});