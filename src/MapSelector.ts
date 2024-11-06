import {LoadingStep, MapIndex, MapItem} from './MapIndex'
import {FakeFileSystem} from 'libbsp-js'

export class MapSelector {
    private mapIndex: MapIndex = new MapIndex()
    private areMapsIndexed: boolean = false
    private rootElement: HTMLElement
    private itemsContainer: HTMLElement
    private loadingContainer: HTMLElement
    private loadingTextElement: HTMLElement

    constructor() {
        this.createMainHtml()
    }

    public async show() {
        if (!this.areMapsIndexed && !this.mapIndex.isIndexing) {
            this.mapIndex.onLoadingProgress = (step, pct) => {
                let stepName = ''
                switch (step) {
                    case LoadingStep.DownloadingArenaFiles:
                        stepName = 'Downloading arena files'
                        break
                    case LoadingStep.ParseArenaFiles:
                        stepName = 'Parsing arena files'
                        break
                    case LoadingStep.FindBspFiles:
                        stepName = 'Searching for BSP files'
                        break
                    case LoadingStep.FindLevelShots:
                        stepName = 'Looking for levelShots'
                        break
                    case LoadingStep.SortResults:
                        stepName = 'Sorting Results'
                        break
                }
                this.loadingTextElement.innerText = `${stepName}: ${Math.round(pct * 100)}%`
            }
            await this.mapIndex.startIndexing()
            this.areMapsIndexed = true
            this.loadingContainer.remove()
            this.createItemsHtml()
        }
    }

    private createItemsHtml() {
        const generateForMap = (map: MapItem) => {
            const itemElem = document.createElement('a')
            itemElem.classList.add('item')
            itemElem.href = '?m=' + map.bspFile.originalPath
            if (map.thumbnailPath) {
                itemElem.style.backgroundImage = `url(${FakeFileSystem.baseUrl}${map.thumbnailPath})`
            }

            const nameElem = document.createElement('p')
            nameElem.innerText = map.longname.replaceAll(/\^\d/g, '') ?? map.map
            nameElem.innerHTML += `<br /><i>${map.map}</i>`
            itemElem.appendChild(nameElem)
            this.itemsContainer.appendChild(itemElem)
        }

        const items = this.mapIndex.mapItems.filter(x => x.bspFile)
        for (let item of items) {
            if (!item) continue
            generateForMap(item)
        }
    }

    private createMainHtml() {
        this.rootElement = document.createElement('div')
        this.rootElement.classList.add('map-selector-root', 'closed')
        this.rootElement.addEventListener('click', (e) => {
            if (e.target === this.rootElement)
                this.rootElement.classList.add('closed')
        })

        const container = document.createElement('div')
        container.classList.add('container')
        this.rootElement.appendChild(container)

        const header = document.createElement('h1')
        header.innerText = 'Map Selector'
        container.appendChild(header)

        const search = document.createElement('input')
        search.placeholder = 'Search'
        container.appendChild(search)

        this.loadingContainer = document.createElement('div')
        const loadingHeader = document.createElement('h2')
        loadingHeader.innerText = 'Loading...'
        this.loadingContainer.appendChild(loadingHeader)
        this.loadingTextElement = document.createElement('span')
        this.loadingContainer.appendChild(this.loadingTextElement)
        container.appendChild(this.loadingContainer)

        this.itemsContainer = document.createElement('div')
        this.itemsContainer.classList.add('items')


        const updateSearchResults = () => {
            for (const child of this.itemsContainer.children) {
                const c = child as HTMLElement
                const match = c.innerText.toLowerCase().includes(search.value.toLowerCase())
                c.style.display = match ? 'flex' : 'none'
            }
        }

        let timer = -1
        search.addEventListener('keydown', () => {
            window.clearTimeout(timer)
            timer = window.setTimeout(() => {
                updateSearchResults()
            }, 500)
        })

        container.appendChild(this.itemsContainer)
        document.body.appendChild(this.rootElement)
    }
}