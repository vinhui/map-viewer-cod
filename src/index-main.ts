import './styles/main.css'
import './styles/mapSelector.css'

import {
    Color3,
    Engine,
    HavokPlugin,
    HemisphericLight,
    Light,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsRaycastResult,
    PhysicsShapeType,
    PointLight,
    Scene,
    Sound,
    StandardMaterial,
    Tools,
    TransformNode,
    Vector3,
    VertexBuffer,
} from '@babylonjs/core'
import '@babylonjs/inspector'
import {BSPLoader, EntityInstance, MeshCombineOptions} from './LibBSP-bjs/Util/BSPLoader'
import {FakeFileSystem} from 'libbsp-js'
import HavokPhysics from '@babylonjs/havok'
import {FirstPersonPlayer} from './FirstPersonPlayer'
import {MapSelector} from './MapSelector'
import {parseSoundAliasLine} from './utils/soundalias'
import {MeshUtils} from './LibBSP-bjs/Util/MeshUtils'
import {bjsLoadXModel} from './utils/xmodel'

const canvas = document.createElement('canvas')
canvas.style.width = '100%'
canvas.style.height = '100%'
canvas.id = 'gameCanvas'
document.body.appendChild(canvas)

const engine = new Engine(canvas, true)
const scene = new Scene(engine)
const gravityVector = new Vector3(0, -9.81, 0)
Engine.audioEngine.useCustomUnlockedButton = true

const ro = new ResizeObserver((entries) => {
    engine.resize()
})
ro.observe(canvas)

window.addEventListener(
    'click',
    () => {
        if (!Engine.audioEngine.unlocked) {
            Engine.audioEngine.unlock()
        }
    },
    {once: true},
)

const light1: HemisphericLight = new HemisphericLight('light1', new Vector3(1, 1, 0), scene)
light1.intensity = 1
light1.lightmapMode = Light.LIGHTMAP_SHADOWSONLY

const spawns: EntityInstance[] = []
const spawnsRoot = new TransformNode('Spawns', scene)
spawnsRoot.setEnabled(false)
const xmodelsRoot = new TransformNode('XModels', scene)
const urlParams = new URLSearchParams(location.search)
let map = 'maps/mp/mp_uo_harbor.bsp'
if (urlParams.has('m')) {
    map = urlParams.get('m')
}

let havok: HavokPlugin
let loader: BSPLoader
let player: FirstPersonPlayer
let mapSelector: MapSelector

async function findAmbientSound() {
    const gscFilePath = map.substring(0, map.length - 3) + 'gsc'
    const matches = FakeFileSystem.FindFiles(gscFilePath, null, false)
    if (!matches || matches.length === 0) {
        return
    }
    const gsc = matches[0]
    if (!await gsc.download()) {
        return
    }
    const gscText = gsc.text
    const regexMatches = gscText.match(/(?<!\/\/\s*)ambientPlay\("(.*?)"\)/)
    if (!regexMatches) {
        return
    }
    const soundName = regexMatches[1]
    if (!soundName) {
        return
    }

    const soundAliases = FakeFileSystem.FindFiles('soundaliases/', /\.csv$/mi, false)

    for (let i = 0; i < soundAliases.length; i += 20) {
        const chunk = soundAliases.slice(i, i + 20)
        await FakeFileSystem.DownloadFiles(chunk)

        for (let file of chunk) {
            const content = file.text
            for (const line of content.split('\n')) {
                if (!line.startsWith(soundName + ',')) {
                    continue
                }
                const obj = parseSoundAliasLine(line)
                const soundFiles = FakeFileSystem.FindFiles(`sound/${obj.file}`, null, false)
                if (soundFiles.length === 0) {
                    console.warn(`Failed to find ambient sound ${obj.file}`, line, obj)
                    return
                }
                if (!await soundFiles[0].download()) {
                    return
                }
                const sound = new Sound(obj.name, soundFiles[0].bytes.buffer, scene, null, {
                    loop: obj.loop === 'looping',
                    autoplay: true,
                    volume: obj.vol_min,
                })
                console.log('Playing ambient sound', obj.name, obj.file)
                return
            }
        }
    }

    console.warn('Failed to find ambient sound', soundName)
}

async function start() {
    const havokInstance = await HavokPhysics()
    havok = new HavokPlugin(true, havokInstance)
    scene.enablePhysics(gravityVector, havok)

    player = new FirstPersonPlayer(scene, havok)

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
            const origin = transformPoint(inst.entity.origin)

            if (inst.entity.className.includes('_spawn') && !inst.entity.model) {
                spawns.push(inst)
            } else if (inst.entity.className === 'light') {
                const light = new PointLight('PointLight', origin, scene)
                const c = inst.entity.map.get('_color')
                if (c) {
                    const color = c.split(' ').map(parseFloat)
                    light.diffuse = new Color3(color[0], color[1], color[2])
                }
                light.intensity = .1
                light.lightmapMode = Light.LIGHTMAP_SHADOWSONLY

                if (inst.entity.map.get('radius')) {
                    light.range = parseFloat(inst.entity.map.get('radius')) * MeshUtils.inch2MeterScale
                } else {
                    light.range = 10
                }
            } else if (inst.entity.className === 'misc_model') {
                const modelName = inst.entity.model
                const modelFiles = FakeFileSystem.FindFiles(modelName, null, false)
                if (modelFiles.length > 0) {
                    const file = modelFiles[0]
                    bjsLoadXModel(file, scene).then(x => {
                        if (x.root) {
                            x.root.parent = xmodelsRoot
                            x.root.position = inst.bjsNode.absolutePosition
                            x.root.rotationQuaternion = inst.bjsNode.absoluteRotationQuaternion
                            let scale = inst.entity.getFloat('modelscale', 1)
                            if (isNaN(scale)) {
                                scale = 1
                            }
                            x.root.scaling.scaleInPlace(scale)
                            x.root.metadata = inst.bjsNode.metadata

                            if (x.collisionMesh) {
                                new PhysicsAggregate(x.root, PhysicsShapeType.MESH, {
                                    mesh: x.collisionMesh,
                                    mass: 0,
                                })
                            }
                        }
                    })
                } else {
                    console.error('Could not find model file', modelName)
                }
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

            teleportToRandomSpawn()
            const mat = new StandardMaterial('spawn', scene)
            mat.emissiveColor = Color3.Red()
            for (let spawn of spawns) {
                const m = MeshBuilder.CreateSphere('spawn ' + spawn.entity.className, {diameter: 1, segments: 3})
                m.parent = spawnsRoot
                m.position = transformPoint(spawn.entity.origin)
                m.material = mat
            }

            findAmbientSound()

            console.log('BSP loaded!')
        })
        .catch(e => {
            console.error('Failed to load:', e)
        })

    engine.runRenderLoop(() => {
        scene.render()
    })

    mapSelector = new MapSelector()
}

start()

const buttonsContainer = document.createElement('div')
buttonsContainer.style.position = 'absolute'
buttonsContainer.style.left = '0'
buttonsContainer.style.top = '0'

const mapSelectorBtn = document.createElement('button')
mapSelectorBtn.innerText = 'Map Selector'
buttonsContainer.appendChild(mapSelectorBtn)
mapSelectorBtn.addEventListener('click', async () => {
    document.querySelector('.map-selector-root').classList.remove('closed')
    mapSelector.show()
})

const randomSpawnBtn = document.createElement('button')
randomSpawnBtn.innerText = 'To Random Spawn'
buttonsContainer.appendChild(randomSpawnBtn)
randomSpawnBtn.addEventListener('click', () => {
    if (loader?.root) {
        teleportToRandomSpawn()
    }
    randomSpawnBtn.blur()
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

function teleportToRandomSpawn(tryCount = 0) {
    if (!spawns || spawns.length === 0 || tryCount >= 10) {
        return
    }
    const spawn = randomFromArray(spawns)
    const spawnPos = getPosFromSpawn(spawn)
    const raycastResult = new PhysicsRaycastResult()
    havok.raycast(spawnPos, spawnPos.add(Vector3.DownReadOnly), raycastResult)
    if (!raycastResult.hasHit) {
        teleportToRandomSpawn(tryCount++)
        return
    }
    if (!spawn) {
        return
    }

    player.position.copyFrom(spawnPos)
    player.position.y += .5
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