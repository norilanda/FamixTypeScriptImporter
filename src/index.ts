/** This is just an export example,
 * we will need to export tools that are needed later */

import { Project } from 'ts-morph';
import { Importer } from './analyze';
import { FamixRepository } from './lib/famix/famix_repository';

export { Importer, SourceFileChangeType } from './analyze';
export { FamixRepository } from "./lib/famix/famix_repository";
export {FamixBaseElement} from "./lib/famix/famix_base_element";
export * from "./lib/famix/model/famix";

export const generateModelForProject = (tsConfigFilePath: string, baseUrl: string) => {
    const project = new Project({
      tsConfigFilePath,
      compilerOptions: {
        baseUrl: baseUrl,
      }
    });

    const importer = new Importer();
    const famixRep: FamixRepository = importer.famixRepFromProject(project);

    const jsonOutput = famixRep.export({ format: "json" });

    return jsonOutput;
};

export const getTsMorphProject = (tsConfigFilePath: string, baseUrl: string) => {
    return new Project({
        tsConfigFilePath,
        compilerOptions: {
            baseUrl: baseUrl,
        }
    });
};