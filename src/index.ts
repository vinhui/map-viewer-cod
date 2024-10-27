import './styles/main.css'
import './styles/mapSelector.css'

import {Engine, FlyCamera, HemisphericLight, Scene, Tools, TransformNode, Vector3} from '@babylonjs/core'
import '@babylonjs/inspector'
import {BSPLoader, EntityInstance, MeshCombineOptions} from './LibBSP-bjs/Util/BSPLoader'
import {FakeFileSystem} from './LibBSP/FakeFileSystem'
import {MapIndex} from './MapIndex'

console.log('Hello World!')

const canvas = document.createElement('canvas')
canvas.style.width = '100%'
canvas.style.height = '100%'
canvas.id = 'gameCanvas'
document.body.appendChild(canvas)

const engine = new Engine(canvas, true)
const scene = new Scene(engine)

const camera: FlyCamera = new FlyCamera('Camera', new Vector3(0, 0, -10), scene)
camera.attachControl()
camera.minZ = .01
camera.maxZ = 1000
const light1: HemisphericLight = new HemisphericLight('light1', new Vector3(1, 1, 0), scene)
light1.intensity = .5

scene.debugLayer.show({
    embedMode: true,
})

engine.runRenderLoop(() => {
    scene.render()
})

const spawns: EntityInstance[] = []
const urlParams = new URLSearchParams(location.search)
let map = 'maps/mp/mp_uo_harbor.bsp'
if (urlParams.has('m')) {
    map = urlParams.get('m')
}

let loader: BSPLoader

async function start() {
    FakeFileSystem.baseUrl = 'cod/'
    await FakeFileSystem.Init()

    const mapIndex = new MapIndex()
    await mapIndex.startIndexing()
    createMapSelector(mapIndex)

    loader = new BSPLoader()
    loader.settings = {
        scene: scene,
        path: map,
        // baseUrl: 'quake/',
        // path: 'maps/anodm4.bsp',
        meshCombineOptions: MeshCombineOptions.PerMaterial,
        scaleFactor: .1,
        curveTesselationLevel: 3,
        entityCreatedCallback: (inst: EntityInstance) => {
            if (inst.entity.className.includes('_spawn')) {
                spawns.push(inst)
            }
        },
    }

    loader.loadBSP()
        .then((root) => {
            // for (let childMesh of x.getChildMeshes()) {
            //     childMesh.showBoundingBox = true
            // }

            teleportToRandomSpawn(root)
            console.log('BSP loaded!')
        })
        .catch(e => {
            console.error('Failed to load:', e)
        })
}

start()

const buttonsContainer = document.createElement('div')
buttonsContainer.style.position = 'absolute'
buttonsContainer.style.left = '0'
buttonsContainer.style.top = '0'

const mapSelectorBtn = document.createElement('button')
mapSelectorBtn.innerText = 'Map Selector'
buttonsContainer.appendChild(mapSelectorBtn)
mapSelectorBtn.addEventListener('click', () => {
    document.querySelector('.map-selector-root').classList.remove('closed')
})

const randomSpawnBtn = document.createElement('button')
randomSpawnBtn.innerText = 'To Random Spawn'
buttonsContainer.appendChild(randomSpawnBtn)
randomSpawnBtn.addEventListener('click', () => {
    if (loader?.root) {
        teleportToRandomSpawn(loader.root)
    }
})

document.body.appendChild(buttonsContainer)

function teleportToRandomSpawn(root: TransformNode) {
    const spawn = randomFromArray(spawns)
    const spawnPos = getPosFromSpawn(spawn)
    camera.position.copyFrom(spawnPos)
    const angle = spawn.entity.angles.y + 180
    if (!isNaN(angle)) {
        camera.rotation.y = Tools.ToRadians(angle)
    }
}

function transformPoint(pos: { x: number, y: number, z: number }): Vector3 {
    return Vector3.TransformCoordinates(new Vector3(pos.x, pos.y, pos.z), loader.root.getWorldMatrix())
}

function getPosFromSpawn(spawn: EntityInstance): Vector3 {
    const p = transformPoint(spawn.entity.origin)
    p.scaleInPlace(.1)
    p.y += 10
    return p
}

function randomFromArray<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function createMapSelector(mapIndex: MapIndex) {
    const root = document.createElement('div')
    root.classList.add('map-selector-root', 'closed')
    root.addEventListener('click', (e) => {
        if (e.target === root)
            root.classList.add('closed')
    })

    const container = document.createElement('div')
    container.classList.add('container')
    root.appendChild(container)

    const header = document.createElement('h1')
    header.innerText = 'Map Selector'
    container.appendChild(header)

    const itemsContainer = document.createElement('div')
    itemsContainer.classList.add('items')
    for (let map of mapIndex.mapItems) {
        if (!map.bspFile) {
            continue
        }
        const itemElem = document.createElement('a')
        itemElem.classList.add('item')
        itemElem.href = '?m=' + map.bspFile.originalPath
        if (map.thumbnailPath) {
            itemElem.style.backgroundImage = `url(${FakeFileSystem.baseUrl}${map.thumbnailPath})`
        }

        const nameElem = document.createElement('p')
        nameElem.innerText = map.longname.replaceAll(/\^\d/g, '') ?? map.map
        // if (map.thumbnailPath) {
        //     nameElem.innerText += map.thumbnailPath
        // }
        itemElem.appendChild(nameElem)

        itemsContainer.appendChild(itemElem)
    }
    container.appendChild(itemsContainer)

    document.body.appendChild(root)
}