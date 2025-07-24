import { ArrowFunction, ClassDeclaration, ModuleDeclaration, Node, SourceFile, SyntaxKind } from "ts-morph";

/**
 * ts-morph doesn't find classes in arrow functions, so we need to find them manually
 * @param s A source file 
 * @returns the ClassDeclaration objects found in arrow functions of the source file
 */
export function getClassesDeclaredInArrowFunctions(s: SourceFile | ModuleDeclaration): ClassDeclaration[] {
    const arrowFunctions = s.getDescendantsOfKind(SyntaxKind.ArrowFunction);
    const classesInArrowFunctions = arrowFunctions.map(f => getArrowFunctionClasses(f)).flat();
    return classesInArrowFunctions;
}

    
export function getArrowFunctionClasses(f: ArrowFunction): ClassDeclaration[] {
    const classes: ClassDeclaration[] = [];

    function findClasses(node: Node) {
        if (node.getKind() === SyntaxKind.ClassDeclaration) {
            classes.push(node as ClassDeclaration);
        }
        node.getChildren().forEach(findClasses);
    }

    findClasses(f);
    return classes;
}

export function getClassesFromSourceFile(sourceFile: SourceFile | ModuleDeclaration) {
    const classesInArrowFunctions = getClassesDeclaredInArrowFunctions(sourceFile);
    const classes = sourceFile.getClasses().concat(classesInArrowFunctions);
    return classes;
}
