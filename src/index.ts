import './styles/main.css'
import {Engine, FlyCamera, HemisphericLight, Scene, Vector3} from '@babylonjs/core'
import '@babylonjs/inspector'
import {BSPLoader, MeshCombineOptions} from './LibBSP-bjs/Util/BSPLoader'

console.log('Hello World!')

const canvas = document.createElement('canvas')
canvas.style.width = '100%'
canvas.style.height = '100%'
canvas.id = 'gameCanvas'
document.body.appendChild(canvas)

const engine = new Engine(canvas, true)
const scene = new Scene(engine)

const camera: FlyCamera = new FlyCamera('Camera', Vector3.Zero(), scene)
camera.attachControl()
const light1: HemisphericLight = new HemisphericLight('light1', new Vector3(1, 1, 0), scene)

scene.debugLayer.show({
    embedMode: true,
})

engine.runRenderLoop(() => {
    scene.render()
})

const loader = new BSPLoader()
loader.settings = {
    scene: scene,
    baseUrl: 'cod/',
    path: 'maps/mp/amusement_park.bsp',
    // baseUrl: 'quake/',
    // path: 'maps/anodm4.bsp',
    meshCombineOptions: MeshCombineOptions.PerMaterial,
    scaleFactor: 1,
    curveTesselationLevel: 3,
}
loader.loadBSP()
    .then(() => {
        console.log('BSP loaded!')
    })
    .catch(e => {
        console.error('Failed to load:', e)
    })
