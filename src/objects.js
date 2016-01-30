Objects = function() {
	
	var playerGrp, sheepGrp, goatGrp, wormGrp;	// sprite groupes
	var playerstate;
	var carriedObject = null;
	
	var ritualSound;
	
	this.preload = function() {
		game.load.spritesheet('wizard', 'assets/spritesheets/wizard.png', 42, 72, 24);
		game.load.spritesheet('sheep', 'assets/spritesheets/sheep.png', 36, 36, 15);
		game.load.spritesheet('goat', 'assets/spritesheets/goat.png', 36, 36, 15);
		game.load.spritesheet('worm', 'assets/spritesheets/worm.png', 36, 36, 8);
		game.load.audio('ritual_tier_brennt', 'assets/audio/ritual_tier_brennt.ogg');
	};
	
	this.stopPlayer = function() {
		player.body.velocity.x = 0.;
		player.body.velocity.y = 0.;
	};
	
	this.getPlayerX = function() {
		return player.body.x;
	};
	
	this.getPlayerY = function() {
		return player.body.y;
	};
	
	this.create = function() {
		playerstate = 'passive';
		
		ritualSound = game.add.audio('ritual_tier_brennt');
		
		// enable user input
		cursors = game.input.keyboard.createCursorKeys();
		
		// add sheeps
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
			sheep.body.collides(bulletsCG, function() {effects.meh();}, this);},this
		);
		
		// add worms
		wormGrp = game.add.group();
		map.createFromObjects('objects', 114, 'worm', 1, true, false, wormGrp);
		wormGrp.forEach(function(worm) {
			var wormAnimFPS = 10;
			worm.animations.add('worm_down', [4, 5], wormAnimFPS, true);
			worm.animations.add('worm_up', [6, 7], wormAnimFPS, true);
			worm.animations.add('worm_right', [0, 1], wormAnimFPS, true);
			worm.animations.add('worm_left', [2, 3], wormAnimFPS, true);
			worm.animations.add('worm_panic', [0], wormAnimFPS, true);
			// enable physics for sheep
			game.physics.p2.enable(worm);
			worm.body.fixedRotation = true;
			worm.body.setCollisionGroup(npcCG);
			worm.body.collides(playerCG, npcBumpedPlayer, this);
			worm.body.collides(tileCG, npcBumpedWall, this);
			worm.body.collides(bulletsCG, function() {effects.meh();}, this);},this
		);
		
		// add goats
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
			goat.body.collides(bulletsCG, function() {var sound = game.add.audio('meh'); sound.play();}, this);}, this
		);
		
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
		player.body.setRectangle(42, 36, 0, 18);
		player.body.fixedRotation = true;
		player.body.setCollisionGroup(playerCG);
		player.body.collides(tileCG);
		player.body.collides(npcCG);
	};
	
	this.update = function() {
		var tmpX = player.x / 36;
		var tmpY = player.y / 36;
		var playerRitualDist = Math.sqrt((ritualCircle.posX - tmpX)*(ritualCircle.posX - tmpX) + (ritualCircle.posY - tmpY)*(ritualCircle.posY - tmpY));
		
		if (playerRitualDist < 2) {
			effects.particleEffectBloodExplosion(player.x , player.y, 10, 300);
		}
		
		var speed = 300;
		if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
			player.body.velocity.x = -speed;
			if (carriedObject != null) {
				player.animations.play('player_carrying_left');
			} else {
				player.animations.play('player_left');
			}
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) {
			player.body.velocity.x = speed;
			if (carriedObject != null) {
				player.animations.play('player_carrying_right');
			} else {
				player.animations.play('player_right');
			}
		} else {
			player.body.velocity.x = 0;
		}
		if (game.input.keyboard.isDown(Phaser.Keyboard.W)) {
			player.body.velocity.y = -speed;
			if (carriedObject != null) {
				player.animations.play('player_carrying_up');
			} else {
				player.animations.play('player_up');
			}
		} else if (game.input.keyboard.isDown(Phaser.Keyboard.S)) {
			player.body.velocity.y = speed;
			if (carriedObject != null) {
				player.animations.play('player_carrying_down');
			} else {
				player.animations.play('player_down');
			}
		} else {
			player.body.velocity.y = 0;
		}
		
		if (player.body.velocity.x == 0 && player.body.velocity.y == 0) {
			if (carriedObject != null) {
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
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.R)) {
			ritualSound.play();
			effects.particleEffectBloodExplosion(player.body.x, player.body.y, 30, 2000);
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
			playerstate = 'angeredNPC';
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.E)) {
			effects.fire(player.x, player.y);
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.B)) {
			effects.doSomeEffects();
		}
		
		if (carriedObject != null && game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
			carriedObject = null;
		}
		sheepGrp.forEach(function(sheep) { resolveAImovement(sheep, 'sheep') }, this);
		goatGrp.forEach(function(goat) { resolveAImovement(goat, 'goat') }, this);
		wormGrp.forEach(function(worm) { resolveAImovement(worm, 'worm') }, this);
	};
	
	
	
	function resolveAImovement(npc, type) {	
		if (carriedObject === npc.body) {
			if (type == 'sheep') {
				npc.animations.play('sheep_panic');
			}
			if (type == 'goat') {
				npc.animations.play('goat_panic');
			}
			if (type == 'worm') {
				npc.animations.play('worm_panic');
			}
			npc.body.x = player.body.x + 0.01;
			npc.body.y = player.body.y - 15;
			return;
		}
		
		// random walk
		if (playerstate == 'passive') {
			//npc.body.force.x = ((game.rnd.integer() % 20) - 10) * 10;
			//npc.body.force.y = ((game.rnd.integer() % 20) - 10) * 10;
			var newVelo = new Phaser.Point(((game.rnd.integer() % 300) - 150), ((game.rnd.integer() % 300) - 150));
			npc.body.force.x = newVelo.x;
			npc.body.force.y = newVelo.y;
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
		
		// worm animation
		if (type == 'worm') {
			if (Math.abs(npc.body.velocity.y) > Math.abs(npc.body.velocity.x)) {
				if (npc.body.velocity.y > 0) {
					npc.animations.play('worm_down');
				} else if (npc.body.velocity.y < 0) {
					npc.animations.play('worm_up');
				} else {
					npc.animations.play('worm_idle');
				}
			}
			
			if (Math.abs(npc.body.velocity.y) < Math.abs(npc.body.velocity.x)) {
				if (npc.body.velocity.x > 0) {
					npc.animations.play('worm_left');
				} else if (npc.body.velocity.x < 0) {
					npc.animations.play('worm_right');
				} else {
					npc.animations.play('worm_idle');
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
		if (carriedObject == null && game.input.keyboard.isDown(Phaser.Keyboard.X)) {
			carriedObject = npcBody;
		}
	}
};
