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

    const playerNormal = PIXI.Texture.from('assets/images/normal-face.svg')
    const playerScreaming = PIXI.Texture.from('assets/images/scream-face.svg')

    let playerSprite = new PIXI.Sprite(playerNormal)
    playerSprite.anchor.set(0.5)
    playerSprite.scale.set(0.3)

    container.addChild(playerSprite)

    const soundParticleTexture = PIXI.Texture.from('assets/images/sound-particle-01.svg')
    const soundParticles = new Array()

    app.ticker.add(delta => {
        let speed = 7

        if (controller.trigger) {
            speed *= 0.5
            playerSprite.texture = playerScreaming

            // Create 10 sound particles per frame
            for (let i = 0; i < 20; i++) {
                const speed = 7 + Math.random() * 3 // 7..10
                const radius = 15 + Math.random() * 10 // 15..20

                let x, y
                while (true) {
                    x = Math.random() * 2 - 1
                    y = Math.random() * 2 - 1
                    if (Math.sqrt(x*x + y*y) <= 1) break
                }
                // bias sound towards movement
                x += controller.move.x * 0.5
                y += controller.move.y * 0.5
                const r = Math.sqrt(x*x + y*y)
                x /= r
                y /= r

                const particle = new PIXI.Sprite(soundParticleTexture)
                particle.scale.set(0.07)

                particle.vx = x * speed
                particle.vy = y * speed
                particle.x = playerSprite.x + x * radius
                particle.y = playerSprite.y + y * radius
                particle.age = 0

                soundParticles.push(particle)
                container.addChild(particle)
            }
        } else {
            playerSprite.texture = playerNormal
        }

        // Sound particle simulation

        for(let i = soundParticles.length - 1; i >= 0; i--){
            const particle = soundParticles[i]
            particle.age += delta

            if (particle.age > 100) {
                particle.destroy()
                soundParticles.splice(i, 1)
                continue
            }

            particle.x += particle.vx * delta
            particle.y += particle.vy * delta
        }

        // Player movement
        playerX += controller.move.x * delta * speed
        playerY += controller.move.y * delta * speed

        playerSprite.x = playerX
        playerSprite.y = playerY


        cameraFollow(playerSprite)
    })
})
