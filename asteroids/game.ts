
var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

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
	public direction: cVector2D = new cVector2D(0,0);

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
	public scale: number = 0;

	constructor(position: cVector2D, asteroidType: AsteroidType) {
		this.position = position;
		this.asteroidType = asteroidType;

		switch(this.asteroidType) {
			case AsteroidType.Large:
				this.scale = 2.5;
				break;
			case AsteroidType.Medium:
				this.scale = 1;
				break;
			case AsteroidType.Small:
				this.scale = 0.5;
				break;
		}

		var x: number = -4 * this.scale;
		var y: number = -15 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		y += 10 * this.scale;
		x += 25 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		y += 2 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		x -= 5 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		y += 4 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		x += 5 * this.scale;
		y += 7 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		y += 7 * this.scale;
		x -= 12 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		x -= 13 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		y -= 5 * this.scale;
		x -= 5 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		y -= 20 * this.scale;
		x -= 12 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		y -= 5 * this.scale;
		x += 15 * this.scale;
		this.pointList.push(new cVector2D(x, y));
		x += 2 * this.scale;
		this.pointList.push(new cVector2D(x, y));

		this.rotationSpeed = Math.random() * (0.06 - 0.02) + 0.02;

		this.velocity.x = Math.random() * (1 - 0.1) + 0.1;
		this.velocity.y = Math.random() * (1 - 0.1) + 0.1;

		if((Math.random() * 100) > 50) {
			this.velocity.x = -this.velocity.x;
		}
		if((Math.random() * 100) > 50) {
			this.velocity.y = -this.velocity.y;
		}
	}

	public draw = (): void => {
		ctx.save();
		//ctx.fillRect(this.position.x, this.position.y, 1, 1);
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

	}
}

var playerShip: cShip = new cShip(new cVector2D(200, 100));
var asteroids_array: Array<iEntity> = new Array<iEntity>();

function gameLoop() {
    // lets keep the game loop going!
    requestAnimationFrame(gameLoop);

    // fill to black!
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

	playerShip.update();
	playerShip.draw();

	var entity: iEntity;
	for(var r: number = 0; r < asteroids_array.length; r++) {
        entity = asteroids_array[r];
		entity.update();
        entity.draw();
    }
}

function keyDownHandler(e: KeyboardEvent) {
    // right arrow == 39
    // left arrow == 37
	// up arrow == 38
	// down arrow == 40
    if(e.keyCode == 39) {
        playerShip.rotateRight = true;
    }else if(e.keyCode == 37) {
        playerShip.rotateLeft = true;
    }else if(e.keyCode == 38) {
		playerShip.isThrusting = true;
	}else if(e.keyCode == 40) {
		playerShip.isBraking = true;
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
	}
}

window.onload = () => {
    // grab our canvas, and get a 2d context
    canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
    ctx = canvas.getContext("2d");

    // let's handle the user input
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

	var a: cAsteroid = new cAsteroid(new cVector2D(50, 175), AsteroidType.Small);
	asteroids_array.push(a);
	var a2: cAsteroid = new cAsteroid(new cVector2D(50, 175), AsteroidType.Medium);
	asteroids_array.push(a2);
	var a3: cAsteroid = new cAsteroid(new cVector2D(50, 175), AsteroidType.Large);
	asteroids_array.push(a3);

	gameLoop();
}