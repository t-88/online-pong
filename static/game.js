canvas = document.getElementById("app-canvas")

ctx = canvas.getContext("2d")
w  = canvas.getBoundingClientRect().width
h  = canvas.getBoundingClientRect().height

p  = []
ball = {}
keys = {
    "ArrowUp" : false,
    "ArrowDown" : false,
    "KeyW" : false,
    "KeyS" : false,
}
have_to_reset = true

ball_init_speed = 3
var player_id = 1 
var board_w = 0.1

function get_player_id() {
    const qStr = window.location.search
    const urlPrams  = new URLSearchParams(qStr)
    return  urlPrams.get("player_id")
}

function draw() {
    // clear screen
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,w,h)
    
    // line
    ctx.fillStyle = "white"
    ctx.fillRect(parseInt((w - 3) / 2),0,3,h)
    
    // p1
    ctx.fillStyle = "green"
    ctx.fillRect((1 - board_w * 2 ) * w,p[0].y,p[0].w,p[0].h)

    // p2
    ctx.fillStyle = "red"
    ctx.fillRect(w * board_w,p[1].y,p[1].w,p[1].h)


    // ball
    ctx.fillStyle = "yellow"
    if(parseInt(player_id) == 1) {
        ctx.fillRect(ball.x,ball.y,ball.w,ball.h)
    } else {
        ctx.fillRect(w - ball.x  - w * board_w,ball.y,ball.w,ball.h)
    }
}

let game_state = {}
async function  update(){ 
    game_state.have_to_reset = have_to_reset 
    if(have_to_reset) {
        player_id = get_player_id()
        have_to_reset = false
    }

    game_state.player_id = player_id
    if (p.length > 0)  {
        game_state.p = p[0]
    }

    await fetch("/data?",{
        method : "POST",
        headers : {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(game_state),
        keepalive : true,
    })
    .then((res) => res.text())
    .then((data) => { 
        data = JSON.parse(data)

        board_w = data.board_w

        data.p1.y = data.p1.y * h 
        data.p2.y = data.p2.y * h 

        data.p1.w = data.p1.w * w
        data.p1.h = data.p1.h * h

        data.p2.w = data.p2.w * w
        data.p2.h = data.p2.h * h
        



        if(player_id == 1) {
            p = [data.p1,data.p2]
        } else {
            ball_offet = -1
            p = [data.p2,data.p1]
        }
        ball = data.ball
        ball.x = ball.x * w
        ball.y = ball.y * h
        ball.w = ball.w * w
        ball.h = ball.h * h
        ball.vel.x = ball.vel.x * w
        ball.vel.y = ball.vel.y * h
    }) 
    draw()

    // reset game state
    game_state = {}
    game_state.w = w
    game_state.h = h
    if(ball.x > w) {
        have_to_reset = true
    } else if (ball.x + ball.w < 0) {
        have_to_reset = true
    }

    if(ball.y < 0) {
        ball.y = 0
        ball.vel.y = -ball.vel.y
        game_state.ball = ball
    } else if(ball.y + ball.h > h) {
        ball.y = h - ball.h
        ball.vel.y = -ball.vel.y
        game_state.ball = ball
    }


    if(keys["ArrowUp"]) {
        p[0].py = p[0].y 
        p[0].y -= p[0].vely
        if(p[0].y < 0) {
            p[0].y = 0
        }
    } else if (keys["ArrowDown"]) {
        p[0].py = p[0].y 
        p[0].y += p[0].vely
        if(p[0].y > h - p[0].h) {
            p[0].y = h - p[0].h
        }
    }

    requestAnimationFrame(update)
}

function keydown(ev) {
    if(ev.code in keys) {
        keys[ev.code] = true
    }
}
function keyup(ev) {
    if(ev.code in keys) {
        keys[ev.code] = false
    }
} 



window.addEventListener("load",(ev) => { update() } )
window.addEventListener("keydown",(ev) => {keydown(ev)})
window.addEventListener("keyup",(ev) => {keyup(ev)})



function on_btn_clk() {
    fetch('/1')
   .then(response => response.text())
   .then(text => console.log(text))
}