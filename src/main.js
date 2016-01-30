window.onload = function() {
	var game = new Phaser.Game(1152, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update});
	
	// game ressources
	var map, layer, layer1;		// tilemap related
	var player, sheep;			// sprites
	var npcCG, tileCG, playerCG;					// collision groups
	var emitter;
	var overlay;
	var playerstate;
	
	/**
	 * preload - load assets
	 */
	function preload () {
		game.load.tilemap('map', 'assets/tilemaps/test.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('tileset', 'assets/tilesets/basictiles.png');
		game.load.spritesheet('player', 'assets/spritesheets/hero.png', 36, 72);
		game.load.spritesheet('particles', 'assets/spritesheets/particles.png', 18, 18);
	    game.load.spritesheet('wizard', 'assets/spritesheets/wizard.png', 36, 72, 12);
	    game.load.spritesheet('sheep', 'assets/spritesheets/sheep.png', 36, 36, 12);
	    
	    playerstate = 'passive';
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
		game.physics.p2.setImpactEvents(true);
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
		player = game.add.sprite(200, 200, 'wizard', 1);
		var playerAnimFPS = 10;
		player.animations.add('player_idle', [0], playerAnimFPS, true);
		player.animations.add('player_down', [0, 1, 2], playerAnimFPS, true);
		player.animations.add('player_up', [3, 4, 5], playerAnimFPS, true);
		player.animations.add('player_right', [6, 7, 8], playerAnimFPS, true);
		player.animations.add('player_left', [9, 10, 11], playerAnimFPS, true);

		sheep = game.add.sprite(400, 300, 'sheep');
		var playerAnimFPS = 10;
		sheep.animations.add('sheep_idle', [0], playerAnimFPS, true);
		sheep.animations.add('sheep_down', [9, 10, 11], playerAnimFPS, true);
		sheep.animations.add('sheep_up', [6, 7, 8], playerAnimFPS, true);
		sheep.animations.add('sheep_right', [3, 4, 5], playerAnimFPS, true);
		sheep.animations.add('sheep_left', [0, 1, 2], playerAnimFPS, true);
		
		//player.body.debug = true;

		
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
		sheep.body.collides(playerCG, sheepBumpedPlayer, this);
		sheep.body.collides(tileCG, sheepBumpedWall, this);
		
		// enable user input
		cursors = game.input.keyboard.createCursorKeys();

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
		
		var speed = 300;
		if (cursors.left.isDown) {
			player.body.velocity.x = -speed;
			player.animations.play('player_left');
		} else if (cursors.right.isDown) {
			player.body.velocity.x = speed;
			player.animations.play('player_right');
		} else {
			player.body.velocity.x = 0;
		}
		if (cursors.up.isDown) {
			player.body.velocity.y = -speed;
			player.animations.play('player_up');
		} else if (cursors.down.isDown) {
			player.body.velocity.y = speed;
			player.animations.play('player_down');
		} else {
			player.body.velocity.y = 0;
		}
		
		if (player.body.velocity.x == 0 && player.body.velocity.y == 0) {
			player.animations.play('player_idle', 3, true);
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.E))
	    {
			particleEffectBloodExplosion(player.body.x, player.body.y, 30, 2000);
	    }
	    
	    if (game.input.keyboard.isDown(Phaser.Keyboard.Q))
	    {
			playerstate = 'angeredSheep';
	    }
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.B))
	    {
		    overlay.alpha = 1.0;
	    }
		
		if (emitter != null) {
			emitter.forEachAlive(function(p) {
				p.alpha = p.lifespan / emitter.lifespan;
			});
		}
		
		resolveAImovement();
	}
	
	function resolveAImovement() {
		// random walk
		if (playerstate == 'passive') {
			sheep.body.force.x = ((game.rnd.integer() % 20) - 10) * 10;
			sheep.body.force.y = ((game.rnd.integer() % 20) - 10) * 10;
		}
		// seek
		if (playerstate == 'angeredSheep') {
			var maxSpeed = 100;
			var target = new Phaser.Point(player.body.x, player.body.y);
			var seeker = new Phaser.Point(sheep.body.x, sheep.body.y);
			var distSheepPlayer = Phaser.Point.normalize(Phaser.Point.subtract(Phaser.Point.add(target, new Phaser.Point(player.body.velocity.x, player.body.velocity.y)), seeker));
			sheep.body.velocity.x = distSheepPlayer.x * maxSpeed;
			sheep.body.velocity.y = distSheepPlayer.y * maxSpeed;
		}
	}
	
	function sheepBumpedWall() {
		sheep.body.velocity.x = -sheep.body.velocity.x;
		sheep.body.velocity.y = -sheep.body.velocity.y;
	}
	
	function sheepBumpedPlayer() {
		playerstate = 'passive';
	}

	
	function particleEffectBloodExplosion(x , y, numParticles, lifeTime) {
		if (emitter == null){
			emitter = game.add.emitter(x, y, numParticles);
		    emitter.makeParticles('particles', [0, 1, 2, 3, 4, 5, 6, 7, 8], numParticles, true, true);
//		    emitter.minParticleSpeed.setTo(-400, -400);
//		    emitter.maxParticleSpeed.setTo(400, 400);
		    emitter.gravity = 0;
		    emitter.maxParticles = numParticles;
		    
		    emitter.start(true, lifeTime, null, numParticles);
		    game.time.events.add(lifeTime, function(){emitter.destroy(); emitter = null;}, this);
			
		}
	}
};
