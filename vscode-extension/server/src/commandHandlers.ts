 
import {
  createConnection,
} from 'vscode-languageserver/node';
import { getOutputFilePath } from './utils';
import { generateModelForProject } from 'ts2famix';
import * as fs from "fs";
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

    const jsonOutput = generateModelForProject(tsConfigFilePath, baseUrl);
    
    const jsonFilePath = await getOutputFilePath(connection);

    fs.writeFile(jsonFilePath, jsonOutput, (err) => {
      if (err) { throw err; }
    });
  });
};
