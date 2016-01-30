window.onload = function() {
	var game = new Phaser.Game(1152, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update});
	
	// game ressources
	var map, layer, layer1;		// tilemap related
	var player, sheep;			// sprites
	var npcCG;					// collision groups
	
	/**
	 * preload - load assets
	 */
	function preload () {
		game.load.tilemap('map', 'assets/tilemaps/test.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('tileset', 'assets/tilesets/basictiles.png');
		game.load.spritesheet('player', 'assets/spritesheets/hero.png', 36, 72);
		game.load.spritesheet('sheep', 'assets/spritesheets/sheep.png', 36, 36);
	}
	
	/**
	 * create - generate and initialise game content
	 */
	function create () {
		// enable scaling
		game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
		game.input.onDown.add(gofull, this);
		
		// start physics system
		game.physics.startSystem(Phaser.Physics.P2JS);
		
		// register collision groups
		npcCG = game.physics.p2.createCollisionGroup();
		
		// load tile map
		game.stage.backgroundColor = '#555555';
		map = game.add.tilemap('map');
		map.addTilesetImage('basictiles', 'tileset');
		layer = map.createLayer('layer0');
		layer1 = map.createLayer('layer1');
		layer.resizeWorld();
		// set collision using the collision map
		map.setCollision(100, true, "collision");
		game.physics.p2.convertTilemap(map, "collision");
		
		// add sprites
		player = game.add.sprite(200, 200, 'player', 1);
		//player.body.debug = true;
		sheep = game.add.sprite(400, 200, 'sheep');
		
		// enable physics for player
		game.physics.p2.enable(player);
		player.body.fixedRotation = true; // no rotation
		player.body.collideWorldBounds = true;
		//player.body.collides(npcCG);
		
		// enable physics for sheep
		game.physics.p2.enable(sheep);
		sheep.body.setCollisionGroup(npcCG);
		sheep.body.collides(player);
		sheep.body.collideWorldBounds = true;
		
		// enable user input
		cursors = game.input.keyboard.createCursorKeys();
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
		if (cursors.left.isDown) {
			player.body.velocity.x = -speed;
		} else if (cursors.right.isDown) {
			player.body.velocity.x = speed;
		} else {
			player.body.velocity.x = 0;
		}
		if (cursors.up.isDown) {
			player.body.velocity.y = -speed;
		} else if (cursors.down.isDown) {
			player.body.velocity.y = speed;
		} else {
			player.body.velocity.y = 0;
		}
	}
};
