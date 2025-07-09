/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClassDeclaration, Node, SourceFile } from "ts-morph";
import * as Famix from "../lib/famix/model/famix";
import { EntityDictionary } from "./EntityDictionary";

export class DefinitionTraverser {
    private visitor: DefinitionVisitor;

    constructor(visitor: DefinitionVisitor) {
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

export class DefinitionVisitor {
    private entityDictionary: EntityDictionary;

    constructor(entityDictionary: EntityDictionary) {
        this.entityDictionary = entityDictionary;
    }
    
    public process(node: Node, fmxScope?: Famix.ScriptEntity): void {
        if (node instanceof ClassDeclaration) {
            this.processClass(node, fmxScope);
            return;
        }
        // TODO: Implement the logic to handle other nodes
    }

    public processClass(node: ClassDeclaration, fmxScope?: Famix.ScriptEntity): void {
        // TODO: Implement the logic to handle class nodes
    }
}
