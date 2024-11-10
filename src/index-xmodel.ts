import './styles/main.css'

import {ArcRotateCamera, Engine, HavokPlugin, MeshBuilder, Scene, Vector3} from '@babylonjs/core'
import '@babylonjs/inspector'
import {FakeFileSystem} from 'libbsp-js'
import {bjsLoadXModel} from './utils/xmodel'
import HavokPhysics from '@babylonjs/havok'

async function main() {
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.id = 'gameCanvas'
    document.body.appendChild(canvas)

    const engine = new Engine(canvas, true)
    const scene = new Scene(engine)

    const havokInstance = await HavokPhysics()
    const havokPlugin = new HavokPlugin(true, havokInstance)
    scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin)

    const ro = new ResizeObserver((entries) => {
        engine.resize()
    })
    ro.observe(canvas)

    scene.createDefaultCameraOrLight(true, true, true)
    scene.createDefaultEnvironment({
        createGround: true,
        createSkybox: true,
        enableGroundMirror: true,
    })
    const cam = scene.activeCamera as ArcRotateCamera
    cam.radius = 5
    cam.beta = 1
    cam.alpha = Math.PI / 2

    const inspector = await scene.debugLayer.show({
        embedMode: true,
    })

    FakeFileSystem.baseUrl = 'cod/'
    await FakeFileSystem.Init()


    engine.runRenderLoop(() => {
        scene.render()
    })

    MeshBuilder.CreateBox('box', {size: 1})

    const models = [
        // 'xmodel/mp_vehicle_civilian_car_d_red',
        // 'xmodel/0_forklift',
        // 'xmodel/1andbags_short',
        // 'xmodel/crate_misc1a',
        'xmodel/trenches_tree1',
    ]

    for (let model of models) {
        const modelFile = FakeFileSystem.FindFiles(model, null, false)
        await modelFile[0].download()
        const xModel = await bjsLoadXModel(modelFile[0], scene)

        inspector.select(xModel)
    }
}

main()
