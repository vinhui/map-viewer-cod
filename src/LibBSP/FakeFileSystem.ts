export class FakeFileSystem {
    /**
     * Set this before calling the Download functions
     */
    public static caseInsensitive = true
    private static fileData = new Map<string, Uint8Array>()

    public static FileExists(path: string): boolean {
        if (!path) {
            return false
        }

        if (this.caseInsensitive) {
            path = path.toLowerCase()
        }
        return this.fileData.has(path)
    }

    public static ReadFile(path: string): Uint8Array {
        if (this.caseInsensitive) {
            path = path.toLowerCase()
        }
        return this.fileData.get(path)
    }

    public static GetFilesInDirectory(path: string, regex?: RegExp): string[] {
        if (path.startsWith('/')) {
            path = path.substring(1)
        }

        if (this.caseInsensitive) {
            path = path.toLowerCase()
        }

        const items: string[] = []
        for (let filePath of this.fileData.keys()) {
            if (filePath.startsWith(path)) {
                if (!regex) {
                    items.push(filePath)
                } else if (regex.test(filePath)) {
                    items.push(filePath)
                }
            }
        }

        return items
    }

    public static Unload(path: string): void {
        if (this.caseInsensitive) {
            path = path.toLowerCase()
        }

        if (this.fileData.has(path)) {
            this.fileData.delete(path)
        }
    }

    public static UnloadAll(): void {
        this.fileData.clear()
    }

    public static async DownloadFile(baseUrl: string, path: string): Promise<boolean> {
        if (path.startsWith('/')) {
            path = path.substring(1)
        }

        if (this.FileExists(path)) {
            return true
        }

        if (!baseUrl.endsWith('/')) {
            baseUrl += '/'
        }

        const response = await fetch(baseUrl + path)
        if (!response.ok) {
            return false
        }
        const bytes = new Uint8Array(await response.arrayBuffer())
        this.fileData.set(path, bytes)
        return true
    }

    public static async DownloadFiles(baseUrl: string, paths: string[]): Promise<void> {
        const promises: Promise<boolean>[] = []
        for (let path of paths) {
            promises.push(this.DownloadFile(baseUrl, path))
        }
        await Promise.all(promises)
    }
}