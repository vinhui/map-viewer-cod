import {FakeFileSystem} from 'libbsp-js'
import {loadDDSFromMemory} from './LibBSP-bjs/Util/dds'

document.body.style.background = '#000'

async function start() {
    FakeFileSystem.baseUrl = 'cod'
    await FakeFileSystem.Init()
    const files = FakeFileSystem.FindFiles('textures/', /\.dds$/i, false)

    let totalTime = 0
    let n = 0
    for (let i = 0; i < files.length; i += 50) {
        const slice = files.slice(i, i + 50)
        const promises = []

        for (let file of slice) {
            promises.push(new Promise(async (resolve, reject) => {
                await file.download()

                const t = performance.now()
                const result = loadDDSFromMemory(file.bytes)
                n++
                totalTime += performance.now() - t
                if (!result) {
                    console.error('Invalid DDS file', file.originalPath, file)
                    resolve(null)
                    return
                }
                const canvas = document.createElement('canvas')
                canvas.width = result.header.width
                canvas.height = result.header.height
                const ctx = canvas.getContext('2d')
                const imageData = new ImageData(new Uint8ClampedArray(result.pixels.slice(0, result.header.width * result.header.height * 4)), result.header.width, result.header.height)
                ctx.drawImage(await createImageBitmap(imageData, {imageOrientation: 'flipY'}), 0, 0)
                canvas.style.maxWidth = '10%'
                canvas.style.maxHeight = '50%'

                document.body.appendChild(canvas)
                resolve(null)
            }))
        }

        await Promise.all(promises)
        window.scrollTo(0, document.body.scrollHeight)
        console.log(`Current avg time: ${totalTime / n}ms`, n)
    }
}

start()