window.onload = function() {
	var game = new Phaser.Game(1152, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update});
	
	// game ressources
	var map, layer, layer1;		// tilemap related
	var player, sheep;			// sprites
	var npcCG, tileCG, playerCG;					// collision groups
	var emitter;
	
	/**
	 * preload - load assets
	 */
	function preload () {
		game.load.tilemap('map', 'assets/tilemaps/test.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('tileset', 'assets/tilesets/basictiles.png');
		game.load.spritesheet('player', 'assets/spritesheets/hero.png', 36, 72);
		game.load.spritesheet('sheep', 'assets/spritesheets/sheep.png', 36, 36);
		game.load.spritesheet('particles', 'assets/spritesheets/particles.png', 18, 18);
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
		tileCG = game.physics.p2.createCollisionGroup();
		playerCG = game.physics.p2.createCollisionGroup();
		
		// enable collision with world bounds
		game.physics.p2.updateBoundsCollisionGroup();
		// enable callbacks on collision
		//game.physics.p2.setImpactEvents(true);
		// set the default coefficient of restitution between colliding bodies
		//game.physics.p2.restitution = 0.8;
		
		// load tile map
		game.stage.backgroundColor = '#555555';
		map = game.add.tilemap('map');
		map.addTilesetImage('basictiles', 'tileset');
		layer = map.createLayer('layer0');
		layer1 = map.createLayer('layer1');
		
		// set tile collision group
		map.setCollision(100, true, 'collision');
		var tileObjects = game.physics.p2.convertTilemap(map, 'collision');
		for (var i = 0; i < tileObjects.length; i++) {
			tileObjects[i].setCollisionGroup(tileCG);
			tileObjects[i].collides(npcCG);
			tileObjects[i].collides(playerCG);
		}
		
		// add sprites
		player = game.add.sprite(200, 200, 'player', 1);
		//player.body.debug = true;
		sheep = game.add.sprite(400, 200, 'sheep');
		
		// enable physics for player
		game.physics.p2.enable(player);
		player.body.fixedRotation = true;
		player.body.setCollisionGroup(playerCG);
		player.body.collides(tileCG);
		player.body.collides(npcCG);
		
		// enable physics for sheep
		game.physics.p2.enable(sheep);
		sheep.body.fixedRotation = true;
		sheep.body.setCollisionGroup(npcCG);
		sheep.body.collides(playerCG);
		sheep.body.collides(tileCG);
		
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
