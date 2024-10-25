import {Color4, Vector3} from '@babylonjs/core'
import {BSPHeader} from './BSPHeader'
import {EntityLump} from '../lumps/EntityLump'
import {FaceLump} from '../lumps/FaceLump'
import {LightmapLump} from '../lumps/LightmapLump'
import {TextureLump} from '../lumps/TextureLump'
import {VertexLump} from '../lumps/VertexLump'
import {BSPTexture} from './BSPTexture'
import {Vertex} from './Vertex'
import {Face} from './Face'
import {BinaryReader} from '../../utils/BinaryReader'

export class BSPMap {
    public readonly fileUrl: string
    public entityLump: EntityLump
    public faceLump: FaceLump
    public header: BSPHeader
    public lightMapLump: LightmapLump
    public textureLump: TextureLump
    public vertexLump: VertexLump
    private reader: BinaryReader

    constructor(url: string) {
        this.fileUrl = url
    }

    public async loadMap() {
        const response = await fetch(this.fileUrl)
        if (!response.ok) {
            throw new Error('Failed to download bsp ' + this.fileUrl)
        }
        const arrayBuffer = await response.arrayBuffer()
        this.reader = new BinaryReader(new Uint8Array(arrayBuffer))

        // Read header and lumps
        this.header = new BSPHeader(this.reader)
        this.readEntities()
        this.readTextures()
        this.readVertexes()
        this.readFaces()
        this.readMeshVerts()
        this.readLightmaps()
    }

    private readEntities() {
        const offset = this.header.directory[0].offset
        const length = this.header.directory[0].length
        this.reader.seek(offset)
        this.entityLump = new EntityLump(this.reader.readString(length))
    }

    private readTextures() {
        const offset = this.header.directory[1].offset
        const length = this.header.directory[1].length
        const textureCount = length / 72 // Assuming texture size is 72 bytes
        this.reader.seek(offset)

        this.textureLump = new TextureLump()
        for (let i = 0; i < textureCount; i++) {
            this.textureLump.textures[i] = new BSPTexture(this.reader.readString(64), this.reader.readInt32(), this.reader.readInt32())
        }

        console.log(this.header.printInfo())
        console.log(this.textureLump.printInfo())
    }

    private readVertexes() {
        const offset = this.header.directory[10].offset
        const length = this.header.directory[10].length
        const vertByteSize = 44
        const vertCount = length / vertByteSize // Assuming vertex size is 44 bytes

        // Calc how many verts there are, them rip them into the vertexLump
        this.reader.seek(offset)
        // A vertex is 44 bytes, so use that to calc how many there are using the lump length from the header

        this.vertexLump = new VertexLump()
        for (let i = 0; i < vertCount; i++) {
            this.vertexLump.verts[i] = new Vertex(
                new Vector3(this.reader.readSingle(), this.reader.readSingle(), this.reader.readSingle()),
                this.reader.readSingle(), this.reader.readSingle(),
                this.reader.readSingle(), this.reader.readSingle(),
                new Vector3(this.reader.readSingle(), this.reader.readSingle(), this.reader.readSingle()),
                new Color4(this.reader.readByte() / 255, this.reader.readByte() / 255, this.reader.readByte() / 255, this.reader.readByte() / 255),
            )
        }
    }

    private readFaces() {
        const offset = this.header.directory[13].offset
        const length = this.header.directory[13].length
        const faceCount = length / 104 // Assuming face size is 104 bytes

        this.reader.seek(offset)
        // A face is 104 bytes of data, so the count is lenght of the lump / 104.
        this.faceLump = new FaceLump()
        for (let i = 0; i < faceCount; i++) {
            // This is pretty fucking intense.
            this.faceLump.faces[i] = new Face(
                this.reader.readInt32(), this.reader.readInt32(), this.reader.readInt32(), this.reader.readInt32(),
                this.reader.readInt32(), this.reader.readInt32(), this.reader.readInt32(), this.reader.readInt32(),
                [this.reader.readInt32(), this.reader.readInt32()],
                [this.reader.readInt32(), this.reader.readInt32()],
                new Vector3(this.reader.readSingle(), this.reader.readSingle(), this.reader.readSingle()),
                [
                    new Vector3(this.reader.readSingle(), this.reader.readSingle(), this.reader.readSingle()),
                    new Vector3(this.reader.readSingle(), this.reader.readSingle(), this.reader.readSingle()),
                ],
                new Vector3(this.reader.readSingle(), this.reader.readSingle(), this.reader.readSingle()),
                [this.reader.readInt32(), this.reader.readInt32()],
            )

        }
    }

    private readMeshVerts() {
        const offset = this.header.directory[11].offset
        const length = this.header.directory[11].length
        const meshVertCount = length / 4 // Assuming mesh vertex size is 4 bytes

        this.reader.seek(offset)

        for (let i = 0; i < meshVertCount; i++) {
            this.vertexLump.meshVerts[i] = this.reader.readInt32()
        }
    }

    private readLightmaps() {
        const offset = this.header.directory[14].offset
        const length = this.header.directory[14].length
        const lmapCount = length / 49152 // Assuming lightmap size is 49152 bytes

        this.reader.seek(offset)
        this.lightMapLump = new LightmapLump()

        for (let i = 0; i < lmapCount; i++) {
            this.lightMapLump.lightMaps[i] = LightmapLump.CreateLightMap(this.reader.readBytes(49152))
        }
    }
}
