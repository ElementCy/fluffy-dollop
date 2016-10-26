//
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

var levels: Array<string> = [   "35,35,5,25,10,RRRRRRRRRRRRRR|BBBBBBBBBBBBBB|GGGGGGGGGGGGGG|YYYYYYYYYYYYYY|WWWWWWWWWWWWWW|YYYYYYYYYYYYYY|GGGGGGGGGGGGGG|BBBBBBBBBBBBBB|RRRRRRRRRRRRRR",
                                "35,35,5,25,10,RRBBRRBBRRBBRR|BBRRBBRRBBRRBB|GGYYGGYYGGYYGG|YYGGYYGGYYGGYY|WWWWWWWWWWWWWW|YYGGYYGGYYGGYY|GGYYGGYYGGYYGG|BBRRBBRRBBRRBB|RRBBRRBBRRBBRR",
                                "35,35,5,25,10,YYYYYYYYYYYYYY|YY-!W!W-YY-!W!W-YY|YY-!W!W-YY-!W!W-YY|YYYYYYYYYYYYYY|YY--YYYYYY--YY|YYY--YYYY--YYY|YYYY--YY--YYYY|YYYYYY--YYYYYY|YYYYYYYYYYYYYY",
                                "35,35,5,25,10,@R@R@R@R@R@R@R@R@R@R@R@R@R@R|WWWWWWWWWWWWWW|YYYGGGYYYGGGYY|GGYYYYGGGYYYGG|BBBBBBBBBBBBBB|GGYYYYGGGYYYGG|YYYGGGYYYGGGYY|WWWWWWWWWWWWWW|@R@R@R@R@R@R@R@R@R@R@R@R@R@R",
                                "35,35,5,25,10,#B@B#B@B#B@B#B@B#B@B#B@B#B@B|RRGGRRGGRRGGRR|GGYYGGYYGGYYGG|YYWWYYWWYYWWYY|!R!RRRRR--RRRR!R!R|YYWWYYWWYYWWYY|GGYYGGYYGGYYGG|RRGGRRGGRRGGRR|WWW@W@WWWW@W@WWWWW",
                                "35,35,5,25,10,GGWWGGWWGGWWGG|RRGGRRGGRRGGRR|BBRRBBRRBBRRBB|!B!B!B!B!B!B!B!B!B!B!B!B!B!B|--------------|!B!B!B!B!B!B!B!B!B!B!B!B!B!B|RRBBRRBBRRBBRR|BBGGBBGGBBGGBB|GGYYGGYYGGYYGG",
                                "35,35,5,25,10,#R#B#G#Y#W#R#B#G#Y#W#R#B#G#Y|#W#R#B#G#Y#W#R#B#G#Y#W#R#B#G|#Y#W#R#B#G#Y#W#R#B#G#Y#W#R#B|#G#Y#W#R#B#G#Y#W#R#B#G#Y#W#R|#B#G#Y#W#R#B#G#Y#W#R#B#G#Y#W|#R#B#G#Y#W#R#B#G#Y#W#R#B#G#Y|#W#R#B#G#Y#W#R#B#G#Y#W#R#B#G|#Y#W#R#B#G#Y#W#R#B#G#Y#W#R#B|#G#Y#W#R#B#G#Y#W#R#B#G#Y#W#R" ];

const enum BrickType {
    Normal,
    Double,
    Triple,
    Unbreakable
}

// base interface for our entities that we want to draw on the screen
// and handle in the game.
interface iEntity {
    draw(): void;
    update(): void;
    reset(): void;
    x: number;
    y: number;
    velX: number;
    velY: number;
}

// base interface for all hud
interface iHud {
    x: number;
    y: number;
    draw(): void;
}

// base interface for our BrickMap
interface iBrickMap {
    brickCount: number;
    brickArray: Array<iEntity>;
    loadMap(map: string): void;
    updateDrawMap(): void;
    reset(): void;
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
                if(this.y < paddle.y && this.x + this.radius > paddle.x && this.x - this.radius < paddle.x + paddle.width) {
                    // bounce the ball back up!
                    // if already going down (if hits paddle at odd angle, and gets stuck, we just want it to go up,
                    // and not bounce back n forth until out of paddle.)
                    if(this.velY > 0)
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
    public strokeColor: string = "#363636";
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
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x,this.y,this.width, this.height);
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

    public reset = (): void => {
        this.x = 215;
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
    public brickType: BrickType = BrickType.Normal;
    public active: boolean = true;
    public points: number = 0;

    constructor(x: number, y: number, width: number, height: number, points: number, color: string = "white", brickType: BrickType = BrickType.Normal)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.points = points;
        this.color = color;
        this.brickType = brickType;
    }

    public draw = (): void => {
        if(this.active) {
            // draw the nice little brick!
            ctx.save();
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.color;
            ctx.fill();
            if(this.brickType == BrickType.Unbreakable) {
                ctx.strokeStyle = "#363636";
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x,this.y,this.width, this.height);
            }else if(this.brickType == BrickType.Triple) {
                ctx.strokeStyle = shadeColor2(ctx.fillStyle, -0.6);
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x,this.y,this.width, this.height);
            }else if(this.brickType == BrickType.Double) {
                ctx.strokeStyle = shadeColor2(ctx.fillStyle, -0.4);
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x,this.y,this.width, this.height);
            }
            ctx.closePath();
        }
    }

    public update = (): void => {
        if(this.active) {
            if(ball.x + ball.radius > this.x && ball.x - ball.radius < this.x + this.width && ball.y + ball.radius > this.y && ball.y - ball.radius < this.y + this.height) {
                ball.velY = -ball.velY;

                if(this.brickType != BrickType.Unbreakable) {
                    score.addPoints(this.points);
                }

                if(this.brickType == BrickType.Triple) {
                    this.brickType = BrickType.Double;
                }else if(this.brickType == BrickType.Double) {
                    this.brickType = BrickType.Normal;
                }else if(this.brickType == BrickType.Normal) {
                    this.active = false;
                    brickMap.brickCount--;
                }
            }
        }
    }

    public reset = (): void => {

    }
}

class cBrickMap implements iBrickMap {
    public brickCount: number = 0;
    public brickArray: Array<iEntity> = new Array<iEntity>();

    public loadMap = (map: string): void => {
        var dataArray: Array<string> = map.split(',');

        var xpos: number = parseInt(dataArray[0]);
        var ypos: number = parseInt(dataArray[1]);
        var pad: number = parseInt(dataArray[2]);
        var bwidth: number = parseInt(dataArray[3]);
        var bheight: number = parseInt(dataArray[4]);

        var brickMap: string = dataArray[5];
        var brickType: BrickType = BrickType.Normal;
        var numUnbreakable: number = 0;
        for(var c: number = 0; c < brickMap.length; c++) {
            switch(brickMap[c]) {
                case 'R':
                {
                    var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "red", brickType);
                    xpos += bwidth + pad;
                    this.brickArray.push(b);
                    brickType = BrickType.Normal;
                }
                break;
                case 'B':
                {
                    var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "blue", brickType);
                    xpos += bwidth + pad;
                    this.brickArray.push(b);
                    brickType = BrickType.Normal;
                }
                break;
                case 'G':
                {
                    var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "green", brickType);
                    xpos += bwidth + pad;
                    this.brickArray.push(b);
                    brickType = BrickType.Normal;
                }
                break;
                case 'Y':
                {
                    var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "yellow", brickType);
                    xpos += bwidth + pad;
                    this.brickArray.push(b);
                    brickType = BrickType.Normal;
                }
                break;
                case 'W':
                {
                    var b: cBrick = new cBrick(xpos, ypos, bwidth, bheight, 10, "white", brickType);
                    xpos += bwidth + pad;
                    this.brickArray.push(b);
                    brickType = BrickType.Normal;
                }
                break;
                case '|':
                {
                    xpos = 35;
                    ypos += bheight + pad;
                    brickType = BrickType.Normal;
                }
                break;
                // brick types come before the color of brick.
                case '!':
                {
                    brickType = BrickType.Unbreakable;
                    numUnbreakable++;
                }
                break;
                case '@':
                {
                    brickType = BrickType.Double;
                }
                break;
                case '#':
                {
                    brickType = BrickType.Triple;
                }
                break;
                case '-':
                {
                    // empty space
                    xpos += bwidth + pad;
                    brickType = BrickType.Normal;
                }
                break;
            }
        }

        this.brickCount = this.brickArray.length - numUnbreakable;
    }

    public updateDrawMap = (): void => {
        var entity: iEntity;
        for(var b: number = 0; b < this.brickArray.length; b++) {
            entity = this.brickArray[b];
            entity.update();
            entity.draw();
        }
        if(this.brickCount <= 0) {
            levelToLoad++;
            loadNewLevel();
        }
    }

    public reset = (): void => {
        this.brickArray.length = 0;
        this.brickCount = 0;
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

    public addPoints = (p: number): void => {
        this.totalPoints += (this.pointMultiplier * p);
    }

    public draw = (): void => {
        // draw a the score!
        ctx.font = "16px Arial";
        ctx.fillStyle = "#6495ED";
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
    
    public addLives = (n: number): void => {
        this.totalLives += n;
    }

    public removeLives = (n: number): void => {
        this.totalLives -= n;
        if(this.totalLives < 0) {
            resetGame();
        }
    }
}

var entity_array: Array<iEntity> = new Array<iEntity>();
var hud_array: Array<iHud> = new Array<iHud>();
var ball: cBall = new cBall(240, 290, 5);
var paddle: cPaddle = new cPaddle(215, 300, 50, 10, "gray");
var score: cScore = new cScore(8, 20);
var lives: cLives = new cLives(8, 310);
var brickMap: cBrickMap = new cBrickMap();
var levelToLoad: number = 0;

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

    brickMap.updateDrawMap();

    // draw the hud
    var hud: iHud;
    for(var h: number = 0; h < hud_array.length; h++) {
        hud = hud_array[h];
        hud.draw();
    }

    // draw a border around the canvas
    ctx.strokeStyle = "grey";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
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
    // 'r' == 82
    if(e.keyCode == 39) {
        paddle.moveRight = false;
    }else if(e.keyCode == 37) {
        paddle.moveLeft = false;
    }else if(e.keyCode == 82) {
        resetGame();
    }
}

function shadeColor2(color, percent) {   
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function resetGame() {
    entity_array.length = 0;
    hud_array.length = 0;
    paddle.x = 215;
    ball.reset();
    score.reset();
    lives.reset();
    brickMap.reset();
    entity_array.push(ball);
    entity_array.push(paddle);

    hud_array.push(score);
    hud_array.push(lives);

    levelToLoad = 0;

    brickMap.loadMap(levels[levelToLoad]);
}

function loadNewLevel() {
    paddle.reset();
    ball.reset();
    brickMap.reset();
    if(levelToLoad < levels.length) {
        brickMap.loadMap(levels[levelToLoad]);
    }else {
        ctx.font = "32px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("You WIN!!!", canvas.width/2, canvas.height/2);
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

    hud_array.push(score);
    hud_array.push(lives);

    brickMap.loadMap(levels[levelToLoad]);

    // run the game!
    gameLoop();
}
