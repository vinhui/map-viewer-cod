import {FakeFileSystem, File} from 'libbsp-js'
import {animationFrame} from './utils/async'

export type MapItem = {
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
        for (let i = 0; i < arenaFiles.length; i += 10) {
            const chunk = arenaFiles.slice(i, i + 10)
            await FakeFileSystem.DownloadFiles(chunk)
        }

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

        for (let i = 0; i < this._mapItems.length; i++) {
            let item = this._mapItems[i]
            const matches = FakeFileSystem.FindFiles('levelshots/' + item.map, null, false)
            if (matches.length > 1) {
                for (let match of matches) {
                    if (match.extension.toLowerCase() === '.dds') {
                        continue
                    }
                    item.thumbnailPath = match.originalPath
                    break
                }
            } else if (matches.length > 1) {
                item.thumbnailPath = matches[0].originalPath
            }
            if (i % 10 === 0) {
                await animationFrame()
                await animationFrame()
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