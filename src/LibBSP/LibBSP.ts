import {BSP} from './Structs/BSP/BSP'
import {FakeFileSystem} from './FakeFileSystem'

export class LibBSP {
    /**
     * @param baseUrl Should be the root of the content, where it maps and texture folder resides
     * @param bspFile Should include maps/ folder
     * @constructor
     */
    public static async LoadBSP(baseUrl: string, bspFile: string): Promise<BSP> {
        if (!await FakeFileSystem.DownloadFile(baseUrl, bspFile)) {
            throw new Error(`Failed to download bsp file: ${baseUrl}/${bspFile}`)
        }

        // Load lumps
        const baseName = bspFile.substring(0, bspFile.length - 4)
        for (let i = 0; i < 100; i++) {
            let match = false
            for (const c of ['l', 'h', 's']) {
                const name = `${baseName}_${c}_${i}.lmp`
                if (await FakeFileSystem.DownloadFile(baseUrl, name)) {
                    match = true
                    break
                }
            }
            if (!match) {
                break
            }
        }

        return new BSP({
            path: bspFile,
            data: FakeFileSystem.ReadFile(bspFile),
        })
    }
}