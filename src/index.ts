import './styles/main.css'
import './styles/mapSelector.css'

import {
    Color3,
    Engine,
    HavokPlugin,
    HemisphericLight,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeType,
    Scene,
    StandardMaterial,
    Tools,
    TransformNode,
    Vector3,
    VertexBuffer,
} from '@babylonjs/core'
import '@babylonjs/inspector'
import {BSPLoader, EntityInstance, MeshCombineOptions} from './LibBSP-bjs/Util/BSPLoader'
import {FakeFileSystem} from 'libbsp-js'
import {MapIndex, MapItem} from './MapIndex'
import HavokPhysics from '@babylonjs/havok'
import {FirstPersonPlayer} from './FirstPersonPlayer'

const canvas = document.createElement('canvas')
canvas.style.width = '100%'
canvas.style.height = '100%'
canvas.id = 'gameCanvas'
document.body.appendChild(canvas)

const engine = new Engine(canvas, true)
const scene = new Scene(engine)
const gravityVector = new Vector3(0, -9.81, 0)
// const gravityVector = new Vector3(0, -1, 0)
// scene.gravity = gravityVector

const light1: HemisphericLight = new HemisphericLight('light1', new Vector3(1, 1, 0), scene)
light1.intensity = 1.5

const spawns: EntityInstance[] = []
const urlParams = new URLSearchParams(location.search)
let map = 'maps/mp/mp_uo_harbor.bsp'
if (urlParams.has('m')) {
    map = urlParams.get('m')
}

let loader: BSPLoader
let player: FirstPersonPlayer

async function start() {
    const havokInstance = await HavokPhysics()
    const havokPlugin = new HavokPlugin(true, havokInstance)
    scene.enablePhysics(gravityVector, havokPlugin)

    player = new FirstPersonPlayer(scene, havokPlugin)

    FakeFileSystem.baseUrl = 'cod/'
    await FakeFileSystem.Init()

    loader = new BSPLoader()
    loader.settings = {
        scene: scene,
        path: map,
        // baseUrl: 'quake/',
        // path: 'maps/anodm4.bsp',
        meshCombineOptions: MeshCombineOptions.PerMaterial,
        scaleFactor: 1,
        curveTesselationLevel: 3,
        entityCreatedCallback: (inst: EntityInstance) => {
            if (inst.entity.className.includes('_spawn') && !inst.entity.model) {
                spawns.push(inst)
            }
        },
    }

    loader.loadBSP()
        .then((root) => {
            for (let childMesh of root.getChildMeshes()) {
                const verticesData = childMesh.getVerticesData(VertexBuffer.PositionKind)
                if (verticesData && verticesData.length > 0) {
                    new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass: 0}, scene)
                }
            }

            teleportToRandomSpawn(root)
            const mat = new StandardMaterial('spawn', scene)
            mat.emissiveColor = Color3.Red()
            for (let spawn of spawns) {
                const m = MeshBuilder.CreateSphere('spawn ' + spawn.entity.className, {diameter: 1, segments: 3})
                m.position = transformPoint(spawn.entity.origin)
                m.material = mat
            }
            console.log('BSP loaded!')
        })
        .catch(e => {
            console.error('Failed to load:', e)
        })


    engine.runRenderLoop(() => {
        scene.render()
    })

    const mapIndex = new MapIndex()
    await mapIndex.startIndexing()
    createMapSelector(mapIndex)
    mapSelectorBtn.disabled = false
}

start()

const buttonsContainer = document.createElement('div')
buttonsContainer.style.position = 'absolute'
buttonsContainer.style.left = '0'
buttonsContainer.style.top = '0'

const mapSelectorBtn = document.createElement('button')
mapSelectorBtn.innerText = 'Map Selector'
mapSelectorBtn.disabled = true
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

const inspectorBtn = document.createElement('button')
inspectorBtn.innerText = 'Open Inspector'
buttonsContainer.appendChild(inspectorBtn)
inspectorBtn.addEventListener('click', () => {
    scene.debugLayer.show({
        embedMode: true,
    })
})

document.body.appendChild(buttonsContainer)

function teleportToRandomSpawn(root: TransformNode) {
    const spawn = randomFromArray(spawns)
    if (!spawn) {
        console.log(spawns)
        return
    }
    const spawnPos = getPosFromSpawn(spawn)
    player.position.copyFrom(spawnPos)
    player.position.y += .1
    const angle = spawn.entity.angles.y + 180
    if (!isNaN(angle)) {
        player.rotation = Tools.ToRadians(angle)
    }
}

function transformPoint(pos: { x: number, y: number, z: number }): Vector3 {
    return Vector3.TransformCoordinates(new Vector3(pos.x, pos.y, pos.z), loader.root.getWorldMatrix())
}

function getPosFromSpawn(spawn: EntityInstance): Vector3 {
    const p = transformPoint(spawn.entity.origin)
    // p.scaleInPlace(MeshUtils.inch2MeterScale)
    p.y += 1
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

    const search = document.createElement('input')
    search.placeholder = 'Search'
    container.appendChild(search)

    const itemsContainer = document.createElement('div')
    itemsContainer.classList.add('items')
    const items = mapIndex.mapItems.filter(x => x.bspFile)

    const generateForMap = (map: MapItem) => {
        const itemElem = document.createElement('a')
        itemElem.classList.add('item')
        itemElem.href = '?m=' + map.bspFile.originalPath
        if (map.thumbnailPath) {
            itemElem.style.backgroundImage = `url(${FakeFileSystem.baseUrl}${map.thumbnailPath})`
        }

        const nameElem = document.createElement('p')
        nameElem.innerText = map.longname.replaceAll(/\^\d/g, '') ?? map.map
        itemElem.appendChild(nameElem)

        itemsContainer.appendChild(itemElem)
    }

    const generateForItems = (items: MapItem[]) => {
        for (let item of items) {
            if (!item) continue
            generateForMap(item)
        }
    }

    for (let i = 0; i < items.length; i += 50) {
        window.setTimeout(() => {
            generateForItems(items.slice(i, i + 50))
        }, i * 100)
    }
    container.appendChild(itemsContainer)

    search.addEventListener('keydown', () => {
        for (const child of itemsContainer.children) {
            const c = child as HTMLElement
            const match = c.innerText.toLowerCase().includes(search.value.toLowerCase())
            c.style.display = match ? 'flex' : 'none'
        }
    })

    document.body.appendChild(root)
}