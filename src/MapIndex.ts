import {FakeFileSystem, File} from 'libbsp-js'
import {animationFrame} from './utils/async'
import {deflate, inflate} from 'pako'
import {asciiFromArray, asciiToArray} from './utils/array'

export type MapItem = {
    map: string
    bspFile: File
    longname: string
    thumbnailPath?: string
}

export enum LoadingStep {
    DownloadingArenaFiles,
    ParseArenaFiles,
    FindBspFiles,
    FindLevelShots,
    SortResults
}

export class MapIndex {
    public onLoadingProgress?: (step: LoadingStep, pct: number) => void

    private _mapItems: MapItem[] = []

    public get mapItems(): MapItem[] {
        return this._mapItems
    }

    private _isIndexing: boolean = false

    public get isIndexing(): boolean {
        return this._isIndexing
    }

    async startIndexing() {
        if (this._isIndexing) {
            return
        }

        const sessionStorageContent = window.sessionStorage.getItem('mapIndex')
        if (sessionStorageContent) {
            const asArray = asciiToArray(sessionStorageContent)
            const decompressed = inflate(asArray, {to: 'string'})
            this._mapItems = JSON.parse(decompressed)
            return
        }

        this._isIndexing = true
        if (this.onLoadingProgress)
            this.onLoadingProgress(LoadingStep.DownloadingArenaFiles, 0)

        const arenaFiles = FakeFileSystem.FindFiles('', /\.arena$/i, false)

        for (let i = 0; i < arenaFiles.length; i += 20) {
            if (this.onLoadingProgress)
                this.onLoadingProgress(LoadingStep.DownloadingArenaFiles, i / arenaFiles.length)

            const chunk = arenaFiles.slice(i, i + 20)
            await FakeFileSystem.DownloadFiles(chunk)
        }

        if (this.onLoadingProgress)
            this.onLoadingProgress(LoadingStep.ParseArenaFiles, 0)
        await animationFrame()

        for (let i = 0; i < arenaFiles.length; i++) {
            let arenaFile = arenaFiles[i]
            if (this.onLoadingProgress)
                this.onLoadingProgress(LoadingStep.ParseArenaFiles, i / arenaFiles.length)

            this._mapItems.push(this.parseArenaFile(arenaFile))
        }
        if (this.onLoadingProgress)
            this.onLoadingProgress(LoadingStep.FindBspFiles, 0)
        await animationFrame()

        const bspFiles = FakeFileSystem.FindFiles('', /\.bsp$/i, false)
        for (let i = 0; i < bspFiles.length; i++) {
            let bspFile = bspFiles[i]
            const fileName = bspFile.nameWithoutExtension

            if (this.onLoadingProgress)
                this.onLoadingProgress(LoadingStep.FindBspFiles, i / bspFiles.length)

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

        if (this.onLoadingProgress)
            this.onLoadingProgress(LoadingStep.FindLevelShots, 0)
        await animationFrame()

        for (let i = 0; i < this._mapItems.length; i++) {
            let item = this._mapItems[i]
            if (this.onLoadingProgress)
                this.onLoadingProgress(LoadingStep.FindLevelShots, i / this._mapItems.length)

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
        }

        if (this.onLoadingProgress)
            this.onLoadingProgress(LoadingStep.SortResults, 0)
        await animationFrame()
        this.mapItems.sort((a, b) => a.longname.localeCompare(b.longname))

        const storageValue = JSON.stringify(this.mapItems)
        const compressed = deflate(storageValue)
        const compressedAsString = asciiFromArray(compressed)
        window.sessionStorage.setItem('mapIndex', compressedAsString)
        this._isIndexing = false
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