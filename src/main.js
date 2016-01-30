window.onload = function() {
	var game = new Phaser.Game(1152, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update});
	var map;
	var layer;
	var layer1;
	//var layer2;
	var player;
	var emitter;
	
	function preload () {
		console.log('starting preload()');
		game.load.tilemap('map', 'assets/tilemaps/test.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('tileset', 'assets/tilesets/basictiles.png');
		game.load.spritesheet('player', 'assets/spritesheets/hero.png', 36, 72);
		game.load.spritesheet('particles', 'assets/spritesheets/particles.png', 18, 18);
		console.log('preload() done');
	}
	
	function create () {
		console.log('starting create()');
		// load tile map
		game.stage.backgroundColor = '#555555';
		map = game.add.tilemap('map');
		map.addTilesetImage('basictiles', 'tileset');
		layer = map.createLayer('layer0');
		layer1 = map.createLayer('layer1');
		//layer2 = map.createLayer('layer2');
		layer.resizeWorld();
		
		// add player sprite
		player = game.add.sprite(200, 200, 'player', 1);
		game.physics.startSystem(Phaser.Physics.P2JS);
		map.setCollision(100, true, "collision");
		//Then the physics engine creates collision bodies from the tiles:
		game.physics.p2.convertTilemap(map, "collision");
		game.physics.p2.enable(player);
		player.body.fixedRotation = true; // no rotation
		player.body.collideWorldBounds = true;
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
		
		if (emitter != null) {
			emitter.forEachAlive(function(p) {
				p.alpha = p.lifespan / emitter.lifespan;
			});
		}
	}
	
	function particleEffectBloodExplosion(x , y, numParticles, lifeTime) {
		emitter = game.add.emitter(x, y, numParticles);
	    emitter.makeParticles('particles', [0, 1, 2, 3, 4, 5, 6, 7, 8], numParticles, true, true);
//	    emitter.minParticleSpeed.setTo(-400, -400);
//	    emitter.maxParticleSpeed.setTo(400, 400);
	    emitter.gravity = 0;
	    emitter.maxParticles = numParticles;
	    
	    emitter.start(true, lifeTime, null, numParticles);
	    game.time.events.add(lifeTime, function(){emitter.destroy();}, this);
	}
};
