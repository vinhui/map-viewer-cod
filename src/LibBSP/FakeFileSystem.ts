const textDecoder = new TextDecoder()

export class File {
    public readonly originalPath: string
    public readonly caseInsensitivePath: string
    public readonly nameWithExtension: string
    public readonly nameWithoutExtension: string
    public readonly extension: string
    public readonly directory: string
    public bytes: Uint8Array

    public failedToDownload: boolean

    constructor(path: string) {
        if (path.startsWith('/')) {
            path = path.substring(1)
        }

        this.originalPath = path
        this.caseInsensitivePath = path.toLowerCase()

        this.nameWithExtension = path.split('/').pop()
        const dotSplit = this.nameWithExtension.split('.')
        this.nameWithoutExtension = dotSplit.shift()
        this.extension = '.' + dotSplit.pop()
        this.directory = this.originalPath.substring(0, this.originalPath.lastIndexOf('/') + 1)
    }

    public get isLoaded(): boolean {
        return this.bytes?.length > 0
    }

    public get text(): string {
        if (!this.isLoaded) {
            return null
        }
        return textDecoder.decode(this.bytes)
    }

    public async download(): Promise<boolean> {
        if (this.failedToDownload) {
            return false
        }
        if (this.isLoaded) {
            return true
        }

        const response = await fetch(FakeFileSystem.baseUrl + this.originalPath)
        if (!response.ok) {
            this.failedToDownload = true
            return false
        }
        this.bytes = new Uint8Array(await response.arrayBuffer())
        this.failedToDownload = false
        return true
    }
}

export class FakeFileSystem {
    public static baseUrl = './'
    private static fileData = new Map<string, File>()
    private static _hasLoadedIndex = false

    public static get hasLoadedIndex(): boolean {
        return this._hasLoadedIndex
    }

    public static async Init() {
        if (!this.baseUrl.endsWith('/')) {
            this.baseUrl += '/'
        }

        const response = await fetch(`${this.baseUrl}index`)
        if (response.ok) {
            console.log('Found index file')
            const text = await response.text()
            const items = text.split(/\r?\n/)
            for (let item of items) {
                this.fileData.set(item.toLowerCase(), new File(item))
            }
            this._hasLoadedIndex = true
        }
    }

    public static FileExists(path: string, loadedOnly: boolean = true): boolean {
        if (!path) {
            return false
        }

        path = path.toLowerCase()
        if (!this.fileData.has(path)) {
            return false
        }
        if (!loadedOnly) {
            return true
        }
        const item = this.fileData.get(path)
        return item.isLoaded
    }

    public static GetFile(path: string): File {
        path = path.toLowerCase()
        return this.fileData.get(path)
    }

    public static FindFiles(startsWithPath: string, regex?: RegExp, loadedOnly: boolean = true): File[] {
        if (startsWithPath.startsWith('/')) {
            startsWithPath = startsWithPath.substring(1)
        }

        startsWithPath = startsWithPath.toLowerCase()

        let items: File[] = []
        for (let [path, file] of this.fileData.entries()) {
            if (path.startsWith(startsWithPath)) {
                if (!regex) {
                    items.push(file)
                } else if (regex.test(path)) {
                    items.push(file)
                }
            }
        }
        if (loadedOnly) {
            items = items.filter(x => x.isLoaded)
        }

        return items
    }

    public static Unload(path: string): void {
        path = path.toLowerCase()

        if (this.fileData.has(path)) {
            this.fileData.delete(path)
        }
    }

    public static UnloadAll(): void {
        this.fileData.clear()
    }

    public static async DownloadFile(file: string | File): Promise<boolean> {
        if (!file) {
            throw new Error('ArgumentNullException')
        }

        let item: File
        if (typeof file === 'string') {
            if (file.startsWith('/')) {
                file = file.substring(1)
            }

            file = file.toLowerCase()

            if (!this.fileData.has(file)) {
                return false
            }

            item = this.fileData.get(file)
        } else {
            item = file
        }

        if (item.isLoaded) {
            return true
        }

        await item.download()
        return !item.failedToDownload
    }

    public static async DownloadFiles(paths: (string | File)[]): Promise<void> {
        const promises: Promise<boolean>[] = []
        for (let path of paths) {
            promises.push(this.DownloadFile(path))
        }
        await Promise.all(promises)
    }
}