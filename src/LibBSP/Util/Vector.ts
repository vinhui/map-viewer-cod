import {float, int} from '../../utils/number'

export class Vector2 {
    public x: float = 0
    public y: float = 0


    constructor(x?: float, y?: float) {
        this.x = x ?? 0
        this.y = y ?? 0
    }

    public getBytes(arr?: Uint8Array | DataView, startIndex: int = 0): DataView {
        const d = arr ?? new Uint8Array(12)
        let view: DataView
        if (d instanceof Uint8Array) {
            view = new DataView(d.buffer)
        } else {
            view = d
        }
        view.setFloat32(startIndex, this.x)
        view.setFloat32(startIndex + 4, this.y)
        return view
    }

    public lengthSquared(): float {
        return this.x * this.x + this.y * this.y
    }

    public distanceToSquared(other: Vector2): float {
        const dx = other.x - this.x
        const dy = other.y - this.y
        return dx * dx + dy * dy
    }

    public distanceTo(other: Vector2): float {
        return Math.sqrt(this.distanceToSquared(other))
    }

    public clone(): Vector2 {
        return new Vector2(this.x, this.y)
    }
}

export class Vector3 {
    public x: float = 0
    public y: float = 0
    public z: float = 0


    constructor(x?: float, y?: float, z?: float) {
        this.x = x ?? 0
        this.y = y ?? 0
        this.z = z ?? 0
    }

    public get magnitudeSquared(): float {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }

    public get magnitude(): float {
        return Math.sqrt(this.magnitudeSquared)
    }

    public dot(other: Vector3): float {
        return this.x * other.x + this.y * other.y + this.z * other.z
    }

    public cross(other: Vector3): Vector3 {
        return new Vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x,
        )
    }

    public normalize(): this {
        const mag = this.magnitude
        this.x /= mag
        this.y /= mag
        this.z /= mag
        return this
    }

    public getBytes(arr?: Uint8Array | DataView, startIndex: int = 0): DataView {
        const d = arr ?? new Uint8Array(12)
        let view: DataView
        if (d instanceof Uint8Array) {
            view = new DataView(d.buffer)
        } else {
            view = d
        }
        view.setFloat32(startIndex, this.x)
        view.setFloat32(startIndex + 4, this.y)
        view.setFloat32(startIndex + 8, this.z)
        return view
    }

    public distanceToSquared(other: Vector3): float {
        const dx = other.x - this.x
        const dy = other.y - this.y
        const dz = other.z - this.z
        return dx * dx + dy * dy + dz * dz
    }

    public distanceTo(other: Vector3): float {
        return Math.sqrt(this.distanceToSquared(other))
    }

    public add(other: Vector3): Vector3 {
        return new Vector3(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z,
        )
    }

    public sub(other: Vector3): Vector3 {
        return new Vector3(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z,
        )
    }

    public set(x: float, y: float, z: float) {
        this.x = x
        this.y = y
        this.z = z
    }

    public clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z)
    }
}

export class Vector4 {
    public x: float = 0
    public y: float = 0
    public z: float = 0
    public w: float = 0


    constructor(x?: float, y?: float, z?: float, w?: float) {
        this.x = x ?? 0
        this.y = y ?? 0
        this.z = z ?? 0
        this.w = w ?? 0
    }

    public getBytes(arr?: Uint8Array, startIndex: int = 0): DataView {
        const d = arr ?? new Uint8Array(12)
        let view: DataView
        if (d instanceof Uint8Array) {
            view = new DataView(d.buffer)
        } else {
            view = d
        }
        view.setFloat32(startIndex, this.x)
        view.setFloat32(startIndex + 4, this.y)
        view.setFloat32(startIndex + 8, this.z)
        view.setFloat32(startIndex + 12, this.w)
        return view
    }

    public clone(): Vector4 {
        return new Vector4(this.x, this.y, this.z, this.w)
    }
}