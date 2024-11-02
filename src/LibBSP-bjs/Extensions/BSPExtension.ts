import {BSP, Face, Leaf, LumpObjDataCtor, Model, Node, TextureInfo} from 'libbsp-js'

export class BSPExtension {
    public static GetLeavesInModel(bsp: BSP, model: Model): Leaf[] {
        let result: Leaf[]
        if (model.firstLeafIndex < 0) {
            if (model.headNodeIndex >= 0) {
                result = BSPExtension.GetLeavesInNode(bsp, bsp.nodes.get(model.headNodeIndex))
            }
        } else {
            result = []
            for (let i = 0; i < model.numLeaves; i++) {
                result.push(bsp.leaves.get(model.firstLeafIndex + i))
            }
        }
        return result
    }

    public static GetLeavesInNode(bsp: BSP, node: Node): Leaf[] {
        const nodeLeaves: Leaf[] = []
        const nodestack: Node[] = []

        let currentNode: Node
        while (!(nodestack.length === 0)) {
            currentNode = nodestack.pop()
            const right = currentNode.child2Index
            if (right >= 0) {
                nodestack.push(bsp.nodes.get(right))
            } else {
                nodeLeaves.push(bsp.leaves.get((right * -1) - 1))
            }
            const left = currentNode.child1Index
            if (left >= 0) {
                nodestack.push(bsp.nodes.get(left))
            } else {
                nodeLeaves.push(bsp.leaves.get((left * -1) - 1))
            }
        }
        return nodeLeaves
    }

    public static GetFacesInModel(bsp: BSP, model: Model): Face[] {
        let result = []
        if (model.firstFaceIndex >= 0) {
            if (!result) {
                result = []
            }
            for (let i = 0; i < model.numFaces; i++) {
                result.push(bsp.faces.get(model.firstFaceIndex + i))
            }
        } else {
            const faceUsed: boolean[] = []
            const leaves: Leaf[] = BSPExtension.GetLeavesInModel(bsp, model)
            for (let leaf of leaves) {
                if (leaf.firstMarkFaceIndex >= 0) {
                    if (!result) {
                        result = []
                    }

                    for (let i = 0; i < leaf.numMarkFaceIndices; i++) {
                        const currentFace = Number(bsp.leafFaces.get(leaf.firstMarkFaceIndex + 1))
                        if (!faceUsed[i]) {
                            faceUsed[currentFace] = true
                            result.push(bsp.faces.get(currentFace))
                        }
                    }
                }
            }
        }
        return result
    }

    public static FindTexDataWithTexture(bsp: BSP, texture: string): number {
        for (let i = 0; i < bsp.textureData.count; i++) {
            const temp = bsp.textures.getTextureAtOffset(
                Number(bsp.textureTable.get(
                    bsp.textureData.get(i).textureStringOffsetIndex,
                )),
            )
            if (temp === texture) {
                return i
            }
        }
        return -1
    }

    public static GetTextureIndex(bsp: BSP, face: Face): number {
        if (face.textureIndex >= 0) {
            return face.textureIndex
        } else {
            if (face.textureInfoIndex >= 0) {
                const textureData = bsp.textureData
                if (textureData) {
                    return textureData.get(bsp.textureInfo.get(face.textureInfoIndex).textureIndex).textureStringOffsetIndex
                } else {
                    return bsp.textureInfo.get(face.textureInfoIndex).textureIndex
                }
            }
        }
        return -1
    }

    public static GetTextureInfo(bsp: BSP, face: Face): TextureInfo {
        if (face.textureIndex >= 0 && bsp.textures.get(face.textureIndex).textureInfo.data && bsp.textures.get(face.textureIndex).textureInfo.data.length > 0) {
            return bsp.textures.get(face.textureIndex).textureInfo
        }
        if (face.textureInfoIndex >= 0) {
            return bsp.textureInfo.get(face.textureInfoIndex)
        }
        return new TextureInfo(new LumpObjDataCtor(new Uint8Array(), null))
    }
}