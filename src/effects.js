var Effects = function() {
	// constants
	var FIRE_RATE = 300;
	
	// variables
	var nextFire = 0;
	var bulletSprite;
	var bullets;
	var emitter, emitterBloodExplosion;
	var lightningTimeMax = 100;
	var lightningTime = lightningTimeMax;
	var overlay;
	var filter, lightFilter;
	var switchTimer3; 
	var emitterRain;
	
	var lightShader = [
			"precision mediump float;",
			// Incoming texture coordinates. 
			'varying vec2 vTextureCoord;',
			// Incoming vertex color
			'varying vec4 vColor;',
			// Sampler for a) sprite image or b) rendertarget in case of game.world.filter
			'uniform sampler2D uSampler;',

			"uniform vec2      resolution;",
			"uniform float     time;",
			"uniform vec2      mouse;",
			"uniform vec2      player;",

			"void main( void ) {",
			// colorRGBA = (y % 2) * texel(u,v);
			//"a_tmp = texture2D(uSampler, vTextureCoord).a;";
			"gl_FragColor = (1.- min(1.,sqrt((gl_FragCoord.y-(resolution.y-player.y))* (gl_FragCoord.y-(resolution.y-player.y))+ (gl_FragCoord.x-player.x)* (gl_FragCoord.x-player.x))/150.)) * texture2D(uSampler, vTextureCoord);",
			//"gl_FragColor = (1.- min(1.,sqrt((gl_FragCoord.y-(resolution.y-player.y))* (gl_FragCoord.y-(resolution.y-player.y))+ (gl_FragCoord.x-player.x)* (gl_FragCoord.x-player.x))/150.)) * vColor;",
			"gl_FragColor.a = 0.5;",
			"}"
		];
	
	var fragmentSrc = [
			"precision mediump float;",
			// Incoming texture coordinates. 
			'varying vec2 vTextureCoord;',
			// Incoming vertex color
			'varying vec4 vColor;',
			// Sampler for a) sprite image or b) rendertarget in case of game.world.filter
			'uniform sampler2D uSampler;',

			"uniform vec2      resolution;",
			"uniform float     time;",
			"uniform vec2      mouse;",
			//"uniform vec2      player;",

			"void main( void ) {",
			// colorRGBA = (y % 2) * texel(u,v);
			//"a_tmp = texture2D(uSampler, vTextureCoord).a;";
			"vec4 colTmp = texture2D(uSampler, vTextureCoord);",
			//"vec4 colTmp = vColor;",
			"const vec3 refCol = vec3(146./255., 39./255., 143./255.);",
			"float colDiff = length(colTmp.rgb - refCol);",
			"if (colDiff < .02) colTmp.a = abs(sin((gl_FragCoord.y/10.+time)));",
			//"gl_FragColor = (1.- min(1.,sqrt((gl_FragCoord.y-(resolution.y-player.y))* (gl_FragCoord.y-(resolution.y-player.y))+ (gl_FragCoord.x-player.x)* (gl_FragCoord.x-player.x))/150.)) * texture2D(uSampler, vTextureCoord);",
			"gl_FragColor = colTmp;",
			"}"
		];
	var lightActive = false;
	var glowActive = false;
	
	// sounds
	var shootSnd;
	
	this.preload = function() {
		game.load.spritesheet('particles', 'assets/spritesheets/particles.png', 18, 18);
		game.load.audio('shoot', 'assets/audio/shoot.ogg');
	};
	
	this.toggleGlow = function() {
		if (  game.time.now- switchTimer3>200)
		{
			if (glowActive)
			{
				glowActive = !glowActive;
				
				var delIdx = -1;
				if (game.world.filters != null) {
					for (var i = 0; i < game.world.filters.length; i++)
					{
						if (game.world.filters[i] == filter) delIdx = i;
					}
					if (delIdx > -1) game.world.filters.splice(delIdx,1);
					if (game.world.filters.length == 0) game.world.filters = null;
					filter.destroy();
				}
			}else{
				glowActive = !glowActive;
				filter = new Phaser.Filter(game, null, fragmentSrc);
				filter.setResolution(1152, 720);
				//filter.uniforms.player = { type: '2f', value: { x: objects.getPlayer().body.x, y: objects.getPlayer().body.y } };
				
				if (!game.world.filters || game.world.filters.length == 0) 
					game.world.filters = [ filter ];
				else
					game.world.filters.push(filter);
				
				//game.world.filters = [ filter ];
			}
			switchTimer3 = game.time.now;
		}
	}
	
	
	this.toggleLight = function () {
		if (lightActive)
		{
			lightActive = !lightActive;
			var delIdx = -1;
			for (var i = 0; i < overlay.filters.length; i++)
			{
				if (overlay.filters[i] == lightFilter) delIdx = i;
			}
			if (delIdx > -1) overlay.filters.splice(delIdx,1);
			if (overlay.filters.length == 0) overlay.filters = null;
			lightFilter.destroy();
		} else {
			lightActive = !lightActive;
			effects.setOverlayColor(0x000000);
			effects.setOverlay(1);
			lightFilter = new Phaser.Filter(game, null, lightShader);
			lightFilter.setResolution(1152, 720);
			lightFilter.uniforms.player = { type: '2f', value: { x: objects.getPlayer().body.x, y: objects.getPlayer().body.y } };
			
			if (!overlay.filters || overlay.filters.length == 0) 
				overlay.filters = [ lightFilter ];
			else
				overlay.filters.push(lightFilter);
		}
	}
	
	
	this.create = function() {
		switchTimer3 = game.time.now;
		shootSnd = game.add.audio('shoot');
		
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
		
		// initialise rain
		emitterRain = game.add.emitter(game.world.centerX, 0, 400);
		//emitter.angle = 5; // uncomment to set an angle for the rain.
		emitterRain.width = game.world.width;
		emitterRain.makeParticles('particles', [20, 21]);
		emitterRain.minParticleScale = 0.3;
		emitterRain.maxParticleScale = 0.9;
		emitterRain.setYSpeed(300, 500);
		emitterRain.setXSpeed(-5, 5);
		emitterRain.minRotation = 0;
		emitterRain.maxRotation = 0;
		//emitterRain.start(false, 1600, 5, 0);
		
		// initialise overlay
		// create a new bitmap data object
		var bmd = game.add.bitmapData(game.width, game.height);
		
		// draw to the canvas context like normal
		bmd.ctx.beginPath();
		bmd.ctx.rect(0, 0, game.width, game.height);
		bmd.ctx.fillStyle = '#FFFFFF';
		bmd.ctx.fill();
		
		// use the bitmap data as the texture for the sprite
		overlay = game.add.sprite(0, 0, bmd);
		overlay.alpha = 0.0;
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
		if (emitterBloodExplosion == null){
			emitterBloodExplosion = game.add.emitter(x, y, numParticles);
			emitterBloodExplosion.makeParticles('particles', [0, 1, 2, 3, 4, 5, 6, 7, 8], numParticles, true, true);
			//emitter.minParticleSpeed.setTo(-400, -400);
			//emitter.maxParticleSpeed.setTo(400, 400);
			emitterBloodExplosion.gravity = 0;
			emitterBloodExplosion.maxParticles = numParticles;
			
			emitterBloodExplosion.start(true, lifeTime, null, numParticles);
			game.time.events.add(lifeTime, function(){emitterBloodExplosion.destroy(); emitterBloodExplosion = null;}, this);
		}
	};
	
	this.particleEffectBleeding = function(x , y, numParticles, pLifetime) {
//		if (emitter == null){
			emitter = game.add.emitter(x, y, numParticles);
			emitter.makeParticles('particles', [0, 1, 2, 3, 4, 5, 6, 7, 8], numParticles, true, true);
			emitter.minParticleSpeed.setTo(-100, -100);
			emitter.maxParticleSpeed.setTo(100, -10);
			emitter.gravity = 50;
			emitter.maxParticles = numParticles;
			
			emitter.start(false, pLifetime, 100);
			return emitter;
//			game.time.events.add(lifeTime, function(){emitter.destroy(); emitter = null;}, this);
//		}
	};
	
	this.update = function(dt) {
		overlay.alpha -= dt * 0.0005;
		lightningTime += dt;
		if (lightningTime < lightningTimeMax / 3.0 || lightningTime > lightningTimeMax * 2.0 / 3.0){
			overlay.tint = 0xFFFFFF;
		} else{
			overlay.tint = 0x000000;
		}
		
		if (emitterBloodExplosion != null) {
			emitterBloodExplosion.forEachAlive(function(p) {
				p.alpha = p.lifespan / emitterBloodExplosion.lifespan;
			});
		}
		
		if (emitter != null) {
			emitter.forEachAlive(function(p) {
				p.alpha = p.lifespan / emitter.lifespan;
			});
		}
		if (lightActive)
		{

			//console.log(typeof(filter.uniforms.player.value));

			/*filter.uniforms.player.value.x = objects.getPlayer().body.x;
			filter.uniforms.player.value.y = objects.getPlayer().body.y;*/
			lightFilter.uniforms.player.value = objects.getPlayer().body;
			lightFilter.update();
		}
		if (glowActive)
		{
			filter.update();
		}
	};
	
	this.doLightning = function() {
		lightningTime = 0;
	}
	
	this.doSomeEffects = function() {
		overlay.alpha = 1.0;
		lightningTime = 0;
	};
	
	this.doStartRain = function() {
		emitterRain.start(false, 1600, 5, 0);
	}
	
	this.setOverlay = function(val) {
		overlay.alpha = val;
	};
	this.setOverlayColor = function(val) {
		overlay.tint = val;
	};
};
