import { app, container, cameraFollow } from '../engine/render.js'
import { controller } from '../engine/controller.js'
import { collider } from '../engine/containsPoint.js'
import { mapv, r } from '../engine/utils.js'

let gameOver = false

window.addEventListener('load', () => {

    let showTitle = true
    let gameOver = true

    const gameContainer = new PIXI.Container()
    container.addChild(gameContainer)

    let bgSprite = PIXI.Sprite.from('assets/images/tausta-01.svg')
    bgSprite.anchor.set(0.5)
    gameContainer.addChild(bgSprite)

    const playerNormal = PIXI.Texture.from('assets/images/normal-face.svg')
    const playerScreaming = PIXI.Texture.from('assets/images/scream-face.svg')
    const eyeTexture = PIXI.Texture.from('assets/images/eye.svg')

    let player = new PIXI.Sprite(playerNormal)
    player.anchor.set(0.5)
    player.scale.set(0.3)

    gameContainer.addChild(player)

    let enemies = new Array()

    let endScreen = PIXI.Sprite.from('assets/images/go-back-to-sleep-02.svg')
    endScreen.anchor.set(0.5)
    container.addChild(endScreen)

    const title = PIXI.Sprite.from('assets/images/title-01.svg')
    title.anchor.set(0.5)
    title.y = -10
    container.addChild(title)

    const soundParticleTexture = PIXI.Texture.from('assets/images/sound-particle-01.svg')
    let soundParticles = new Array()

    const spawnEnemy = (health) => {
        const enemy = new PIXI.Sprite(eyeTexture)
        enemy.scale.set(mapv(health, 0, 200, 0.3, 0.7) / 4)
        enemy.anchor.set(0.5)

        let x, y
        while (true) {
            x = (Math.random() * 2 - 1) * 1000
            y = (Math.random() * 2 - 1) * 1000
            if (r(x, y) > 300 && r(x, y) < 600) break
        }
        enemy.x = player.x + x
        enemy.y = player.y + y
        enemy.health = health
        enemy.maxHealth = health
        enemy.spawnTime = Date.now()
        enemy.alpha = 0

        enemies.push(enemy)
        gameContainer.addChild(enemy)
    }

    let gameElapsedTime
    const startGame = () => {
        showTitle = false

        for (const enemy of enemies) {
            enemy.destroy()
        }
        for (const particle of soundParticles) {
            particle.destroy()
        }

        // Create enemies
        enemies = new Array()
        for (let i = 0; i < 3; i++) {
            spawnEnemy(200)
        }

        soundParticles = new Array()

        gameOver = false
        player.scale.set(0.3)

        gameElapsedTime = 0
    }

    let triggerState = 0
    app.ticker.add(delta => {
        gameElapsedTime += delta

        if (gameOver) {
            if (triggerState === 0 && !controller.trigger) {
                triggerState = 1
            }
            if (triggerState === 1 && controller.trigger) {
                triggerState = 0
                startGame()
            }
        }

        endScreen.x = player.x
        endScreen.y = player.y
        if (gameOver) {
            endScreen.scale.set(0.5)
        } else {
            endScreen.scale.set(0)
        }

        if (showTitle) {
            title.scale.set(0.5)
            return
        } else {
            title.scale.set(0)
        }

        let speed = 7

        if (!gameOver && triggerState === 0 && !controller.trigger) {
            triggerState = 1
        }

        if (!gameOver && triggerState === 1 && controller.trigger) {
            speed *= 0.3
            player.texture = playerScreaming

            // Create sound particles
            const count = 20 + 50 * Math.sin(Date.now() / 15)
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
                particle.scale.set(0.9)

                particle.vx = x * speed
                particle.vy = y * speed
                particle.x = player.x + x * radius
                particle.y = player.y + y * radius

                soundParticles.push(particle)
                gameContainer.addChild(particle)
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

        // Enemies get more opaque over time
        for (const enemy of enemies) {
            if(enemy.alpha < 1.0) {
                const t = (Date.now() - enemy.spawnTime) / 500
                enemy.alpha = Math.min(1, t)
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
                if (Math.abs(dx) + Math.abs(dy) < 200) {
                    if (Math.sqrt(dx*dx + dy*dy) < 6 + 420*enemy.scale.x) {
                        enemy.health -= 1

                        particle.destroy()
                        soundParticles.splice(i, 1)
                    }
                }
            }
        }

        // Enemy scaling
        for (const enemy of enemies) {
            enemy.scale.set(mapv(enemy.health, 0, 200, 0.3, 0.7) / 4)
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
        if (!gameOver) {
            for (const enemy of enemies) {
                if (r(enemy.x - player.x, enemy.y - player.y) < 420*enemy.scale.x + 100*player.scale.x) {
                    gameOver = true
                    triggerState = 0
                    player.scale.set(0)
                }
            }
        }

        // Spawn new enemies
        if (Math.random() < 0.01) {
            const health = 200 + gameElapsedTime*0.3
            console.log('spawn', health)
            spawnEnemy(health)
        }

        // Player movement
        if (!gameOver) {
            player.x += controller.move.x * delta * speed
            player.y += controller.move.y * delta * speed
        }

        const xRepeat = 251.7
        const yRepeat = 622.5
        bgSprite.x = Math.round(player.x/xRepeat)*xRepeat
        bgSprite.y = Math.round(player.y/yRepeat)*yRepeat

        cameraFollow(player)
    })
})
