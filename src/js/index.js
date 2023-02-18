import { app, container, cameraFollow } from '../engine/render.js'
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


    app.ticker.add(delta => {
        let speed = 7

        if (controller.trigger) {
            speed *= 0.5
        }

        playerX += controller.move.x * delta * speed
        playerY += controller.move.y * delta * speed

        playerSprite.x = playerX
        playerSprite.y = playerY


        cameraFollow(playerSprite)
    })
})
