import { EntityWithSourceAnchor } from "../lib/famix/model/famix/sourced_entity";
import { EntityDictionary } from "../famix_functions/EntityDictionary";
import { Class, ImportClause, IndexedFileAnchor, Interface } from "../lib/famix/model/famix";

export const getTransientDependentAssociations = (
    entityDictionary: EntityDictionary,
    changedFilesNames: string []
) => {
    const importClauses = entityDictionary.famixRep.getImportClauses();

    const transientDependentAssociations: Set<EntityWithSourceAnchor> = new Set();

    const unprocessedFiles: Set<string> = new Set(changedFilesNames);
    const processedFiles: Set<string> = new Set();

    while (unprocessedFiles.size > 0) {
        const file: string = unprocessedFiles.values().next().value!;
        unprocessedFiles.delete(file);
        processedFiles.add(file);

        importClauses.forEach(importClause => {
            if (importClause.moduleSpecifier === file) {
                transientDependentAssociations.add(importClause);
                if (importClause.importedEntity.isStub) {
                    transientDependentAssociations.add(importClause.importedEntity);
                }

                const importingEntityFileName = (importClause.sourceAnchor as IndexedFileAnchor).fileName;

                if (!unprocessedFiles.has(importingEntityFileName) && !processedFiles.has(importingEntityFileName)) {
                    unprocessedFiles.add(importingEntityFileName);
                }

                getOtherTransientDependencies(entityDictionary, importClause, transientDependentAssociations);
            }
        });
    }

    return transientDependentAssociations;
};

const getOtherTransientDependencies = (
    entityDictionary: EntityDictionary,
    importClause: ImportClause,
    transientDependentAssociations: Set<EntityWithSourceAnchor>
) => {
    const importedEntity = importClause.importedEntity;
    const importingEntityFileName = (importClause.sourceAnchor as IndexedFileAnchor).fileName;

    const inheritances = entityDictionary.famixRep.getInheritances();

    if (importedEntity instanceof Class || importedEntity instanceof Interface || importedEntity.isStub) {
        inheritances.forEach(inheritance => {
            const doesInheritanceContainImportedEntity = inheritance.superclass === importClause.importedEntity && 
                importingEntityFileName === (inheritance.sourceAnchor as IndexedFileAnchor).fileName;

            if (doesInheritanceContainImportedEntity) {
                transientDependentAssociations.add(inheritance);
            } else if (inheritance.superclass.isStub) {
                transientDependentAssociations.add(inheritance);
                transientDependentAssociations.add(inheritance.superclass);
            }
        });                
    }

    // TODO: find the other associations between the imported entity and the sourceFile
};