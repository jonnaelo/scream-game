import { app, container, cameraFollow } from '../engine/render.js'
import { controller } from '../engine/controller.js'
import { collider } from '../engine/containsPoint.js'
import { mapv, r } from '../engine/utils.js'

let gameOver = false

window.addEventListener('load', () => {
    let bgSprite = PIXI.Sprite.from('assets/images/tausta-01.svg')
    bgSprite.anchor.set(0.5)
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
        enemy.health = 500

        enemies.push(enemy)
        container.addChild(enemy)
    }

    const soundParticleTexture = PIXI.Texture.from('assets/images/sound-particle-01.svg')
    const soundParticles = new Array()

    app.ticker.add(delta => {
        let speed = 7

        if (controller.trigger) {
            speed *= 0.3
            player.texture = playerScreaming

            // Create sound particles
            const count = 20 + 50 * Math.sin(Date.now() / 15)
            console.log(count)
            for (let i = 0; i < count; i++) {
                const speed = 10
                const radius = 15 + Math.random() * 10 // 15..25

                // Random point inside a unit circle
                let x, y
                while (true) {
                    x = Math.random() * 2 - 1
                    y = Math.random() * 2 - 1
                    if (r(x, y) <= 1) break
                }

                // bias sound towards movement
                x += controller.move.x * 0.5
                y += controller.move.y * 0.5

                const r_ = r(x, y)
                x /= r_
                y /= r_

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
            player.scale.x = -player.scale.y
        } else {
            player.scale.x = player.scale.y
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

        // Enemies move towards the player
        if (!gameOver) {
            for (const enemy of enemies) {
                const speed = 1.7
                let dx = player.x - enemy.x
                let dy = player.y - enemy.y
                const dr = r(dx, dy)
                dx *= speed / dr
                dy *= speed / dr
                enemy.x += dx
                enemy.y += dy
            }
        }

        // Enemies stay away from each other
        for (const enemy1 of enemies) {
            for (const enemy2 of enemies) {
                if (enemy1 === enemy2) continue

                const force = 30
                let dx = enemy1.x - enemy2.x
                let dy = enemy1.y - enemy2.y
                const dr = r(dx, dy)
                dx *= force / dr/dr
                dy *= force / dr/dr
                enemy1.x += dx
                enemy1.y += dy
            }
        }

        // Enemies take damage from sound
        for (const enemy of enemies) {
            for (let i = soundParticles.length - 1; i >= 0; i--){
                const particle = soundParticles[i]

                const dx = particle.x - enemy.x
                const dy = particle.y - enemy.y
                if (Math.abs(dx) + Math.abs(dy) < 100) {
                    if (Math.sqrt(dx*dx + dy*dy) < 5 + 70*enemy.scale.x) {
                        enemy.health -= 1
                        enemy.scale.set(mapv(enemy.health, 0, 500, 0.2, 0.7))

                        particle.destroy()
                        soundParticles.splice(i, 1)
                    }
                }
            }
        }

        // Enemies can die
        for (let i = enemies.length - 1; i >= 0; i--){
            const enemy = enemies[i]
            if (enemy.health <= 0) {
                enemy.destroy()
                enemies.splice(i, 1)
            }
        }

        // Enemies give damage to player
        for (const enemy of enemies) {
            if (r(enemy.x - player.x, enemy.y - player.y) < 70*enemy.scale.x + 100*player.scale.x) {
                gameOver = true
                player.scale.set(0)
            }
        }

        // Player movement
        if (!gameOver) {
            player.x += controller.move.x * delta * speed
            player.y += controller.move.y * delta * speed
        }

        cameraFollow(player)
    })
})
