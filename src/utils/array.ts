type Primitive = string | number | boolean

export function generate2dArray<T>(dim1: number, dim2: number, defaultVal: { new(): T; } | Primitive) {
    const arr: T[][] = []
    for (let i = 0; i < dim1; i++) {
        arr[i] = []
        for (let j = 0; j < dim2; j++) {
            if (typeof defaultVal === 'string' || typeof defaultVal === 'number' || typeof defaultVal === 'boolean') {
                arr[i][j] = defaultVal as T
            } else {
                arr[i][j] = new defaultVal()
            }
        }
    }
    return arr
}

type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;
type TypedArrayCtor<T extends TypedArray> = { new(length: number): T }

export function generate2dTypedArray<T extends TypedArray>(type: TypedArrayCtor<T>, dim1: number, dim2: number) {
    const arr: T[] = []
    for (let i = 0; i < dim1; i++) {
        arr[i] = new type(dim2)
    }
    return arr
}

export function asciiFromArray(data: Uint8Array): string {
    let s = ''
    for (let i = 0; i < data.length; i++) {
        s += String.fromCharCode(data[i])
    }
    return s
}

export function asciiToArray(text: string): Uint8Array {
    const arr = new Uint8Array(text.length)
    for (let i = 0; i < arr.length; i++) {
        arr[i] = text.charCodeAt(i)
    }
    return arr
}