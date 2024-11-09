export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];
export type Vec2 = [number, number];
export type Color = [number, number, number, number];

/**
 * Adds two vectors component-wise.
 */
export function vec3_add(v1: Vec3, v2: Vec3): Vec3 {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]]
}

/**
 * Divides a vector by a scalar.
 */
export function vec3_div(v: Vec3, scalar: number): Vec3 {
    return [v[0] / scalar, v[1] / scalar, v[2] / scalar]
}

/**
 * Converts an array to a Vec3 if it has three elements.
 */
export function vec3_from_vec(arr: number[]): Vec3 | null {
    return arr.length === 3 ? [arr[0], arr[1], arr[2]] as Vec3 : null
}

/**
 * Rotates a vector by a quaternion.
 */
export function vec3_rotate(vec: Vec3, quat: Quat): Vec3 {
    const [x, y, z] = vec
    const [qw, qx, qy, qz] = quat

    const ix = qw * x + qy * z - qz * y
    const iy = qw * y + qz * x - qx * z
    const iz = qw * z + qx * y - qy * x
    const iw = -qx * x - qy * y - qz * z

    return [
        ix * qw + iw * -qx + iy * -qz - iz * -qy,
        iy * qw + iw * -qy + iz * -qx - ix * -qz,
        iz * qw + iw * -qz + ix * -qy - iy * -qx,
    ]
}

/**
 * Multiplies two quaternions.
 */
export function quat_multiply(q1: Quat, q2: Quat): Quat {
    const [w1, x1, y1, z1] = q1
    const [w2, x2, y2, z2] = q2

    return [
        w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
        w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
        w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2,
        w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2,
    ]
}
