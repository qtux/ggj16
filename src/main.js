window.onload = function() {
	var game = new Phaser.Game(1152, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update});
	
	// game ressources
	var levelNames = ['test', 'test2'];
	var levelNum = 0;
	var map, layer, layer1;		// tilemap related
	var player, sheep, goat, bulletSprite;			// sprites
	var npcCG, tileCG, playerCG, bulletsCG;					// collision groups
	var emitter;
	var overlay;
	var playerstate;
	var playerGrp, sheepGrp, goatGrp;
	var bullets;
	
	var fireRate = 300;
	var nextFire = 0;
	var circleTile;
	
	var carried = null;
	
	var ritualCircle = {
		posX : 0,
		posY : 0
	}
	/**
	 * preload - load assets
	 */
	function preload () {
		game.load.tilemap('map', 'assets/tilemaps/'+levelNames[levelNum]+'.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('tileset', 'assets/tilesets/basictiles.png');
		game.load.spritesheet('particles', 'assets/spritesheets/particles.png', 18, 18);
	    game.load.spritesheet('wizard', 'assets/spritesheets/wizard.png', 42, 72, 24);
	    game.load.spritesheet('sheep', 'assets/spritesheets/sheep.png', 36, 36, 15);
	    game.load.spritesheet('goat', 'assets/spritesheets/goat.png', 36, 36, 15);
		playerstate = 'passive';
	    
	    game.load.audio('ritual_tier_brennt', 'assets/audio/ritual_tier_brennt.ogg');
	    game.load.audio('shoot', 'assets/audio/shoot.ogg');
	    game.load.audio('meh', 'assets/audio/meh.ogg');
	}
	
	/**
	 * create - generate and initialise game content
	 */
	function create () {
		playerstate = 'passive';
		// enable scaling
		game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
		game.input.onDown.add(gofull, this);
		
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
		
		for (var i=0;i < map.width; i++) {
			for (var j=0;j < map.height; j++) {
//				console.log(map.getTile(i, j, 'layer1', true).index);
				if (map.getTile(i, j, 'layer1', true).index == 7) {
					circleTile = map.getTile(i, j, 'layer1', true);
					ritualCircle.posX = i + 2;
					ritualCircle.posY = j + 2;
//					console.log(ritualCircle.posX + ", " + ritualCircle.posY);
				}
			}
		}
		
		// set tile collision group
		map.setCollision(100, true, 'collision');
		var tileObjects = game.physics.p2.convertTilemap(map, 'collision');
		for (var i = 0; i < tileObjects.length; i++) {
			tileObjects[i].setCollisionGroup(tileCG);
			tileObjects[i].collides(npcCG);
			tileObjects[i].collides(playerCG);
			tileObjects[i].collides(bulletsCG);
		}
		
		// add sprites
		playerGrp = game.add.group();
		map.createFromObjects('objects', 102, 'wizard', 1, true, false, playerGrp);
		player = playerGrp.getTop();
		var playerAnimFPS = 10;
		player.animations.add('player_idle', [0], playerAnimFPS, true);
		player.animations.add('player_down', [0, 1,0, 2], playerAnimFPS, true);
		player.animations.add('player_up', [3, 4, 3, 5], playerAnimFPS, true);
		player.animations.add('player_right', [6, 7, 6, 8], playerAnimFPS, true);
		player.animations.add('player_left', [9, 10, 9, 11], playerAnimFPS, true);
		player.animations.add('player_carrying_idle', [12], playerAnimFPS, true);
		player.animations.add('player_carrying_down', [12, 13, 12, 14], playerAnimFPS, true);
		player.animations.add('player_carrying_up', [15, 16, 15, 17], playerAnimFPS, true);
		player.animations.add('player_carrying_right', [18, 19, 18, 20], playerAnimFPS, true);
		player.animations.add('player_carrying_left', [21, 22, 21, 23], playerAnimFPS, true);
		//player.body.debug = true;
		
		// enable physics for player
		game.physics.p2.enable(player);
		player.body.fixedRotation = true;
		player.body.setCollisionGroup(playerCG);
		player.body.collides(tileCG);
		player.body.collides(npcCG);
		
		sheepGrp = game.add.group();
		map.createFromObjects('objects', 103, 'sheep', 1, true, false, sheepGrp);
		sheepGrp.forEach(function(sheep) {
			var sheepAnimFPS = 10;
			sheep.animations.add('sheep_idle', [0], sheepAnimFPS, true);
			sheep.animations.add('sheep_down', [9, 10, 11], sheepAnimFPS, true);
			sheep.animations.add('sheep_up', [6, 7, 8], sheepAnimFPS, true);
			sheep.animations.add('sheep_right', [3, 4, 5], sheepAnimFPS, true);
			sheep.animations.add('sheep_left', [0, 1, 2], sheepAnimFPS, true);
			sheep.animations.add('sheep_panic', [12, 13, 14], sheepAnimFPS, true);
			// enable physics for sheep
			game.physics.p2.enable(sheep);
			sheep.body.fixedRotation = true;
			sheep.body.setCollisionGroup(npcCG);
			sheep.body.collides(playerCG, npcBumpedPlayer, this);
			sheep.body.collides(tileCG, npcBumpedWall, this);
			sheep.body.collides(bulletsCG, function() {var sound = game.add.audio('meh'); sound.play();}, this);}, this);
		goatGrp = game.add.group();
		map.createFromObjects('objects', 107, 'goat', 1, true, false, goatGrp);
		goatGrp.forEach(function(goat) {
			var goatAnimFPS = 10;
			goat.animations.add('goat_idle', [0], goatAnimFPS, true);
			goat.animations.add('goat_down', [9, 10, 11], goatAnimFPS, true);
			goat.animations.add('goat_up', [6, 7, 8], goatAnimFPS, true);
			goat.animations.add('goat_right', [3, 4, 5], goatAnimFPS, true);
			goat.animations.add('goat_left', [0, 1, 2], goatAnimFPS, true);
			goat.animations.add('goat_panic', [12, 13, 14], goatAnimFPS, true);
			// enable physics for goat
			game.physics.p2.enable(goat);
			goat.body.fixedRotation = true;
			goat.body.setCollisionGroup(npcCG);
			goat.body.collides(playerCG, npcBumpedPlayer, this);
			goat.body.collides(tileCG, npcBumpedWall, this);
			goat.body.collides(bulletsCG, function() {var sound = game.add.audio('meh'); sound.play();}, this);}, this);
		
		// bullets
		bullets = game.add.group();
		bullets.enableBody = true;
		bullets.physicsBodyType = Phaser.Physics.P2JS;
		bullets.createMultiple(10, 'particles', maxBullets);
		var maxBullets = 10;
		for (var i = 0; i < bullets.children.length; i++)
		{
			var tmpBullet = bullets.children[i];
//			tmpBullet.lifespan = 1000;
//			var tmpBullet = bullets.create(0, 0, 'particles', 10);
//			tmpBullet.body.setRectangle(40, 40);
			game.physics.p2.enable(tmpBullet);
//			tmpBullet.scale.setTo(2, 2);
			tmpBullet.animations.add('bullet_anim', [10, 11, 12, 13], 20, true);
			tmpBullet.animations.play('bullet_anim')
			
			tmpBullet.body.setCollisionGroup(bulletsCG);
			tmpBullet.body.collides(tileCG);
			tmpBullet.body.collides(npcCG);
		}
		
//		bullets.callAll('animations.add', 'animations', 'bullet_anim', [10, 11, 12, 13], 1, true, false);
//		bullets.callAll('play', 'animations', 'bullet_anim');
		
//		for (var i in bullets) {
//			console.log(typeof(bullets.getAt(i)));
////			tmpBullet = game.add.sprite(100, 0, 'particles', 1);
//			bullets.getAt(i).animations.add('bullet_anim', [10, 11, 12, 13], 20, true);
//			tmpBullet.animations.play('bullet_anim')
//		}

		bullets.setAll('checkWorldBounds', true);
		bullets.setAll('outOfBoundsKill', true);
		
//		bulletSprite = game.add.sprite(400, 300, 'particles', 10);
//		bulletSprite.animations.add('bullet_anim', [10, 11, 12, 13], 20, true);
//		bulletSprite.animations.play('bullet_anim');
//		bulletSprite.anchor.set(0.5);

//		game.physics.enable(bulletSprite, Phaser.Physics.P2JS);

//		bulletSprite.body.allowRotation = false;
		
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
		
		var tmpX = player.x / 36;
		var tmpY = player.y / 36;
		var playerRitualDist = Math.sqrt((ritualCircle.posX - tmpX)*(ritualCircle.posX - tmpX) + (ritualCircle.posY - tmpY)*(ritualCircle.posY - tmpY));
		
		if (playerRitualDist < 2) {
			particleEffectBloodExplosion(player.x , player.y, 10, 300);
		}
		
		var speed = 300;
		if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
			player.body.velocity.x = -speed;
			if (carried != null) {
				player.animations.play('player_carrying_left');
			} else {
				player.animations.play('player_left');
			}
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
			player.body.velocity.x = speed;
			if (carried != null) {
				player.animations.play('player_carrying_right');
			} else {
				player.animations.play('player_right');
			}
		} else {
			player.body.velocity.x = 0;
		}
		if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
			player.body.velocity.y = -speed;
			if (carried != null) {
				player.animations.play('player_carrying_up');
			} else {
				player.animations.play('player_up');
			}
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
			player.body.velocity.y = speed;
			if (carried != null) {
				player.animations.play('player_carrying_down');
			} else {
				player.animations.play('player_down');
			}
		} else {
			player.body.velocity.y = 0;
		}
		
		if (player.body.velocity.x == 0 && player.body.velocity.y == 0) {
			if (carried != null) {
				player.animations.play('player_carrying_idle', 3, true);
			} else {
				player.animations.play('player_idle', 3, true);
			}
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.N)) {
			if (levelNum + 1 < levelNames.length){
				levelNum += 1;
			}
			this.game.state.restart();	
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
			if (levelNum > 0){
				levelNum -= 1;
			}
			this.game.state.restart();

		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.R))
		{
		    var sound = game.add.audio('ritual_tier_brennt');
		    sound.play();
			particleEffectBloodExplosion(player.body.x, player.body.y, 30, 2000);
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.Q))
		{
			playerstate = 'angeredNPC';
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.E))
		{
			fire();
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.B))
		{
			overlay.alpha = 1.0;
		}
		
		if (carried != null && game.input.keyboard.isDown(Phaser.Keyboard.Y))
		{
			carried = null;
		}
		
		if (emitter != null) {
			emitter.forEachAlive(function(p) {
				p.alpha = p.lifespan / emitter.lifespan;
			});
		}
		
		sheepGrp.forEach(function(sheep) { resolveAImovement(sheep, 'sheep') }, this);
		goatGrp.forEach(function(goat) { resolveAImovement(goat, 'goat') }, this);
	}
	
	function resolveAImovement(npc, type) {	
		if (carried === npc.body) {
			if (type == 'sheep') {
				npc.animations.play('sheep_panic');
			}
			if (type == 'goat') {
				npc.animations.play('goat_panic');
			}
			npc.body.x = player.body.x + 0.01;
			npc.body.y = player.body.y - 15;
			return;
		}
		
		// random walk
		if (playerstate == 'passive') {
			//npc.body.force.x = ((game.rnd.integer() % 20) - 10) * 10;
			//npc.body.force.y = ((game.rnd.integer() % 20) - 10) * 10;
			var newVelo = new Phaser.Point(((game.rnd.integer() % 20) - 10) * 10, ((game.rnd.integer() % 20) - 10) * 10);
			if (Phaser.Point.angle(new Phaser.Point(npc.body.velocity.x, npc.body.velocity.y), newVelo) > 3.15/4) {
//				console.debug('high change');
			} else {
				npc.body.force.x = newVelo.x;
				npc.body.force.y = newVelo.y;
			}
		}
		// seek
		if (playerstate == 'angeredNPC') {
			var maxSpeed = 100;
			var target = new Phaser.Point(player.body.x, player.body.y);
			var seeker = new Phaser.Point(npc.body.x, npc.body.y);
			var distNPCPlayer = Phaser.Point.normalize(Phaser.Point.subtract(target, Phaser.Point.add(seeker, new Phaser.Point(npc.body.velocity.x, npc.body.velocity.y))));
			npc.body.force.x = distNPCPlayer.x * maxSpeed;
			npc.body.force.y = distNPCPlayer.y * maxSpeed;
		}
		
		// sheep animation
		if (type == 'sheep') {
			if (Math.abs(npc.body.velocity.y) > Math.abs(npc.body.velocity.x)) {
				if (npc.body.velocity.y > 0) {
					npc.animations.play('sheep_down');
				} else if (npc.body.velocity.y < 0) {
					npc.animations.play('sheep_up');
				} else {
					npc.animations.play('sheep_idle');
				}
			}
			
			if (Math.abs(npc.body.velocity.y) < Math.abs(npc.body.velocity.x)) {
				if (npc.body.velocity.x > 0) {
					npc.animations.play('sheep_left');
				} else if (npc.body.velocity.x < 0) {
					npc.animations.play('sheep_right');
				} else {
					npc.animations.play('sheep_idle');
				}
			}
		}
		// goat animation
		if (type == 'goat') {
			if (Math.abs(npc.body.velocity.y) > Math.abs(npc.body.velocity.x)) {
				if (npc.body.velocity.y > 0) {
					npc.animations.play('goat_down');
				} else if (npc.body.velocity.y < 0) {
					npc.animations.play('goat_up');
				} else {
					npc.animations.play('goat_idle');
				}
			}
			
			if (Math.abs(npc.body.velocity.y) < Math.abs(npc.body.velocity.x)) {
				if (npc.body.velocity.x > 0) {
					npc.animations.play('goat_left');
				} else if (npc.body.velocity.x < 0) {
					npc.animations.play('goat_right');
				} else {
					npc.animations.play('goat_idle');
				}
			}
		}
	}
	
	function npcBumpedWall(npcBody, wallBody) {
		npcBody.velocity.x = -npcBody.velocity.x;
		npcBody.velocity.y = -npcBody.velocity.y;
	}
	
	function npcBumpedPlayer(npcBody, playerBody) {
		playerstate = 'passive';
		if (carried == null && game.input.keyboard.isDown(Phaser.Keyboard.X))
		{
			carried = npcBody;
		}
	}

	function fire() {
		if (game.time.now > nextFire && bullets.countDead() > 0)
		{
			nextFire = game.time.now + fireRate;

			var bullet = bullets.getFirstDead();

			bullet.reset(player.body.x, player.body.y);
			bullet.lifespan = 2000;
//			bullet.animations.play('bullet_anim');#
			
			var music = game.add.audio('shoot');
			music.play();

			game.physics.arcade.moveToPointer(bullet, 300);
		}
	}
	
	function particleEffectBloodExplosion(x , y, numParticles, lifeTime) {
		if (emitter == null){
			emitter = game.add.emitter(x, y, numParticles);
			emitter.makeParticles('particles', [0, 1, 2, 3, 4, 5, 6, 7, 8], numParticles, true, true);
//			emitter.minParticleSpeed.setTo(-400, -400);
//			emitter.maxParticleSpeed.setTo(400, 400);
			emitter.gravity = 0;
			emitter.maxParticles = numParticles;
			
			emitter.start(true, lifeTime, null, numParticles);
			game.time.events.add(lifeTime, function(){emitter.destroy(); emitter = null;}, this);
		}
	}
	
//	function freeResources(){
//		game.world.removeAll();
////		emitter.destroy(true, true);
//		overlay.destroy(true, true);
//		playerGrp.destroy(true, true);
//		sheepGrp.destroy(true, true);
//		goatGrp.destroy(true, true);
//		bullets.destroy(true, true);
//	}
};
