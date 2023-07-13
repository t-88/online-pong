canvas = document.getElementById("main-canvas")
ctx = canvas.getContext("2d")
w  = canvas.getBoundingClientRect().width
h  = canvas.getBoundingClientRect().height

p1 = {}
p2 = {}
ball = {}
keys = {}
have_to_reset = true

ball_init_speed = 3


function AABB(a,b) {
    return a.x + a.w > b.x && a.y + a.h > b.y && b.x + b.w > a.x && b.y + b.h > a.y 
}

function proj_aabb(a,axis) {
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    for (let i = 0; i < a.length; i++) {
        let projected = a[i][0] * axis[0] + a[i][1] * axis[1]
        if (projected > max) {
            max = projected 
        } 
        if (projected < min) {
            min = projected 
        }
    }

    return [min , max]
} 
function SAT(aa,bb) {
    a = JSON.parse(JSON.stringify(aa))
    b = JSON.parse(JSON.stringify(bb))

    // because i am using rects i will just convert them to pointes here
    // and because we are doing rects that are not rotated i can use the x and y axis
    a = [[a.x,a.y],[a.x + a.w,a.y],[a.x+a.w,a.y+a.h],[a.x,a.y+a.h]]
    b = [[b.x,b.y],[b.x + b.w,b.y],[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]]

    let min_depth = Number.MAX_SAFE_INTEGER

    for (let i = 0; i < a.length / 2; i++) {
        let p1 = a[i];       
        let p2 = a[(i + 1) % a.length];        
    
        p12 = [p2[0] - p1[0],p2[1] - p1[1]]
        mag_p12 = Math.sqrt(p12[0] * p12[0] + p12[1] * p12[1])
        p12[0] /= mag_p12
        p12[1] /= mag_p12
        norm_p12 = [-p12[1],p12[0]]

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
    
        let [min1 , max1] = proj_aabb(a,norm_p12)
        let [min2 , max2] = proj_aabb(b,norm_p12)

        if(min1 > max2 || min2 > max1) {
            return {did_collide : false,depth : null,normal : null}
        }

        let depth = Math.min(max1 - min2,max2 - min1)
        if (depth < min_depth) {
            normal = norm_p12
            min_depth = depth
        }
    }
    depth = min_depth
    return {did_collide: true,depth,normal}
}


function reset() {
    let p1 = {
        x : 10,
        y : (h - 100) / 2,
        px : 10,
        py : (h - 100) / 2,
        w : 10,
        h : 100,
        vely : 5,
    }
    let p2 = {
        x  :w - 20,
        y : (h - 100) / 2,
        px : 10,
        py : (h - 100) / 2,
        w : 10, 
        h: 100,
        vely : 5,
    }    
    let keys = {
        "ArrowUp" : false,
        "ArrowDown" : false,
        "KeyW" : false,
        "KeyS" : false,
    }
    let ball = {
        x : (w - 10) / 2,
        y : (h - 10) / 2,
        w : 10,
        h : 10,
        vel : {
            x : Math.floor(Math.random() * 10) + 1 ,
            y : Math.floor(Math.random() * 10) + 1 ,
        }
    }    

    const mag = Math.sqrt((ball.vel.x * ball.vel.x) + (ball.vel.y * ball.vel.y))
    ball.vel.x /= mag 
    ball.vel.y /= mag 

    ball.vel.x *= ball_init_speed
    ball.vel.y *= ball_init_speed

    return [p1,p2,keys,ball]
}

function draw() {
    // clear screen
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,w,h)

    
    // line
    ctx.fillStyle = "white"
    ctx.fillRect(parseInt((w - 3) / 2),0,3,h)
    
    // p1
    ctx.fillStyle = "white"
    ctx.fillRect(p1.x,p1.y,p1.w,p1.h)

    // p2
    ctx.fillStyle = "white"
    ctx.fillRect(p2.x,p2.y,p2.w,p2.h)

    // ball
    ctx.fillStyle = "yellow"
    ctx.fillRect(ball.x,ball.y,ball.w,ball.h)


}


function  update() {
    draw()


    if(have_to_reset) {
        [p1,p2,keys,ball] =  reset()
        have_to_reset = false
    }

    if(ball.x > w) {
        have_to_reset = true
    } else if (ball.x + ball.w < 0) {
        have_to_reset = true
    }

    if(ball.y < 0) {
        ball.y = 0
        ball.vel.y = -ball.vel.y
    } else if(ball.y + ball.h > h) {
        ball.y = h - ball.h
        ball.vel.y = -ball.vel.y
    }



    let col1 = SAT(p1,ball) 
    let col2 = SAT(p2,ball)
    if(col1.did_collide || col2.did_collide) {
        let p = col1.did_collide ? p1  : p2
        col1 = col1.did_collide ? col1  : col2
        
        if(col1.normal[0] != 0 && col1.normal[0] != -0) {
            ball.vel.x = -ball.vel.x + Math.random() * 4
            if(p == p1) {
                ball.x -= col1.depth * col1.normal[0]
            } else {
                ball.x += col1.depth * col1.normal[0]
            }
        } else {
            ball.x -= col1.depth * col1.normal[0]
            ball.y -= col1.depth * col1.normal[1]
            ball.vel.x = -ball.vel.x + Math.random() * 4
            ball.vel.y = Math.sign(p.y - p.py) * (5 + Math.random()/ 2) 
        }
    }

    ball.x += ball.vel.x
    ball.y += ball.vel.y

    if(keys["ArrowUp"]) {
        p1.py = p1.y 
        p1.y -= p1.vely
        if(p1.y < 0) {
            p1.y = 0
        }
    } else if (keys["ArrowDown"]) {
        p1.py = p1.y 
        p1.y += p1.vely
        if(p1.y > h - p1.h) {
            p1.y = h - p1.h
        }
    }

    if(keys["KeyW"]) {
        p2.py = p2.y 
        p2.y -= p2.vely
        if(p2.y < 0) {
            p2.y = 0
        }        
    } else if (keys["KeyS"]) {
        p2.py = p2.y 
        p2.y += p2.vely
        if(p2.y > h - p2.h) {
            p2.y = h - p2.h
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