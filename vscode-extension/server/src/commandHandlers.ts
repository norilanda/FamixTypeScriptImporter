import {
  createConnection,
} from 'vscode-languageserver/node';
import { getOutputFilePath } from './utils';
import { Importer, FamixRepository } from 'ts2famix';
import * as fs from "fs";
import { Project } from 'ts-morph';
import path from 'path';

export const registerCommandHandlers = (connection: ReturnType<typeof createConnection>) => {
  // TODO: params type
  connection.onRequest("generateModelForProject", async (params) => {
    const baseUrl = params?.filePath;
    if (!baseUrl) {
      connection.console.error('No filePath provided for model generation.');
      return;
    }
    
    const tsConfigFilePath = baseUrl.endsWith('tsconfig.json')
      ? baseUrl
      : path.join(baseUrl, 'tsconfig.json');

    // const baseUrl = "C:/Users/ACER/Projects/moose/Emojiopoly";
    // const tsConfigFilePath = "C:/Users/ACER/Projects/moose/Emojiopoly/tsconfig.json";

    const project = new Project({
      tsConfigFilePath,
      compilerOptions: {
        baseUrl: baseUrl,
      }
    });

    const importer = new Importer();
    const famixRep: FamixRepository = importer.famixRepFromProject(project);

    const jsonOutput = famixRep.export({ format: "json" });
    
    const jsonFilePath = await getOutputFilePath(connection);

    fs.writeFile(jsonFilePath, jsonOutput, (err) => {
      if (err) { throw err; }
    });
  });
};
