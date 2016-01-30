window.onload = function() {
	var game = new Phaser.Game(1152, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update});
	
	// game ressources
	var map, layer, layer1;		// tilemap related
	var player, sheep;			// sprites
	var npcCG, tileCG, playerCG;					// collision groups
	var emitter;
	var overlay;
	var state;
	var nSpells;
	var fireSpell;
	var selector;
	var spellPos;
	var menuState;
	var fsm; 
	var ringSpeed, selectIdx;
	var graphics
	
	
	/**
	 * which way to turn to get from angle a to b the fastest (math. rotation)
	 */
	function turnDir(a,b)
	{
		var g = b-a;
		var f = a+2*Math.PI-b;
		if (f > 2*Math.PI) f -= 2*Math.PI;
		if (g > 2*Math.PI) g -= 2*Math.PI;
		if (g < f) return g;
		return -f;
	}
	
	function turnDist(a,b, direction)
	{
		var g = b-(a+.001*direction);
		var f = (a+.001*direction)+2*Math.PI-b;
		if (direction < 0) return g;
		return -f;
	}
	
	/**
	 * preload - load assets
	 */
	function preload () {
		game.load.tilemap('map', 'assets/tilemaps/test.json', null, Phaser.Tilemap.TILED_JSON);
		game.load.image('tileset', 'assets/tilesets/basictiles.png');
		game.load.atlas('spells', 'assets/spritesheets/spells.png','assets/spritesheets/spells.json');
		game.load.spritesheet('player', 'assets/spritesheets/hero.png', 36, 72);
		game.load.spritesheet('particles', 'assets/spritesheets/particles.png', 18, 18);
	    game.load.spritesheet('wizard', 'assets/spritesheets/wizard.png', 36, 72, 12);
	    game.load.spritesheet('sheep', 'assets/spritesheets/sheep.png', 36, 36, 12);
	    
		game.load.script('filterX', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/BlurX.js');
		game.load.script('filterY', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/BlurY.js');
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
		player = game.add.sprite(200, 200, 'wizard', 1);
		var playerAnimFPS = 10;
		player.animations.add('player_idle', [0], playerAnimFPS, true);
		player.animations.add('player_down', [0, 1,0, 2], playerAnimFPS, true);
		player.animations.add('player_up', [3, 4, 3, 5], playerAnimFPS, true);
		player.animations.add('player_right', [6, 7, 6, 8], playerAnimFPS, true);
		player.animations.add('player_left', [9, 10, 9, 11], playerAnimFPS, true);

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
		sheep.body.collides(playerCG);
		sheep.body.collides(tileCG);
		
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
	    
	    // set state of player for "regular" game play
	    state = 0;
	    nSpells = 1;
	    spellPos = 0;
	    selectIdx = 0;
	    ringSpeed =0;
	    
		
		
		//  Create a Rectangle
		selector = new Phaser.Rectangle(player.body.x-18, player.body.y-18+200, 36, 36);

    /*var fragmentSrc = [
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
            "gl_FragColor.a = 0.5;",
            "}"
        ];

    filter = new Phaser.Filter(game, null, fragmentSrc);
    filter.setResolution(1152, 720);
    filter.uniforms.player = { type: '2f', value: { x: player.body.x, y: player.body.x } };*/

    /*sprite = game.add.sprite();
    sprite.width = 800;
    sprite.height = 600;*/

//  game.world.filters = [ filter ];
		fsm = StateMachine.create({
			initial: 'move',
			events: [
				{ name: 'activateSpellMenu',  from: 'move',  to: 'spellMenu' },
				{ name: 'activateMoveMode', from: 'spellMenu', to: 'move'    }
			]
			
			});
		
		fsm.onbeforeactivateSpellMenu = function(event, from, to) {
				fireSpell = game.add.sprite(player.body.x,player.body.y,'spells')
				fireSpell.frameName = 'fire_spell';
				fireSpell.pivot.y=-200;
				fireSpell.anchor.setTo(.5,.5);
				
				fireSpell.x = player.body.x;
				fireSpell.y = player.body.y;
				
				selector.x = player.body.x-18;
				selector.y = player.body.y-18+200;
				
				//  And display our circle on the top
				graphics = game.add.graphics(0, 0);
				graphics.lineStyle(2, 0xeeeeee, .7);
				graphics.drawRect(selector.x, selector.y, selector.width, selector.height);
				
				overlay.alpha = .7;
			};
		fsm.onbeforeactivateMoveMode = function(event, from, to) {
				fireSpell.destroy();
				overlay.alpha = 0.;
				graphics.destroy();
				
			};
		//fsm.start();
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
		if (state ==0){
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
			
			if (game.input.keyboard.isDown(Phaser.Keyboard.B))
			{
				overlay.alpha = 1.0;
			}
		}
		if (state == 1)
		{
			if (cursors.left.isDown) {
				selectIdx -= 1;
				if (selectIdx <0) selectIdx = nSpells-1;
				ringSpeed = +1;
			}
			if (cursors.right.isDown) {
				selectIdx += 1;
				if (selectIdx >= nSpells-1) selectIdx = 0;
				ringSpeed = -1;
			}
			var angRange = 2*Math.PI / nSpells;
			// rotation=0 is idx 0
			
			var rot_tmp = turnDist(fireSpell.rotation, angRange*selectIdx, ringSpeed);
			console.log(rot_tmp);
			var rot_dir = Math.sign(rot_tmp);
			var rot_tmp2 = Math.max(Math.sqrt(Math.abs(rot_tmp)),.08) * rot_dir/10.;
			if (Math.abs(rot_tmp) < .01) 
			{
				fireSpell.rotation = angRange*selectIdx;
				ringSpeed = 0;
			}
			
			if (ringSpeed != 0)	fireSpell.rotation += rot_tmp2;
		}
		//fireSpell.rotation -= .02;
		
		
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.M))
	    {
			if (fsm.is('move'))
			{
				fsm.activateSpellMenu();
			}
			else
			{
				fsm.activateMoveMode();
			}
	    }
		
		if (emitter != null) {
			emitter.forEachAlive(function(p) {
				p.alpha = p.lifespan / emitter.lifespan;
			});
		}
		//filter.uniforms.player.value = player.body;
		//filter.update();
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
