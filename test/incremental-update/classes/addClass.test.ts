import { SourceFileChangeType } from "../../../src/analyze";
import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";
import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModel, getUpdateFileChangesMap } from "../incrementalUpdateTestHelper";

const sourceFileName = 'sourceCode.ts';
const existingClassName = 'ExistingClass';
const newClassName = 'NewClass';

describe('Add new classes to a single file', () => {
  const sourceCodeWithOneClass = `
    class ${existingClassName} { }
  `;

  const sourceCodeWithTwoClasses = `
    class ${existingClassName} { }

    class ${newClassName} { }
  `;

  it('should create new classes in the Famix representation', async () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder.addSourceFile(sourceFileName, sourceCodeWithOneClass);
    const { importer, famixRep } = testProjectBuilder.build();
    const sourceFile = testProjectBuilder.changeSourceFile(sourceFileName, sourceCodeWithTwoClasses);

    // TODO: I don't really like stubbing this method like this.
    // I think it is better to refactor this method (Importer.getUpdatedTsMorphSourceFiles) (and also to make it private).
    // Options to refactor: 
    // 1. move the operations that related to file system interaction to a separate class and then mock that class.
    const mockGetUpdatedTsMorphSourceFiles = jest.fn().mockResolvedValue(
      new Map([[SourceFileChangeType.Update, [sourceFile]]])
    );
    importer.getUpdatedTsMorphSourceFiles = mockGetUpdatedTsMorphSourceFiles;
    
    // act
    const fileChangesMap = getUpdateFileChangesMap(sourceFile);
    await importer.updateFamixModelIncrementally(fileChangesMap);

    // assert
    const expectedFamixRepo = createExpectedFamixModel(sourceFileName, sourceCodeWithTwoClasses);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});