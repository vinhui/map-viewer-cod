import {BSP, Entity, Face, FakeFileSystem, File, LODTerrain, Texture as BspTex} from 'libbsp-js'
import {
    Color3,
    CubeTexture,
    ISize,
    Material,
    Mesh,
    RawTexture,
    Scene,
    StandardMaterial,
    Texture as BjsTex,
    TransformNode,
    Vector3 as BjsVec3,
    VertexData,
} from '@babylonjs/core'
import {BSPExtension} from '../Extensions/BSPExtension'
import {MeshUtils} from './MeshUtils'
import {doesDdsHaveAlpha} from '../../utils/dds'

export enum MeshCombineOptions {
    None,
    PerMaterial,
}

type Settings = {
    path?: string
    scene?: Scene
    meshCombineOptions: MeshCombineOptions
    curveTesselationLevel: number
    entityCreatedCallback?: (entity: EntityInstance, targets: EntityInstance[]) => void
    scaleFactor: number
}

export type EntityInstance = {
    entity: Entity
    bjsNode: Mesh
}

export class BSPLoader {
    public settings: Settings
    private entityInstances: EntityInstance[] = []
    private namedEntities: Map<string, EntityInstance[]> = new Map()
    private materialDirectory: Map<string, StandardMaterial> = new Map()

    private _root: TransformNode

    public get root(): TransformNode {
        return this._root
    }

    private _bsp: BSP

    public get bsp(): BSP {
        return this._bsp
    }

    public async loadBSP(bsp?: BSP): Promise<TransformNode> {
        if (!bsp) {
            if (!this.settings?.path) {
                throw new Error(`Cannot import ${this.settings.path}: The path is invalid`)
            }

            if (!await FakeFileSystem.DownloadFile(this.settings.path)) {
                throw new Error(`Failed to download bsp file: ${this.settings.path}`)
            }

            const lumpFiles = FakeFileSystem.FindFiles(this.settings.path.substring(0, this.settings.path.lastIndexOf('.')), /\.lmp$/, false)
            await FakeFileSystem.DownloadFiles(lumpFiles)
            this._bsp = new BSP(FakeFileSystem.GetFile(this.settings.path))
            await this.loadBSP(this._bsp)
        } else {
            this._bsp = bsp
            for (let i = 0; i < bsp.entities.count; i++) {
                const entity = bsp.entities.get(i)
                const instance: EntityInstance = this.createEntityInstance(entity)
                this.entityInstances.push(instance)
                this.namedEntities.get(entity.name).push(instance)

                const modelNumber = entity.modelNumber
                if (modelNumber >= 0) {
                    this.buildMesh(instance)
                } else {
                    const angles = entity.angles
                    instance.bjsNode.rotation = new BjsVec3(angles.x, angles.y, angles.z)
                }
                instance.bjsNode.position = new BjsVec3(entity.origin.x, entity.origin.y, entity.origin.z).scaleInPlace(this.settings.scaleFactor)
            }

            this._root = new TransformNode(bsp.mapName)
            this._root.rotation.x = -Math.PI / 2
            this._root.scaling.setAll(MeshUtils.inch2MeterScale)
            this._root.scaling.x *= -1
            for (let value of this.namedEntities.values()) {
                this.SetUpEntityHierarchy(value)
            }

            if (this.settings.entityCreatedCallback) {
                for (let instance of this.entityInstances) {
                    const target = instance.entity.get('target')
                    if (this.namedEntities.has(target) && target) {
                        this.settings.entityCreatedCallback(instance, this.namedEntities.get(target))
                    } else {
                        this.settings.entityCreatedCallback(instance, [])
                    }
                }
            }
        }

        return this._root
    }

    protected createFaceMesh(face: Face, textureName: string): VertexData {
        let dims: ISize
        if (!this.materialDirectory.has(textureName)) {
            this.loadMaterial(textureName)
        }
        const bjsTex = this.materialDirectory.get(textureName).diffuseTexture
        if (bjsTex) {
            dims = bjsTex.getSize()
        } else {
            dims = {
                width: 128,
                height: 128,
            }
        }

        let mesh: VertexData
        if (face.displacementIndex >= 0) {
            mesh = MeshUtils.CreateDisplacementMesh(this._bsp, face, dims)
        } else {
            mesh = MeshUtils.CreateFaceMesh(this._bsp, face, dims, this.settings.curveTesselationLevel)
        }

        return mesh
    }

    protected createLoDTerrainMesh(lodTerrain: LODTerrain, textureName: string): VertexData {
        if (!this.materialDirectory.has(textureName)) {
            this.loadMaterial(textureName)
        }
        return MeshUtils.CreateMoHAATerrainMesh(this._bsp, lodTerrain)
    }

    private loadTextureAtPath(path: string, onTexChanged: () => void): BjsTex {
        const s = path.toLowerCase()
        const s2 = path.replaceAll('_', '')
        if (s.startsWith('textures/sky/') || s2.startsWith('textures/sky/') || s.startsWith('textures/skies/') || s2.startsWith('textures/skies/')) {
            const skyTex = this.loadSkyTextureAtPath(path)
            if (skyTex) {
                return skyTex
            }
        }

        if (FakeFileSystem.hasLoadedIndex) {
            const matches = FakeFileSystem.FindFiles(path, null, false)
            if (matches.length === 0) {
                return null
            }

            for (let match of matches) {
                if (match.directory + match.nameWithoutExtension === path) {
                    if (match.isLoaded) {
                        if (match.extension === '.ftx') {
                            return this.getFtxTexture(match)
                        } else {
                            if (match.extension.toLowerCase() === '.dds') {
                                const view = new DataView(match.bytes.buffer)
                                // Some old DDS files have bits per pixels that are way too high
                                // So we're just limiting those
                                if (view.getInt32(22 * 4, true) >= 256) {
                                    view.setInt32(22 * 4, 0, true)
                                }
                            }
                            const tex = new BjsTex(
                                'data:' + match.originalPath, // url
                                this.settings.scene, // scene
                                null, // no mipmap or options
                                null, // inverty
                                null, // samplingmode
                                null, // onload
                                null, // onerror
                                match.bytes.buffer, // buffer
                                false, // delete buffer
                                null, // format
                                null, // mimetype
                                null, // loaderoptions
                                null, // creationflags
                                null, // forced extension
                            )
                            if (match.extension.toLowerCase() === '.dds') {
                                tex.hasAlpha = doesDdsHaveAlpha(match.bytes)
                            }
                            return tex
                        }
                    } else {
                        if (match.extension === '.ftx') {
                            console.error(`Using FTX textures that aren't preloaded is currently not supported.\nYou need to pre-download them through the FakeFileSystem beforehand.`)
                            return null
                        }
                        let tex = new BjsTex(null, this.settings.scene, false, true)
                        tex.name = match.originalPath
                        match.download()
                            .then(success => {
                                if (success) {
                                    if (match.extension.toLowerCase() === '.dds') {
                                        const view = new DataView(match.bytes.buffer)
                                        // Some old DDS files have bits per pixels that are way too high
                                        // So we're just limiting those
                                        if (view.getInt32(22 * 4, true) >= 256) {
                                            view.setInt32(22 * 4, 0, true)
                                        }
                                    }
                                    tex.updateURL(
                                        'data:' + match.originalPath, // url
                                        match.bytes.buffer, // buffer
                                        null, // onload
                                        null, // forced extension
                                    )
                                    if (match.extension.toLowerCase() === '.dds') {
                                        tex.hasAlpha = doesDdsHaveAlpha(match.bytes)
                                    }
                                    onTexChanged()
                                } else {
                                    console.error(`Downloading ${match.originalPath} failed while index indicated it should exist. Maybe index file is out of date?`)
                                }
                            })
                        return tex
                    }
                }
            }
            return null
        } else {
            // Fallback to trying to download the file
            const tex = new BjsTex(null, this.settings.scene)
            let responseCount = 0
            let foundMatch = false
            const extensions = ['dds', 'jpg', 'tga', 'gif', 'jpeg', 'png'].flatMap(x => [x, x.toUpperCase()])
            for (const extension of extensions) {
                const url = `${FakeFileSystem.baseUrl}${path}.${extension}`
                fetch(url, {method: 'HEAD'})
                    .then((res) => {
                        responseCount++
                        if (res.ok) {
                            foundMatch = true
                            tex.updateURL(url)
                        }
                        if (responseCount === extensions.length) {
                            onTexChanged()
                            if (!foundMatch) {
                                console.error(`Failed to find texture ${path}`)
                            }
                        }
                    })
            }
            return tex
        }
    }

    private loadSkyTextureAtPath(path: string): BjsTex {
        type Sides = 'bk' | 'dn' | 'ft' | 'lf' | 'rt' | 'up'

        let fileName: string
        if (path.startsWith('textures/sky/'))
            fileName = path.substring('textures/sky/'.length)
        else if (path.startsWith('textures/skies/'))
            fileName = path.substring('textures/skies/'.length)
        const sides: Sides[] = ['bk', 'dn', 'ft', 'lf', 'rt', 'up']
        const files = new Map<Sides, File>()
        for (let side of sides) {
            let f: File[]
            f = FakeFileSystem.FindFiles(`env/${fileName}_${side}.`, null, false)
            if (f?.length === 0) {
                console.warn(`Couldn't find skybox texture`, path)
                return null
            }
            files.set(side, f[0])
        }

        const cubeTex = new CubeTexture(null, this.settings.scene)
        Promise.all(files.values().map(x => x.download()))
            .then(x => {
                if (x.some(x => !x)) {
                    return
                }

                const blobUrls = new Map<Sides, string>()
                for (let [side, file] of files.entries()) {
                    const blob = new Blob([file.bytes])
                    const f = new window.File([blob], file.nameWithExtension)
                    blobUrls.set(side, URL.createObjectURL(f))
                }
                const cleanup = (e?: unknown) => {
                    for (let url of blobUrls.values()) {
                        URL.revokeObjectURL(url)
                    }
                }
                const ext = files.get('up').extension
                console.log(ext)
                cubeTex.updateURL(
                    path, // url
                    ext, // forced extension
                    cleanup, // onload
                    null, // prefiltered
                    (e) => {
                        console.error('Failed to load sky texture:', e)
                        cleanup()
                    }, // onerror
                    null, // extensions
                    null, // delayload
                    [
                        blobUrls.get('rt'),
                        blobUrls.get('up'),
                        blobUrls.get('ft'),
                        blobUrls.get('lf'),
                        blobUrls.get('dn'),
                        blobUrls.get('bk'),
                    ],
                    null, // buffer
                )
            })

        return null
    }

    private getFtxTexture(file: File) {
        const bytes = file.bytes
        if (bytes.byteLength < 12) {
            console.warn(`Invalid FTX texture file "${file.originalPath}": File too small`)
            return null
        }
        const view = new DataView(bytes.buffer)
        const width = view.getInt32(0)
        const height = view.getInt32(4)

        if (bytes.byteLength < (width * height * 4) + 12) {
            console.warn(`Invalid FTX texture file "${file.originalPath}": Not enough pixels`)
            return null
        }

        const tex = RawTexture.CreateRGBATexture(bytes.slice(12), width, height, this.settings.scene, true, false)
        tex.name = file.originalPath
        return tex
    }

    private loadMaterial(textureName: string) {
        let material: StandardMaterial
        const tex = this.loadTextureAtPath(textureName, () => {
            if (tex.hasAlpha) {
                material.diffuseTexture = tex
                material.useAlphaFromDiffuseTexture = true
                material.needDepthPrePass = true
            }
        })
        if (!tex) {
            console.warn(`Texture ${textureName} could not be loaded (does the file exist?)`)
        }

        material = new StandardMaterial(textureName, this.settings.scene)
        material.specularColor = Color3.Black()
        if (textureName.toLowerCase().includes('decal@')) {
            material.zOffset = -1
        }
        if (tex) {
            material.diffuseTexture = tex
        }

        this.materialDirectory.set(textureName, material)
    }

    private createEntityInstance(entity: Entity): EntityInstance {
        if (!this.namedEntities.has(entity.name) || !this.namedEntities.get(entity.name)) {
            this.namedEntities.set(entity.name, [])
        }

        const mesh = new Mesh(`${entity.className}${entity.name ? ` ${entity.name}` : ''}`, this.settings.scene)
        if (!mesh.metadata)
            mesh.metadata = {}
        for (let [k, v] of entity.map.entries()) {
            mesh.metadata[k] = v
        }
        return {
            entity: entity,
            bjsNode: mesh,
        }
    }

    private SetUpEntityHierarchy(instance: EntityInstance[] | EntityInstance) {
        if (Array.isArray(instance)) {
            for (let i of instance) {
                this.SetUpEntityHierarchy(i)
            }
        } else {
            if (!instance.entity.has('parentname')) {
                instance.bjsNode.parent = this._root
                return
            }

            const parentName = instance.entity.get('parentname')
            if (this.namedEntities.has(parentName)) {
                const e = this.namedEntities.get(parentName)
                if (e.length > 0) {
                    console.warn(`Entity "${instance.bjsNode.name}" claims to have parent "${instance.entity.get('parentname')}" but more than one matching entity exists.`, instance.bjsNode)
                }

                instance.bjsNode.parent = e[0].bjsNode
            } else {
                console.warn(`Entity "${instance.bjsNode.name}" claims to have parent "${parentName}" but no such entity exists.`, instance.bjsNode)
            }
        }
    }

    private buildMesh(instance: EntityInstance) {
        const modelNumber = instance.entity.modelNumber
        const model = this._bsp.models.get(modelNumber)
        const textureMeshMap: Map<string, VertexData[]> = new Map()
        const bjsNode = instance.bjsNode

        const faces: Face[] = BSPExtension.GetFacesInModel(this._bsp, model)
        let i: number
        for (i = 0; i < faces.length; i++) {
            const face = faces[i]
            if (face.numEdgeIndices <= 0 && face.numVertices <= 0) {
                continue
            }

            const textureIndex = BSPExtension.GetTextureIndex(this._bsp, face)
            let textureName = ''
            if (textureIndex >= 0) {
                const texture = this._bsp.textures.get(textureIndex)
                textureName = BspTex.SanitizeName(texture.name, this._bsp.mapType)
                if (!textureName.startsWith('tools/')) {
                    if (!textureMeshMap.has(textureName) || !textureMeshMap.get(textureName)) {
                        textureMeshMap.set(textureName, [])
                    }

                    textureMeshMap.get(textureName).push(this.createFaceMesh(face, textureName))
                }
            }
        }

        if (modelNumber === 0) {
            if (this._bsp.lodTerrains) {
                for (const lodTerrain of this._bsp.lodTerrains) {
                    if (lodTerrain.textureIndex >= 0) {
                        const texture = this._bsp.textures.get(lodTerrain.textureIndex)
                        const textureName = texture.name

                        if (!textureMeshMap.has(textureName) || !textureMeshMap.get(textureName)) {
                            textureMeshMap.set(textureName, [])
                        }

                        textureMeshMap.get(textureName).push(this.createLoDTerrainMesh(lodTerrain, textureName))
                    }
                }
            }
        }

        if (this.settings.meshCombineOptions === MeshCombineOptions.PerMaterial) {
            const textureMeshes: VertexData[] = []
            const materials: Material[] = []
            i = 0

            for (let [key, value] of textureMeshMap.entries()) {
                textureMeshes[i] = MeshUtils.CombineAllMeshes(value)
                if (textureMeshes[i].positions.length > 0) {
                    if (this.materialDirectory.has(key)) {
                        materials[i] = this.materialDirectory.get(key)
                    }
                    const textureNode = new Mesh(key, this.settings.scene)
                    textureNode.parent = bjsNode
                    for (let j = 0; j < textureMeshes[i].positions.length; j++) {
                        textureMeshes[i].positions[j] *= this.settings.scaleFactor
                    }
                    if (textureMeshes[i].normals.length < 3
                        || (!textureMeshes[i].normals[0] || !textureMeshes[i].normals[1] || !textureMeshes[i].normals[2])) {
                        VertexData.ComputeNormals(textureMeshes[i].positions, textureMeshes[i].indices, textureMeshes[i].normals)
                    }

                    textureMeshes[i].applyToMesh(textureNode, false)
                    textureNode.material = materials[i]
                    ++i
                }
            }
        } else {
            i = 0
            for (let [key, value] of textureMeshMap.entries()) {
                const textureNode = new Mesh(key, this.settings.scene)
                textureNode.parent = bjsNode
                const material = this.materialDirectory.get(key)
                for (let mesh of value) {
                    if (mesh.positions.length > 3) {
                        const faceNode = new Mesh('Face')
                        faceNode.parent = textureNode
                        for (let j = 0; j < mesh.positions.length; j++) {
                            mesh.positions[j] *= this.settings.scaleFactor
                        }

                        if (mesh.normals.length < 3
                            || (!mesh.normals[0] || !mesh.normals[1] || !mesh.normals[2])) {
                            VertexData.ComputeNormals(mesh.positions, mesh.indices, mesh.normals)
                        }

                        mesh.applyToMesh(faceNode, false)
                        faceNode.material = material
                    }
                }
                ++i
            }
        }
    }
}