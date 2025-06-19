import {
	createConnection,
} from 'vscode-languageserver/node';

export async function getOutputFilePath(connection: ReturnType<typeof createConnection>): Promise<string> {
  const config = await connection.workspace.getConfiguration({ section: 'ts2famix' });
  return config.outputFilePath || '';
}