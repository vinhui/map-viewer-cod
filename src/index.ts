import './styles/main.css'
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
let map = 'mp/mp_uo_harbor.bsp'
if (urlParams.has('map')) {
    map = urlParams.get('map')
}

let loader: BSPLoader

async function start() {
    FakeFileSystem.baseUrl = 'cod/'
    await FakeFileSystem.Init()

    const mapIndex = new MapIndex()
    await mapIndex.init()

    loader = new BSPLoader()
    loader.settings = {
        scene: scene,
        path: 'maps/' + map,
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

const btn = document.createElement('button')
btn.innerText = 'To Random Spawn'
btn.style.position = 'absolute'
btn.style.left = '0'
btn.style.top = '0'
document.body.appendChild(btn)
btn.addEventListener('click', () => {
    if (loader?.root) {
        teleportToRandomSpawn(loader.root)
    }
})

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