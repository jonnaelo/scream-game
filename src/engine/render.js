import { mapClamp } from './utils.js'

export let app, container

window.addEventListener('load', () => {
    const canvasContainer = document.getElementById('canvas-container')
    const fsButton = document.getElementById('full-screen-button')
    if (canvasContainer.requestFullscreen) {
        fsButton.addEventListener('click', () => {
            canvasContainer.requestFullscreen()
        })
    } else {
        fsButton.style.display = 'none'
    }

    const scale = window.devicePixelRatio || 1

    app = new PIXI.Application()
    canvasContainer.appendChild(app.view)

    const wrappingContainer = new PIXI.Container()
    const fxaa = new PIXI.FXAAFilter
    wrappingContainer.filters = [fxaa]
    app.stage.addChild(wrappingContainer)

    const resize = () => {
        app.renderer.resize(window.innerWidth * scale, window.innerHeight * scale)
        wrappingContainer.x = app.screen.width / 2
        wrappingContainer.y = app.screen.height / 2
        wrappingContainer.scale.set(window.innerHeight * scale / 1000)
        canvasContainer.style.height = `${window.innerHeight}px`
        canvasContainer.style.width = `${window.innerWidth}px`
    }

    resize()

    window.addEventListener('resize', resize)

    // So that the application can't mess up the scaling and position
    container = new PIXI.Container()
    wrappingContainer.addChild(container)
})

export const cameraFollow = sprite => {
    const view = container.getGlobalPosition()
    const target = sprite.getGlobalPosition()
    const canvasScaling = container.parent.scale

    const newCentering = {
        x: (view.x - target.x) / canvasScaling.x,
        y: (view.y - target.y) / canvasScaling.y
    }

    const diff = {
        x: newCentering.x - container.x,
        y: newCentering.y - container.y
    }

    const r = a => Math.sqrt(a.x*a.x + a.y*a.y)

    // Exponential smoothing
    const t = mapClamp(1/(Math.sqrt(r(diff))*1.2+1), 1, 0.1, 0.5, 0.07)
    // const t = 0.07
    container.x += diff.x * t
    container.y += diff.y * t
}