import {FakeFileSystem, File} from './LibBSP/FakeFileSystem'

type MapDisplayItem = {
    map: string
    bspFile: File
    longname: string
    thumbnailPath?: string
}

export class MapIndex {
    private displayItems: MapDisplayItem[] = []

    public async init() {
        const arenaFiles = FakeFileSystem.FindFiles('', /\.arena$/i, false)
        await FakeFileSystem.DownloadFiles(arenaFiles)

        for (let arenaFile of arenaFiles) {
            this.displayItems.push(this.parseArenaFile(arenaFile))
        }

        const bspFiles = FakeFileSystem.FindFiles('', /\.bsp$/i, false)
        for (let bspFile of bspFiles) {
            const fileName = bspFile.nameWithoutExtension

            const match = this.displayItems.find(x => x.map === fileName)
            if (!match) {
                this.displayItems.push({
                    map: fileName,
                    bspFile: bspFile,
                    longname: fileName,
                })
            } else {
                match.bspFile = bspFile
            }
        }

        for (let item of this.displayItems) {
            const matches = FakeFileSystem.FindFiles('mp/levelshots/' + item.map, null, false)
            if (matches.length > 0) {
                console.log(item)
                item.thumbnailPath = matches[0].originalPath
            }
        }

        // console.log(this.displayItems)
    }

    private parseArenaFile(file: File): MapDisplayItem {
        const lines = file.text.split('\n')
        const obj: MapDisplayItem = {
            map: '',
            bspFile: null,
            longname: file.originalPath,
        }
        const parseValue = (value: string): string => {
            return value.replaceAll(/^\s*"|"\s*$/gm, '')
        }

        for (let line of lines) {
            line = line.trim()
            if (line.startsWith('map')) {
                obj.map = parseValue(line.replace('map', ''))
            } else if (line.startsWith('longname')) {
                obj.longname = parseValue(line.replace('longname', ''))
            }
        }
        return obj
    }
}