import './styles/main.css'
import {ArcRotateCamera, Engine, HemisphericLight, Scene, Vector3} from '@babylonjs/core'
import '@babylonjs/inspector'
import {BSPLoader} from './BSP/BabylonBSPLoader'

console.log('Hello World!')

const canvas = document.createElement('canvas')
canvas.style.width = '100%'
canvas.style.height = '100%'
canvas.id = 'gameCanvas'
document.body.appendChild(canvas)

const engine = new Engine(canvas, true)
const scene = new Scene(engine)

const camera: ArcRotateCamera = new ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene)
camera.attachControl(canvas, true)
const light1: HemisphericLight = new HemisphericLight('light1', new Vector3(1, 1, 0), scene)

scene.debugLayer.show({
    embedMode: true,
})

engine.runRenderLoop(() => {
    scene.render()
})

const loader = new BSPLoader('cod/', 'maps/mp/funfair.bsp')
loader.load().then(
    () => {
        console.log('Map loaded!')
    },
)