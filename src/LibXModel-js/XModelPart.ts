import {euler_to_quat, Quat, quat_multiply, Vec3, vec3_add, vec3_rotate} from './math'
import {XModelVersion} from './XModelVersion'

export enum XModelType {
    Rigid = 48,
    Animated = 49,
    Viewmodel = 50,
    Playerbody = 51,
    Viewhands = 52,
}

export interface XModelPartBoneTransform {
    position: Vec3;
    rotation: Quat;
}

export interface XModelPartBone {
    name: string;
    parent: number;
    localTransform: XModelPartBoneTransform;
    worldTransform: XModelPartBoneTransform;
}

export interface XModelPart {
    name: string;
    version: XModelVersion;
    modelType: XModelType;
    bones: XModelPartBone[];
}

export class XModelPartLoader {
    // private static readonly ROTATION_DIVISOR = 32768.0
    // private static readonly INCH_TO_CM = 2.54
    private buffer: DataView
    private offset = 0

    constructor(data: Uint8Array) {
        this.buffer = new DataView(data.buffer)
    }

    public async load(name: string): Promise<XModelPart> {
        const version = this.readUInt16()
        const modelType = name.charCodeAt(name.length - 1) as XModelType

        const xmodelPart: XModelPart = {
            name,
            version: version as XModelVersion,
            modelType,
            bones: [],
        }

        switch (version) {
            case XModelVersion.V14:
                await this.loadV14(xmodelPart)
                break
            case XModelVersion.V20:
                await this.loadV20(xmodelPart)
                break
            case XModelVersion.V25:
                await this.loadV25(xmodelPart)
                break
            case XModelVersion.V62:
                await this.loadV62(xmodelPart)
                break
            default:
                throw new Error(`Invalid xmodelpart version: ${version}`)
        }

        return xmodelPart
    }

    private readUInt16(): number {
        const value = this.buffer.getUint16(this.offset, true)
        this.offset += 2
        return value
    }

    private readInt8(): number {
        const value = this.buffer.getInt8(this.offset)
        this.offset += 1
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

    private readVec3Int16(): Vec3 {
        return [this.buffer.getInt16(this.offset, true), this.buffer.getInt16(this.offset + 2, true), this.buffer.getInt16(this.offset + 4, true)]
    }

    private skip(bytes: number) {
        this.offset += bytes
    }

    private async loadV14(xmodelPart: XModelPart): Promise<void> {
        const [boneCount, rootBoneCount] = [this.readUInt16(), this.readUInt16()]
        this.initializeBones(xmodelPart, rootBoneCount)

        for (let i = 0; i < boneCount; i++) {
            const parent = this.readInt8()
            const position = this.readVec3()
            const rotation = this.readVec3Int16()

            const boneTransform = {position, rotation: euler_to_quat(rotation)}

            xmodelPart.bones.push({
                name: '',
                parent,
                localTransform: boneTransform,
                worldTransform: boneTransform,
            })
        }

        this.updateBoneNamesAndTransforms(xmodelPart, boneCount, rootBoneCount, this.viewhandTableCod1)
    }

    private async loadV20(xmodelPart: XModelPart): Promise<void> {
        const [boneCount, rootBoneCount] = [this.readUInt16(), this.readUInt16()]
        this.initializeBones(xmodelPart, rootBoneCount)

        for (let i = 0; i < boneCount; i++) {
            const parent = this.readInt8()
            const position = this.readVec3()
            const rotation = this.readVec3Int16()

            const boneTransform = {position, rotation: euler_to_quat(rotation)}

            xmodelPart.bones.push({
                name: '',
                parent,
                localTransform: boneTransform,
                worldTransform: boneTransform,
            })
        }

        this.updateBoneNamesAndTransforms(xmodelPart, boneCount, rootBoneCount, this.viewhandTableCod2)
    }

    private async loadV25(xmodelPart: XModelPart): Promise<void> {
        await this.loadV20(xmodelPart) // Similar structure to loadV20
    }

    private async loadV62(xmodelPart: XModelPart): Promise<void> {
        await this.loadV20(xmodelPart) // Similar structure to loadV20
    }

    private initializeBones(xmodelPart: XModelPart, rootBoneCount: number): void {
        for (let i = 0; i < rootBoneCount; i++) {
            xmodelPart.bones.push({
                name: '',
                parent: -1,
                localTransform: {position: [0.0, 0.0, 0.0], rotation: [0.0, 0.0, 0.0, 1.0] as Quat},
                worldTransform: {position: [0.0, 0.0, 0.0], rotation: [0.0, 0.0, 0.0, 1.0] as Quat},
            })
        }
    }

    private updateBoneNamesAndTransforms(xmodelPart: XModelPart, boneCount: number, rootBoneCount: number, viewhandTable: (boneName: string) => Vec3 | null): void {
        for (let i = 0; i < rootBoneCount + boneCount; i++) {
            const boneName = this.readString()
            const currentBone = {...xmodelPart.bones[i], name: boneName}
            this.skip(24) // skipping padding bytes

            if (xmodelPart.modelType === XModelType.Viewhands) {
                const viewmodelPos = viewhandTable(boneName)
                if (viewmodelPos) {
                    currentBone.localTransform.position = viewmodelPos
                    currentBone.worldTransform.position = viewmodelPos
                }
            }

            if (currentBone.parent > -1) {
                const parentBone = xmodelPart.bones[currentBone.parent]
                currentBone.worldTransform = this.generateWorldTransform(currentBone, parentBone)
            }

            xmodelPart.bones[i] = currentBone
        }
    }

    private readString(): string {
        let string = ''
        let char = this.buffer.getUint8(this.offset++)

        while (char !== 0) {  // Null-terminated check
            string += String.fromCharCode(char)
            char = this.buffer.getUint8(this.offset++)
        }

        return string
    }

    private generateWorldTransform(bone: XModelPartBone, parent: XModelPartBone): XModelPartBoneTransform {
        return {
            position: vec3_add(
                parent.worldTransform.position,
                vec3_rotate(bone.localTransform.position, parent.worldTransform.rotation),
            ),
            rotation: quat_multiply(parent.worldTransform.rotation, bone.localTransform.rotation),
        }
    }

    private viewhandTableCod1(boneName: string): Vec3 | null {
        const mappings: { [key: string]: Vec3 } = {
            'tag_view': [0.0, 0.0, 0.0],
            'tag_torso': [0.0, 0.0, 0.0],
            'tag_weapon': [0.0, 0.0, 0.0],
            'bip01 l upperarm': [0.0, 0.0, 0.0],
            'bip01 l forearm': [0.0, 0.0, 0.0],
            'bip01 l hand': [0.0, 0.0, 0.0],
            'bip01 l finger0': [0.0, 0.0, 0.0],
            'bip01 l finger01': [0.0, 0.0, 0.0],
            'bip01 l finger02': [0.0, 0.0, 0.0],
            'bip01 l finger0nub': [0.0, 0.0, 0.0],
            'bip01 l finger1': [0.0, 0.0, 0.0],
            'bip01 l finger11': [0.0, 0.0, 0.0],
            'bip01 l finger12': [0.0, 0.0, 0.0],
            'bip01 l finger1nub': [0.0, 0.0, 0.0],
            'bip01 l finger2': [0.0, 0.0, 0.0],
            'bip01 l finger21': [0.0, 0.0, 0.0],
            'bip01 l finger22': [0.0, 0.0, 0.0],
            'bip01 l finger2nub': [0.0, 0.0, 0.0],
            'bip01 l finger3': [0.0, 0.0, 0.0],
            'bip01 l finger31': [0.0, 0.0, 0.0],
            'bip01 l finger32': [0.0, 0.0, 0.0],
            'bip01 l finger3nub': [0.0, 0.0, 0.0],
            'bip01 l finger4': [0.0, 0.0, 0.0],
            'bip01 l finger41': [0.0, 0.0, 0.0],
            'bip01 l finger42': [0.0, 0.0, 0.0],
            'bip01 l finger4nub': [0.0, 0.0, 0.0],
            'bip01 r upperarm': [0.0, 0.0, 0.0],
            'bip01 r forearm': [0.0, 0.0, 0.0],
            'bip01 r hand': [0.0, 0.0, 0.0],
            'bip01 r finger0': [0.0, 0.0, 0.0],
            'bip01 r finger01': [0.0, 0.0, 0.0],
            'bip01 r finger02': [0.0, 0.0, 0.0],
            'bip01 r finger0nub': [0.0, 0.0, 0.0],
            'bip01 r finger1': [0.0, 0.0, 0.0],
            'bip01 r finger11': [0.0, 0.0, 0.0],
            'bip01 r finger12': [0.0, 0.0, 0.0],
            'bip01 r finger1nub': [0.0, 0.0, 0.0],
            'bip01 r finger2': [0.0, 0.0, 0.0],
            'bip01 r finger21': [0.0, 0.0, 0.0],
            'bip01 r finger22': [0.0, 0.0, 0.0],
            'bip01 r finger2nub': [0.0, 0.0, 0.0],
            'bip01 r finger3': [0.0, 0.0, 0.0],
            'bip01 r finger31': [0.0, 0.0, 0.0],
            'bip01 r finger32': [0.0, 0.0, 0.0],
            'bip01 r finger3nub': [0.0, 0.0, 0.0],
            'bip01 r finger4': [0.0, 0.0, 0.0],
            'bip01 r finger41': [0.0, 0.0, 0.0],
            'bip01 r finger42': [0.0, 0.0, 0.0],
            'bip01 r finger4nub': [0.0, 0.0, 0.0],
            'l hand webbing': [0.0, 0.0, 0.0],
            'r hand webbing': [0.0, 0.0, 0.0],
            'r cuff': [0.0, 0.0, 0.0],
            'r cuff01': [0.0, 0.0, 0.0],
            'r wrist': [0.0, 0.0, 0.0],
            'r wrist01': [0.0, 0.0, 0.0],
        }
        return mappings[boneName] || null
    }

    private viewhandTableCod2(boneName: string): Vec3 | null {
        const mappings: { [key: string]: Vec3 } = {
            'tag_view': [0.0, 0.0, 0.0],
            'tag_torso': [-11.76486, 0.0, -3.497466],
            'j_shoulder_le': [2.859542, 20.16072, -4.597286],
            'j_elbow_le': [30.7185, -8E-06, 3E-06],
            'j_wrist_le': [29.3906, 1.9E-05, -3E-06],
            'j_thumb_le_0': [2.786345, 2.245192, 0.85161],
            'j_thumb_le_1': [4.806596, -1E-06, 3E-06],
            'j_thumb_le_2': [2.433519, -2E-06, 1E-06],
            'j_thumb_le_3': [3.0, -1E-06, -1E-06],
            'j_flesh_le': [4.822557, 1.176307, -0.110341],
            'j_index_le_0': [10.53435, 2.786251, -3E-06],
            'j_index_le_1': [4.563, -3E-06, 1E-06],
            'j_index_le_2': [2.870304, 3E-06, -2E-06],
            'j_index_le_3': [2.999999, 4E-06, 1E-06],
            'j_mid_le_0': [10.71768, 0.362385, -0.38647],
            'j_mid_le_1': [4.842623, -1E-06, -1E-06],
            'j_mid_le_2': [2.957112, -1E-06, -1E-06],
            'j_mid_le_3': [3.000005, 4E-06, 0.0],
            'j_ring_le_0': [9.843364, -1.747671, -0.401116],
            'j_ring_le_1': [4.842618, 4E-06, -3E-06],
            'j_ring_le_2': [2.755294, -2E-06, 5E-06],
            'j_ring_le_3': [2.999998, -2E-06, -4E-06],
            'j_pinky_le_0': [8.613766, -3.707476, 0.16818],
            'j_pinky_le_1': [3.942609, 1E-06, 1E-06],
            'j_pinky_le_2': [1.794117, 3E-06, -3E-06],
            'j_pinky_le_3': [2.83939, -1E-06, 4E-06],
            'j_wristtwist_le': [21.60379, 1.2E-05, -3E-06],
            'j_shoulder_ri': [2.859542, -20.16072, -4.597286],
            'j_elbow_ri': [-30.71852, 4E-06, -2.4E-05],
            'j_wrist_ri': [-29.39067, 4.4E-05, 2.2E-05],
            'j_thumb_ri_0': [-2.786155, -2.245166, -0.851634],
            'j_thumb_ri_1': [-4.806832, -6.6E-05, 0.000141],
            'j_thumb_ri_2': [-2.433458, -3.8E-05, -5.3E-05],
            'j_thumb_ri_3': [-3.000123, 0.00016, 2.5E-05],
            'j_flesh_ri': [-4.822577, -1.176315, 0.110318],
            'j_index_ri_0': [-10.53432, -2.786281, -7E-06],
            'j_index_ri_1': [-4.562927, -5.8E-05, 5.4E-05],
            'j_index_ri_2': [-2.870313, -6.5E-05, 0.0001],
            'j_index_ri_3': [-2.999938, 0.000165, -6.5E-05],
            'j_mid_ri_0': [-10.71752, -0.362501, 0.386463],
            'j_mid_ri_1': [-4.842728, 0.000151, 2.8E-05],
            'j_mid_ri_2': [-2.957152, -8.7E-05, -2.2E-05],
            'j_mid_ri_3': [-3.00006, -6.8E-05, -1.9E-05],
            'j_ring_ri_0': [-9.843175, 1.747613, 0.401109],
            'j_ring_ri_1': [-4.842774, 0.000176, -6.3E-05],
            'j_ring_ri_2': [-2.755269, -1.1E-05, 0.000149],
            'j_ring_ri_3': [-3.000048, -4.1E-05, -4.9E-05],
            'j_pinky_ri_0': [-8.613756, 3.707438, -0.168202],
            'j_pinky_ri_1': [-3.942537, -0.000117, -6.5E-05],
            'j_pinky_ri_2': [-1.794038, 0.000134, 0.000215],
            'j_pinky_ri_3': [-2.839375, 5.6E-05, -0.000115],
            'j_wristtwist_ri': [-21.60388, 9.7E-05, 8E-06],
            'tag_weapon': [38.5059, 0.0, -17.15191],
            'tag_cambone': [0.0, 0.0, 0.0],
            'tag_camera': [0.0, 0.0, 0.0],
        }
        return mappings[boneName] || null
    }
}
