/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClassDeclaration, Node, SourceFile } from "ts-morph";
import { EntityDictionary } from "./EntityDictionary";

export class ReferenceTraverser {
    private visitor: ReferenceVisitor;

    constructor(visitor: ReferenceVisitor) {
        this.visitor = visitor;
    }

    public traverseSourceFile(file: SourceFile): void {
        this.traverse(file);
    }

    private traverse(node: Node) {
        this.visitor.process(node);
        node.forEachChild(child => this.traverse(child));
    }
}

export class ReferenceVisitor {
    private entityDictionary: EntityDictionary;

    constructor(entityDictionary: EntityDictionary) {
        this.entityDictionary = entityDictionary;
    }
    public process(node: Node): void {
        if (node instanceof ClassDeclaration) {
            this.processClass(node);
            return;
        }
        // TODO: Implement the logic to handle other nodes
    }

    public processClass(node: ClassDeclaration): void {
        this.processInheritances(node);
        this.processConcretisations(node);
        // TODO: Implement the logic to handle class nodes
    }

    private processInheritances(node: ClassDeclaration): void {
        //
    }
    private processConcretisations(node: ClassDeclaration): void {
        //
    }
}