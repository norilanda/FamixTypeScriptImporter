import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModelForSeveralFiles } from "../incrementalUpdateTestHelper";
import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";

const classNameThatContainsOtherClass = 'ClassThatContainsOther';
const classNameThatIsUsedByOther = 'ClassUsedByOther';

const sourceFileNameClassThatContains = `${classNameThatContainsOtherClass}.ts`;
const sourceFileNameClassUsedByOther = `${classNameThatIsUsedByOther}.ts`;
const sourceFileNameUsesClass = 'sourceCodeUsesClass.ts';

const classUsedByOtherCode = `
    class ${classNameThatIsUsedByOther} {
        method2(): number {
            return 42;
        }
    }
`;

const exportClassUsedByOtherCode = `
    export ${classUsedByOtherCode}
`;

const classThatContainsWithoutCompositionCode = `
    class ${classNameThatContainsOtherClass} {
        protected property1: string;
        protected method1() {}
    }
`;

const importClassThatContainsWithCompositionCode = `
    import { ${classNameThatIsUsedByOther} } from './${classNameThatIsUsedByOther}';

    class ${classNameThatContainsOtherClass} {
        protected property1: string;
        protected method1() {}
        private other: ${classNameThatIsUsedByOther};
    }
`;

const exportClassUsedByOtherChangedCode = `
    export class ${classNameThatIsUsedByOther} {
        method2Changed(): number {
            return 42;
        }
    }
`;

const fileCodeThatUsesClass = `
    import { ${classNameThatIsUsedByOther} } from './${classNameThatIsUsedByOther}';
    
    const instance = new ${classNameThatIsUsedByOther}();
`;

describe('Change the composition between several files', () => {
  it('should add new composition association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameClassUsedByOther, exportClassUsedByOtherCode)
      .addSourceFile(sourceFileNameClassThatContains, classThatContainsWithoutCompositionCode);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameClassThatContains, importClassThatContainsWithCompositionCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameClassUsedByOther, exportClassUsedByOtherCode],
        [sourceFileNameClassThatContains, importClassThatContainsWithCompositionCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should remove the composition association', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameClassUsedByOther, exportClassUsedByOtherCode)
      .addSourceFile(sourceFileNameClassThatContains, importClassThatContainsWithCompositionCode);

    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameClassThatContains, classThatContainsWithoutCompositionCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameClassUsedByOther, exportClassUsedByOtherCode],
        [sourceFileNameClassThatContains, classThatContainsWithoutCompositionCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should retain the composition association when the composed class is modified', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameClassThatContains, importClassThatContainsWithCompositionCode)
      .addSourceFile(sourceFileNameClassUsedByOther, exportClassUsedByOtherCode);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileNameClassUsedByOther, exportClassUsedByOtherChangedCode);

    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameClassUsedByOther, exportClassUsedByOtherChangedCode],
        [sourceFileNameClassThatContains, importClassThatContainsWithCompositionCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should handle 3-file project with superclass usage and inheritance changes', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
      .addSourceFile(sourceFileNameClassUsedByOther, exportClassUsedByOtherCode)
      .addSourceFile(sourceFileNameClassThatContains, importClassThatContainsWithCompositionCode)
      .addSourceFile(sourceFileNameUsesClass, fileCodeThatUsesClass);
      const { importer, famixRep } = testProjectBuilder.build();

    const sourceFile = testProjectBuilder
      .changeSourceFile(sourceFileNameClassUsedByOther, exportClassUsedByOtherChangedCode);
      
    // act
    importer.updateFamixModelIncrementally([sourceFile]);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [sourceFileNameClassUsedByOther, exportClassUsedByOtherChangedCode],
        [sourceFileNameClassThatContains, importClassThatContainsWithCompositionCode],
        [sourceFileNameUsesClass, fileCodeThatUsesClass]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});