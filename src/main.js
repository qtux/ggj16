window.onload = function() {
	var game = new Phaser.Game(1152, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update});
	var map;
	var layer;
	var player;
	
	function preload () {
		console.log('starting preload()');
		game.load.tilemap('map', 'assets/tilemaps/test.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('tileset', 'assets/tilesets/basictiles.png');
		game.load.spritesheet('player', 'assets/spritesheets/hero.png', 36, 72);
		console.log('preload() done');
	}
	
	function create () {
		console.log('starting create()');
		// load tile map
		game.stage.backgroundColor = '#555555';
		map = game.add.tilemap('map');
		map.addTilesetImage('basictiles', 'tileset');
		layer = map.createLayer('layer0');
		layer.resizeWorld();
		
		// add player sprite
		player = game.add.sprite(200, 200, 'player', 1);
		game.physics.startSystem(Phaser.Physics.P2JS);
		map.setCollision(100, true, "collision");
		//Then the physics engine creates collision bodies from the tiles:
		game.physics.p2.convertTilemap(map, "collision");
		game.physics.p2.enable(player);
		player.body.fixedRotation = true; // no rotation
		//player.body.addRectangle(72, 36, 0, 25);	// only lower part collides
		//Controls
		cursors = game.input.keyboard.createCursorKeys();
		//player.body.debug = true;
		
		// scaling
		game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
		game.input.onDown.add(gofull, this);
		
		console.log('create() done');
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
		var speed = 300;
		if (cursors.left.isDown){
			player.body.velocity.x = -speed;
		} else if (cursors.right.isDown){
			player.body.velocity.x = speed;
		} else {
			player.body.velocity.x = 0;
		}
		if (cursors.up.isDown){
			player.body.velocity.y = -speed;
		} else if (cursors.down.isDown){
			player.body.velocity.y = speed;
		} else {
			player.body.velocity.y = 0;
		}
	}
};
