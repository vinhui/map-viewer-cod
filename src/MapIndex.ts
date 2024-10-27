import {FakeFileSystem, File} from './LibBSP/FakeFileSystem'

type MapItem = {
    map: string
    bspFile: File
    longname: string
    thumbnailPath?: string
}

export class MapIndex {
    private _mapItems: MapItem[] = []

    public get mapItems(): MapItem[] {
        return this._mapItems
    }

    public async startIndexing() {
        const arenaFiles = FakeFileSystem.FindFiles('', /\.arena$/i, false)
        await FakeFileSystem.DownloadFiles(arenaFiles)

        for (let arenaFile of arenaFiles) {
            this._mapItems.push(this.parseArenaFile(arenaFile))
        }

        const bspFiles = FakeFileSystem.FindFiles('', /\.bsp$/i, false)
        for (let bspFile of bspFiles) {
            const fileName = bspFile.nameWithoutExtension

            const match = this._mapItems.find(x => x.map === fileName)
            if (!match) {
                this._mapItems.push({
                    map: fileName,
                    bspFile: bspFile,
                    longname: fileName,
                })
            } else {
                match.bspFile = bspFile
            }
        }

        for (let item of this._mapItems) {
            const matches = FakeFileSystem.FindFiles('levelshots/' + item.map, null, false)
            if (matches.length > 0) {
                item.thumbnailPath = matches[0].originalPath
            }
        }

        this.mapItems.sort((a, b) => a.longname.localeCompare(b.longname))
    }

    private parseArenaFile(file: File): MapItem {
        const lines = file.text.split('\n')
        const obj: MapItem = {
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