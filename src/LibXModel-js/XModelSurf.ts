import {Color, Vec2, Vec3, vec3_add, vec3_rotate} from './math'
import {XModelVersion} from './XModelVersion'
import {XModelPart} from './XModelPart'

export interface XModelSurfWeight {
    bone: number;
    influence: number;
}

export interface XModelSurfVertex {
    normal: Vec3;
    color: Color;
    uv: Vec2;
    bone: number;
    position: Vec3;
    weights: XModelSurfWeight[];
}

export interface XModelSurfSurface {
    vertices: XModelSurfVertex[];
    triangles: number[];
}

export interface XModelSurf {
    name: string;
    version: XModelVersion;
    surfaces: XModelSurfSurface[];
}

export class XModelSurfLoader {
    private static readonly RIGGED = 65535
    private buffer: DataView
    private offset = 0

    constructor(data: Uint8Array) {
        this.buffer = new DataView(data.buffer)
    }

    public async load(name: string, xmodelPart?: XModelPart): Promise<XModelSurf> {
        const version = this.readUInt16()
        const xmodelSurf: XModelSurf = {
            name,
            version: version as XModelVersion,
            surfaces: [],
        }

        switch (version) {
            case XModelVersion.V14:
                await this.loadV14(xmodelSurf, xmodelPart)
                break
            case XModelVersion.V20:
                await this.loadV20(xmodelSurf, xmodelPart)
                break
            case XModelVersion.V25:
                await this.loadV25(xmodelSurf)
                break
            case XModelVersion.V62:
                await this.loadV62(xmodelSurf)
                break
            default:
                throw new Error(`Invalid xmodelsurf version ${version}`)
        }

        return xmodelSurf
    }

    private readUInt16(): number {
        const value = this.buffer.getUint16(this.offset, true)
        this.offset += 2
        return value
    }

    private readUInt8(): number {
        const value = this.buffer.getUint8(this.offset)
        this.offset += 1
        return value
    }

    private readInt16(): number {
        const value = this.buffer.getInt16(this.offset, true)
        this.offset += 2
        return value
    }

    private readFloat32(): number {
        const value = this.buffer.getFloat32(this.offset, true)
        this.offset += 4
        return value
    }

    private readVec3(): Vec3 {
        return [this.readFloat32(), this.readFloat32(), this.readFloat32()]
    }

    private readVec2(): [number, number] {
        return [this.readFloat32(), this.readFloat32()]
    }

    private readColor(): Color {
        return [
            this.readUInt8() / 255,
            this.readUInt8() / 255,
            this.readUInt8() / 255,
            this.readUInt8() / 255,
        ]
    }

    private skip(bytes: number) {
        this.offset += bytes
    }

    private async loadV14(xmodelSurf: XModelSurf, xmodelPart?: XModelPart): Promise<void> {
        const surfaceCount = this.readUInt16()

        for (let s = 0; s < surfaceCount; s++) {
            this.skip(1) // skip unknown byte

            const vertexCount = this.readUInt16()
            const triangleCount = this.readUInt16()

            this.skip(2) // skip padding

            let defaultBoneIdx = this.readUInt16()
            if (defaultBoneIdx === XModelSurfLoader.RIGGED) {
                this.skip(4) // skip unknown bytes
                defaultBoneIdx = 0
            }

            const triangles: number[] = []
            while (triangles.length / 3 < triangleCount) {
                const idxCount = this.readUInt8()

                const idx1 = this.readUInt16()
                let idx2 = this.readUInt16()
                let idx3 = this.readUInt16()

                if (idx1 !== idx2 && idx1 !== idx3 && idx2 !== idx3) {
                    triangles.push(idx3, idx1, idx2)
                }

                let i = 3
                while (i < idxCount) {
                    const idx4 = idx3
                    const idx5 = this.readUInt16()

                    if (idx4 !== idx2 && idx4 !== idx5 && idx2 !== idx5) {
                        triangles.push(idx5, idx4, idx2)
                    }

                    i++
                    if (i >= idxCount) break

                    idx2 = idx5
                    idx3 = this.readUInt16()

                    if (idx4 !== idx2 && idx4 !== idx3 && idx2 !== idx3) {
                        triangles.push(idx3, idx4, idx2)
                    }

                    i++
                }
            }

            const boneWeightCounts = new Array(vertexCount).fill(0)
            const vertices: XModelSurfVertex[] = []

            for (let i = 0; i < vertexCount; i++) {
                let normal = this.readVec3()
                const uv = this.readVec2()
                let weightCount = 0
                let vertexBoneIdx = defaultBoneIdx

                if (defaultBoneIdx === XModelSurfLoader.RIGGED) {
                    weightCount = this.readUInt16()
                    vertexBoneIdx = this.readUInt16()
                }

                let position = this.readVec3()

                if (weightCount !== 0) {
                    this.skip(4) // skip padding
                }

                boneWeightCounts[i] = weightCount

                if (xmodelPart) {
                    const xmodelPartBone = xmodelPart.bones[vertexBoneIdx]
                    if (xmodelPartBone) {
                        position = vec3_add(
                            vec3_rotate(position, xmodelPartBone.worldTransform.rotation),
                            xmodelPartBone.worldTransform.position,
                        )
                        normal = vec3_rotate(normal, xmodelPartBone.worldTransform.rotation)
                    }
                }

                vertices.push({
                    normal,
                    color: [1.0, 1.0, 1.0, 1.0],
                    uv,
                    bone: vertexBoneIdx,
                    position,
                    weights: [
                        {
                            bone: vertexBoneIdx,
                            influence: 1.0,
                        },
                    ],
                })
            }

            for (let i = 0; i < vertexCount; i++) {
                const weightCount = boneWeightCounts[i]
                if (weightCount > 0) {
                    for (let w = 0; w < weightCount; w++) {
                        const weightBoneIdx = this.readUInt16()
                        this.skip(12) // skip padding
                        let weightInfluence = this.readFloat32()
                        weightInfluence /= XModelSurfLoader.RIGGED

                        vertices[i].weights[0].influence -= weightInfluence
                        vertices[i].weights.push({
                            bone: weightBoneIdx,
                            influence: weightInfluence,
                        })
                    }
                }
            }

            xmodelSurf.surfaces.push({
                vertices,
                triangles,
            })
        }
    }

    private async loadV20(xmodelSurf: XModelSurf, xmodelPart?: XModelPart): Promise<void> {
        const surfaceCount = this.readUInt16()

        for (let s = 0; s < surfaceCount; s++) {
            this.skip(1) // skip unknown byte

            const vertexCount = this.readUInt16()
            const triangleCount = this.readUInt16()
            let defaultBoneIdx = this.readUInt16()

            if (defaultBoneIdx === XModelSurfLoader.RIGGED) {
                this.skip(2) // skip unknown bytes
                defaultBoneIdx = 0
            }

            const vertices: XModelSurfVertex[] = []

            for (let i = 0; i < vertexCount; i++) {
                let normal = this.readVec3()
                const color = this.readColor()
                const uv = this.readVec2()

                this.skip(24) // skip padding

                let weightCount = 0
                let vertexBoneIdx = defaultBoneIdx

                if (defaultBoneIdx === 0) {
                    weightCount = this.readUInt8()
                    vertexBoneIdx = this.readUInt16()
                    this.skip(1) // skip padding
                }

                let position = this.readVec3()
                const vertexWeights: XModelSurfWeight[] = [
                    {
                        bone: vertexBoneIdx,
                        influence: 1.0,
                    },
                ]

                if (weightCount > 0) {
                    for (let w = 0; w < weightCount; w++) {
                        const weightBoneIdx = this.readUInt16()
                        this.skip(12) // skip padding
                        let weightInfluence = this.readUInt16() / XModelSurfLoader.RIGGED

                        vertexWeights[0].influence -= weightInfluence
                        vertexWeights.push({
                            bone: weightBoneIdx,
                            influence: weightInfluence,
                        })
                    }
                }

                if (xmodelPart) {
                    const xmodelPartBone = xmodelPart.bones[vertexBoneIdx]
                    position = vec3_add(
                        vec3_rotate(position, xmodelPartBone.worldTransform.rotation),
                        xmodelPartBone.worldTransform.position,
                    )
                    normal = vec3_rotate(normal, xmodelPartBone.worldTransform.rotation)
                }

                vertices.push({
                    normal,
                    color,
                    uv,
                    bone: vertexBoneIdx,
                    position,
                    weights: vertexWeights,
                })
            }

            const triangles: number[] = []

            for (let t = 0; t < triangleCount; t++) {
                const indices = [this.readUInt16(), this.readUInt16(), this.readUInt16()]
                triangles.push(indices[0], indices[1], indices[2])
            }

            xmodelSurf.surfaces.push({
                vertices,
                triangles,
            })
        }
    }

    private async loadV25(xmodelSurf: XModelSurf): Promise<void> {
        const surfaceCount = this.readUInt16()

        for (let s = 0; s < surfaceCount; s++) {
            this.skip(3) // skip unknown bytes

            const vertexCount = this.readUInt16()
            const triangleCount = this.readUInt16()
            const vertexCount2 = this.readUInt16()

            if (vertexCount !== vertexCount2) {
                this.skip(2)
                if (vertexCount2 !== 0) {
                    while (true) {
                        const p = this.readUInt16()
                        if (p === 0) break
                    }
                    this.skip(2)
                }
            } else {
                this.skip(4)
            }

            const vertices: XModelSurfVertex[] = []

            for (let i = 0; i < vertexCount; i++) {
                const normal = this.readVec3()
                const color = this.readColor()
                const uv = this.readVec2()

                this.skip(24) // skip padding

                let weightCount = 0
                let vertexBoneIdx = 0

                if (vertexCount !== vertexCount2) {
                    weightCount = this.readUInt8()
                    vertexBoneIdx = this.readUInt16()
                }

                const position = this.readVec3()
                const vertexWeights: XModelSurfWeight[] = [
                    {
                        bone: vertexBoneIdx,
                        influence: 1.0,
                    },
                ]

                if (weightCount > 0) {
                    for (let w = 0; w < weightCount; w++) {
                        const weightBoneIdx = this.readUInt16()
                        const weightInfluence = this.readUInt16() / XModelSurfLoader.RIGGED

                        vertexWeights[0].influence -= weightInfluence
                        vertexWeights.push({
                            bone: weightBoneIdx,
                            influence: weightInfluence,
                        })
                    }
                }

                vertices.push({
                    normal,
                    color,
                    uv,
                    bone: vertexBoneIdx,
                    position,
                    weights: vertexWeights,
                })
            }

            const triangles: number[] = []

            for (let t = 0; t < triangleCount; t++) {
                const indices = [this.readUInt16(), this.readUInt16(), this.readUInt16()]
                triangles.push(indices[0], indices[1], indices[2])
            }

            xmodelSurf.surfaces.push({
                vertices,
                triangles,
            })
        }
    }

    private async loadV62(xmodelSurf: XModelSurf): Promise<void> {
        // Similar to loadV25, but with slight differences in offsets
        const surfaceCount = this.readUInt16()

        for (let s = 0; s < surfaceCount; s++) {
            this.skip(3) // skip unknown bytes

            const vertexCount = this.readUInt16()
            const triangleCount = this.readUInt16()
            const vertexCount2 = this.readUInt16()

            if (vertexCount !== vertexCount2) {
                this.skip(2)
                if (vertexCount2 !== 0) {
                    while (true) {
                        const p = this.readUInt16()
                        if (p === 0) break
                    }
                    this.skip(2)
                }
            } else {
                this.skip(4)
            }

            const vertices: XModelSurfVertex[] = []

            for (let i = 0; i < vertexCount; i++) {
                const normal = this.readVec3()
                const color = this.readColor()
                const uv = this.readVec2()

                this.skip(28) // skip padding

                let weightCount = 0
                let vertexBoneIdx = 0

                if (vertexCount !== vertexCount2) {
                    weightCount = this.readUInt8()
                    vertexBoneIdx = this.readUInt16()
                }

                const position = this.readVec3()
                const vertexWeights: XModelSurfWeight[] = [
                    {
                        bone: vertexBoneIdx,
                        influence: 1.0,
                    },
                ]

                if (weightCount > 0) {
                    for (let w = 0; w < weightCount; w++) {
                        const weightBoneIdx = this.readUInt16()
                        const weightInfluence = this.readUInt16() / XModelSurfLoader.RIGGED

                        vertexWeights[0].influence -= weightInfluence
                        vertexWeights.push({
                            bone: weightBoneIdx,
                            influence: weightInfluence,
                        })
                    }
                }

                vertices.push({
                    normal,
                    color,
                    uv,
                    bone: vertexBoneIdx,
                    position,
                    weights: vertexWeights,
                })
            }

            const triangles: number[] = []

            for (let t = 0; t < triangleCount; t++) {
                const indices = [this.readUInt16(), this.readUInt16(), this.readUInt16()]
                triangles.push(indices[0], indices[1], indices[2])
            }

            xmodelSurf.surfaces.push({
                vertices,
                triangles,
            })
        }
    }
}
