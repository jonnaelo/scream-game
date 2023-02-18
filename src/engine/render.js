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
    // Exponential smoothing
    const t = 0.05

    // Horizontally
    const viewX = container.getGlobalPosition().x
    const tipX = sprite.getGlobalPosition().x
    const canvasScalingX = container.parent.scale.x
    const newCenteringX = (viewX - tipX) / canvasScalingX
    container.x = (1-t) * container.x + t * newCenteringX

    // Vertically
    const viewY = container.getGlobalPosition().y
    const tipY = sprite.getGlobalPosition().y
    const canvasScalingY = container.parent.scale.y
    const newCenteringY = (viewY - tipY) / canvasScalingY
    container.y = (1-t) * container.y + t * newCenteringY
}