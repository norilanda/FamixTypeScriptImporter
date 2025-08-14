import { expectRepositoriesToHaveSameStructure } from "../incrementalUpdateExpect";
import { IncrementalUpdateProjectBuilder } from "../incrementalUpdateProjectBuilder";
import { createExpectedFamixModelForSeveralFiles, getUpdateFileChangesMap } from "../incrementalUpdateTestHelper";

const exportSourceFileName = 'exportSource.ts';
const reexportSourceFileName = 'reexportSource.ts';
const importSourceFileName = 'importSource.ts';
const existingClassName = 'ExistingClass';

describe('Re-export functionality with inheritance changes', () => {
  const initialExportCode = `
    export class ${existingClassName} { }
  `;

  const exportCodeWithInheritance = `
    class BaseClass { }
    
    export class ${existingClassName} extends BaseClass { }
  `;

  const reexportCode = `
    export { ${existingClassName} } from './${exportSourceFileName}';
  `;

  const importCode = `
    import { ${existingClassName} } from './${reexportSourceFileName}';

    class ConsumerClass extends ${existingClassName} { }
  `;

  it('should maintain re-export associations when original export adds inheritance', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
        .addSourceFile(exportSourceFileName, initialExportCode)
        .addSourceFile(reexportSourceFileName, reexportCode)
        .addSourceFile(importSourceFileName, importCode);

    const { importer, famixRep } = testProjectBuilder.build();
    
    // act - change the original export file to add inheritance
    const sourceFile = testProjectBuilder.changeSourceFile(exportSourceFileName, exportCodeWithInheritance);
    const fileChangesMap = getUpdateFileChangesMap(sourceFile);
    importer.updateFamixModelIncrementally(fileChangesMap);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [exportSourceFileName, exportCodeWithInheritance],
        [reexportSourceFileName, reexportCode],
        [importSourceFileName, importCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should establish correct re-export chain from scratch', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
        .addSourceFile(exportSourceFileName, initialExportCode)
        .addSourceFile(reexportSourceFileName, '')
        .addSourceFile(importSourceFileName, '');

    const { importer, famixRep } = testProjectBuilder.build();
    
    // act - add re-export
    let sourceFile = testProjectBuilder.changeSourceFile(reexportSourceFileName, reexportCode);
    let fileChangesMap = getUpdateFileChangesMap(sourceFile);
    importer.updateFamixModelIncrementally(fileChangesMap);

    // act - add import from re-export
    sourceFile = testProjectBuilder.changeSourceFile(importSourceFileName, importCode);
    fileChangesMap = getUpdateFileChangesMap(sourceFile);
    importer.updateFamixModelIncrementally(fileChangesMap);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [exportSourceFileName, initialExportCode],
        [reexportSourceFileName, reexportCode],
        [importSourceFileName, importCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should handle removing re-export while maintaining original export', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
        .addSourceFile(exportSourceFileName, initialExportCode)
        .addSourceFile(reexportSourceFileName, reexportCode)
        .addSourceFile(importSourceFileName, importCode);

    const { importer, famixRep } = testProjectBuilder.build();
    
    // act - remove re-export
    const sourceFile = testProjectBuilder.changeSourceFile(reexportSourceFileName, '');
    const fileChangesMap = getUpdateFileChangesMap(sourceFile);
    importer.updateFamixModelIncrementally(fileChangesMap);

    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
      [exportSourceFileName, initialExportCode],
      [reexportSourceFileName, ''],
      [importSourceFileName, importCode]
    ]);
    
    // assert
    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });

  it('should update re-export associations when import file changes to use original export', () => {
    // arrange
    const testProjectBuilder = new IncrementalUpdateProjectBuilder();
    testProjectBuilder
        .addSourceFile(exportSourceFileName, initialExportCode)
        .addSourceFile(reexportSourceFileName, reexportCode)
        .addSourceFile(importSourceFileName, importCode);

    const { importer, famixRep } = testProjectBuilder.build();
    
    // act - change import to use original export instead of re-export
    const directImportCode = `
      import { ${existingClassName} } from './${exportSourceFileName}';

      class ConsumerClass {
        private instance: ${existingClassName};

        constructor() {
          this.instance = new ${existingClassName}();
        }
      }
    `;
    
    const sourceFile = testProjectBuilder.changeSourceFile(importSourceFileName, directImportCode);
    const fileChangesMap = getUpdateFileChangesMap(sourceFile);
    importer.updateFamixModelIncrementally(fileChangesMap);

    // assert
    const expectedFamixRepo = createExpectedFamixModelForSeveralFiles([
        [exportSourceFileName, initialExportCode],
        [reexportSourceFileName, reexportCode],
        [importSourceFileName, directImportCode]
    ]);

    expectRepositoriesToHaveSameStructure(famixRep, expectedFamixRepo);
  });
});
