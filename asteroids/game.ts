
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

if (!Array.prototype.find) {
	Array.prototype.find = function(predicate) {
		if (this == null) {
			throw new TypeError('Array.prototype.find called on null or undefined');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}
		var list = Object(this);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value;

		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return value;
			}
		}
		return undefined;
	};
}

interface Array<T> {
    find(predicate: (search: T) => boolean) : T;
}

const enum AsteroidType {
    Small,
    Medium,
    Large
}

interface iPoint {
	x: number;
	y: number;
}

interface iEntity {
	draw(): void;
	update(): void;
	reset(): void;
	position: cVector2D;
	velocity: cVector2D;
}

interface iRandom {
	getNumber(min:number, max:number): number;
}

class cRandom implements iRandom {
	public getNumber = (min: number, max: number) => {
		return  Math.random() * (max - min) + min;
	}
}

class cRect {
	public start: cVector2D = new cVector2D(0,0);
	public end: cVector2D = new cVector2D(0,0);
}

class cVector2D implements iPoint {
	public x: number = 0;
	public y: number = 0;

	constructor(x: number, y: number) {
		this.set(x, y);
	}

	public set = (x: number, y: number): void => {
		this.x = x;
		this.y = y;
	}

	public negative = (): void => {
		this.set(-this.x, -this.y);
	}

	public add = (v: cVector2D | number): void => {
		if( v instanceof cVector2D) {
			this.x += v.x;
			this.y += v.y;
		}else {
			this.x += v;
			this.y += v;
		}
	}

	public subtract = (v: cVector2D | number): void => {
		if(v instanceof cVector2D) {
			this.x -= v.x;
			this.y -= v.y;
		}else {
			this.x -= v;
			this.y -= v;
		}
	}

	public multiply = (v: cVector2D | number): void => {
		if(v instanceof cVector2D) {
			this.x *= v.x;
			this.y *= v.y;
		}else {
			this.x *= v;
			this.y *= v;
		}
	}

	public divide = (v: cVector2D | number): void => {
		if(v instanceof cVector2D) {
			if(v.x != 0) this.x /= v.x;
			if(v.y != 0) this.y /= v.y;
		}else {
			if(v != 0) {
				this.x /= v;
				this.y /= v;
			}
		}
	}

	public equals = (v: cVector2D): boolean => {
		return this.x == v.x && this.y == v.y;
	}

	public dot = (v: cVector2D): number => {
		return this.x * v.x + this.y * v.y;
	}

	public cross = (v: cVector2D): number => {
		return this.x * v.y - this.y * v.x;
	}

	public length = (): number => {
		return Math.sqrt(this.dot(this));
	}

	public normalize = (): void => {
		this.divide(this.length());
	}

	public toRadians = (): number => {
		return -Math.atan2(-this.y, this.x);
	}

	public copy = (): cVector2D => {
		return new cVector2D(this.x, this.y);
	}

	public rotate = (rads: number): cVector2D => {
		var cos: number = Math.cos(rads);
		var sin: number = Math.sin(rads)
		var nx:number = (cos * (this.x)) + (sin * (this.y));
		var ny:number = (cos * (this.y)) - (sin * (this.x));
		return new cVector2D(nx, ny);
	}
}

class cBullet implements iEntity {
	public position: cVector2D = new cVector2D(0,0);
	public velocity: cVector2D = new cVector2D(0,0);
	public direction: cVector2D = new cVector2D(0,0);
	public isAlive: boolean = false;
	public life: number = 50;
	public speed: number = 10;

	public deploy = (position: cVector2D, direction: cVector2D): void => {
		this.position = position;
		this.direction = direction;

		this.velocity = new cVector2D(0,0);
		this.direction.normalize();
		this.direction.multiply(this.speed)
		this.velocity.add(this.direction);
		this.life = 50;
		this.isAlive = true;
	}

	public draw = (): void => {
		if(this.isAlive) {
			ctx.save();
			ctx.translate(this.position.x, this.position.y);
			ctx.beginPath();
			ctx.fillStyle = "white";
			ctx.lineWidth = 1;

			ctx.fillRect(0, 0, 2,2);

			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
	}

	public update = (): void => {
		if(this.isAlive) {
			this.position.add(this.velocity);

			var hit: boolean = asteroidManager.checkCollision(this.position.copy());

			if(hit)
			{
				this.reset();
				return;
			}
			// wrap the player in the canvas...
			if(this.position.x > canvas.width)
				this.position.x = 0;
			else if(this.position.x < 0)
				this.position.x = canvas.width;
			if(this.position.y > canvas.height)
				this.position.y = 0;
			else if(this.position.y < 0)
				this.position.y = canvas.height;

			this.life--;

			if(this.life < 0) {
				this.isAlive = false;
			}
		}
	}

	public reset = (): void => {
		this.isAlive = false;
	}
}

class cBulletManager {
	public bullets: Array<cBullet> = new Array<cBullet>();

	constructor() {
		for(var bc: number = 0; bc < 15; bc++) {
			this.bullets.push(new cBullet());
		}
	}

	public addBullet = (position: cVector2D, direction: cVector2D): void => {
		var x = this.bullets.find(b => !b.isAlive);
		if(x != undefined) {
			x.deploy(position, direction);
		}
	}

	public updateDraw = (): void => {
		var bull: cBullet;
		for(var b: number = 0; b < this.bullets.length; b++) {
			bull = this.bullets[b];
			if(bull.isAlive) {
				bull.update();
				bull.draw();
			}
		}
	}
}

class cAsteroidManager {
	public asteroids: Array<cAsteroid> = new Array<cAsteroid>();

	constructor() {
		for(var ac: number = 0; ac < 15; ac++) {
			this.asteroids.push(new cAsteroid());
		}
	}

	public addAsteroid = (position: cVector2D, asteriodType: AsteroidType): void => {
		var x = this.asteroids.find(b => !b.isAlive);
		if(x != undefined) {
			x.spawn(position, asteriodType);
		}
	}

	public updateDraw = (): void => {
		var roid: cAsteroid;
		for(var r: number = 0; r < this.asteroids.length; r++) {
			roid = this.asteroids[r];
			if(roid.isAlive) {
				roid.update();
				roid.draw();
			}
		}
	}

	public checkCollision = (position: cVector2D): boolean => {
		var roidCheck: cAsteroid;
		for(var a: number = 0; a < this.asteroids.length; a++) {
			roidCheck = this.asteroids[a];
			if(roidCheck.isAlive) {
				var bound: cRect = roidCheck.calculateCollisionBounds();

				if(position.x > bound.start.x && 
					position.x < (bound.start.x + bound.end.x) && 
					position.y > bound.start.y && 
					position.y < (bound.start.y + bound.end.y)) {
					roidCheck.onDeath();
					return true;
				}
			}
		}

		return false;
	}
}

class cShip implements iEntity {
	public position: cVector2D = new cVector2D(0,0);
	public velocity: cVector2D = new cVector2D(0,0);
	public rotation: number = 0;
	public rotationSpeed: number = 0;
	public pointList: Array<cVector2D> = new Array<cVector2D>();
	public rotateRight: boolean = false;
	public rotateLeft: boolean = false;
	public isThrusting: boolean = false;
	public isBraking: boolean = false;
	public isFiring: boolean = false;
	public direction: cVector2D = new cVector2D(0,0);
	public fireTimer: number = 0;

	constructor(position: cVector2D) {
		this.position = position;

		var x: number = 12;
		var y: number = 0;
		this.pointList.push(new cVector2D(x, y));
		y -= 10;
		x -= 24;
		this.pointList.push(new cVector2D(x, y));
		y += 10;
		x += 6;
		this.pointList.push(new cVector2D(x, y));
		y += 10;
		x -= 6;
		this.pointList.push(new cVector2D(x, y));
		y -= 10;
		x += 24;
		this.pointList.push(new cVector2D(x, y));

		this.rotationSpeed = 0.06;
	}

	public draw = (): void => {
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(this.rotation);
		ctx.beginPath();
		ctx.strokeStyle = "white";
		ctx.lineWidth = 1;

		ctx.moveTo(this.pointList[this.pointList.length - 1].x, this.pointList[this.pointList.length - 1].y);

		for (var i: number = 0; i < this.pointList.length; i++) {
			ctx.lineTo(this.pointList[i].x, this.pointList[i].y);
		}

		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	public update = (): void => {

		if(this.fireTimer > 0) {
			this.fireTimer--;
		}

		if(this.rotateLeft)
			this.rotation -= this.rotationSpeed;
		else if(this.rotateRight)
			this.rotation += this.rotationSpeed;

		//first get the direction the entity is pointed
		this.direction.x = Math.cos(this.rotation);// / (Math.PI / 180));
		this.direction.y = Math.sin(this.rotation);// / (Math.PI / 180));
		if (this.direction.length() > 0) {
			this.direction.normalize();
		}

		if(this.isThrusting) {
			var v: cVector2D = new cVector2D(this.velocity.x, this.velocity.y);
			this.direction.multiply(0.2);
			v.add(this.direction);
			if(v.length() < 8) {
			//Then scale it by the current speed to get the velocity
				this.velocity.add(this.direction);
			}
			
		}

		if(this.isFiring && this.fireTimer == 0) {
			bulletManager.addBullet(this.position.copy(), this.direction.copy());
			this.fireTimer = 10;
		}

		if(this.isBraking) {
			this.velocity.multiply(0.99);
		}

		if(this.velocity.length() < 0.2) {
			this.velocity.set(0,0);
		}

		this.position.add(this.velocity);

		// wrap the player in the canvas...
		if(this.position.x > canvas.width)
			this.position.x = 0;
		else if(this.position.x < 0)
			this.position.x = canvas.width;
		if(this.position.y > canvas.height)
			this.position.y = 0;
		else if(this.position.y < 0)
			this.position.y = canvas.height;
		
	}

	public reset = (): void => {

	}
}

class cAsteroid implements iEntity {
	public position: cVector2D = new cVector2D(0,0);
	public velocity: cVector2D = new cVector2D(0,0);
	public rotation: number = 0;
	public rotationSpeed: number = 0;
	public pointList: Array<cVector2D> = new Array<cVector2D>();
	public asteroidType: AsteroidType = AsteroidType.Small;
	public size: number = 0;
	public isAlive: boolean = false;
	public bounds: cRect = new cRect();
	public colBounds: cRect = new cRect();

	public spawn = (position: cVector2D, asteroidType: AsteroidType): void => {
		this.position = position;
		this.asteroidType = asteroidType;

		switch(this.asteroidType) {
			case AsteroidType.Large:
				this.size = 12;
				break;
			case AsteroidType.Medium:
				this.size = 7;
				break;
			case AsteroidType.Small:
				this.size = 3;
				break;
		}

		this.buildAsteroid();

		this.rotationSpeed = rnd.getNumber(0.02, 0.06);

		this.velocity.x = rnd.getNumber(0.1, 1);
		this.velocity.y = rnd.getNumber(0.1, 1);

		if(rnd.getNumber(0, 100) > 50) {
			this.velocity.x = -this.velocity.x;
		}
		if(rnd.getNumber(0, 100) > 50) {
			this.velocity.y = -this.velocity.y;
		}

		this.isAlive = true;
	}

	private buildAsteroid = (): void => {

		var scale: number = this.size / 6;

		var cx: cVector2D = new cVector2D(0,0);
		var cy: cVector2D = new cVector2D(0,0);

		var x: number = -4 * scale;
		var y: number = -15 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		y += 10 * scale;
		x += 25 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		y += 2 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		x -= 5 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		y += 4 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		x += 5 * scale;
		y += 7 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		y += 7 * scale;
		x -= 12 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		x -= 13 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		y -= 5 * scale;
		x -= 5 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		y -= 20 * scale;
		x -= 12 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		y -= 5 * scale;
		x += 15 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));
		x += 2 * scale;
		if(x < cx.x) cx.x = x;
		if(x > cx.y) cx.y = x;
		if(y < cy.x) cy.x = y;
		if(y > cy.y) cy.y = y;
		this.pointList.push(new cVector2D(x, y));

		
		this.bounds.start.x = cx.x;
		this.bounds.start.y = cy.x;
		this.bounds.end.x = Math.abs(cx.x) + Math.abs(cx.y);
		this.bounds.end.y = Math.abs(cy.x) + Math.abs(cy.y);
	}

	public draw = (): void => {
		ctx.save();
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(this.rotation);
		ctx.beginPath();
		ctx.strokeStyle = "white";
		ctx.lineWidth = 1;

		ctx.moveTo(this.pointList[this.pointList.length - 1].x, this.pointList[this.pointList.length - 1].y);

		for (var i: number = 0; i < this.pointList.length; i++) {
			ctx.lineTo(this.pointList[i].x, this.pointList[i].y);
		}

		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	public update = (): void => {
		this.rotation += this.rotationSpeed;

		this.position.add(this.velocity);

		// wrap the asteroid in the canvas...
		if(this.position.x > canvas.width)
			this.position.x = 0;
		else if(this.position.x < 0)
			this.position.x = canvas.width;
		if(this.position.y > canvas.height)
			this.position.y = 0;
		else if(this.position.y < 0)
			this.position.y = canvas.height;
	}

	public reset = (): void => {
		this.pointList.length = 0;
		this.isAlive = false;
	}

	public onDeath = (): void => {
		if(this.asteroidType == AsteroidType.Large) {
			asteroidManager.addAsteroid(this.position.copy(), AsteroidType.Medium);
			asteroidManager.addAsteroid(this.position.copy(), AsteroidType.Medium);
			asteroidManager.addAsteroid(this.position.copy(), AsteroidType.Small);
		}else if (this.asteroidType == AsteroidType.Medium) {
			var n:number = rnd.getNumber(2, 5);

			for(var sn: number = 0; sn < n; sn++) {
				asteroidManager.addAsteroid(this.position.copy(), AsteroidType.Small);
			}
		}
		this.reset();
	}

	public calculateCollisionBounds = (): cRect => {
		var topLeft: cVector2D = this.bounds.start.rotate(this.rotation);
		var topRight: cVector2D = new cVector2D(this.bounds.start.x + this.bounds.end.x, this.bounds.start.y).rotate(this.rotation);
		var bottomLeft: cVector2D = new cVector2D(this.bounds.start.x, this.bounds.start.y + this.bounds.end.y).rotate(this.rotation);
		var bottomRight: cVector2D = new cVector2D(this.bounds.start.x + this.bounds.end.x,this.bounds.start.y + this.bounds.end.y).rotate(this.rotation);

		var minX: number = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
		var minY: number = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
		var maxX: number = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
		var maxY: number = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);

		this.colBounds.start.x = minX + this.size + this.position.x;
		this.colBounds.start.y = minY + this.size + this.position.y;
		this.colBounds.end.x = maxX - minX - (this.size * 2);
		this.colBounds.end.y = maxY - minY - (this.size * 2);
		return this.colBounds;
	}
}

var playerShip: cShip = new cShip(new cVector2D(200, 100));
var bulletManager: cBulletManager = new cBulletManager();
var asteroidManager: cAsteroidManager = new cAsteroidManager();
var rnd: cRandom = new cRandom();
var debugText: string = "";

function gameLoop() {
    // lets keep the game loop going!
    requestAnimationFrame(gameLoop);

    // fill to black!
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

	playerShip.update();
	playerShip.draw();

	bulletManager.updateDraw();

	asteroidManager.updateDraw();

	if(debugText.length > 0) {
        // draw a the score!
        ctx.font = "10px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(debugText, 10, 30);

	}
}

function keyDownHandler(e: KeyboardEvent) {
    // right arrow == 39
    // left arrow == 37
	// up arrow == 38
	// down arrow == 40
	// space bar == 32
    if(e.keyCode == 39) {
        playerShip.rotateRight = true;
    }else if(e.keyCode == 37) {
        playerShip.rotateLeft = true;
    }else if(e.keyCode == 38) {
		playerShip.isThrusting = true;
	}else if(e.keyCode == 40) {
		playerShip.isBraking = true;
	}else if(e.keyCode == 32) {
        playerShip.isFiring = true;
    }
}

function keyUpHandler(e: KeyboardEvent) {
    if(e.keyCode == 39) {
        playerShip.rotateRight = false;
    }else if(e.keyCode == 37) {
        playerShip.rotateLeft = false;
    }else if(e.keyCode == 38) {
		playerShip.isThrusting = false;
	}else if(e.keyCode == 40) {
		playerShip.isBraking = false;
	}else if(e.keyCode == 32) {
        playerShip.isFiring = false;
    }
}

window.onload = () => {
    // grab our canvas, and get a 2d context
    canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
    ctx = canvas.getContext("2d");

    // let's handle the user input
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

	asteroidManager.addAsteroid(new cVector2D(50,175), AsteroidType.Small);
	asteroidManager.addAsteroid(new cVector2D(50,175), AsteroidType.Medium);
	asteroidManager.addAsteroid(new cVector2D(50,175), AsteroidType.Large);


	gameLoop();
}
