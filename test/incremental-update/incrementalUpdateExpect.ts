import { FamixBaseElement } from "../../src";
import { FamixRepository } from "../../src";
import { Class, PrimitiveType } from "../../src";

const classCompareFunction = (actual: FamixBaseElement, expected: FamixBaseElement) => {
    const actualAsClass = actual as Class;
    const expectedAsClass = expected as Class;
    
    return actualAsClass.fullyQualifiedName === expectedAsClass.fullyQualifiedName;
    // TODO: add more properties to compare
};

const primitiveTypeCompareFunction = (actual: FamixBaseElement, expected: FamixBaseElement) => {
    const actualAsPrimitiveType = actual as PrimitiveType;
    const expectedAsPrimitiveType = expected as PrimitiveType;
    
    return actualAsPrimitiveType.fullyQualifiedName === expectedAsPrimitiveType.fullyQualifiedName;
};

export const expectRepositoriesToHaveSameStructure = (actual: FamixRepository, expected: FamixRepository) => {
    // TODO: use the expectElementsToBeSame for more types
    // TODO: test cyclomatic complexity
    expectElementsToBeEqualSize(actual, expected, "Access");
    expectElementsToBeEqualSize(actual, expected, "Accessor");
    expectElementsToBeEqualSize(actual, expected, "Alias");
    expectElementsToBeEqualSize(actual, expected, "ArrowFunction");
    expectElementsToBeEqualSize(actual, expected, "BehaviorEntity");
    expectElementsToBeEqualSize(actual, expected, "Class");
    expectElementsToBeSame(actual, expected, "Class", classCompareFunction);
    expectElementsToBeEqualSize(actual, expected, "Comment");
    expectElementsToBeEqualSize(actual, expected, "Concretisation");
    expectElementsToBeEqualSize(actual, expected, "ContainerEntity");
    expectElementsToBeEqualSize(actual, expected, "Decorator");
    expectElementsToBeEqualSize(actual, expected, "Entity");
    expectElementsToBeEqualSize(actual, expected, "EnumValue");
    expectElementsToBeEqualSize(actual, expected, "Enum");
    expectElementsToBeEqualSize(actual, expected, "Function");
    expectElementsToBeEqualSize(actual, expected, "ImportClause");
    // expectElementsToBeEqualSize(actual, expected, "IndexedFileAnchor");
    expectElementsToBeEqualSize(actual, expected, "Inheritance");
    expectElementsToBeEqualSize(actual, expected, "Interface");
    expectElementsToBeEqualSize(actual, expected, "Invocation");
    expectElementsToBeEqualSize(actual, expected, "Method");
    expectElementsToBeEqualSize(actual, expected, "Module");
    expectElementsToBeEqualSize(actual, expected, "NamedEntity");
    expectElementsToBeEqualSize(actual, expected, "ParameterConcretisation");
    expectElementsToBeEqualSize(actual, expected, "ParameterType");
    expectElementsToBeEqualSize(actual, expected, "Parameter");
    expectElementsToBeEqualSize(actual, expected, "ParametricArrowFunction");
    expectElementsToBeEqualSize(actual, expected, "ParametricClass");
    expectElementsToBeEqualSize(actual, expected, "ParametricFunction");
    expectElementsToBeEqualSize(actual, expected, "ParametricInterface");
    expectElementsToBeEqualSize(actual, expected, "ParametricMethod");
    expectElementsToBeEqualSize(actual, expected, "PrimitiveType");
    expectElementsToBeSame(actual, expected, "PrimitiveType", primitiveTypeCompareFunction);
    expectElementsToBeEqualSize(actual, expected, "Property");
    expectElementsToBeEqualSize(actual, expected, "Reference");
    expectElementsToBeEqualSize(actual, expected, "ScopingEntity");
    // expectElementsToBeEqualSize(actual, expected, "ScriptEntity");
    expectElementsToBeEqualSize(actual, expected, "SourceAnchor");
    expectElementsToBeEqualSize(actual, expected, "SourceLanguage");
    expectElementsToBeEqualSize(actual, expected, "SourcedEntity");
    expectElementsToBeEqualSize(actual, expected, "StructuralEntity");
    expectElementsToBeEqualSize(actual, expected, "Type");
    expectElementsToBeEqualSize(actual, expected, "Variable");

    // expect(actual._getAllEntities().size).toEqual(expected._getAllEntities().size);
};

const expectElementsToBeEqualSize = (actual: FamixRepository, expected: FamixRepository, type: string) => {
    const actualEntities = actual._getAllEntitiesWithType(type);
    const expectedEntities = expected._getAllEntitiesWithType(type);
    expect(actualEntities.size).toEqual(expectedEntities.size);
};

const expectElementsToBeSame = (
    actual: FamixRepository, 
    expected: FamixRepository, 
    type: string, 
    compareFunction: (actual: FamixBaseElement, expected: FamixBaseElement) => boolean
) => {
    const actualEntities = actual._getAllEntitiesWithType(type);
    const expectedEntities = expected._getAllEntitiesWithType(type);
    
    for (const actualEntity of actualEntities) {
        const expectedEntity = Array.from(expectedEntities).find(entity => 
            compareFunction(actualEntity, entity)
        );
        expect(expectedEntity).toBeDefined();
    }
};
