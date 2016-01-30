// global variables
var game = new Phaser.Game(1152, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update});
var effects = new Effects();
var objects = new Objects();
var player;
var npcCG, tileCG, playerCG, bulletsCG;		// collision groups

// TODO local variables
var levelNames = ['test', 'test2'];
var levelNum = 0;
var map, layer, layer1;		// tilemap related
var overlay;
var circleTile;
var ritualCircle = {
	posX : 0,
	posY : 0
};

/**
 * preload - load assets
 */
function preload () {
	game.load.tilemap('map', 'assets/tilemaps/'+levelNames[levelNum]+'.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tileset', 'assets/tilesets/basictiles.png');
	
	// preload effects and objects
	effects.preload();
	objects.preload();
}

/**
 * create - generate and initialise game content
 */
function create () {
	// start physics system
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true);
	
	// register collision groups
	npcCG = game.physics.p2.createCollisionGroup();
	tileCG = game.physics.p2.createCollisionGroup();
	playerCG = game.physics.p2.createCollisionGroup();
	bulletsCG = game.physics.p2.createCollisionGroup();
	
	// enable collision with world bounds
	game.physics.p2.updateBoundsCollisionGroup();
	// enable callbacks on collision
	game.physics.p2.setImpactEvents(true);
	// set the default coefficient of restitution between colliding bodies
	//game.physics.p2.restitution = 0.8;
	
	// load tile map
	game.stage.backgroundColor = '#555555';
	map = game.add.tilemap('map');
	map.addTilesetImage('basictiles', 'tileset');
	layer = map.createLayer('layer0');
	layer1 = map.createLayer('layer1');
	
	// create effects and objects
	effects.create();
	objects.create();
	
	// enable scaling
	game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
	game.input.onDown.add(gofull, this);
	
	// set tile collision group
	map.setCollision(100, true, 'collision');
	var tileObjects = game.physics.p2.convertTilemap(map, 'collision');
	for (var i = 0; i < tileObjects.length; i++) {
		tileObjects[i].setCollisionGroup(tileCG);
		tileObjects[i].collides(npcCG);
		tileObjects[i].collides(playerCG);
		tileObjects[i].collides(bulletsCG);
	}
	
	for (var i=0;i < map.width; i++) {
		for (var j=0;j < map.height; j++) {
			//console.log(map.getTile(i, j, 'layer1', true).index);
			if (map.getTile(i, j, 'layer1', true).index == 7) {
				circleTile = map.getTile(i, j, 'layer1', true);
				ritualCircle.posX = i + 2;
				ritualCircle.posY = j + 2;
				//console.log(ritualCircle.posX + ", " + ritualCircle.posY);
			}
		}
	}
	
	// create a new bitmap data object
	var bmd = game.add.bitmapData(game.width, game.height);
	
	// draw to the canvas context like normal
	bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, game.width, game.height);
	bmd.ctx.fillStyle = '#000000';
	bmd.ctx.fill();
	
	// use the bitmap data as the texture for the sprite
	overlay = game.add.sprite(0, 0, bmd);
	overlay.alpha = 0.0;
}

function gofull() {
	if (game.scale.isFullScreen) {
		game.scale.stopFullScreen();
	}
	else {
		game.scale.startFullScreen(false);
	}
}

function update() {
	var dt = game.time.elapsed;
	overlay.alpha -= dt * 0.0005;
	
	// update effects and objects
	effects.update();
	objects.update();
	
}
