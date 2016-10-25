///
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

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

// class for the ball entity
class cBall implements iEntity {
    public x: number = 0;
    public y: number = 0;
    public velX: number = 0;
    public velY: number = 0;
    public radius: number = 0;
    public color: string = "white";

    constructor(x: number, y: number, radius: number, color: string = "white")
    {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    public reset = (): void => {
        this.x = 50;
        this.y = 50;
        this.velX = 3;
        this.velY = 3;
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
            if(this.y < paddle.y && this.x > paddle.x && this.x < paddle.x + paddle.length) {
                // bounce the ball back up!
                this.velY = -this.velY;
            }else if(this.y > canvas.height - this.radius) {
                // we lost a life
                // reset the ball back to start.
                this.reset();
            }
        }
    }
}

// class for the paddle entity (aka, the player)
class cPaddle implements iEntity {
    public x: number = 0;
    public y: number = 0;
    public velX: number = 0;
    public velY: number = 0;
    public length: number = 0;
    public height: number = 0;
    public color: string = "white";
    public moveRight: boolean = false;
    public moveLeft: boolean = false;

    constructor(x: number, y: number, length: number, height: number, color: string = "white")
    {
        this.x = x;
        this.y = y;
        this.length = length;
        this.height = height;
        this.color = color;
    }

    public draw = (): void => {
        // draw the nice little paddle!
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.length, this.height);
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
        if(this.x > canvas.width - this.length) {
            this.x = canvas.width - this.length;
        }

        if(this.x < 0) {
            this.x = 0;
        }
    }
}

var entity_array: Array<iEntity> = new Array<iEntity>();
var ball: cBall = new cBall(50, 50, 4);
var paddle: cPaddle = new cPaddle(100, 300, 50, 10, "red");

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
}

function keyDownHandler(e: KeyboardEvent) {
    // right arrow == 39
    // left arrow == 37
    if(e.keyCode == 39) {
        paddle.moveRight = true;
    }else if(e.keyCode == 37) {
        paddle.moveLeft = true;
    }
}

function keyUpHandler(e: KeyboardEvent) {
    if(e.keyCode == 39) {
        paddle.moveRight = false;
    }else if(e.keyCode == 37) {
        paddle.moveLeft = false;
    }
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

    // run the game!
    gameLoop();
}
