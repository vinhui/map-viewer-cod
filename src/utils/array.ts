type Primitive = string | number | boolean

export function generate2dArray<T>(dim1: number, dim2: number, opt: { new(): T; } | Primitive) {
    const arr: T[][] = []
    for (let i = 0; i < dim1; i++) {
        arr[i] = []
        for (let j = 0; j < dim2; j++) {
            if (typeof opt === 'string' || typeof opt === 'number' || typeof opt === 'boolean') {
                arr[i][j] = opt as T
            } else {
                arr[i][j] = new opt()
            }
        }
    }
    return arr
}