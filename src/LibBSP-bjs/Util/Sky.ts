import {
    CubeTexture,
    Engine,
    GetTGAHeader,
    MeshBuilder,
    RawCubeTexture,
    Scene,
    StandardMaterial,
    Texture,
    TGATools,
} from '@babylonjs/core'
import {FakeFileSystem, File} from 'libbsp-js'
import mime from 'mime'


const _TYPE_INDEXED = 1
const _TYPE_RGB = 2
const _TYPE_GREY = 3
const _TYPE_RLE_INDEXED = 9
const _TYPE_RLE_RGB = 10
const _TYPE_RLE_GREY = 11
const _ORIGIN_MASK = 0x30
const _ORIGIN_SHIFT = 0x04
const _ORIGIN_BL = 0x00
const _ORIGIN_BR = 0x01
const _ORIGIN_UL = 0x02
const _ORIGIN_UR = 0x03

function getTgaPixels(data: Uint8Array) {
    // Not enough data to contain header ?
    if (data.length < 19) {
        console.error('Unable to load TGA file - Not enough data to contain header')
        return
    }

    // Read Header
    let offset = 18
    const header = GetTGAHeader(data)

    // Assume it's a valid Targa file.
    if (header.id_length + offset > data.length) {
        console.error('Unable to load TGA file - Not enough data')
        return
    }

    // Skip not needed data
    offset += header.id_length

    let use_rle = false
    let use_pal = false
    let use_grey = false

    // Get some informations.
    switch (header.image_type) {
        case _TYPE_RLE_INDEXED:
            use_rle = true
        // eslint-disable-next-line no-fallthrough
        case _TYPE_INDEXED:
            use_pal = true
            break

        case _TYPE_RLE_RGB:
            use_rle = true
        // eslint-disable-next-line no-fallthrough
        case _TYPE_RGB:
            // use_rgb = true;
            break

        case _TYPE_RLE_GREY:
            use_rle = true
        // eslint-disable-next-line no-fallthrough
        case _TYPE_GREY:
            use_grey = true
            break
    }

    let pixel_data

    // var numAlphaBits = header.flags & 0xf;
    const pixel_size = header.pixel_size >> 3
    const pixel_total = header.width * header.height * pixel_size

    // Read palettes
    let palettes

    if (use_pal) {
        palettes = data.subarray(offset, (offset += header.colormap_length * (header.colormap_size >> 3)))
    }

    // Read LRE
    if (use_rle) {
        pixel_data = new Uint8Array(pixel_total)

        let c, count, i
        let localOffset = 0
        const pixels = new Uint8Array(pixel_size)

        while (offset < pixel_total && localOffset < pixel_total) {
            c = data[offset++]
            count = (c & 0x7f) + 1

            // RLE pixels
            if (c & 0x80) {
                // Bind pixel tmp array
                for (i = 0; i < pixel_size; ++i) {
                    pixels[i] = data[offset++]
                }

                // Copy pixel array
                for (i = 0; i < count; ++i) {
                    pixel_data.set(pixels, localOffset + i * pixel_size)
                }

                localOffset += pixel_size * count
            }
            // Raw pixels
            else {
                count *= pixel_size
                for (i = 0; i < count; ++i) {
                    pixel_data[localOffset + i] = data[offset++]
                }
                localOffset += count
            }
        }
    }
    // RAW Pixels
    else {
        pixel_data = data.subarray(offset, (offset += use_pal ? header.width * header.height : pixel_total))
    }

    // Load to texture
    let x_start, y_start, x_step, y_step, y_end, x_end

    switch ((header.flags & _ORIGIN_MASK) >> _ORIGIN_SHIFT) {
        default:
        case _ORIGIN_UL:
            x_start = 0
            x_step = 1
            x_end = header.width
            y_start = 0
            y_step = 1
            y_end = header.height
            break

        case _ORIGIN_BL:
            x_start = 0
            x_step = 1
            x_end = header.width
            y_start = header.height - 1
            y_step = -1
            y_end = -1
            break

        case _ORIGIN_UR:
            x_start = header.width - 1
            x_step = -1
            x_end = -1
            y_start = 0
            y_step = 1
            y_end = header.height
            break

        case _ORIGIN_BR:
            x_start = header.width - 1
            x_step = -1
            x_end = -1
            y_start = header.height - 1
            y_step = -1
            y_end = -1
            break
    }

    // Load the specify method
    const func = '_getImageData' + (use_grey ? 'Grey' : '') + header.pixel_size + 'bits'
    return (<any>TGATools)[func](header, palettes, pixel_data, y_start, y_step, y_end, x_start, x_step, x_end)
}

enum Sides {
    ft = 0,
    bk = 1,
    up = 2,
    dn = 3,
    lf = 5,
    rt = 4,
}

function loadFilesIntoCubeTexture(path: string, cubeTex: CubeTexture, onTexChanged: () => void) {
    const files = new Map<Sides, File>()
    const sides: Sides[] = [Sides.bk, Sides.dn, Sides.ft, Sides.lf, Sides.rt, Sides.up]
    for (let side of sides) {
        let f: File[]
        f = FakeFileSystem.FindFiles(`${path}_${Sides[side]}.`, null, false)
        if (f?.length === 0) {
            console.warn(`Couldn't find skybox texture`, path)
            return null
        }
        files.set(side, f[0])
    }

    Promise.all(files.values().map(x => x.download()))
        .then(x => {
            if (x.some(x => !x)) {
                return
            }

            console.log(files)
            if (files.values().every(x => x.extension.toLowerCase() === '.tga')) {
                // TODO: Resize if required. Maybe load into a canvas?
                const bytes: Uint8Array[] = []
                for (let [side, file] of files.entries()) {
                    if (side === Sides.dn) {
                        bytes[side] = new Uint8Array(512 * 512 * 4).fill(255)
                    } else {
                        bytes[side] = getTgaPixels(file.bytes)
                    }
                }
                const header = GetTGAHeader(files.get(Sides.ft).bytes)
                console.log(header)
                console.log(bytes)
                const rawCubeTex = new RawCubeTexture(cubeTex.getScene(), bytes, header.width, Engine.TEXTUREFORMAT_RGBA, Engine.TEXTURETYPE_UNSIGNED_BYTE)
                const mat = new StandardMaterial('test')
                rawCubeTex.coordinatesMode = Texture.SKYBOX_MODE
                mat.backFaceCulling = false
                mat.reflectionTexture = rawCubeTex
                mat.disableLighting = true
                const mesh = MeshBuilder.CreateBox('test', {size: 100})
                mesh.infiniteDistance = true
                mesh.material = mat
                onTexChanged()
            } else {
                const blobUrls = new Map<Sides, string>()
                for (let [side, file] of files.entries()) {
                    const blob = new Blob([file.bytes], {type: mime.getType(file.nameWithExtension)})
                    blobUrls.set(side, URL.createObjectURL(blob))
                }
                const cleanup = (e?: unknown) => {
                    for (let url of blobUrls.values()) {
                        URL.revokeObjectURL(url)
                    }
                }
                cubeTex.updateURL(
                    '', // url
                    null, // forced extension
                    () => {
                        cleanup()
                        onTexChanged()
                    }, // onload
                    null, // prefiltered
                    (e) => {
                        console.error('Failed to load sky texture:', e)
                        cleanup()
                    }, // onerror
                    null, // extensions
                    null, // delayload
                    [
                        blobUrls.get(Sides.rt),
                        blobUrls.get(Sides.up),
                        blobUrls.get(Sides.ft),
                        blobUrls.get(Sides.lf),
                        blobUrls.get(Sides.dn),
                        blobUrls.get(Sides.bk),
                    ],
                    null, // buffer
                )
            }
        })
}

export function loadSkyTextureAtPath(path: string, scene: Scene, onTexChanged: () => void): CubeTexture {
    const cubeTex = new CubeTexture(null, scene)
    cubeTex.name = path
    cubeTex.coordinatesMode = Texture.SKYBOX_MODE

    const scriptFiles = FakeFileSystem.FindFiles('scripts/', /\.shader$/i, false)
    FakeFileSystem.DownloadFiles(scriptFiles)
        .then(() => {
            for (let scriptFile of scriptFiles) {
                if (!scriptFile.text) {
                    continue
                }
                const lines = scriptFile.text.split('\n')
                let shaderMatch = false
                for (let line of lines) {
                    line = line.trim()
                    if (line === path) {
                        shaderMatch = true
                        continue
                    }
                    if (shaderMatch) {
                        if (line.startsWith('skyParms')) {
                            const split = line.split(' ')
                            const textureFile = split[1]
                            loadFilesIntoCubeTexture(textureFile, cubeTex, onTexChanged)
                            return
                        }
                        if (line.includes('}')) {
                            return
                        }
                    }
                }
            }
        })


    return cubeTex
}