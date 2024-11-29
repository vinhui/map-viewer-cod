import './styles/main.css'

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
} from '@babylonjs/core'
import '@babylonjs/inspector'
import HavokPhysics from '@babylonjs/havok'
import {FirstPersonPlayer} from '../FirstPersonPlayer'

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

scene.debugLayer.show({
    embedMode: true,
})


async function start() {
    const havokInstance = await HavokPhysics()
    const havokPlugin = new HavokPlugin(true, havokInstance)
    scene.enablePhysics(gravityVector, havokPlugin)
    havokPlugin.setTimeStep(1 / 20)

    const light1: HemisphericLight = new HemisphericLight('light1', new Vector3(1, 1, 0), scene)
    light1.intensity = .5
    const boxesRoot = new TransformNode('Boxes Root')
    for (let x = -5; x < 5; x++) {
        for (let y = -5; y < 5; y++) {
            const b = MeshBuilder.CreateBox('box', {size: 1})
            b.parent = boxesRoot
            b.position.set(x * 2, 5, y * 2 + 15)
            b.rotation = new Vector3(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
            const mat = new StandardMaterial('box-mat')
            mat.diffuseColor = Color3.FromHSV(Math.random() * 360, .75, 1)
            b.material = mat
            new PhysicsAggregate(b, PhysicsShapeType.BOX, {mass: 10})
        }
    }

    const ramp = MeshBuilder.CreateBox('Ramp', {size: 4})
    ramp.rotation.x = Tools.ToRadians(60)
    ramp.position.y = -.8
    ramp.position.z += 5
    new PhysicsAggregate(ramp, PhysicsShapeType.BOX, {mass: 0, friction: .9})

    const ground = MeshBuilder.CreateGround('ground', {width: 100, height: 100})
    new PhysicsAggregate(ground, PhysicsShapeType.BOX, {mass: 0, friction: 1})

    const player = new FirstPersonPlayer(scene, havokPlugin)

    engine.runRenderLoop(() => {
        scene.render()
    })
}

start()
