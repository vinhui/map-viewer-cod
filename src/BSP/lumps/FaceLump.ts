import {Face} from '../types/Face'

export class FaceLump {
    public faces: Face[] = []

    public printInfo(): string {
        let blob = ''
        this.faces.forEach((face, index) => {
            blob += `Face ${index}\t Tex: ${face.texture}\tType: ${face.type}\tVertIndex: ${face.vertex}\tNumVerts: ${face.n_vertexes}\tMeshVertIndex: ${face.meshvert}\tMeshVerts: ${face.n_meshverts}\r\n`
        })
        return blob
    }
}
