export class SourceFileData<T> {
    protected currentSourceFileName: string | undefined = "default";
    protected sourceFileMap: Map<string, T> = new Map();

    public setSourceFileName(name: string): void {
        this.currentSourceFileName = name;
    }

    public removeBySourceFileName(sourceFileName: string): void {
        this.sourceFileMap.delete(sourceFileName);
    }
}

export class SourceFileDataMap<TKey, TValue> extends SourceFileData<Map<TKey, TValue>> {
    public get(key: TKey): TValue | undefined {
        for (const sourceFileMap of this.sourceFileMap.values()) {
            const value = sourceFileMap.get(key);
            if (value !== undefined) {
                return value;
            }
        }
        return undefined;
    }

    public set(key: TKey, value: TValue): void {
        if (!this.currentSourceFileName) {
            throw new Error("Current source file name is not set.");
        }

        for (const [, sourceFileMap] of this.sourceFileMap.entries()) {
            if (sourceFileMap.has(key)) {
                return;
            }
        }
        
        let innerMap = this.sourceFileMap.get(this.currentSourceFileName);
        if (!innerMap) {
            innerMap = new Map<TKey, TValue>();
            this.sourceFileMap.set(this.currentSourceFileName, innerMap);
        }
        innerMap.set(key, value);
    }

    public has(key: TKey): boolean {
        for (const sourceFileMap of this.sourceFileMap.values()) {
            if (sourceFileMap.has(key)) {
                return true;
            }
        }
        return false;
    }

    public delete(key: TKey): boolean {
        for (const sourceFileMap of this.sourceFileMap.values()) {
            if (sourceFileMap.delete(key)) {
                return true;
            }
        }
        return false;
    }

    public *entries(): IterableIterator<[TKey, TValue]> {
        for (const sourceFileMap of this.sourceFileMap.values()) {
            for (const entry of sourceFileMap.entries()) {
                yield entry;
            }
        }
    }

    public *keys(): IterableIterator<TKey> {
        for (const sourceFileMap of this.sourceFileMap.values()) {
            for (const key of sourceFileMap.keys()) {
                yield key;
            }
        }
    }

    public getBySourceFileName(sourceFileName: string): Map<TKey, TValue> {
        return this.sourceFileMap.get(sourceFileName) ?? new Map<TKey, TValue>();
    }
}

export class SourceFileDataArray<T> extends SourceFileData<Array<T>> {
    public push(value: T): void {
        if (!this.currentSourceFileName) {
            throw new Error("Current source file name is not set.");
        }
        if (!this.sourceFileMap.has(this.currentSourceFileName)) {
            this.sourceFileMap.set(this.currentSourceFileName, []);
        }
        this.sourceFileMap.get(this.currentSourceFileName)!.push(value);
    }

    public getBySourceFileName(sourceFileName: string): T[] {
        return this.sourceFileMap.get(sourceFileName) ?? [];
    }

    public getAll(): T[] {
        const allValues: T[] = [];
        for (const values of this.sourceFileMap.values()) {
            allValues.push(...values);
        }
        return allValues;
    }
}

export class SourceFileDataSet<T> extends SourceFileData<Set<T>> {
    public add(value: T): void {
        if (!this.currentSourceFileName) {
            throw new Error("Current source file name is not set.");
        }
        if (!this.sourceFileMap.has(this.currentSourceFileName)) {
            this.sourceFileMap.set(this.currentSourceFileName, new Set<T>());
        }
        const currentSet = this.sourceFileMap.get(this.currentSourceFileName)!;
        currentSet.add(value);
    }

    public has(value: T): boolean {
        if (!this.currentSourceFileName) {
            throw new Error("Current source file name is not set.");
        }
        const currentSet = this.sourceFileMap.get(this.currentSourceFileName);
        return currentSet?.has(value) ?? false;
    }
}