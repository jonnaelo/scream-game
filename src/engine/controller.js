import { mapv } from './utils.js'

const touchJoystickMaxR = 70


// Keyboard
const keysDown = new Set()

window.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        event.preventDefault()
    }
    keysDown.add(event.code)
})

window.addEventListener('keyup', event => {
    keysDown.delete(event.code)
})


// Touch screen
let joystickTouchId = null
let joystickCenterX = null
let joystickCenterY = null
let joystickLastX = null
let joystickLastY = null
let triggerTouchId = null

window.addEventListener('touchstart', event => {
    event.preventDefault()

    for (const touch of event.changedTouches) {
        if (joystickTouchId === null) {
            joystickTouchId = touch.identifier
            joystickCenterX = touch.clientX
            joystickCenterY = touch.clientY
            joystickLastX = touch.clientX
            joystickLastY = touch.clientY
        } else if (triggerTouchId === null) {
            triggerTouchId = touch.identifier
        }
    }
})

window.addEventListener('touchmove', event => {
    event.preventDefault()

    for (const touch of event.changedTouches) {
        if (touch.identifier === joystickTouchId) {
            joystickTouchId = touch.identifier
            joystickLastX = touch.clientX
            joystickLastY = touch.clientY
            const dx = joystickLastX - joystickCenterX
            const dy = joystickLastY - joystickCenterY
            const r = Math.sqrt(dx*dx + dy*dy)
            if (r > touchJoystickMaxR) {
                // t = 0 -> not moving center
                // t = 1 -> center goes to joystickLast
                // t = 0.5 -> to the middle of center and joystickLast
                const t = (r - touchJoystickMaxR) / r
                joystickCenterX = t * joystickLastX + (1-t) * joystickCenterX
                joystickCenterY = t * joystickLastY + (1-t) * joystickCenterY
            }
        }
    }
})

window.addEventListener('touchend', event => {
    event.preventDefault()

    for (const touch of event.changedTouches) {
        if (touch.identifier === joystickTouchId) {
            joystickTouchId = null
            joystickCenterX = null
            joystickCenterY = null
            joystickLastX = null
            joystickLastY = null
        } else if (touch.identifier === triggerTouchId) {
            triggerTouchId = null
        }
    }
})


// Combined & gamepad
class Controller {
    get move() {
        let x = 0
        let y = 0
        if (keysDown.has('KeyA')) {
            x -= 1
        }
        if (keysDown.has('KeyD')) {
            x += 1
        }
        if (keysDown.has('KeyW')) {
            y -= 1
        }
        if (keysDown.has('KeyS')) {
            y += 1
        }

        if (joystickTouchId !== null) {
            const dx = (joystickLastX - joystickCenterX) / touchJoystickMaxR
            const dy = (joystickLastY - joystickCenterY) / touchJoystickMaxR
            x += dx
            y += dy
        }

        if (navigator.getGamepads) {
            const gamepads = navigator.getGamepads()
            if (gamepads.length >= 1 && gamepads[0]) {
                const gamepad = gamepads[0]
                if (gamepad.axes.length >= 2) {
                    // Remove neutral zone drift
                    const minR = 0.15
                    let gx = gamepad.axes[0]
                    let gy = gamepad.axes[1]
                    const gr = Math.sqrt(gx*gx + gy*gy)
                    if (gr < minR) {
                        gx = 0
                        gy = 0
                    } else {
                        const gr2 = mapv(gr, minR, 1, 0, 1)
                        gx *= gr2 / gr
                        gy *= gr2 / gr
                    }
                    x += gx
                    y += gy
                }
            }
        }

        const r = Math.sqrt(x*x + y*y)
        if (r > 1) {
            x /= r
            y /= r
        }
        return { x, y }
    }

    get trigger() {
        if (keysDown.has('Space')) {
            return true
        }

        if (triggerTouchId !== null) {
            return true
        }

        if (navigator.getGamepads) {
            const gamepads = navigator.getGamepads()
            if (gamepads.length >= 1 && gamepads[0]) {
                const gamepad = gamepads[0]
                if (gamepad.buttons.length >= 1) {
                    if (gamepad.buttons[0].pressed) {
                        return true
                    }
                }
            }
        }

        return false
    }
}

export const controller = new Controller()
