import { FileChangeType, FileEvent } from 'vscode-languageserver/node';

export type FileChangeAction = 'create' | 'change' | 'delete';

type FileChangeMapAction = 'create' | 'change' | 'delete' | 'removeFromMap';

export class FileChangesMap {
    private fileChangesMap: Map<string, FileChangeAction> = new Map<string, FileChangeAction>();

    public addFile(change: FileEvent) {	
        const uri = change.uri;
        const actionFromEvent = getChangeTypeFromEvent(change);
        const actionToSetInMap = this.calculateFileChangeAction(actionFromEvent, uri);
        if (actionToSetInMap === 'removeFromMap') {
            this.fileChangesMap.delete(uri);
            return;
        }
        this.fileChangesMap.set(uri, actionToSetInMap);
    };
	
    public getAndClearFileChangesMap(): ReadonlyMap<string, FileChangeAction> {
        const mapCopy = new Map<string, FileChangeAction>(this.fileChangesMap);
        this.fileChangesMap.clear();
        return mapCopy;
    }

    private calculateFileChangeAction (newAction: FileChangeAction, filePath: string): FileChangeMapAction {
        const previousAction = this.fileChangesMap.get(filePath);

        switch (newAction) {
            case 'change': {
                if (previousAction === 'create') {
                    return 'create';
                }
                return 'change';
            }
            case 'create': {
                if (previousAction === 'delete') {
                    return 'change';
                }
                return 'create';
            }
            case 'delete': {
                if (previousAction === 'create') {
                    return 'removeFromMap';
                }
                return 'delete';
            }
            default:
                throw new Error(`Unknown file change action: ${newAction}`);
        }
    }
}

const getChangeTypeFromEvent = (event: FileEvent): FileChangeAction => {
    switch (event.type) {
        case FileChangeType.Created:
            return 'create';
        case FileChangeType.Changed:
            return 'change';
        case FileChangeType.Deleted:
            return 'delete';
        default:
            throw new Error(`Unknown file change type: ${event.type}`);
    }
};
