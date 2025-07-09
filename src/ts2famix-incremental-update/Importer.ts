 
import { Logger } from "tslog";
import { Project, SourceFile } from "ts-morph";
import { EntityDictionary } from "./EntityDictionary";
import { DefinitionTraverser, DefinitionVisitor } from "./DefinitionTraverser";
import { ReferenceTraverser, ReferenceVisitor } from "./ReferencesTraverser";
import { ReferencesManager } from "./ReferencesManager";

export const logger = new Logger({ name: "ts2famix", minLevel: 2 });

export class Importer {
    private project = new Project(
        {
            compilerOptions: {
                baseUrl: "./test_src"
            }
        }
    );
    private entityDictionary = new EntityDictionary();
    private definitionTraverser: DefinitionTraverser;
    private referenceTraverser: ReferenceTraverser;
    private referenceManager: ReferencesManager;

    constructor(project: Project) {
        this.project = project;
        this.definitionTraverser = new DefinitionTraverser(new DefinitionVisitor(this.entityDictionary));
        this.referenceTraverser = new ReferenceTraverser(new ReferenceVisitor(this.entityDictionary));
        this.referenceManager = new ReferencesManager(this.entityDictionary);
        this.buildFamixModelFromScratch();
    }

    public buildFamixModelFromScratch(): void {
        const sourceFiles: SourceFile[] = this.project.getSourceFiles().filter(f => f.getFilePath().endsWith('.ts'));

        sourceFiles.forEach(file => {
            // 1. Create Famix entities
            this.definitionTraverser.traverseSourceFile(file);
            // 2. Create Famix relations
            this.referenceTraverser.traverseSourceFile(file);
        });        
    }

    public updateFamixModelIncrementally(sourceFiles: SourceFile[]): void {        
        sourceFiles.forEach(file => {
            // 1. Remove all the source files entities from the Famix model
            this.entityDictionary.removeSourceFileEntities(file.getFilePath());
            // 2. Create the Famix entities for the source files
            this.definitionTraverser.traverseSourceFile(file);
        }); 
        
        // 3. Update the Famix model relations for the source files
        const filesToUpdateReferences = this.referenceManager.findChangedSourceFiles(sourceFiles);
        filesToUpdateReferences.forEach(file => {
            this.referenceManager.removeAssociationsForFilePath(file.getFilePath());
        });
        filesToUpdateReferences.forEach(file => {
            this.referenceTraverser.traverseSourceFile(file);
        });
    }

}
