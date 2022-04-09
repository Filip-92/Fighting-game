const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

var audio = new Audio('./Assets/Samurai Jack Theme Song [Extended].mp3');
var slash1 = new Audio('./Assets/katana1.mp3');
var slash2 = new Audio('./Assets/katana2.mp3');
var deathSound = new Audio('./Assets/death.wav');

function enableMute() { 
  audio.muted = !audio.muted;
  slash1.muted = !slash1.muted;
  slash2.muted = !slash2.muted;
  deathSound.muted = !deathSound.muted;
  if (audio.muted) {
    document.querySelector('#mute').style.border = '2px solid red'
    document.querySelector('#mute').innerHTML = 'Unmute sounds'
  } else {
    document.querySelector('#mute').style.border = 'none'
    document.querySelector('#mute').innerHTML = 'Mute sounds'
  }
}

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './Assets/background.png'
})

const shop = new Sprite({
    position: {
        x: 600,
        y: 130
    },
    imageSrc: './Assets/shop.png',
    scale: 2.75,
    framesMax: 6,
    framesCurrent: 1
})

enableMute()

const player = new Fighter({
    position: {
        x: 100,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './Assets/samuraiMack/Idle.png',
    framesMax: 8,
    scale: 2.5,
    offset: {
        x: 215,
        y: 157
    },
    sprites: {
        idle: {
            imageSrc: './Assets/samuraiMack/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './Assets/samuraiMack/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './Assets/samuraiMack/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './Assets/samuraiMack/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './Assets/samuraiMack/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './Assets/samuraiMack/Take Hit - white silhouette.png',
            framesMax: 4,
            framesHold: 5
        },
        death: {
            imageSrc: './Assets/samuraiMack/Death.png',
            framesMax: 6
        }
    },
    attackBox: {
        offset: {
            x: 80,
            y: 50
        },
        width: 180,
        height: 50
    }
})

const enemy = new Fighter({
    position: {
        x: 800,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './Assets/kenji/Idle.png',
    framesMax: 4,
    scale: 2.5,
    offset: {
        x: 215,
        y: 167
    },
    sprites: {
        idle: {
            imageSrc: './Assets/kenji/Idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './Assets/kenji/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './Assets/kenji/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './Assets/kenji/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './Assets/kenji/Attack1.png',
            framesMax: 4
        },
        takeHit: {
            imageSrc: './Assets/kenji/Take hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './Assets/kenji/Death.png',
            framesMax: 7
        }
    },
    attackBox: {
        offset: {
            x: -170,
            y: 50
        },
        width: 170,
        height: 50
    }
})

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    y: {
        pressed: false
    },
    n: {
        pressed: false
    }
}

let lastKey

decreaseTimer()

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()

    audio.volume = 0.2
    audio.play()

    player.velocity.x = 0
    enemy.velocity.x = 0

    // do you wish to continue?
    if (keys.y.pressed) {
        window.location.reload(true);
    } else if (keys.n.pressed) {
        window.location.href = 'https://wordpress.filippeszke.pl';
    }

    // player movement
    if (keys.a.pressed && player.lastKey === 'a' && player.position.x >= 0) {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd' && player.position.x <= 1024) {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    // jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    // enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft' && enemy.position.x >= 0) {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight' && enemy.position.x <= 1000) {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    // detect for collision & enemy gets hit
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking && 
        player.framesCurrent === 4
        ) {
            enemy.takeHit()
            player.isAttacking = false

            gsap.to('#enemyHealth', {
                width: enemy.health + '%'
            })
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false
    }

    // this is where our player gets hit
    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
    }) &&
        enemy.isAttacking &&
        enemy.framesCurrent === 2
        ) {
            player.takeHit()
            enemy.isAttacking = false
            
            gsap.to('#playerHealth', {
                width: player.health + '%'
            })
    }

    // if enemy misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        deathSound.play()
        setTimeout(function(){
            deathSound.pause();
            deathSound.currentTime = 0;
        }, 1000);

        determineWinner({ player, enemy, timerId })
    }
}

function mute() {
    audio.play()
}

animate()

window.addEventListener('keydown', (event) => {
    if (!player.dead) {
        switch (event.key) {
            case 'd':
                keys.d.pressed = true
                player.lastKey = 'd'
                break
            case 'a':
                keys.a.pressed = true
                player.lastKey = 'a'    
                break
            case 'w':
                if (player.position.y > 20) {
                    player.velocity.y = -20
                }
                break
            case ' ':
                player.attack()
                slash1.play();
                break
        }
    }

    if (!enemy.dead) {
        switch (event.key) {
            case 'ArrowRight':
                keys.ArrowRight.pressed = true
                enemy.lastKey = 'ArrowRight'
                break
            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true
                enemy.lastKey = 'ArrowLeft'
                break
            case 'ArrowUp':
                if (enemy.position.y > 20) {
                    enemy.velocity.y = -20
                }
                break
            case 'ArrowDown':
                enemy.attack()
                slash2.play();
                break
        }
    }

    if (player.dead || enemy.dead || timer <= 0) {
        switch(event.key) {
            case 'y':
                keys.y.pressed = true
                break
            case 'n':
                keys.n.pressed = true
                break
        }
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
    }

    // enemy keys
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowUp':
            keys.w.pressed = true
            lastKey = 'ArrowUp'
            break
    }
    console.log(event.key)
})