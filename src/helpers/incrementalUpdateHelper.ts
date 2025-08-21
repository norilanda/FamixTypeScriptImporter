import { Class } from '../lib/famix/model/famix/class';
import { FamixBaseElement } from "../lib/famix/famix_base_element";
import { ImportClause, IndexedFileAnchor, Inheritance, Interface, NamedEntity } from '../lib/famix/model/famix';
import { EntityWithSourceAnchor } from '../lib/famix/model/famix/sourced_entity';
import { SourceFileChangeType } from '../analyze';
import { SourceFile } from 'ts-morph';
import { getAbsoluteFileNameFromFamixIndexFileAnchor, getFamixIndexFileAnchorFileName } from './famixIndexFileAnchorHelper';
import { FamixRepository } from '../lib/famix/famix_repository';
import { EntityDictionary } from 'src/famix_functions/EntityDictionary';
import { getTransientDependentAssociations } from './transientDependencyResolverHelper';

export const getSourceFilesToUpdate = (
    dependentAssociations: EntityWithSourceAnchor[],
    sourceFileChangeMap: Map<SourceFileChangeType, SourceFile[]>,
    allSourceFiles: SourceFile[]
) => {
    const sourceFilesToEnsureEntities = [
        ...(sourceFileChangeMap.get(SourceFileChangeType.Create) || []),
        ...(sourceFileChangeMap.get(SourceFileChangeType.Update) || []),
    ];

    const dependentFileNames = getDependentSourceFileNames(dependentAssociations);
    const dependentFileNamesToAdd = Array.from(dependentFileNames)
        .map(fileName => getAbsoluteFileNameFromFamixIndexFileAnchor(fileName))
        .filter(
            fileName => !Array.from(sourceFileChangeMap.values())
            .flat().some(sourceFile => sourceFile.getFilePath() === fileName));

    const dependentFiles = allSourceFiles.filter(
        sourceFile => dependentFileNamesToAdd.includes(sourceFile.getFilePath())
    );

    return sourceFilesToEnsureEntities.concat(dependentFiles);
};

const getDependentSourceFileNames = (dependentAssociations: EntityWithSourceAnchor[]) => {
    const dependentFileNames = new Set<string>();

    dependentAssociations.forEach(entity => {
            // todo: ? sourceAnchor instead of indexedfileAnchor
        dependentFileNames.add((entity.sourceAnchor as IndexedFileAnchor).fileName);
    });

    return dependentFileNames;
};

export const getDependentAssociations = (entities: FamixBaseElement[]) => {
    const dependentAssociations: EntityWithSourceAnchor[] = [];

    entities.forEach(entity => {
        dependentAssociations.push(...getDependentAssociationsForEntity(entity));
    });

    return dependentAssociations;
};

export const getTransientDependentEntities = (
    entityDictionary: EntityDictionary, 
    sourceFileChangeMap: Map<SourceFileChangeType, SourceFile[]>,
) => {
    const absoluteProjectPath = entityDictionary.getAbsolutePath();

    const changedFilesNames = Array.from(sourceFileChangeMap.values())
        .flat()
        .map(sourceFile => getFamixIndexFileAnchorFileName(sourceFile.getFilePath(), absoluteProjectPath));

    const transientDependentAssociations = getTransientDependentAssociations(entityDictionary, changedFilesNames);

    return transientDependentAssociations;
};

const getDependentAssociationsForEntity = (entity: FamixBaseElement) => {
    const dependentAssociations: EntityWithSourceAnchor[] = [];

    const addElementFileToSet = (association: EntityWithSourceAnchor) => {
        dependentAssociations.push(association);
    };

    if (entity instanceof Class) {
        Array.from(entity.subInheritances).forEach(inheritance => {
            addElementFileToSet(inheritance);
        });
    } else if (entity instanceof Interface) {
        Array.from(entity.subInheritances).forEach(inheritance => {
            addElementFileToSet(inheritance);
        });
    }
    
    if (entity instanceof NamedEntity) {
        Array.from(entity.incomingImports).forEach(importClause => {
            addElementFileToSet(importClause);
        });
    }
    // TODO: add other associations

    return dependentAssociations;
};

export const removeDependentAssociations = (
    famixRep: FamixRepository,
    dependentAssociations: EntityWithSourceAnchor[]) => {
    // NOTE: removing the depending associations because they will be recreated later
    famixRep.removeElements(dependentAssociations);
    famixRep.removeElements(dependentAssociations.map(x => x.sourceAnchor));

    dependentAssociations.forEach(association => {
        if (association instanceof Inheritance) {
            association.superclass.removeSubInheritance(association);
            association.subclass.removeSuperInheritance(association);
        } else if (association instanceof ImportClause) {
            association.importedEntity.incomingImports.delete(association);
            association.importingEntity.outgoingImports.delete(association);
        }
    });
};