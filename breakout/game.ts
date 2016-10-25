//
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

var levelToLoad: string = "RRRRRRRRRRRR|BBBBBBBBBBBB|GGGGGGGGGGGG|YYYYYYYYYYYY|WWWWWWWWWWWW";

// base interface for our entities that we want to draw on the screen
// and handle in the game.
interface iEntity {
    draw(): void;
    update(): void;
    x: number;
    y: number;
    velX: number;
    velY: number;
}

interface iHud {
    x: number;
    y: number;
    draw(): void;
}

// class for the ball entity
class cBall implements iEntity {
    public x: number = 0;
    public y: number = 0;
    public velX: number = 0;
    public velY: number = 0;
    public radius: number = 0;
    public color: string = "white";
    public status: boolean = false;

    constructor(x: number, y: number, radius: number, color: string = "white")
    {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    public reset = (): void => {
        this.velX = 3;
        this.velY = 3;
        this.y = 290;
        this.status = false;
    }

    public draw = (): void => {
        // draw a nice circle!
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    public update = (): void => {
        if(this.status) {
            // update the balls position
            this.x += this.velX;
            this.y += this.velY;

            // did we hit the left or right bounds?
            // if so, lets bounce back the opposite direction.
            if(this.x > canvas.width - this.radius || this.x < this.radius) {
                this.velX = -this.velX;
            }

            // did we hit the ceiling?
            // if so, let's bounce back down.
            if(this.y < this.radius) {
                this.velY = -this.velY;
            }else if(this.y > paddle.y - this.radius) {
                // check to see if the ball is near the height of the paddle
                // if so, let's check to see if it is in the same area on the X axis as the paddle,
                // and check to see if the ball is still above the paddle.
                if(this.y < paddle.y && this.x > paddle.x && this.x < paddle.x + paddle.width) {
                    // bounce the ball back up!
                    this.velY = -this.velY;
                }else if(this.y > canvas.height - this.radius) {
                    // we lost a life
                    // reset the ball back to start.
                    this.reset();
                    lives.removeLives(1);
                }
            }
        } else {
            this.x = paddle.x + paddle.width/2;
        }
    }
}

// class for the paddle entity (aka, the player)
class cPaddle implements iEntity {
    public x: number = 0;
    public y: number = 0;
    public velX: number = 0;
    public velY: number = 0;
    public width: number = 0;
    public height: number = 0;
    public color: string = "white";
    public moveRight: boolean = false;
    public moveLeft: boolean = false;

    constructor(x: number, y: number, width: number, height: number, color: string = "white")
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    public draw = (): void => {
        // draw the nice little paddle!
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    public update = (): void => {

        // are we moving right or left?
        if(this.moveRight) {
            this.x += this.velX;
        }else if(this.moveLeft) {
            this.x -= this.velX;
        }

        // make sure the user can't go off the X axis bounds.
        if(this.x > canvas.width - this.width) {
            this.x = canvas.width - this.width;
        }

        if(this.x < 0) {
            this.x = 0;
        }
    }
}

class cBrick implements iEntity {
    public x: number = 0;
    public y: number = 0;
    public velX: number = 0;
    public velY: number = 0;
    public width: number = 0;
    public height: number = 0;
    public color: string = "white";
    public active: boolean = true;
    public points: number = 0;

    constructor(x: number, y: number, width: number, height: number, points: number, color: string = "white")
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.points = points;
        this.color = color;
    }

    public draw = (): void => {
        if(this.active) {
            // draw the nice little brick!
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }

    public update = (): void => {
        if(this.active) {
            if(ball.x > this.x && ball.x < this.x + this.width && ball.y > this.y && ball.y < this.y + this.height) {
                ball.velY = -ball.velY;
                this.active = false;
                score.addPoints(this.points);
            }
        }
    }
}

class cScore implements iHud {
    public x: number = 0;
    public y: number = 0;
    public pointMultiplier: number = 0;
    public totalPoints: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.pointMultiplier = 1;
    }

    public reset = (): void => {
        this.pointMultiplier = 1;
        this.totalPoints = 0;
    }

    public addPoints(p: number) {
        this.totalPoints += (this.pointMultiplier * p);
    }

    public draw = (): void => {
        // draw a the score!
        ctx.font = "16px Arial";
        ctx.fillStyle = "#0095DD";
        ctx.fillText("Score: " + this.totalPoints, this.x, this.y);
    }
}

class cLives implements iHud {
    public x: number = 0;
    public y: number = 0;
    public totalLives: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.totalLives = 3;
    }

    public reset = (): void => {
        this.totalLives = 3;
    }
    
    public draw = (): void => {
        var xPos: number = this.x;
        var yPos: number = this.y;

        ctx.save();
        for(var l: number = 0; l < this.totalLives; l++) {
            ctx.beginPath();
            ctx.arc(xPos, yPos, 2, 0, Math.PI*2);
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.closePath();
            xPos += 6;
        }
    }
    
    public addLives(n: number) {
        this.totalLives += n;
    }

    public removeLives(n: number) {
        this.totalLives -= n;
        if(this.totalLives < 0) {
            reloadLevel();
        }
    }
}

var entity_array: Array<iEntity> = new Array<iEntity>();
var hud_array: Array<iHud> = new Array<iHud>();
var ball: cBall = new cBall(240, 290, 5);
var paddle: cPaddle = new cPaddle(215, 300, 50, 10, "gray");
var score: cScore = new cScore(8, 20);
var lives: cLives = new cLives(8, 310);

function gameLoop()
{
    // lets keep the game loop going!
    requestAnimationFrame(gameLoop);

    // fill to black!
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // update and draw the entities
    var entity: iEntity;
    for(var i: number = 0; i < entity_array.length; i++) {
        entity = entity_array[i];
        entity.update();
        entity.draw();
    }

    var hud: iHud;
    for(var h: number = 0; h < hud_array.length; h++) {
        hud = hud_array[h];
        hud.draw();
    }
}

function keyDownHandler(e: KeyboardEvent) {
    // right arrow == 39
    // left arrow == 37
    if(e.keyCode == 39) {
        paddle.moveRight = true;
    }else if(e.keyCode == 37) {
        paddle.moveLeft = true;
    }else if(e.keyCode == 32) {
        if(ball.status == false) {
            ball.status = true;
        }
    }
}

function keyUpHandler(e: KeyboardEvent) {
    if(e.keyCode == 39) {
        paddle.moveRight = false;
    }else if(e.keyCode == 37) {
        paddle.moveLeft = false;
    }else if(e.keyCode == 82) {
        reloadLevel();
    }
}

function loadLevel(bricks: string) {
    var xpos: number = 35;
    var ypos: number = 35;
    var pad: number = 10;
    var bwidth: number = 25;
    var bheight: number = 10;

    for(var c: number = 0; c < bricks.length; c++) {
        switch(bricks[c]) {
            case 'R':
            {
                var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "red");
                xpos += bwidth + pad;
                entity_array.push(b);
            }
            break;
            case 'B':
            {
                var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "blue");
                xpos += bwidth + pad;
                entity_array.push(b);
            }
            break;
            case 'G':
            {
                var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "green");
                xpos += bwidth + pad;
                entity_array.push(b);
            }
            break;
            case 'Y':
            {
                var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "yellow");
                xpos += bwidth + pad;
                entity_array.push(b);
            }
            break;
            case 'W':
            {
                var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "white");
                xpos += bwidth + pad;
                entity_array.push(b);
            }
            break;
            case '|':
            {
                xpos = 35;
                ypos += bheight + pad;
            }
            break;
        }
    }
}

function reloadLevel() {
    entity_array.length = 0;
    hud_array.length = 0;
    paddle.x = 215;
    ball.reset();
    score.reset();
    lives.reset();
    entity_array.push(ball);
    entity_array.push(paddle);

    hud_array.push(score);
    hud_array.push(lives);

    loadLevel(levelToLoad);
}

window.onload = () => {
    // grab our canvas, and get a 2d context
    canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
    ctx = canvas.getContext("2d");
    
    // let's handle the user input
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    // setup initial values for the entities.
    ball.velX = 3;
    ball.velY = 3;
    paddle.velX = 5;

    entity_array.push(ball);
    entity_array.push(paddle);

    hud_array.push(score);
    hud_array.push(lives);

    loadLevel(levelToLoad);

    // run the game!
    gameLoop();
}
