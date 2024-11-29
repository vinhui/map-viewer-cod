import './checkerboard.css'
import {FakeFileSystem} from 'libbsp-js'
import TgaLoader from 'tga-js'

async function start() {
    FakeFileSystem.baseUrl = 'cod'
    await FakeFileSystem.Init()
    const files = FakeFileSystem.FindFiles('textures/', /\.tga$/i, false)

    let totalTime = 0
    let n = 0

    for (let i = 0; i < files.length; i += 50) {
        const slice = files.slice(i, i + 50)
        const promises = []

        for (let file of slice) {
            promises.push(new Promise(async (resolve, reject) => {
                await file.download()

                const t = performance.now()
                const tgaLoader = new TgaLoader()
                tgaLoader.load(file.bytes)
                n++
                totalTime += performance.now() - t
                const canvas = tgaLoader.getCanvas()
                canvas.style.maxWidth = '10%'
                canvas.style.maxHeight = '50vh'
                canvas.title = `${file.originalPath}\n${canvas.width}x${canvas.height}`

                document.body.appendChild(canvas)
                resolve(null)
            }))
        }

        await Promise.all(promises)
        window.scrollTo(0, document.body.scrollHeight)
        console.log(`Current avg time: ${totalTime / n}ms`, n, (n / files.length * 100).toFixed(1) + '%')
    }
}

start()