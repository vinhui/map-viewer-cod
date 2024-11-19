import {LoadingStep, MapIndex, MapItem} from './MapIndex'
import {FakeFileSystem} from 'libbsp-js'

export class MapSelector {
    private mapIndex: MapIndex = new MapIndex()
    private areMapsIndexed: boolean = false
    private rootElement: HTMLElement
    private itemsContainer: HTMLElement
    private loadingContainer: HTMLElement
    private loadingTextElement: HTMLElement
    private searchInput: HTMLInputElement
    private randomButtom: HTMLButtonElement

    private searchItems: { text: string, elem: HTMLElement }[] = []

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
                    case LoadingStep.SetupCache:
                        stepName = 'Creating Cache'
                        break
                }
                this.loadingTextElement.innerText = `${stepName}: ${Math.round(pct * 100)}%`
            }
            await this.mapIndex.startIndexing()
            this.areMapsIndexed = true
            this.loadingContainer.remove()
            this.createItemsHtml()
            this.searchInput.disabled = false
            this.randomButtom.disabled = false
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
            const prettyName = map.longname.replaceAll(/\^\d/g, '') ?? map.map
            nameElem.innerText = prettyName
            nameElem.innerHTML += `<br /><i>${map.map}</i>`
            itemElem.appendChild(nameElem)
            this.itemsContainer.appendChild(itemElem)
            this.searchItems.push({
                text: `${prettyName} ${map.map}`.toLowerCase(),
                elem: itemElem,
            })
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
        search.disabled = true
        this.searchInput = search
        container.appendChild(search)

        const random = document.createElement('button')
        random.innerText = 'Random'
        random.disabled = true
        this.randomButtom = random
        random.addEventListener('click', () => {
            const randItem = this.searchItems[Math.floor(Math.random() * this.searchItems.length)]
            randItem.elem.click()
        })
        container.appendChild(random)

        this.loadingContainer = document.createElement('div')
        const loadingHeader = document.createElement('h2')
        loadingHeader.innerText = 'Loading...'
        this.loadingContainer.appendChild(loadingHeader)
        this.loadingTextElement = document.createElement('span')
        this.loadingContainer.appendChild(this.loadingTextElement)
        container.appendChild(this.loadingContainer)

        this.itemsContainer = document.createElement('div')
        this.itemsContainer.classList.add('items')


        const debounce = (func: () => void, delay) => {
            let timer: number
            return () => {
                clearTimeout(timer)
                timer = window.setTimeout(() => func(), delay)
            }
        }

        const updateSearchResults = debounce(() => {
            const searchString = search.value.toLowerCase()
            for (const item of this.searchItems) {
                const match = item.text.includes(searchString)
                item.elem.style.display = match ? 'flex' : 'none'
            }
        }, 300)

        search.addEventListener('keydown', () => updateSearchResults())

        container.appendChild(this.itemsContainer)
        document.body.appendChild(this.rootElement)
    }
}