import './styles/main.css'

import {Color3, Engine, MeshBuilder, Scene} from '@babylonjs/core'
import '@babylonjs/inspector'
import {FakeFileSystem} from 'libbsp-js'
import {bjsLoadXModel} from './utils/xmodel'

async function main() {
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.id = 'gameCanvas'
    document.body.appendChild(canvas)

    const engine = new Engine(canvas, true)
    const scene = new Scene(engine)

    const ro = new ResizeObserver((entries) => {
        engine.resize()
    })
    ro.observe(canvas)

    scene.createDefaultCameraOrLight(true, true, true)
    scene.createDefaultEnvironment({
        createGround: false,
        createSkybox: true,
        groundColor: Color3.Black(),
        enableGroundMirror: false,
    })

    const inspector = await scene.debugLayer.show({
        embedMode: true,
    })

    FakeFileSystem.baseUrl = 'cod/'
    await FakeFileSystem.Init()


    engine.runRenderLoop(() => {
        scene.render()
    })

    MeshBuilder.CreateBox('box', {size: 1})

    const modelFile = FakeFileSystem.FindFiles('xmodel/barrels', null, false)
    await modelFile[0].download()
    const xModel = await bjsLoadXModel(modelFile[0], scene)

    inspector.select(xModel)
}

async function getFileBytes(path: string) {
    const files = FakeFileSystem.FindFiles(path, null, false)
    const file = files[0]
    await file.download()
    return file.bytes
}

main()
