export enum DDSPixelFormatFlags {
    DDPF_ALPHAPIXELS = 0x1,
    DDPF_ALPHA = 0x2,
    DDPF_FOURCC = 0x4,
    DDPF_RGB = 0x40,
    DDPF_YUV = 0x200,
    DDPF_LUMINANCE = 0x20000,
}

export interface DDSPixelFormat {
    size: number;
    flags: number;
    fourCC: number;
    rgbBitCount: number;
    rBitMask: number;
    gBitMask: number;
    bBitMask: number;
    aBitMask: number;
}

export interface DDSHeader {
    size: number;
    flags: number;
    height: number;
    width: number;
    pitchLinearSize: number;
    depth: number;
    mipmapCount: number;
    reserved1: number[];
    pixelFormat: DDSPixelFormat;
    caps: number;
    caps2: number;
    caps3: number;
    caps4: number;
    reserved2: number;
}

export interface DDSHeaderDXT10 {
    dxgiFormat: number;
    resourceDimension: number;
    miscFlag: number;
    arraySize: number;
    miscFlags2: number;
}

export interface DDSImage {
    header: DDSHeader;
    header10: DDSHeaderDXT10;
    pixels: Uint8Array; // Always RGBA; no support for mipmaps currently
}

export function FOURCC(str: string): number {
    return str.charCodeAt(3) << 24 |
        str.charCodeAt(2) << 16 |
        str.charCodeAt(1) << 8 |
        str.charCodeAt(0)
}

// DDS Parsing Logic (ported from C)
function parseUncompressed(image: DDSImage, data: Uint8Array): void {
    const {width, height, depth, pixelFormat} = image.header
    const imgWidth = Math.max(1, width)
    const imgHeight = Math.max(1, height)
    const imgDepth = Math.max(1, depth)

    const {rBitMask, gBitMask, bBitMask, aBitMask, rgbBitCount} = pixelFormat
    const bytesPerPixel = rgbBitCount / 8

    const calculateShifts = (mask: number) => {
        if (mask === 0) return {leftShift: 0, rightShift: 0, bitCount: 0}
        let leftShift = 0
        let rightShift = 0
        let bitCount = 0
        for (let i = 0; i < 32; i++) {
            if (mask & (1 << i)) {
                if (bitCount === 0) rightShift = i
                bitCount++
            }
        }
        leftShift = bitCount >= 8 ? 0 : 8 - bitCount
        return {leftShift, rightShift, bitCount}
    }

    const rShift = calculateShifts(rBitMask)
    const gShift = calculateShifts(gBitMask)
    const bShift = calculateShifts(bBitMask)
    const aShift = calculateShifts(aBitMask)

    const headerSize = 128 // Skip the header
    let dataOffset = headerSize

    for (let z = 0; z < imgDepth; z++) {
        for (let y = 0; y < imgHeight; y++) {
            for (let x = 0; x < imgWidth; x++) {
                const pxIndex = (z * imgWidth * imgHeight + y * imgWidth + x) * bytesPerPixel
                const dataIndex = (z * imgWidth * imgHeight + (imgHeight - y - 1) * imgWidth + x) * 4

                const px = data[dataOffset + pxIndex] |
                    (data[dataOffset + pxIndex + 1] << 8) |
                    (data[dataOffset + pxIndex + 2] << 16) |
                    (data[dataOffset + pxIndex + 3] << 24)

                image.pixels[dataIndex] =
                    ((px & rBitMask) >> rShift.rightShift) << rShift.leftShift
                image.pixels[dataIndex + 1] =
                    ((px & gBitMask) >> gShift.rightShift) << gShift.leftShift
                image.pixels[dataIndex + 2] =
                    ((px & bBitMask) >> bShift.rightShift) << bShift.leftShift
                image.pixels[dataIndex + 3] =
                    aBitMask === 0
                        ? 0xff
                        : ((px & aBitMask) >> aShift.rightShift) << aShift.leftShift
            }
        }
    }
}

function parseDXT1(image: DDSImage, data: Uint8Array): void {
    const {width, height, depth} = image.header
    const imgWidth = Math.max(1, width)
    const imgHeight = Math.max(1, height)
    const imgDepth = Math.max(1, depth)

    const blocksX = Math.max(1, imgWidth >> 2)
    const blocksY = Math.max(1, imgHeight >> 2)

    let dataOffset = 0

    for (let z = 0; z < imgDepth; z++) {
        for (let y = 0; y < blocksY; y++) {
            for (let x = 0; x < blocksX; x++) {
                const blockOffset = dataOffset + (y * blocksX + x) * 8

                const color0 = data[blockOffset] | (data[blockOffset + 1] << 8)
                const color1 = data[blockOffset + 2] | (data[blockOffset + 3] << 8)
                const codes =
                    data[blockOffset + 4] |
                    (data[blockOffset + 5] << 8) |
                    (data[blockOffset + 6] << 16) |
                    (data[blockOffset + 7] << 24)

                const decodeColor = (c: number) => ({
                    r: ((c >> 11) & 0x1f) << 3,
                    g: ((c >> 5) & 0x3f) << 2,
                    b: (c & 0x1f) << 3,
                })

                const color0RGB = decodeColor(color0)
                const color1RGB = decodeColor(color1)

                for (let blockIndex = 0; blockIndex < 16; blockIndex++) {
                    const pxIndex =
                        (z * imgHeight * imgWidth +
                            (imgHeight - (y * 4 + (blockIndex >> 2)) - 1) * imgWidth +
                            x * 4 +
                            (blockIndex & 3)) *
                        4

                    const code = (codes >> (2 * blockIndex)) & 3
                    let r, g, b
                    if (code === 0) {
                        ({r, g, b} = color0RGB)
                    } else if (code === 1) {
                        ({r, g, b} = color1RGB)
                    } else if (code === 2) {
                        r = (2 * color0RGB.r + color1RGB.r) / 3
                        g = (2 * color0RGB.g + color1RGB.g) / 3
                        b = (2 * color0RGB.b + color1RGB.b) / 3
                    } else {
                        r = (color0RGB.r + 2 * color1RGB.r) / 3
                        g = (color0RGB.g + 2 * color1RGB.g) / 3
                        b = (color0RGB.b + 2 * color1RGB.b) / 3
                    }
                    image.pixels[pxIndex] = r
                    image.pixels[pxIndex + 1] = g
                    image.pixels[pxIndex + 2] = b
                    image.pixels[pxIndex + 3] = 0xff // Alpha
                }
            }
        }
        dataOffset += blocksX * blocksY * 8
    }
}

function parseDXT3(image: DDSImage, data: Uint8Array): void {
    const {width, height, depth} = image.header
    const imgWidth = Math.max(1, width)
    const imgHeight = Math.max(1, height)
    const imgDepth = Math.max(1, depth)

    const blocksX = Math.max(1, imgWidth >> 2)
    const blocksY = Math.max(1, imgHeight >> 2)

    let dataOffset = 0

    for (let z = 0; z < imgDepth; z++) {
        for (let y = 0; y < blocksY; y++) {
            for (let x = 0; x < blocksX; x++) {
                const blockOffset = dataOffset + (y * blocksX + x) * 16

                // Alpha block (8 bytes)
                const alphaData = data.subarray(blockOffset, blockOffset + 8)

                // Color block
                const color0 = data[blockOffset + 8] | (data[blockOffset + 9] << 8)
                const color1 = data[blockOffset + 10] | (data[blockOffset + 11] << 8)
                const codes =
                    data[blockOffset + 12] |
                    (data[blockOffset + 13] << 8) |
                    (data[blockOffset + 14] << 16) |
                    (data[blockOffset + 15] << 24)

                const decodeColor = (c: number) => ({
                    r: ((c >> 11) & 0x1f) << 3,
                    g: ((c >> 5) & 0x3f) << 2,
                    b: (c & 0x1f) << 3,
                })

                const color0RGB = decodeColor(color0)
                const color1RGB = decodeColor(color1)

                for (let blockIndex = 0; blockIndex < 16; blockIndex++) {
                    const pxIndex =
                        (z * imgHeight * imgWidth +
                            (imgHeight - (y * 4 + (blockIndex >> 2)) - 1) * imgWidth +
                            x * 4 +
                            (blockIndex & 3)) *
                        4

                    // Extract alpha (4-bit packed in 2 bytes)
                    const alpha = (alphaData[blockIndex >> 1] >> ((blockIndex & 1) * 4)) & 0xf
                    image.pixels[pxIndex + 3] = (alpha * 255) / 15 // Normalize alpha to 8-bit

                    // Extract color code (2 bits)
                    const code = (codes >> (2 * blockIndex)) & 0b11
                    let r, g, b
                    if (code === 0) {
                        ({r, g, b} = color0RGB)
                    } else if (code === 1) {
                        ({r, g, b} = color1RGB)
                    } else if (code === 2) {
                        r = (2 * color0RGB.r + color1RGB.r) / 3
                        g = (2 * color0RGB.g + color1RGB.g) / 3
                        b = (2 * color0RGB.b + color1RGB.b) / 3
                    } else {
                        r = (color0RGB.r + 2 * color1RGB.r) / 3
                        g = (color0RGB.g + 2 * color1RGB.g) / 3
                        b = (color0RGB.b + 2 * color1RGB.b) / 3
                    }
                    image.pixels[pxIndex] = r
                    image.pixels[pxIndex + 1] = g
                    image.pixels[pxIndex + 2] = b
                }
            }
        }
        dataOffset += blocksX * blocksY * 16
    }
}

function parseDXT5(image: DDSImage, data: Uint8Array): void {
    const {width, height, depth} = image.header
    const imgWidth = Math.max(1, width)
    const imgHeight = Math.max(1, height)
    const imgDepth = Math.max(1, depth)

    const blocksX = Math.max(1, imgWidth >> 2)
    const blocksY = Math.max(1, imgHeight >> 2)

    let dataOffset = 0

    for (let z = 0; z < imgDepth; z++) {
        for (let y = 0; y < blocksY; y++) {
            for (let x = 0; x < blocksX; x++) {
                const blockOffset = dataOffset + (y * blocksX + x) * 16

                const alpha0 = data[blockOffset]
                const alpha1 = data[blockOffset + 1]

                let alphaCodes = 0
                for (let i = 0; i < 6; i++) {
                    alphaCodes |= data[blockOffset + 2 + i] << (i * 8)
                }

                const color0 = data[blockOffset + 8] | (data[blockOffset + 9] << 8)
                const color1 = data[blockOffset + 10] | (data[blockOffset + 11] << 8)
                const codes =
                    data[blockOffset + 12] |
                    (data[blockOffset + 13] << 8) |
                    (data[blockOffset + 14] << 16) |
                    (data[blockOffset + 15] << 24)

                const decodeColor = (c: number) => ({
                    r: ((c >> 11) & 0x1f) << 3,
                    g: ((c >> 5) & 0x3f) << 2,
                    b: (c & 0x1f) << 3,
                })

                const color0RGB = decodeColor(color0)
                const color1RGB = decodeColor(color1)

                const computeAlpha = (code: number) => {
                    if (code === 0) return alpha0
                    if (code === 1) return alpha1
                    if (alpha0 > alpha1) {
                        return Math.floor(((8 - code) * alpha0 + (code - 1) * alpha1) / 7)
                    } else {
                        if (code === 6) return 0
                        if (code === 7) return 255
                        return Math.floor(((6 - code) * alpha0 + (code - 1) * alpha1) / 5)
                    }
                }

                for (let blockIndex = 0; blockIndex < 16; blockIndex++) {
                    const pxIndex =
                        (z * imgHeight * imgWidth +
                            (imgHeight - (y * 4 + (blockIndex >> 2)) - 1) * imgWidth +
                            x * 4 +
                            (blockIndex & 3)) *
                        4

                    // Alpha value
                    const alphaCode = (alphaCodes >> (3 * blockIndex)) & 0b111
                    image.pixels[pxIndex + 3] = computeAlpha(alphaCode)

                    // Color value
                    const code = (codes >> (2 * blockIndex)) & 0b11
                    let r, g, b
                    if (code === 0) {
                        ({r, g, b} = color0RGB)
                    } else if (code === 1) {
                        ({r, g, b} = color1RGB)
                    } else if (code === 2) {
                        r = (2 * color0RGB.r + color1RGB.r) / 3
                        g = (2 * color0RGB.g + color1RGB.g) / 3
                        b = (2 * color0RGB.b + color1RGB.b) / 3
                    } else {
                        r = (color0RGB.r + 2 * color1RGB.r) / 3
                        g = (color0RGB.g + 2 * color1RGB.g) / 3
                        b = (color0RGB.b + 2 * color1RGB.b) / 3
                    }
                    image.pixels[pxIndex] = r
                    image.pixels[pxIndex + 1] = g
                    image.pixels[pxIndex + 2] = b
                }
            }
        }
        dataOffset += blocksX * blocksY * 16
    }
}

export function loadDDSFromMemory(data: Uint8Array): DDSImage | null {
    const headerSize = 128

    if (data.byteLength < headerSize) return null

    const magic = data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24)
    if (magic !== 0x20534444) return null // 'DDS '

    const headerView = new DataView(data.buffer, 4, 124)
    const header = parseHeader(headerView)

    const imgWidth = Math.max(1, header.width)
    const imgHeight = Math.max(1, header.height)
    const imgDepth = Math.max(1, header.depth)

    const pixelArraySize = imgWidth * imgHeight * imgDepth * 4 // RGBA, 4 bytes per pixel
    const ddsImage: DDSImage = {
        header,
        header10: null as any, // DX10 header will be set later if present
        pixels: new Uint8Array(pixelArraySize),
    }

    const pixelData = data.subarray(headerSize)

    if (header.pixelFormat.flags & DDSPixelFormatFlags.DDPF_FOURCC) {
        const fourCC = header.pixelFormat.fourCC
        switch (fourCC) {
            case FOURCC('DXT1'):
                parseDXT1(ddsImage, pixelData)
                break
            case FOURCC('DXT3'):
                parseDXT3(ddsImage, pixelData)
                break
            case FOURCC('DXT5'):
                parseDXT5(ddsImage, pixelData)
                break
            default:
                console.warn(`Unsupported FOURCC: ${fourCC.toString(16)}`)
                return null
        }
    } else {
        parseUncompressed(ddsImage, pixelData)
    }

    return ddsImage
}

function parseHeader(headerView: DataView): DDSHeader {
    const reserved1 = new Array(11)
    for (let i = 0; i < 11; i++) {
        reserved1[i] = headerView.getUint32(28 + i * 4, true)
    }

    return {
        size: headerView.getUint32(0, true),
        flags: headerView.getUint32(4, true),
        height: headerView.getUint32(8, true),
        width: headerView.getUint32(12, true),
        pitchLinearSize: headerView.getUint32(16, true),
        depth: headerView.getUint32(20, true),
        mipmapCount: headerView.getUint32(24, true),
        reserved1,
        pixelFormat: {
            size: headerView.getUint32(72, true),
            flags: headerView.getUint32(76, true),
            fourCC: headerView.getUint32(80, true),
            rgbBitCount: headerView.getUint32(84, true),
            rBitMask: headerView.getUint32(88, true),
            gBitMask: headerView.getUint32(92, true),
            bBitMask: headerView.getUint32(96, true),
            aBitMask: headerView.getUint32(100, true),
        },
        caps: headerView.getUint32(104, true),
        caps2: headerView.getUint32(108, true),
        caps3: headerView.getUint32(112, true),
        caps4: headerView.getUint32(116, true),
        reserved2: headerView.getUint32(120, true),
    }
}
