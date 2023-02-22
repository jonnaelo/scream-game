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
    const eyeTexture = PIXI.Texture.from('assets/images/eye.svg')

    let player = new PIXI.Sprite(playerNormal)
    player.anchor.set(0.5)
    player.scale.set(0.3)

    container.addChild(player)

    // Create enemies
    const enemies = new Array()
    for (let i = 0; i < 10; i++) {

        const enemy = new PIXI.Sprite(eyeTexture)
        enemy.anchor.set(0.5)
        enemy.scale.set(0.7)
        enemy.x = Math.random() * 1000
        enemy.y = Math.random() * 1000
        enemy.health = 100

        enemies.push(enemy)
        container.addChild(enemy)
    }

    const soundParticleTexture = PIXI.Texture.from('assets/images/sound-particle-01.svg')
    const soundParticles = new Array()

    app.ticker.add(delta => {
        let speed = 7

        if (controller.trigger) {
            speed *= 0.5
            player.texture = playerScreaming

            const count = 20 + 50 * Math.sin(Date.now() / 15)
            console.log(count)
            // Create 10 sound particles per frame
            for (let i = 0; i < count; i++) {
                const speed = 10
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
                particle.anchor.set(0.5)
                particle.scale.set(0.07)

                particle.vx = x * speed
                particle.vy = y * speed
                particle.x = player.x + x * radius
                particle.y = player.y + y * radius

                soundParticles.push(particle)
                container.addChild(particle)
            }
        } else {
            player.texture = playerNormal
        }

        // Flip player character horizontally when moving left
        if (controller.move.x < 0) {
            player.scale.x = -0.3
        } else {
            player.scale.x = 0.3
        }

        // Sound particle simulation
        for (let i = soundParticles.length - 1; i >= 0; i--){
            const particle = soundParticles[i]

            if (Math.random() < 0.01) {
                particle.destroy()
                soundParticles.splice(i, 1)
                continue
            }

            particle.x += particle.vx * delta
            particle.y += particle.vy * delta
        }

        // Enemy movement
        for (const enemy of enemies) {
            const speed = 1
            let dx = player.x - enemy.x
            let dy = player.y - enemy.y
            const dr = Math.sqrt(dx*dx + dy*dy)
            dx *= speed / dr
            dy *= speed / dr
            enemy.x += dx
            enemy.y += dy
        }

        // Player movement
        player.x += controller.move.x * delta * speed
        player.y += controller.move.y * delta * speed


        cameraFollow(player)
    })
})
