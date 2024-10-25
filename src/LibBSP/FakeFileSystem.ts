export class FakeFileSystem {
    private static fileData = new Map<string, Uint8Array>()

    public static FileExists(path: string): boolean {
        return this.fileData.has(path)
    }

    public static ReadFile(path: string): Uint8Array {
        return this.fileData.get(path)
    }

    public static Unload(path: string): void {
        if (this.fileData.has(path)) {
            this.fileData.delete(path)
        }
    }

    public static UnloadAll(): void {
        this.fileData.clear()
    }

    public static async DownloadFile(baseUrl: string, path: string): Promise<boolean> {
        if (this.FileExists(path)) {
            return true
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