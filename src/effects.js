var Effects = function() {
	// constants
	var FIRE_RATE = 300;
	
	// variables
	var nextFire = 0;
	
	// sounds
	var shootSnd;
	var mehSnd;
	
	this.preload = function() {
		game.load.spritesheet('particles', 'assets/spritesheets/particles.png', 18, 18);
		game.load.audio('shoot', 'assets/audio/shoot.ogg');
		game.load.audio('meh', 'assets/audio/meh.ogg');
	}
	
	this.create = function() {
		shootSnd = game.add.audio('shoot');
		mehSnd = game.add.audio('meh');
	}
	
	this.meh = function() {
		mehSnd.play();
	}
	
	this.fire = function() {
		if (game.time.now > nextFire && bullets.countDead() > 0) {
			nextFire = game.time.now + FIRE_RATE;
			var bullet = bullets.getFirstDead();
			bullet.reset(player.body.x, player.body.y);
			bullet.lifespan = 2000;
			//bullet.animations.play('bullet_anim');
			shootSnd.play();
			game.physics.arcade.moveToPointer(bullet, 300);
		}
	}
	
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
	}
};
