import {BSP} from './Structs/BSP/BSP'

export class LibBSP {
    public static baseUrl: string
    private static fileData: Map<string, Uint8Array>

    /**
     * @param baseUrl Should be the root of the content, where it maps and texture folder resides
     * @param bspFile Should include maps/ folder
     * @constructor
     */
    public static async LoadBSP(baseUrl: string, bspFile: string): BSP {
        this.baseUrl = baseUrl
        this.fileData = new Map()

        await this.LoadFile(bspFile)

        // Load lumps
        const baseName = bspFile.substring(0, bspFile.length - 4)
        for (let i = 0; i < 100; i++) {
            let match = false
            for (const c of ['l', 'h', 's']) {
                const name = `${baseName}_${c}_${i}.lmp`
                await this.LoadFile(name)
                if (!this.fileData.has(name)) {
                    continue
                }
                match = true
            }
            if (!match) {
                break
            }
        }

        return new BSP(bspFile)
    }

    public static HasFile(name: string): boolean {
        return this.fileData.has(name)
    }

    public static GetFile(name: string): Uint8Array {
        if (this.fileData.has(name)) {
            return this.fileData.get(name)
        }
        return null
    }

    private static async LoadFile(path: string): Promise<void> {
        const response = await fetch(this.baseUrl + path)
        if (!response.ok) {
            return
        }
        const bytes = new Uint8Array(await response.arrayBuffer())
        this.fileData.set(path, bytes)
    }
}