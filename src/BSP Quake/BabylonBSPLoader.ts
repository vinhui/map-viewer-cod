import {BSPMap} from './types/BSPMap'
import {
    Material,
    Mesh,
    Scene,
    StandardMaterial,
    Texture,
    TransformNode,
    Vector2,
    Vector3,
    VertexData,
} from '@babylonjs/core'
import {Face} from './types/Face'

export class BSPLoader {
    public readonly baseUrl: string
    public readonly mapName: string
    public applyLightmaps: boolean
    public generateAtRuntime = true
    public tessellations = 5

    public fallbackMaterial: Material
    public rootNode: TransformNode
    private map: BSPMap
    private scene: Scene

    constructor(baseUrl: string, mapName: string, scene?: Scene) {
        this.baseUrl = baseUrl
        this.mapName = mapName
        this.scene = scene
        this.map = new BSPMap(baseUrl + mapName)
    }

    async load() {
        if (!this.rootNode) {
            this.rootNode = new TransformNode(`__root__ (${this.mapName})`, this.scene)
        }

        await this.map.loadMap()
        await this.map.textureLump.pullInTextures(this.baseUrl, this.scene)

        for (let face of this.map.faceLump.faces) {
            const mat = this.fetchMaterial(this.map.textureLump.textures[face.texture].name, face.lm_index)
            switch (face.type) {
                case 2:
                    // Bezier
                    // this.generateBezierObject(mat, face)
                    break
                case 1:
                case 3:
                    // polygon
                    this.generatePolygonObject(mat, [face])
                    break
                default:
                    console.warn(
                        `Skipped face because it was not a polygon, mesh, or bez patch (${face.type}).`)
                    break
            }
        }
    }

    fetchMaterial(texName: string, lm_index: number): Material {
        let baseTex: Texture
        if (this.map.textureLump.containsTexture(texName)) {
            baseTex = this.map.textureLump.getTexture(texName)
        } else {
            console.warn('Failed to find texture ' + texName)
            if (!this.fallbackMaterial) {
                this.fallbackMaterial = new StandardMaterial('BSP Fallback')
            }
            return this.fallbackMaterial
        }

        const mat = new StandardMaterial('face', this.scene)
        mat.diffuseTexture = baseTex

        if (lm_index >= 0 && this.applyLightmaps) {
            mat.lightmapTexture = this.map.lightMapLump.lightMaps[lm_index]
        }

        return mat
    }


    private generatePolygonObject(material: Material, faces: Face[]) {
        if (!faces || faces.length === 0) {
            console.warn('Failed to create polygon object because there are no faces')
            return
        }

        for (let face of faces) {
            const mesh = new Mesh('BSP Mesh', this.scene)
            mesh.parent = this.rootNode
            mesh.material = material

            this.generatePolygonMesh(face).applyToMesh(mesh)
            // const vertexData = new VertexData()
            // let vertexDatas = faces.map(x => this.generatePolygonMesh(x)).filter(x => x !== null)
            // console.log(vertexDatas)
            // vertexData.merge(vertexDatas)
            // vertexData.applyToMesh(mesh)
        }
    }

    private generatePolygonMesh(face: Face): VertexData {
        const data = new VertexData()

        const positions: Vector3[] = []
        const uv: Vector2[] = []
        const lmUv: Vector2[] = []
        const normals: Vector3[] = []
        const indicies: number[] = []

        let vstep = face.vertex
        for (let i = 0; i < face.n_vertexes; i++) {
            let vert = this.map.vertexLump.verts[vstep]
            positions.push(vert.position)
            uv.push(this.map.vertexLump.verts[vstep].texcoord)
            lmUv.push(this.map.vertexLump.verts[vstep].lmcoord)
            normals.push(this.map.vertexLump.verts[vstep].normal)
            vstep++
        }

        let mstep = face.meshvert
        for (let i = 0; i < face.n_meshverts; i++) {
            indicies.push(this.map.vertexLump.meshVerts[mstep])
            mstep++
        }

        if (positions.length === 0) {
            return null
        }
        data.positions = positions.flatMap(x => [x.x, x.y, x.z])
        data.uvs = uv.flatMap(x => [x.x, x.y])
        data.uvs2 = lmUv.flatMap(x => [x.x, x.y])
        data.normals = normals.flatMap(x => [x.x, x.y, x.z])
        data.indices = indicies
        return data
    }
}