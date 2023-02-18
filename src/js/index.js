import { app, container } from '../engine/render.js'
import { controller } from '../engine/controller.js'
import { collider } from '../engine/containsPoint.js'
import { mapv } from '../engine/utils.js'

let playerX = 0
let playerY = 0

window.addEventListener('load', () => {
    let bgSprite = PIXI.Sprite.from('assets/images/sound-particle-01.svg')
    bgSprite.anchor.set(0.5)
    bgSprite.scale.set(10)
    container.addChild(bgSprite)

    let playerSprite = PIXI.Sprite.from('assets/images/sound-particle-01.svg')
    playerSprite.anchor.set(0.5)
    playerSprite.scale.set(0.2)
    container.addChild(playerSprite)



    // const dirtContainer = new PIXI.Container()
    // container.addChild(dirtContainer)
    // for (let i = 0; i < 4; i++) {
    //     let sprite = PIXI.Sprite.from(`assets/images/dirt_${i + 1}.png`)
    //     sprite.anchor.set(0.5)
    //     sprite.scale.set(.5)
    //     do {
    //         sprite.x = Math.random() * 2000 - 1000
    //         sprite.y = Math.random() * 800 - 150
    //     } while (sprite.y < 250 && sprite.x < 300 && sprite.x > -300)
    //     dirtContainer.addChild(sprite)
    // }


    // const rootAngles = []
    // const rootSprites = []
    // const rootContainer = new PIXI.Container()
    // rootContainer.scale.set(0.08)
    // rootContainer.y = -70
    // container.addChild(rootContainer)

    // let parent = rootContainer
    // for (let i = 0; i < controlPieceCount; i++) {
    //     let sprite = PIXI.Sprite.from('assets/images/white square.png')
    //     sprite.anchor.set(0.5)
    //     sprite.scale.set(1 - 1/controlPieceCount)
    //     sprite.y = 64
    //     parent.addChild(sprite)
    //     rootSprites.push(sprite)
    //     rootAngles.push(Math.random())
    //     parent = sprite
    // }


    app.ticker.add(delta => {
        let speed = 7

        if (controller.trigger) {
            speed *= 0.5
        }

        playerX += controller.move.x * delta * speed
        playerY += controller.move.y * delta * speed

        playerSprite.x = playerX
        playerSprite.y = playerY

        // Center the view
        const t = 0.05

        // Horizontally
        const viewX = container.getGlobalPosition().x
        const tipX = playerSprite.getGlobalPosition().x
        const canvasScalingX = container.parent.scale.x
        const newCenteringX = (viewX - tipX) / canvasScalingX
        container.x = (1-t) * container.x + t * newCenteringX

        // Vertically
        const viewY = container.getGlobalPosition().y
        const tipY = playerSprite.getGlobalPosition().y
        const canvasScalingY = container.parent.scale.y
        const newCenteringY = (viewY - tipY) / canvasScalingY
        container.y = (1-t) * container.y + t * newCenteringY
    })
})
