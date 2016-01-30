var Effects = function() {
	// constants
	var FIRE_RATE = 300;
	
	// variables
	var nextFire = 0;
	var bulletSprite;
	var bullets;
	var emitter;
	
	// sounds
	var shootSnd;
	var mehSnd;
	
	this.preload = function() {
		game.load.spritesheet('particles', 'assets/spritesheets/particles.png', 18, 18);
		game.load.audio('shoot', 'assets/audio/shoot.ogg');
		game.load.audio('meh', 'assets/audio/meh.ogg');
	};
	
	this.create = function() {
		shootSnd = game.add.audio('shoot');
		mehSnd = game.add.audio('meh');
		
		// initialise bullets
		bullets = game.add.group();
		bullets.enableBody = true;
		bullets.physicsBodyType = Phaser.Physics.P2JS;
		bullets.createMultiple(10, 'particles', maxBullets);
		var maxBullets = 10;
		for (var i = 0; i < bullets.children.length; i++) {
			var tmpBullet = bullets.children[i];
			game.physics.p2.enable(tmpBullet);
			tmpBullet.animations.add('bullet_anim', [10, 11, 12, 13], 20, true);
			tmpBullet.animations.play('bullet_anim')
			tmpBullet.body.setCollisionGroup(bulletsCG);
			tmpBullet.body.collides(tileCG);
			tmpBullet.body.collides(npcCG);
		}
		bullets.setAll('checkWorldBounds', true);
		bullets.setAll('outOfBoundsKill', true);
	};
	
	this.meh = function() {
		mehSnd.play();
	};
	
	this.fire = function(x, y) {
		if (game.time.now > nextFire && bullets.countDead() > 0) {
			nextFire = game.time.now + FIRE_RATE;
			var bullet = bullets.getFirstDead();
			bullet.reset(x, y);
			bullet.lifespan = 2000;
			shootSnd.play();
			game.physics.arcade.moveToPointer(bullet, 300);		// TODO fix this (wrong physics engine)
		}
	};
	
	this.particleEffectBloodExplosion = function(x , y, numParticles, lifeTime) {
		if (emitter == null){
			emitter = game.add.emitter(x, y, numParticles);
			emitter.makeParticles('particles', [0, 1, 2, 3, 4, 5, 6, 7, 8], numParticles, true, true);
			//emitter.minParticleSpeed.setTo(-400, -400);
			//emitter.maxParticleSpeed.setTo(400, 400);
			emitter.gravity = 0;
			emitter.maxParticles = numParticles;
			
			emitter.start(true, lifeTime, null, numParticles);
			game.time.events.add(lifeTime, function(){emitter.destroy(); emitter = null;}, this);
		}
	};
	
	this.update = function() {
		if (emitter != null) {
			emitter.forEachAlive(function(p) {
				p.alpha = p.lifespan / emitter.lifespan;
			});
		}
	}
};
