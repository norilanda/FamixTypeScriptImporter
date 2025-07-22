import { Importer } from "../../src/analyze";
import { createProject } from "../testUtils";

export const getFqnForClass = (sourceFileName: string, className: string): string => {
    return `{${sourceFileName}}.${className}[ClassDeclaration]`;
};

export const createExpectedFamixModel = (sourceFileName: string, initialSourceCode: string) => {
    return createExpectedFamixModelForSeveralFiles([[sourceFileName, initialSourceCode]]);
};

export const createExpectedFamixModelForSeveralFiles = (sourceFilesWithCode: [string, string][]) => {
    const importer = new Importer();
    const project = createProject();

    for (const [fileName, code] of sourceFilesWithCode) {
        project.createSourceFile(fileName, code);
    }

    const famixRep = importer.famixRepFromProject(project);

    return famixRep;
};
