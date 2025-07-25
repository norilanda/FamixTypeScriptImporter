import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    TextDocumentSyncKind,
    DidChangeWatchedFilesRegistrationOptions,
    WatchKind,
    RegistrationRequest,
} from 'vscode-languageserver/node';

import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { registerCommandHandlers } from './commandHandlers';
import { registerEventHandlers } from './eventHandlers';
import { getTsMorphProject } from 'ts2famix';
import { findTypeScriptProject } from './utils';
import { FamixProjectManager } from './model/FamixProjectManager';
import { FamixModelExporter } from './model/FamixModelExporter';

let hasDidChangeWatchedFilesCapability = false;

const connection = createConnection(ProposedFeatures.all);

const famixModelExporter = new FamixModelExporter(connection);
const famixProjectManager = new FamixProjectManager(famixModelExporter);

const documents = new TextDocuments(TextDocument);

documents.listen(connection);

connection.onInitialize((params) => {
    connection.console.log(`[Server(${process.pid})] Started and initialize received`);
    const capabilities = params.capabilities;

    hasDidChangeWatchedFilesCapability = !!(
        capabilities.workspace &&
        capabilities.workspace.didChangeWatchedFiles 
    );

    return {
        capabilities: {
            textDocumentSync: {
                openClose: true,
                change: TextDocumentSyncKind.None
            }
        }
    };
});

connection.onInitialized(async () => {
    if (hasDidChangeWatchedFilesCapability) {
        try {
            const registrationOptions: DidChangeWatchedFilesRegistrationOptions = {
                watchers: [
                    { 
                        globPattern: '{**/*.ts,**/tsconfig.json}', 
                        kind: WatchKind.Create | WatchKind.Change | WatchKind.Delete 
                    }
                ]
            };
    
            const ts2famixFileWatcherId = 'ts2famix-file-watcher';
            await connection.sendRequest(RegistrationRequest.type, {
                registrations: [{
                    id: ts2famixFileWatcherId,
                    method: 'workspace/didChangeWatchedFiles',
                    registerOptions: registrationOptions
                }]
            });
            
            initializeFamixProjectManager();
            registerEventHandlers(connection, famixProjectManager);
            
        } catch (error) {
            connection.console.error(`Failed to register file watcher: ${error}`);
            // TODO: Handle the error here
        }
    } else {
        //TODO: Handle the case when the client does not support dynamic registration
    }
    await connection.sendNotification('ts2famix/serverInitializationComplete');

});


registerCommandHandlers(connection, famixProjectManager);

connection.listen();

const initializeFamixProjectManager = async () => {
    const { tsConfigPath, baseUrl } = await findTypeScriptProject(connection);
    const tsMorphProject = getTsMorphProject(tsConfigPath, baseUrl);

    famixProjectManager.initializeFamixModel(tsMorphProject);
};
