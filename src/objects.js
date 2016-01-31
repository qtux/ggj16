Objects = function() {
	
	var playerGrp, sheepGrp, goatGrp, wormGrp, staticGrp, deadheadGrp;	// sprite groupes

	var playerstate;
	var carriedObject = null;
//	this.carriedObject = carriedObject;
	
	var ritualSounds = [
			'ritual_tier_brennt',
			'ritual_kanelbullar',
			'ritual_mörkret',
			'ritual_öppna_fönstret',
			'ritual_ostfralla',
			'ritual_fika'
			];
	
	var ritualSound;
	var mehSnd;
	var wormSnd;
	var skullSnd;

	this.getCarriedObject = function (){
		return carriedObject;
	};
	
	this.preload = function() {

		game.load.spritesheet('wizard', 'assets/spritesheets/wizard.png', 42, 72, 24);
		game.load.spritesheet('sheep', 'assets/spritesheets/sheep.png', 36, 36, 15);
		game.load.spritesheet('goat', 'assets/spritesheets/goat.png', 36, 36, 15);
		game.load.spritesheet('worm', 'assets/spritesheets/worm.png', 36, 36, 8);
		game.load.spritesheet('deadhead', 'assets/spritesheets/enemy.png', 36, 36, 4);
		// statics
		game.load.spritesheet('key', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		game.load.spritesheet('pearl', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		game.load.spritesheet('torch', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		game.load.spritesheet('bucket', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		game.load.spritesheet('book', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		game.load.spritesheet('abyss', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		game.load.spritesheet('spikes', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		game.load.spritesheet('runestone', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		game.load.spritesheet('questionmark', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		game.load.spritesheet('exclamationmark', 'assets/tilesets/objecttiles.png', 36, 36, 20);
		
		// rituals
		game.load.audio('ritual_tier_brennt', 'assets/audio/ritual_tier_brennt.ogg');
		game.load.audio('ritual_kanelbullar', 'assets/audio/kanelbullar.ogg');
		game.load.audio('ritual_mörkret', 'assets/audio/moerkret.ogg');
		game.load.audio('ritual_öppna_fönstret', 'assets/audio/oeppna_foenstret.ogg');
		game.load.audio('ritual_ostfralla', 'assets/audio/ostfralla.ogg');
		game.load.audio('ritual_fika', 'assets/audio/fika.ogg');
		
		// animals
		game.load.audio('meh', 'assets/audio/meh.ogg');
		game.load.audio('worm', 'assets/audio/worm.ogg');
		game.load.audio('skull', 'assets/audio/skull.ogg');
	};
	
	this.create = function() {
		// sounds
		mehSnd = game.add.audio('meh');
		wormSnd = game.add.audio('worm');
		skullSnd = game.add.audio('skull');
		
		playerstate = 'passive';
		
		// enable user input
		cursors = game.input.keyboard.createCursorKeys();
		
		// add sheeps
		sheepGrp = game.add.group();
		map.createFromObjects('objects', 103, 'sheep', 1, true, false, sheepGrp);
		sheepGrp.forEach(function(sheep) {
			var sheepAnimFPS = 10;
			sheep.animations.add('sheep_idle', [ 0 ], sheepAnimFPS, true);
			sheep.animations.add('sheep_down', [ 9, 10, 11 ], sheepAnimFPS, true);
			sheep.animations.add('sheep_up', [ 6, 7, 8 ], sheepAnimFPS, true);
			sheep.animations.add('sheep_right', [ 0, 1, 2 ], sheepAnimFPS, true);
			sheep.animations.add('sheep_left', [ 3, 4, 5 ], sheepAnimFPS, true);
			sheep.animations.add('sheep_panic', [ 12, 13, 14 ], sheepAnimFPS, true);
			// enable physics for sheep
			game.physics.p2.enable(sheep);
			sheep.body.fixedRotation = true;
			sheep.body.setCollisionGroup(npcCG);
			sheep.body.collides(playerCG, npcBumpedPlayer, this);
			sheep.body.collides(tileCG, npcBumpedWall, this);
			sheep.body.collides(bulletsCG, function() {
				mehSnd.play();
			}, this);
		}, this);

		// add worms
		wormGrp = game.add.group();
		map.createFromObjects('objects', 114, 'worm', 1, true, false, wormGrp);
		wormGrp.forEach(function(worm) {
			var wormAnimFPS = 10;
			worm.animations.add('worm_down', [ 4, 5 ], wormAnimFPS, true);
			worm.animations.add('worm_up', [ 6, 7 ], wormAnimFPS, true);
			worm.animations.add('worm_right', [ 0, 1 ], wormAnimFPS, true);
			worm.animations.add('worm_left', [ 2, 3 ], wormAnimFPS, true);
			worm.animations.add('worm_panic', [ 0 ], wormAnimFPS, true);
			// enable physics for sheep
			game.physics.p2.enable(worm);
			worm.body.fixedRotation = true;
			worm.body.setCollisionGroup(npcCG);
			worm.body.collides(playerCG, npcBumpedPlayer, this);
			worm.body.collides(tileCG, npcBumpedWall, this);
			worm.body.collides(bulletsCG, function() {
				wormSnd.play();
			}, this);
		}, this);

		// add goats
		goatGrp = game.add.group();
		map.createFromObjects('objects', 107, 'goat', 1, true, false, goatGrp);
		goatGrp.forEach(function(goat) {
			var goatAnimFPS = 10;
			goat.animations.add('goat_idle', [ 0 ], goatAnimFPS, true);
			goat.animations.add('goat_down', [ 9, 10, 11 ], goatAnimFPS, true);
			goat.animations.add('goat_up', [ 6, 7, 8 ], goatAnimFPS, true);
			goat.animations.add('goat_right', [ 0, 1, 2 ], goatAnimFPS, true);
			goat.animations.add('goat_left', [ 3, 4, 5 ], goatAnimFPS, true);
			goat.animations
					.add('goat_panic', [ 12, 13, 14 ], goatAnimFPS, true);
			// enable physics for goat
			game.physics.p2.enable(goat);
			goat.body.fixedRotation = true;
			goat.body.setCollisionGroup(npcCG);
			goat.body.collides(playerCG, npcBumpedPlayer, this);
			goat.body.collides(tileCG, npcBumpedWall, this);
			goat.body.collides(bulletsCG, function() {
				mehSnd.play();
			}, this);
		}, this);
		
		// add deadhead
		deadheadGrp = game.add.group();
		map.createFromObjects('objects', 115, 'deadhead', 0, true, false, deadheadGrp);
		deadheadGrp.forEach(function(deadhead) {
			var deadheadAnimFPS = 10;
			deadhead.animations.add('deadhead_idle', [ 0 ], deadheadAnimFPS, true);
			deadhead.animations.add('deadhead_down', [ 0 ], deadheadAnimFPS, true);
			deadhead.animations.add('deadhead_up', [ 3 ], deadheadAnimFPS, true);
			deadhead.animations.add('deadhead_right', [ 1 ], deadheadAnimFPS, true);
			deadhead.animations.add('deadhead_left', [ 2 ], deadheadAnimFPS, true);
			// enable physics for deadhead
			game.physics.p2.enable(deadhead);
			deadhead.body.fixedRotation = true;
			deadhead.body.setCollisionGroup(npcCG);
			deadhead.body.collides(playerCG, npcBumpedPlayer, this);
			deadhead.body.collides(tileCG, npcBumpedWall, this);
			deadhead.body.collides(bulletsCG, function() {
				skullSnd.play();
			}, this);
		}, this);

		// static item group
		staticGrp = game.add.group();
		map.createFromObjects('objects', 101, 'key', 0, true, false, staticGrp);
		map.createFromObjects('objects', 104, 'pearl', 3, true, false, staticGrp);
		map.createFromObjects('objects', 105, 'torch', 4, true, false, staticGrp);
		map.createFromObjects('objects', 106, 'bucket', 5, true, false, staticGrp);
		map.createFromObjects('objects', 108, 'book', 7, true, false, staticGrp);
		map.createFromObjects('objects', 109, 'abyss', 8, true, false, staticGrp);
		map.createFromObjects('objects', 110, 'spikes', 9, true, false, staticGrp);
		map.createFromObjects('objects', 111, 'runestone', 10, true, false, staticGrp);
		map.createFromObjects('objects', 112, 'questionmark', 11, true, false, staticGrp);
		map.createFromObjects('objects', 113, 'exclamationmark', 12, true, false, staticGrp);

		// player group
		playerGrp = game.add.group();
		map.createFromObjects('objects', 102, 'wizard', 1, true, false,
				playerGrp);
		player = playerGrp.getTop();
		var playerAnimFPS = 10;
		player.animations.add('player_idle', [ 0 ], playerAnimFPS, true);
		player.animations.add('player_down', [ 0, 1, 0, 2 ], playerAnimFPS,
				true);
		player.animations.add('player_up', [ 3, 4, 3, 5 ], playerAnimFPS, true);
		player.animations.add('player_right', [ 6, 7, 6, 8 ], playerAnimFPS,
				true);
		player.animations.add('player_left', [ 9, 10, 9, 11 ], playerAnimFPS,
				true);
		player.animations.add('player_carrying_idle', [ 12 ], playerAnimFPS,
				true);
		player.animations.add('player_carrying_down', [ 12, 13, 12, 14 ],
				playerAnimFPS, true);
		player.animations.add('player_carrying_up', [ 15, 16, 15, 17 ],
				playerAnimFPS, true);
		player.animations.add('player_carrying_right', [ 18, 19, 18, 20 ],
				playerAnimFPS, true);
		player.animations.add('player_carrying_left', [ 21, 22, 21, 23 ],
				playerAnimFPS, true);
		// player.body.debug = true;

		// enable physics for player
		game.physics.p2.enable(player);
		player.body.setRectangle(42, 36, 0, 18);
		player.body.fixedRotation = true;
		player.body.setCollisionGroup(playerCG);
		player.body.collides(tileCG);
		player.body.collides(npcCG);
	};

	this.update = function() {

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
			if (levelNum + 1 < levelNames.length) {
				levelNum += 1;
			}
			game.state.restart();
		}

		if (game.input.keyboard.isDown(Phaser.Keyboard.P)) {
			if (levelNum > 0) {
				levelNum -= 1;
			}
			game.state.restart();
		}

		if (game.input.keyboard.isDown(Phaser.Keyboard.R)) {
			var tmpInd = Math.floor(Math.random()*ritualSounds.length);
			console.log(tmpInd);
			ritualSound = game.add.audio(ritualSounds[tmpInd]);
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

		if (carriedObject != null
				&& game.input.keyboard.isDown(Phaser.Keyboard.Y)) {
			carriedObject = null;
		}
		
		sheepGrp.forEach(function(sheep) { resolveAImovement(sheep, 'sheep') }, this);
		goatGrp.forEach(function(goat) { resolveAImovement(goat, 'goat') }, this);
		wormGrp.forEach(function(worm) { resolveAImovement(worm, 'worm') }, this);
		deadheadGrp.forEach(function(deadhead) { resolveAImovement(deadhead, 'deadhead') }, this);
		staticGrp.forEach(function(static) { resolveStatics(static) }, this);
	};
	
	this.stopPlayer = function() {
		player.body.velocity.x = 0.;
		player.body.velocity.y = 0.;
	};
	
	this.getPlayerX = function() {
		return player.body.x;
		console.log(typeof(player.body));
	};
	
	this.getPlayerY = function() {
		return player.body.y;
	};
	
	this.getPlayer = function() {
		return player;
	};
	
	function resolveStatics(static) {
		if (carriedObject === static) {
			static.x = player.body.x - 17;
			static.y = player.body.y - 40;
			return;
		}
		if (Phaser.Rectangle.intersects(player, static) && game.input.keyboard.isDown(Phaser.Keyboard.X)) {
			carriedObject = static;
		}
	}
	
	function resolveAImovement(npc, type) {
		if (carriedObject === npc.body) {
			if (type == 'deadhead') {
				// TODO get damage
				return;
			}
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
		if (playerstate == 'passive' && type != 'deadhead') {
			// npc.body.force.x = ((game.rnd.integer() % 20) - 10) * 10;
			// npc.body.force.y = ((game.rnd.integer() % 20) - 10) * 10;
			var newVelo = new Phaser.Point(((game.rnd.integer() % 300) - 150),
					((game.rnd.integer() % 300) - 150));
			npc.body.force.x = newVelo.x;
			npc.body.force.y = newVelo.y;
		}
		// seek
		if (playerstate == 'angeredNPC' || type == 'deadhead') {
			var maxSpeed = 100;
			var target = new Phaser.Point(player.body.x, player.body.y);
			var seeker = new Phaser.Point(npc.body.x, npc.body.y);
			var distNPCPlayer = Phaser.Point.normalize(Phaser.Point.subtract(
					target, Phaser.Point.add(seeker, new Phaser.Point(
							npc.body.velocity.x, npc.body.velocity.y))));
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
					npc.animations.play('sheep_right');
				} else if (npc.body.velocity.x < 0) {
					npc.animations.play('sheep_left');
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
					npc.animations.play('worm_right');
				} else if (npc.body.velocity.x < 0) {
					npc.animations.play('worm_left');
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
					npc.animations.play('goat_right');
				} else if (npc.body.velocity.x < 0) {
					npc.animations.play('goat_left');
				} else {
					npc.animations.play('goat_idle');
				}
			}
		}
		
		// deadhead animation
		if (type == 'deadhead') {
			if (Math.abs(npc.body.velocity.y) > Math.abs(npc.body.velocity.x)) {
				if (npc.body.velocity.y > 0) {
					npc.animations.play('deadhead_down');
				} else if (npc.body.velocity.y < 0) {
					npc.animations.play('deadhead_up');
				} else {
					npc.animations.play('deadhead_idle');
				}
			}

			if (Math.abs(npc.body.velocity.y) < Math.abs(npc.body.velocity.x)) {
				if (npc.body.velocity.x > 0) {
					npc.animations.play('deadhead_right');
				} else if (npc.body.velocity.x < 0) {
					npc.animations.play('deadhead_left');
				} else {
					npc.animations.play('deadhead_idle');
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
		if (carriedObject == null
				&& game.input.keyboard.isDown(Phaser.Keyboard.X)) {
			carriedObject = npcBody;
		}
	}
};