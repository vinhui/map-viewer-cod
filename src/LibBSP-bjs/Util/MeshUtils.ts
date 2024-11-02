import {FloatArray, ISize, Matrix, Vector2 as BjsVec2, Vector3 as BjsVec3, VertexData} from '@babylonjs/core'
import {BSP, Color, Face, LODTerrain, TextureInfo, Vector2 as BspVec2, Vector3 as BspVec3, Vertex} from 'libbsp-js'
import {BSPExtension} from '../Extensions/BSPExtension'
import {TextureInfoExtensions} from '../Extensions/TextureInfoExtensions'

export class MeshUtils {
    public static readonly inch2MeterScale = 0.0254

    public static CreateFaceMesh(bsp: BSP, face: Face, dims: ISize, curveTesselationLevel: number): VertexData {
        let mesh: VertexData = null
        if (face.numVertices > 0) {
            if (face.numIndices === 0 && face.type === 2) {
                mesh = this.CreatePatchMesh(bsp, face, curveTesselationLevel)
            } else {
                mesh = this.LoadVerticesFromFace(bsp, face)
            }
        } else if (face.numEdgeIndices > 0) {
            mesh = this.LoadVerticesFromEdges(bsp, face)
        }
        if (mesh) {
            const textureInfo = BSPExtension.GetTextureInfo(bsp, face)
            if (textureInfo.data && textureInfo.data.length > 0) {
                this.CalculateUVs(mesh, textureInfo, dims)
            }
        }
        return mesh
    }

    public static LoadVertices(vertices: Vertex[]): VertexData {
        const mesh = new VertexData()
        mesh.positions = this.Vector3sToArray(vertices.map(x => x.position))
        mesh.normals = this.Vector3sToArray(vertices.map(x => x.normal))
        mesh.uvs = this.Vector2sToArray(vertices.map(x => x.uv0))
        mesh.uvs2 = this.Vector2sToArray(vertices.map(x => x.uv1))
        mesh.colors = this.ColorsToArray(vertices.map(x => x.color))

        for (let i = 1; i < mesh.uvs.length; i += 2) {
            // mesh.uvs[i] = 1 - mesh.uvs[i]
        }

        return mesh
    }

    public static LoadVerticesFromFace(bsp: BSP, face: Face): VertexData {
        const mesh = this.LoadVertices(bsp.getReferencedObjects<Vertex>(face, 'vertices'))
        const indices = face.indices// bsp.getReferencedObjects<bigint>(face, 'indices')
        const triangles = new Int32Array(indices.length)
        for (let i = 0; i < indices.length; i++) {
            triangles[i] = Number(indices[i])
        }
        mesh.indices = triangles
        return mesh
    }

    public static LoadVerticesFromEdges(bsp: BSP, face: Face): VertexData {
        const vertices: Vertex[] = []
        const triangles = new Int32Array((face.numEdgeIndices - 2) * 3)
        const firstSurfEdge = Number(bsp.faceEdges.get(face.firstEdgeIndexIndex))
        if (firstSurfEdge > 0) {
            vertices[0] = bsp.vertices.get(bsp.edges.get(firstSurfEdge).firstVertexIndex)
        } else {
            vertices[0] = bsp.vertices.get(bsp.edges.get(-firstSurfEdge).secondVertexIndex)
        }

        let currTriangle = 0
        let currVert = 0

        for (let i = 0; i < face.numEdgeIndices; i++) {
            let currSurfEdge = Number(bsp.faceEdges.get(face.firstEdgeIndexIndex + i))
            let first: Vertex
            let second: Vertex

            if (currSurfEdge > 0) {
                const e = bsp.edges.get(currSurfEdge)
                first = bsp.vertices.get(e.firstVertexIndex)
                second = bsp.vertices.get(e.secondVertexIndex)
            } else {
                const e = bsp.edges.get(-currSurfEdge)
                first = bsp.vertices.get(e.secondVertexIndex)
                second = bsp.vertices.get(e.firstVertexIndex)
            }

            if (first.position !== vertices[0].position && second.position !== vertices[0].position) {
                triangles[currTriangle * 3] = 0
                let firstFound = false
                let secondFound = false
                for (let j = 0; j < currVert; j++) {
                    if (first.position === vertices[j].position) {
                        triangles[currTriangle * 3 + 1] = j
                        firstFound = true
                    }
                }
                if (!firstFound) {
                    vertices[currVert] = first
                    triangles[currTriangle * 3 + 1] = currVert
                    currVert++
                }
                for (let j = 0; j < currVert; j++) {
                    if (second.position === vertices[j].position) {
                        triangles[currTriangle * 3 + 2] = j
                        secondFound = true
                    }
                }
                if (!secondFound) {
                    vertices[currVert] = second
                    triangles[currTriangle * 3 + 2] = currVert
                    currVert++
                }
                currTriangle++
            }
        }

        const mesh = this.LoadVertices(vertices)
        mesh.indices = triangles

        return mesh
    }

    public static CalculateUVs(mesh: VertexData, textureInfo: TextureInfo, dims: ISize) {
        const uv = new Float32Array(mesh.positions.length / 3 * 2)
        const textureMatrixInverse: Matrix = TextureInfoExtensions.BuildTexMatrix(textureInfo).invert()
        for (let i = 0; i < uv.length; i += 2) {
            const vec3 = new BjsVec3(
                mesh.positions[i / 2 * 3 + 0],
                mesh.positions[i / 2 * 3 + 1],
                mesh.positions[i / 2 * 3 + 2],
            )
            const transformVertex = BjsVec3.TransformCoordinates(vec3, textureMatrixInverse)
            const uv0: BjsVec2 = TextureInfoExtensions.CalculateUV(textureInfo, transformVertex, dims)
            uv[i + 0] = uv0.x
            uv[i + 1] = uv0.y
        }
        mesh.uvs = uv
    }

    public static TransformVertices(mesh: VertexData, transform: Matrix) {
        const vertices = mesh.positions
        const normals = mesh.normals
        for (let i = 0; i < vertices.length; i += 3) {
            const v = new BjsVec3(
                vertices[i + 0],
                vertices[i + 1],
                vertices[i + 2],
            )
            const n = new BjsVec3(
                normals[i + 0],
                normals[i + 1],
                normals[i + 2],
            )
            BjsVec3.TransformCoordinatesToRef(v, transform, v)
            BjsVec3.TransformNormalToRef(n, transform, n)

            mesh.positions[i + 0] = v.x
            mesh.positions[i + 1] = v.y
            mesh.positions[i + 2] = v.z

            mesh.normals[i + 0] = n.x
            mesh.normals[i + 1] = n.y
            mesh.normals[i + 2] = n.z
        }
        mesh.positions = vertices
        mesh.normals = normals
    }

    public static CombineAllMeshes(meshes: VertexData[]): VertexData {
        const result = meshes.pop()
        result.merge(meshes)
        return result
    }

    public static CreateDisplacementMesh(bsp: BSP, face: Face, dims: ISize): VertexData {
        let mesh: VertexData = null
        if (face.numEdgeIndices > 0) {
            mesh = this.LoadVerticesFromEdges(bsp, face)
        } else {
            console.warn('Cannot create displacement, face contains no edges.')
            return null
        }

        const faceCorners: BjsVec3[] = this.ArrayToVector3(mesh.positions)
        const faceTriangles = mesh.indices
        if (faceCorners.length !== 4 * 3 || faceTriangles.length !== 6) {
            console.warn(`Cannot create displacement mesh because ${faceCorners.length} corners and ${faceTriangles.length} triangles indices`)
            return null
        }

        const displacement = bsp.displacements.get(face.displacementIndex)
        const numSideTriangles = Math.trunc(Math.pow(2, displacement.power))

        const displacementVertices = displacement.vertices

        const corners: BjsVec3[] = []
        const s = displacement.startPosition
        const start = new BjsVec3(s.x, s.y, s.z)
        if ((faceCorners[faceTriangles[0]].subtract(start)).lengthSquared() < .01) {
            corners[0] = faceCorners[faceTriangles[0]]
            corners[1] = faceCorners[faceTriangles[1]]
            corners[2] = faceCorners[faceTriangles[5]]
            corners[3] = faceCorners[faceTriangles[4]]
        } else if ((faceCorners[faceTriangles[1]].subtract(start)).lengthSquared() < .01) {
            corners[0] = faceCorners[faceTriangles[1]]
            corners[1] = faceCorners[faceTriangles[4]]
            corners[2] = faceCorners[faceTriangles[0]]
            corners[3] = faceCorners[faceTriangles[5]]
        } else if ((faceCorners[faceTriangles[5]].subtract(start)).lengthSquared() < .01) {
            corners[0] = faceCorners[faceTriangles[5]]
            corners[1] = faceCorners[faceTriangles[0]]
            corners[2] = faceCorners[faceTriangles[4]]
            corners[3] = faceCorners[faceTriangles[1]]
        } else if ((faceCorners[faceTriangles[4]].subtract(start)).lengthSquared() < .01) {
            corners[0] = faceCorners[faceTriangles[4]]
            corners[1] = faceCorners[faceTriangles[5]]
            corners[2] = faceCorners[faceTriangles[1]]
            corners[3] = faceCorners[faceTriangles[0]]
        } else {
            console.warn(`Cannot create displacement mesh because start position isn't one of the face corners.
Start position: ${start}
Corners: ${faceCorners[faceTriangles[0]]} ${faceCorners[faceTriangles[1]]} ${faceCorners[faceTriangles[5]]} ${faceCorners[faceTriangles[4]]}`)
            return null
        }

        const offsets: BjsVec3[] = []
        for (let i = 0; i < displacementVertices.length; i++) {
            const n = displacementVertices[i].normal
            offsets[i] = new BjsVec3(n.x, n.y, n.z).scaleInPlace(displacementVertices[i].magnitude)
        }
        const uv = new Float32Array(4 * 2)
        const uv2 = new Float32Array(4 * 2)

        const positions = this.Vector3sToArray(corners)
        mesh.positions = positions
        mesh.normals = new Float32Array(positions.length)
        mesh.uvs = uv
        mesh.uvs2 = uv2
        this.CalculateUVs(mesh, BSPExtension.GetTextureInfo(bsp, face), dims)
        this.CalculateTerrainVertices(mesh, offsets, numSideTriangles)
        VertexData.ComputeNormals(mesh.positions, mesh.indices, mesh.normals)

        return mesh
    }

    public static CreateMoHAATerrainMesh(bsp: BSP, lodTerrain: LODTerrain): VertexData {
        const origin = new BjsVec3(lodTerrain.x * 64, lodTerrain.y * 64, lodTerrain.baseZ)
        const corners: BjsVec3[] = this.GetCornersForTerrain(origin, 512, (lodTerrain.flags & 1 << 6) > 0)
        const offsets: BjsVec3[] = []
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if ((lodTerrain.flags & 1 << 6) > 0) {
                    offsets[x * 9 + y] = BjsVec3.Up().scaleInPlace(lodTerrain.heightmap[y][x] * 2)
                } else {
                    offsets[y * 9 + x] = BjsVec3.Up().scaleInPlace(lodTerrain.heightmap[y][x] * 2)
                }
            }
        }

        const uv = new Float32Array([
            lodTerrain.uvs[0], lodTerrain.uvs[1],
            lodTerrain.uvs[2], lodTerrain.uvs[3],
            lodTerrain.uvs[4], lodTerrain.uvs[5],
            lodTerrain.uvs[6], lodTerrain.uvs[7],
        ])
        const uv2 = new Float32Array(4 * 2)
        const positions = this.Vector3sToArray(corners)
        const mesh = new VertexData()
        mesh.positions = positions
        mesh.uvs = uv
        mesh.uvs2 = uv2
        this.CalculateTerrainVertices(mesh, offsets, 8)
        mesh.indices = this.BuildDisplacementTrianges(8)
        VertexData.ComputeNormals(mesh.positions, mesh.indices, mesh.normals)

        return mesh
    }

    public static GetCornersForTerrain(origin: BjsVec3, side: number, inverted: boolean): BjsVec3[] {
        const corners = [
            origin,
            new BjsVec3(origin.x, origin.y + side, origin.z),
            new BjsVec3(origin.x + side, origin.y, origin.z),
            new BjsVec3(origin.x + side, origin.y + side, origin.z),
        ]

        if (inverted) {
            const temp = corners[1]
            corners[1] = corners[3]
            corners[3] = temp
        }

        return corners
    }

    public static CreatePatchMesh(bps: BSP, face: Face, curveTessellationLevel): VertexData {
        const curveSubmeshes = []
        const controls = bps.getReferencedObjects<Vertex>(face, 'vertices')
        const size = face.patchSize
        const xSize = Math.round(size[0])
        for (let i = 0; i < size[1] - 2; i += 2) {
            for (let j = 0; j < size[0] - 2; j += 2) {
                let rowOff = i * xSize
                const thisCurveControls: Vertex[] = []

                // Store control points
                thisCurveControls[0] = controls[rowOff + j]
                thisCurveControls[1] = controls[rowOff + j + 1]
                thisCurveControls[2] = controls[rowOff + j + 2]
                rowOff += xSize
                thisCurveControls[3] = controls[rowOff + j]
                thisCurveControls[4] = controls[rowOff + j + 1]
                thisCurveControls[5] = controls[rowOff + j + 2]
                rowOff += xSize
                thisCurveControls[6] = controls[rowOff + j]
                thisCurveControls[7] = controls[rowOff + j + 1]
                thisCurveControls[8] = controls[rowOff + j + 2]

                curveSubmeshes.push(this.CreateQuadraticBezierMesh(thisCurveControls, curveTessellationLevel))
            }
        }

        return this.CombineAllMeshes(curveSubmeshes)
    }

    public static CreateQuadraticBezierMesh(bezierControls: Vertex[], curveTessellationLevel: number): VertexData {
        const mesh = this.LoadVertices(this.TessellateCurveVertices(bezierControls, curveTessellationLevel))
        mesh.indices = this.BuildCurveTriangles(curveTessellationLevel)
        return mesh
    }

    private static CalculateTerrainVertices(mesh: VertexData, displacementMap: BjsVec3[], numSideTriangles: number) {
        const numSideVertices = numSideTriangles + 1
        const vertices = []
        const corners = this.ArrayToVector3(mesh.positions)
        const calculatedUV: BjsVec2[] = []
        const uv = this.ArrayToVector2(mesh.uvs)
        const calculatedUV2: BjsVec2[] = []
        const uv2 = this.ArrayToVector2(mesh.uvs2)

        for (let i = 0; i < numSideVertices; i++) {
            const rowPosition = i / numSideTriangles
            const rowStart = BjsVec3.Lerp(corners[0], corners[1], rowPosition)
            const rowEnd = BjsVec3.Lerp(corners[2], corners[3], rowPosition)
            const uvStart = BjsVec2.Lerp(uv[0], uv[1], rowPosition)
            const uvEnd = BjsVec2.Lerp(uv[2], uv[3], rowPosition)
            const uv2Start = BjsVec2.Lerp(uv2[0], uv2[1], rowPosition)
            const uv2End = BjsVec2.Lerp(uv2[2], uv2[3], rowPosition)
            for (let j = 0; j < numSideVertices; ++j) {
                // column
                const current = i * numSideVertices + j
                const columnPosition = j / numSideTriangles
                vertices[current] = BjsVec3.Lerp(rowStart, rowEnd, columnPosition).addInPlace(displacementMap[current])
                calculatedUV[current] = BjsVec2.Lerp(uvStart, uvEnd, columnPosition)
                calculatedUV2[current] = BjsVec2.Lerp(uv2Start, uv2End, columnPosition)
            }
        }
        mesh.positions = this.Vector3sToArray(vertices)
        mesh.uvs = this.Vector2sToArray(calculatedUV)
        mesh.uvs2 = this.Vector2sToArray(calculatedUV2)
    }

    private static BuildDisplacementTrianges(numSideTriangles: number): number[] {
        const triangles: number[] = []
        const numSideVertices = numSideTriangles + 1

        for (let i = 0; i < numSideTriangles; i++) {
            for (let j = 0; j < numSideTriangles; j++) {
                triangles[i * numSideTriangles * 6 + j * 6] = i * numSideVertices + j
                triangles[i * numSideTriangles * 6 + j * 6 + 5] = (i + 1) * numSideVertices + j + 1
                triangles[i * numSideTriangles * 6 + j * 6 + 2] = i * numSideVertices + j + 1
                triangles[i * numSideTriangles * 6 + j * 6 + 4] = (i + 1) * numSideVertices + j
                if ((i + j) % 2 == 0) {
                    triangles[i * numSideTriangles * 6 + j * 6 + 1] = (i + 1) * numSideVertices + j + 1
                    triangles[i * numSideTriangles * 6 + j * 6 + 3] = i * numSideVertices + j
                } else {
                    triangles[i * numSideTriangles * 6 + j * 6 + 1] = (i + 1) * numSideVertices + j
                    triangles[i * numSideTriangles * 6 + j * 6 + 3] = i * numSideVertices + j + 1
                }
            }
        }
        return triangles
    }

    private static TessellateCurveVertices(bezierControls: Vertex[], curveTessellationLevel: number): Vertex[] {
        const vertices = []
        for (let i = 0; i <= curveTessellationLevel; ++i) {
            const p = i / curveTessellationLevel

            const temp = []
            const tempUVs = []
            const tempUV2s = []

            for (let j = 0; j < 3; ++j) {
                temp[j] = this.InterpolateCurve(this.ToBjsVec(bezierControls[3 * j].position), this.ToBjsVec(bezierControls[3 * j + 1].position), this.ToBjsVec(bezierControls[3 * j + 2].position), p)
                tempUVs[j] = this.InterpolateCurve(this.ToBjsVec(bezierControls[3 * j].uv0), this.ToBjsVec(bezierControls[3 * j + 1].uv0), this.ToBjsVec(bezierControls[3 * j + 2].uv0), p)
                tempUV2s[j] = this.InterpolateCurve(this.ToBjsVec(bezierControls[3 * j].uv1), this.ToBjsVec(bezierControls[3 * j + 1].uv1), this.ToBjsVec(bezierControls[3 * j + 2].uv1), p)
            }

            for (let j = 0; j <= curveTessellationLevel; ++j) {
                const a2 = j / curveTessellationLevel

                vertices[i * (curveTessellationLevel + 1) + j].position = this.InterpolateCurve(temp[0], temp[1], temp[2], a2)
                vertices[i * (curveTessellationLevel + 1) + j].uv0 = this.InterpolateCurve(tempUVs[0], tempUVs[1], tempUVs[2], a2)
                vertices[i * (curveTessellationLevel + 1) + j].uv1 = this.InterpolateCurve(tempUV2s[0], tempUV2s[1], tempUV2s[2], a2)
            }
        }

        return vertices
    }

    private static BuildCurveTriangles(curveTessellationLevel: number): number[] {
        const triangles = []

        for (let row = 0; row < curveTessellationLevel; row++) {
            for (let col = 0; col < curveTessellationLevel; col++) {
                triangles[(row * curveTessellationLevel + col) * 6] = row * (curveTessellationLevel + 1) + col
                triangles[((row * curveTessellationLevel) + col) * 6 + 1] = row * (curveTessellationLevel + 1) + col + 1
                triangles[((row * curveTessellationLevel) + col) * 6 + 2] = row * (curveTessellationLevel + 1) + col + (curveTessellationLevel + 1)
                triangles[((row * curveTessellationLevel) + col) * 6 + 3] = row * (curveTessellationLevel + 1) + col + 1
                triangles[((row * curveTessellationLevel) + col) * 6 + 4] = row * (curveTessellationLevel + 1) + col + (curveTessellationLevel + 1) + 1
                triangles[((row * curveTessellationLevel) + col) * 6 + 5] = row * (curveTessellationLevel + 1) + col + (curveTessellationLevel + 1)
            }
        }

        return triangles
    }

    private static InterpolateCurve<T extends BjsVec2 | BjsVec3>(v1: T, v2: T, v3: T, t: number): T extends BspVec2 ? BjsVec2 : BjsVec3 {
        const pinv = 1.0 - t
        return v1.scale(pinv * pinv)
            .addInPlace(
                v2.scale(2 * pinv * t)
                    .addInPlace(
                        v3.scale(t * t) as T extends BspVec2 ? BjsVec2 : BjsVec3,
                    ) as T extends BspVec2 ? BjsVec2 : BjsVec3,
            ) as T extends BspVec2 ? BjsVec2 : BjsVec3
    }

    private static ToBjsVec<T extends BspVec2 | BspVec3>(vec: T): T extends BspVec2 ? BjsVec2 : BjsVec3 {
        if (vec instanceof BspVec2) {
            return new BjsVec2(vec.x, vec.y) as T extends BspVec2 ? BjsVec2 : BjsVec3
        } else {
            return new BjsVec3(vec.x, vec.y, vec.z) as T extends BspVec2 ? BjsVec2 : BjsVec3
        }
    }

    private static Vector3sToArray(vectors: { x: number, y: number, z: number }[]): Float32Array {
        const result = new Float32Array(vectors.length * 3)
        for (let i = 0; i < result.length; i += 3) {
            result[i + 0] = vectors[i / 3].x
            result[i + 1] = vectors[i / 3].y
            result[i + 2] = vectors[i / 3].z
        }
        return result
    }

    private static ArrayToVector3(arr: FloatArray): BjsVec3[] {
        const result: BjsVec3[] = []
        for (let i = 0; i < arr.length; i += 3) {
            result.push(new BjsVec3(
                arr[i + 0],
                arr[i + 1],
                arr[i + 2],
            ))
        }
        return result
    }

    private static Vector2sToArray(vectors: { x: number, y: number }[]): Float32Array {
        const result = new Float32Array(vectors.length * 2)
        for (let i = 0; i < result.length; i += 2) {
            result[i + 0] = vectors[i / 2].x
            result[i + 1] = vectors[i / 2].y
        }
        return result
    }

    private static ArrayToVector2(arr: FloatArray): BjsVec2[] {
        const result: BjsVec2[] = []
        for (let i = 0; i < arr.length; i += 2) {
            result.push(new BjsVec2(
                arr[i + 0],
                arr[i + 1],
            ))
        }
        return result
    }

    private static ColorsToArray(vectors: Color[]): Float32Array {
        const result = new Float32Array(vectors.length * 4)
        for (let i = 0; i < result.length; i += 4) {
            result[i + 0] = vectors[i / 4].r / 255
            result[i + 1] = vectors[i / 4].g / 255
            result[i + 2] = vectors[i / 4].g / 255
            result[i + 3] = vectors[i / 4].g / 255
        }
        return result
    }

    private static ArrayToColor(arr: FloatArray): Color[] {
        const result: Color[] = []
        for (let i = 0; i < arr.length; i += 4) {
            result.push(new Color(
                arr[i + 0],
                arr[i + 1],
                arr[i + 2],
                arr[i + 3],
            ))
        }
        return result
    }
}