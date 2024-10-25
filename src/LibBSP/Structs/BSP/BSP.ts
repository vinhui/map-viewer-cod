import {ILump} from '../Common/Lumps/ILump'
import {BSPReader} from '../../Utils/BSPReader'
import {BSPHeader} from './BSPHeader'
import {Lump} from '../Common/Lumps/Lump'
import {Plane} from '../../Utils/Plane'
import {Entity} from '../Common/Entity'
import {Entities} from '../Common/Lumps/Entities'
import {PlaneExtensions} from '../../Extensions/PlaneExtensions'
import {Vertex} from '../Common/Vertex'
import {VertexExtensions} from '../../Extensions/VertexExtensions'
import {Vector3} from '../../Utils/Vector'
import {Vector3Extensions} from '../../Extensions/Vector3Extensions'
import {NumList} from '../Common/Lumps/NumList'
import {Visibility} from './Lumps/Visibility'
import {Texture} from './Texture'
import {GameLump} from './Lumps/GameLump'
import {StaticProps} from './Lumps/StaticProps'
import {TextureInfo} from '../Common/TextureInfo'
import {Textures} from './Lumps/Textures'
import {Lightmaps} from './Lumps/Lightmaps'
import {Leaf} from './Leaf'
import {Node} from './Node'
import {int} from '../../../utils/number'
import {Face} from './Face'
import {Edge} from './Edge'
import {Brush} from './Brush'
import {BrushSide} from './BrushSide'
import {TextureData} from './TextureData'
import {Displacement} from './Displacement'
import {DisplacementVertex} from './DisplacementVertex'
import {Cubemap} from './Cubemap'
import {Overlay} from './Overlay'
import {StaticModel} from './StaticModel'
import {LODTerrain} from './LODTerrain'
import {Patch} from './Patch'
import {Model} from './Model'

export enum MapType {
    Undefined = 0x00000000,

    Quake = 0x01000000,
    GoldSrc = 0x01010000,
    BlueShift = 0x01010001,

    Quake2 = 0x02000000,
    Daikatana = 0x02000001,
    SoF = 0x02000002,
    SiN = 0x02000004,

    Quake3 = 0x04000000,
    ET = 0x04000001,
    Raven = 0x04010000,
    CoD = 0x04020000,
    CoDDemo = 0x04020001,
    CoD2 = 0x04020002,
    CoD4 = 0x04020004,
    UberTools = 0x04040000,
    STEF2 = 0x04040100,
    STEF2Demo = 0x04040101,
    MOHAA = 0x04040200,
    MOHAADemo = 0x04040201,
    MOHAABT = 0x04040202,
    FAKK2 = 0x04040400,
    Alice = 0x04040401,

    Nightfire = 0x08000000,

    Source = 0x10000000,
    Source17 = 0x10000100,
    Source18 = 0x10000200,
    Source19 = 0x10000400,
    Source20 = 0x10000800,
    DMoMaM = 0x10000801,
    Vindictus = 0x10000802,
    Source21 = 0x10001000,
    L4D2 = 0x10001001,
    TacticalInterventionEncrypted = 0x10001002,
    Source22 = 0x10002000,
    Source23 = 0x10004000,
    Source27 = 0x10008000,

    Titanfall = 0x20000000,
}

export namespace MapType {
    export function IsSubtypeOf(type: MapType, other: MapType): boolean {
        return (type & other) === other
    }
}

export class LumpInfo {
    public ident: int
    public flags: int
    public version: int
    public offset: int
    public length: int
    public lumpFile: string
}

export class BSP {
    public mapName: string
    private _dict: Map<int, LumpInfo> = new Map()

    constructor(name: string, mapType: MapType = MapType.Undefined) {
        this.mapName = name
        this.mapType = mapType
        const data = new Uint8Array(0)
        this._header = new BSPHeader(this, data)

        this._lumps = new Map()
    }

    private _lumps: Map<int, ILump>

    public get lumps(): Map<int, ILump> {
        return this._lumps
    }

    private _mapType: MapType

    public get mapType(): MapType {
        if (this._mapType === MapType.Undefined) {
            this._mapType = this.reader.getVersion()
        }
        return this._mapType
    }

    public set mapType(val: MapType) {
        if (val === MapType.Undefined) {
            this._lumps = null
        } else if (val !== this._mapType) {
            this._lumps = new Map()
        }
        this._mapType = val
    }

    private _reader: BSPReader

    public get reader(): BSPReader {
        if (this._reader === null) {
            this._reader = new BSPReader()
        }
        return this._reader
    }

    public set reader(val: BSPReader) {
        this._reader = val
    }

    private _header: BSPHeader

    public get header(): BSPHeader {
        return this._header
    }

    private _bigEndian: boolean

    public get bigEndian(): boolean {
        return this._bigEndian
    }

    public get entitiesLoaded(): boolean {
        const index = Entity.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get planesLoaded(): boolean {
        const index = PlaneExtensions.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get texturesLoaded(): boolean {
        const index = Texture.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get verticesLoaded(): boolean {
        const index = VertexExtensions.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get normalsLoaded(): boolean {
        const index = Vector3Extensions.GetIndexForNormalsLump(this._mapType)
        return this.lumpLoaded(index)
    }

    public get nodesLoaded(): boolean {
        const index = Node.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get textureInfoLoaded(): boolean {
        const index = TextureInfo.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get facesLoaded(): boolean {
        const index = Face.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leavesLoaded(): boolean {
        const index = Leaf.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get edgesLoaded(): boolean {
        const index = Edge.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get brushesLoaded(): boolean {
        const index = Brush.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get brushSidesLoaded(): boolean {
        const index = BrushSide.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get materialsLoaded(): boolean {
        const index = Texture.GetIndexForMaterialLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get visibilityLoaded(): boolean {
        const index = Visibility.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get lightmapsLoaded(): boolean {
        const index = Lightmaps.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get originalFacesLoaded(): boolean {
        const index = Face.GetIndexForOriginalFacesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get textureDataLoaded(): boolean {
        const index = TextureData.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get displacementsLoaded(): boolean {
        const index = Displacement.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get displacementVerticesLoaded(): boolean {
        const index = DisplacementVertex.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get cubemapsLoaded(): boolean {
        const index = Cubemap.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get overlaysLoaded(): boolean {
        const index = Overlay.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leafFacesLoaded(): boolean {
        const {index, type} = NumList.GetIndexForLeafFacesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get faceEdgesLoaded(): boolean {
        const {index, type} = NumList.GetIndexForFaceEdgesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leafBrushesLoaded(): boolean {
        const {index, type} = NumList.GetIndexForLeafFacesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get staticModelsLoaded(): boolean {
        const index = StaticModel.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get lodTerrainsLoaded(): boolean {
        const index = LODTerrain.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leafStaticModelsLoaded(): boolean {
        const {index, type} = NumList.GetIndexForLeafStaticModelsLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get patchesLoaded(): boolean {
        const index = Patch.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get patchVertsLoaded(): boolean {
        const index = Vector3Extensions.GetIndexForPatchVertsLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get patchIndicesLoaded(): boolean {
        const {index, type} = NumList.GetIndexForPatchIndicesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get leafPatchesLoaded(): boolean {
        const {index, type} = NumList.GetIndexForLeafPatchesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get indicesLoaded(): boolean {
        const {index, type} = NumList.GetIndexForIndicesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get textureTableLoaded(): boolean {
        const {index, type} = NumList.GetIndexForTexTableLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get displacementTrianglesLoaded(): boolean {
        const {index, type} = NumList.GetIndexForDisplacementTrianglesLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get gameLumpLoaded(): boolean {
        const index = GameLump.GetIndexForLump(this.mapType)
        return this.lumpLoaded(index)
    }

    public get staticProps(): StaticProps {
        if (this.gameLump !== null) {
            return this.gameLump.staticProps
        }
    }

    public set staticProps(val: StaticProps) {
        this.gameLump.staticProps = val
    }

    public get staticPropsLoaded(): boolean {
        return this.gameLumpLoaded && this.gameLump.staticPropsLoaded
    }

    public get leafBrushes(): NumList {
        const {index, type} = NumList.GetIndexForLeafFacesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info), type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
        return null
    }

    public set leafBrushes(val: NumList) {
        const {index, type} = NumList.GetIndexForLeafFacesLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get planes(): Lump<Plane> {
        const index = PlaneExtensions.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, PlaneExtensions.LumpFactory(this.reader.readLump(info), this, info))
            }

            return this._lumps.get(index) as Lump<Plane>
        }
        return null
    }

    public set planes(val: Lump<Plane>) {
        const index = PlaneExtensions.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get leafFaces(): NumList {
        const {index, type} = NumList.GetIndexForLeafFacesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info), type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
    }

    public set leafFaces(val: NumList) {
        const {index, type} = NumList.GetIndexForLeafFacesLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get faceEdges(): NumList {
        const {index, type} = NumList.GetIndexForFaceEdgesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info), type, this, info))
            }

            return this._lumps.get(index) as NumList
        }
    }

    public set faceEdges(val: NumList) {
        const {index, type} = NumList.GetIndexForFaceEdgesLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get entities(): Entities {
        const index = Entity.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Entity.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Entities
        }
        return null
    }

    public set entities(val: Entities) {
        const index = Entity.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get textures(): Textures {
        const index = Texture.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Texture.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps[index] as Textures
        }
    }

    public set textures(val: Textures) {
        const index = Texture.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get vertices(): Lump<Vertex> {
        const index = VertexExtensions.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, VertexExtensions.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Vertex>
        }
    }

    public set vertices(val: Lump<Vertex>) {
        const index = VertexExtensions.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get normals(): Lump<Vector3> {
        const index = Vector3Extensions.GetIndexForNormalsLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Vector3Extensions.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Vector3>
        }
    }

    public set normals(val: Lump<Vector3>) {
        const index = Vector3Extensions.GetIndexForNormalsLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get nodes(): Lump<Node> {
        const index = Node.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Node.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Node>
        }
    }

    public set nodes(val: Lump<Node>) {
        const index = Node.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get textureInfo(): Lump<TextureInfo> {
        const index = TextureInfo.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, TextureInfo.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<TextureInfo>
        }
    }

    public set textureInfo(val: Lump<TextureInfo>) {
        const index = TextureInfo.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get faces(): Lump<Face> {
        const index = Face.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Face.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Face>
        }
    }

    public set faces(val: Lump<Face>) {
        const index = Face.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get leaves(): Lump<Leaf> {
        const index = Leaf.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Leaf.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Leaf>
        }
    }

    public set leaves(val: Lump<Leaf>) {
        const index = Leaf.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get edges(): Lump<Edge> {
        const index = Edge.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Edge.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Edge>
        }
    }

    public set edges(val: Lump<Edge>) {
        const index = Edge.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get models(): Lump<Model> {
        const index = Model.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Model.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Model>
        }
    }

    public set models(val: Lump<Model>) {
        const index = Model.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get brushes(): Lump<Brush> {
        const index = Brush.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Brush.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Brush>
        }
    }

    public set brushes(val: Lump<Brush>) {
        const index = Brush.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get brushSides(): Lump<BrushSide> {
        const index = BrushSide.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, BrushSide.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<BrushSide>
        }
    }

    public set brushSides(val: Lump<BrushSide>) {
        const index = BrushSide.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get materials(): Textures {
        const index = Texture.GetIndexForMaterialLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Texture.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Textures
        }
        return null
    }

    public set materials(val: Textures) {
        const index = Texture.GetIndexForMaterialLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get lightmaps(): Lightmaps {
        const index = Lightmaps.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, new Lightmaps(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lightmaps
        }
    }

    public set lightmaps(val: Lightmaps) {
        const index = Lightmaps.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get originalFaces(): Lump<Face> {
        const index = Face.GetIndexForOriginalFacesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Face.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Face>
        }
    }

    public set originalFaces(val: Lump<Face>) {
        const index = Face.GetIndexForOriginalFacesLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get textureData(): Lump<TextureData> {
        const index = TextureData.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, TextureData.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<TextureData>
        }
    }

    public set textureData(val: Lump<TextureData>) {
        const index = TextureData.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get displacements(): Lump<Displacement> {
        const index = Displacement.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Displacement.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Displacement>
        }
    }

    public set displacements(val: Lump<Displacement>) {
        const index = Displacement.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get displacementVertices(): Lump<DisplacementVertex> {
        const index = DisplacementVertex.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, DisplacementVertex.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<DisplacementVertex>
        }
    }

    public set displacementVertices(val: Lump<DisplacementVertex>) {
        const index = DisplacementVertex.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get cubemaps(): Lump<Cubemap> {
        const index = Cubemap.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Cubemap.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Cubemap>
        }
    }

    public set cubemaps(val: Lump<Cubemap>) {
        const index = Cubemap.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get overlays(): Lump<Overlay> {
        const index = Overlay.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Overlay.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Overlay>
        }
    }

    public set overlays(val: Lump<Overlay>) {
        const index = Overlay.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get staticModels(): Lump<StaticModel> {
        const index = StaticModel.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, StaticModel.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<StaticModel>
        }
    }

    public set staticModels(val: Lump<StaticModel>) {
        const index = StaticModel.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get lodTerrains(): Lump<LODTerrain> {
        const index = LODTerrain.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, LODTerrain.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<LODTerrain>
        }
    }

    public set lodTerrains(val: Lump<LODTerrain>) {
        const index = LODTerrain.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get leafStaticModels(): NumList {
        const {index, type} = NumList.GetIndexForLeafStaticModelsLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info), type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
    }

    public set leafStaticModels(val: NumList) {
        const {index, type} = NumList.GetIndexForLeafStaticModelsLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get patches(): Lump<Patch> {
        const index = Patch.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Patch.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Patch>
        }
    }

    public set patches(val: Lump<Patch>) {
        const index = Patch.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get patchVertices(): Lump<Vector3> {
        const index = Vector3Extensions.GetIndexForPatchVertsLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, Vector3Extensions.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Lump<Vector3>
        }
    }

    public set patchVertices(val: Lump<Vector3>) {
        const index = Vector3Extensions.GetIndexForPatchVertsLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get patchIndices(): NumList {
        const {index, type} = NumList.GetIndexForPatchIndicesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info), type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
    }

    public set patchIndices(val: NumList) {
        const {index, type} = NumList.GetIndexForPatchIndicesLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get leafPatches(): NumList {
        const {index, type} = NumList.GetIndexForLeafPatchesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info), type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
    }

    public set leafPatches(val: NumList) {
        const {index, type} = NumList.GetIndexForLeafPatchesLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get indices(): NumList {
        const {index, type} = NumList.GetIndexForIndicesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info), type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
    }

    public set indices(val: NumList) {
        const {index, type} = NumList.GetIndexForIndicesLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get textureTable(): NumList {
        const {index, type} = NumList.GetIndexForTexTableLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info), type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
    }

    public set textureTable(val: NumList) {
        const {index, type} = NumList.GetIndexForTexTableLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get displacementTriangles(): NumList {
        const {index, type} = NumList.GetIndexForDisplacementTrianglesLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, NumList.LumpFactory(this.reader.readLump(info), type, this, info))
            }
            return this._lumps.get(index) as NumList
        }
    }

    public set displacementTriangles(val: NumList) {
        const {index, type} = NumList.GetIndexForDisplacementTrianglesLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get visibility(): Visibility {
        const index = Visibility.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, new Visibility(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as Visibility
        }
    }

    public set visibility(val: Lump<Visibility>) {
        const index = Visibility.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public get gameLump(): GameLump {
        const index = GameLump.GetIndexForLump(this.mapType)
        if (index >= 0) {
            if (!this._lumps.has(index)) {
                const info = this.get(index)
                this._lumps.set(index, GameLump.LumpFactory(this.reader.readLump(info), this, info))
            }
            return this._lumps.get(index) as GameLump
        }
    }

    public set gameLump(val: GameLump) {
        const index = GameLump.GetIndexForLump(this.mapType)
        if (index >= 0) {
            this._lumps.set(index, val)
            val.bsp = this
        }
    }

    public static GetNumLumps(version: MapType): int {
        if (version === MapType.Titanfall) {
            return 128
        } else if (MapType.IsSubtypeOf(version, MapType.Source)) {
            return 64
        } else if (MapType.IsSubtypeOf(version, MapType.Quake)) {
            return 15
        } else if (MapType.IsSubtypeOf(version, MapType.MOHAA)) {
            return 28
        } else if (MapType.IsSubtypeOf(version, MapType.STEF2)) {
            return 30
        } else if (MapType.IsSubtypeOf(version, MapType.FAKK2) || version === MapType.SiN) {
            return 20
        } else if (version === MapType.Raven || version === MapType.Nightfire) {
            return 18
        } else if (version === MapType.Quake2) {
            return 19
        } else if (version === MapType.Daikatana) {
            return 21
        } else if (version === MapType.SoF) {
            return 22
        } else if (version === MapType.CoD || version === MapType.CoDDemo) {
            return 31
        } else if (version === MapType.CoD2) {
            return 39
        } else if (version === MapType.CoD4) {
            return 55
        } else if (version === MapType.Quake3 || version === MapType.ET) {
            return 17
        }
        return 0
    }

    public get(index: int): LumpInfo {
        if (!this._dict.has(index)) {
            this._dict.set(index, this.header.getLumpInfo(index))
        }
        return this._dict.get(index)
    }

    public set(index: int, val: LumpInfo) {
        this._dict.set(index, val)
    }

    public lumpLoaded(index: int): boolean {
        return this._lumps && this._lumps.has(index)
    }

    public getLoadedLump(index: int): ILump {
        if (!this.lumpLoaded(index)) {
            return null
        }
        return this._lumps.get(index)
    }

    public updateHeader(newHeader: BSPHeader) {
        this._header = newHeader

        const keys = this._dict.keys()
        for (let i = 0; i < this._dict.size; i++) {
            const index = keys[i]
            this.set(index, newHeader.getLumpInfo(index))
        }
    }
}