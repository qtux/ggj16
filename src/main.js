// global variables
var game = new Phaser.Game(1152, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update});
var effects = new Effects();
var objects = new Objects();
var cursors;
var player;
var npcCG, tileCG, playerCG, bulletsCG, ritualResultCG;		// collision groups

// TODO local variables
var levelNames = ['level00', 'level01', 'level02'];
var levelNum = 0;
var map, layer, layer1;		// tilemap related
var circleTile;
var ritualCircle = {
	posX : 0,
	posY : 0
};

var nSpells;
var selector;
var spellPos;
var menuState;
var fsm; 
var ringSpeed, selectIdx;
var graphics;
var switchTimer;
var switchTimer2;
var rot_tmp;
var spellSprites;
var animState;
var ritualKillBleeding = {
	emitter : null,
	connectedSprite : null
};

/**
 * which way to turn to get from angle a to b the fastest (math. rotation)
 */
function turnDir(a,b)
{ 
	//http://stackoverflow.com/a/2007279
	return Math.atan2(Math.sin(a-b), Math.cos(b-a));
}

function turnDist(a,b, direction)
{
	if (b>a) return direction * (b-a);
	return direction * (2*Math.PI + b - a);
}


/**
 * preload - load assets
 */
function preload () {
	game.load.tilemap('map', 'assets/tilemaps/'+levelNames[levelNum]+'.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tileset', 'assets/tilesets/basictiles.png');
	game.load.atlas('spells', 'assets/spritesheets/spells.png','assets/spritesheets/spells.json');
	
	objects.preload();
	effects.preload();
}

/**
 * create - generate and initialise game content
 */
function create () {
	// start physics system
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true);
	
	// register collision groups
	npcCG = game.physics.p2.createCollisionGroup();
	tileCG = game.physics.p2.createCollisionGroup();
	playerCG = game.physics.p2.createCollisionGroup();
	bulletsCG = game.physics.p2.createCollisionGroup();
	ritualResultCG = game.physics.p2.createCollisionGroup();
	
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
	
	// create effects, top layer and objects
	objects.create();
	
	layer2 = map.createLayer('layer2');
	
	effects.create();
	
	// enable scaling
	game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
	game.input.onDown.add(gofull, this);
	
	// set tile collision group
	map.setCollision(100, true, 'collision');
	var tileObjects = game.physics.p2.convertTilemap(map, 'collision');
	for (var i = 0; i < tileObjects.length; i++) {
		tileObjects[i].setCollisionGroup(tileCG);
		tileObjects[i].collides(npcCG);
		tileObjects[i].collides(playerCG);
		tileObjects[i].collides(bulletsCG);
	}
	
	/*var polygon = game.physics.p2.convertCollisionObjects(map, 'objectsCollision', true);   
	for(var i in polygon) {
		polygon[i].setCollisionGroup(tileCG);
		polygon[i].collides(npcCG);
		polygon[i].collides(playerCG);
		polygon[i].collides(bulletsCG);
	}*/
	
	// TODO ritual thing
	for (var i=0;i < map.width; i++) {
		for (var j=0;j < map.height; j++) {
			//console.log(map.getTile(i, j, 'layer1', true).index);
			if (map.getTile(i, j, 'layer1', true).index == 7) {
				circleTile = map.getTile(i, j, 'layer1', true);
				ritualCircle.posX = i + 2;
				ritualCircle.posY = j + 2;
				//console.log(ritualCircle.posX + ", " + ritualCircle.posY);
			}
		}
	}
	
	// set state of player for "regular" game play
	state = 0;
	nSpells = 3;
	spellPos = 0;
	selectIdx = 0;
	ringSpeed = 0;
	switchTimer = game.time.now-5000;
	animState = false;

	spellSprites = [];

	// Create a Rectangle
	selector = new Phaser.Rectangle(player.body.x-18, player.body.y-18+200, 36, 36);
	
	fsm = StateMachine.create({
		initial: 'move',
		events: [
			{ name: 'activateSpellMenu',  from: 'move',  to: 'spellMenu' },
			{ name: 'activateMoveMode', from: 'spellMenu', to: 'move'    }
		]
		
		});
	
	fsm.onbeforeactivateSpellMenu = function(event, from, to) {
			/*
			objects.getPlayer().body.reset(objects.getPlayer().body.x,objects.getPlayer().body.y);
			objects.getCarriedSprite().body.reset(objects.getCarriedSprite().body.x,objects.getCarriedSprite().body.y);*/
			objects.getPlayer().body.enabled=false;
			if (objects.getCarriedSprite().body != null) {
				objects.getCarriedSprite().body.enabled=false;
			}

			

			//objects.getPlayer().body.immovable = true;
			objects.getPlayer().body.velocity.x = 0;
			objects.getPlayer().body.velocity.y = 0;
			if (objects.getCarriedSprite().body != null) {
				objects.getCarriedSprite().body.velocity.x = 0;
				objects.getCarriedSprite().body.velocity.y = 0;
			}
			
			//console.log(objects.getCarriedSprite());
			//objects.getCarriedSprite().immovable = true;
			/**/

			
			spellSprites.push(game.add.sprite(objects.getPlayer().body.x, objects.getPlayer().body.y,'spells'))
			spellSprites.push(game.add.sprite(objects.getPlayer().body.x, objects.getPlayer().body.y,'spells'))
			spellSprites.push(game.add.sprite(objects.getPlayer().body.x, objects.getPlayer().body.y,'spells'))
			spellSprites[0].frameName = 'fire_spell';
			spellSprites[1].frameName = 'poison_spell';
			spellSprites[2].frameName = 'arcane_spell';
			
			for (var i = 0 ; i < spellSprites.length ; i++)
			{
				spellSprites[i].pivot.y=-200;
				spellSprites[i].anchor.setTo(.5,.5);
			
				spellSprites[i].x = objects.getPlayer().body.x;
				spellSprites[i].y = objects.getPlayer().body.y;
			
				spellSprites[i].rotation = 2.*Math.PI / nSpells * i;
			}
			
			selector.x = objects.getPlayer().body.x-18;
			selector.y = objects.getPlayer().body.y-18+200;
			
			//  And display our rect on the top
			graphics = game.add.graphics(0, 0);
			graphics.lineStyle(2, 0xeeeeee, .7);
			graphics.drawRect(selector.x, selector.y, selector.width, selector.height);
			effects.setOverlayColor(0x000000);
			effects.setOverlay(.7);
			switchTimer2 = game.time.now;
		};
	fsm.onbeforeactivateMoveMode = function(event, from, to) {
			for (var i = spellSprites.length-1; i >=0; i--)
			{
				spellSprites[i].destroy();
				spellSprites.pop();
			}	
			objects.getPlayer().body.enabled=true;
			if (objects.getCarriedSprite().body != null) {
				objects.getCarriedSprite().body.enabled=true;
			}
			//objects.getCarriedSprite().immovable = false;
			//objects.getPlayer().body.immovable = false;
			effects.setOverlay(0.);
			graphics.destroy();
			
		};
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
	
	var tmpX = player.x / 36;
	var tmpY = player.y / 36;
	var playerRitualDist = Math.sqrt((ritualCircle.posX - tmpX)
			* (ritualCircle.posX - tmpX) + (ritualCircle.posY - tmpY)
			* (ritualCircle.posY - tmpY));

	var tmpObj = objects.getCarriedObject();
//	console.log(tmpObj);
	if (tmpObj)
	{
		if (tmpObj.emitter)
		{
//			console.log(tmpObj + ", " + tmpObj.emitter);
			tmpObj.emitter.x = tmpObj.x;
			tmpObj.emitter.y = tmpObj.y;
		}
	}
	
//	if (playerRitualDist < 2) {
//		effects.particleEffectBloodExplosion(player.x, player.y, 10, 300);
//	}
	
	// update objects and effects
	if (fsm.is('move')){
		objects.update();
		effects.update(dt);
	}
	if (fsm.is('spellMenu'))
	{
		objects.getPlayer().body.velocity.x = 0;
		objects.getPlayer().body.velocity.y = 0;
		if (objects.getCarriedSprite().body != null) {
			objects.getCarriedSprite().body.velocity.x = 0;
			objects.getCarriedSprite().body.velocity.y = 0;
		}
		
		//console.log(objects.getPlayer().body);
		var angRange = 2*Math.PI / nSpells;
		if (game.input.keyboard.isDown(Phaser.Keyboard.A) && Math.abs(game.time.now - switchTimer2) > 500) {
			selectIdx -= 1;
			if (selectIdx <0) selectIdx = nSpells-1;
			ringSpeed = -1;
			switchTimer2 = game.time.now;
			rot_tmp = turnDist(spellSprites[0].rotation, angRange*(selectIdx-1), ringSpeed);
			console.log(rot_tmp);
		}
		if (game.input.keyboard.isDown(Phaser.Keyboard.D) && Math.abs(game.time.now - switchTimer2) > 500) {
			selectIdx += 1;
			if (selectIdx >= nSpells) selectIdx = 0;
			ringSpeed = +1;
			switchTimer2 = game.time.now;
			rot_tmp = turnDist(spellSprites[0].rotation, angRange*selectIdx, ringSpeed);
			console.log(rot_tmp);
		}
		
		// rotation=0 is idx 0
		
		
		var rot_dir = Math.sign(rot_tmp);
		//if (rot_dir != ringSpeed) rot_tmp += rot_dir* 2* Math.PI;
		var rot_tmp2 = rot_dir * .08;
		if ( Math.abs(rot_tmp) < .1)
		{
			for (var i = 0; i < spellSprites.length; i++)
			{
				spellSprites[i].rotation = angRange*selectIdx + angRange * i;
			}
			ringSpeed = 0;
		}
		
		if (ringSpeed != 0)	
		{
			for (var i = 0; i < spellSprites.length; i++)
			{
				spellSprites[i].rotation += rot_tmp2;
			}
			rot_tmp -= rot_tmp2;
		}
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			var tmpObj = objects.getCarriedObject();
			var key = null;
			var tmpSprite;
			if ("sprite" in tmpObj) 
			{
				key = tmpObj.sprite.key;
				tmpSprite = tmpObj.sprite;
			}else{
				key = tmpObj.key;
				tmpSprite = tmpObj;
			}
			// rituals go here
			if (selectIdx == 1 && key == "goat")
			{
				effects.doStartRain();
				// color the goat
				tmpObj.sprite.tint = 0xff0000;
				objects.playRitualSoundRnd();
				
				fsm.activateMoveMode();
			}
			if (selectIdx == 0 && key == "goat")
			{
				fsm.activateMoveMode();
				effects.doSomeEffects();
				tmpObj.emitter = effects.particleEffectBleeding(tmpSprite.x + tmpSprite.width / 2., tmpSprite.y + tmpSprite.height / 2., 20, 1000);
				tmpObj.ritualized = true;
				
				objects.playRitualSoundRnd();
			}
			
		}
	}

	
	if (game.input.keyboard.isDown(Phaser.Keyboard.L))
	{
		effects.toggleLight();
	}
	
	if (playerRitualDist<2)
	{
		if (!animState) 
		{
			effects.toggleGlow();
			animState = true;
		}
	}
	else
	{
		if (animState) 
		{
			effects.toggleGlow();
			animState = false;
		}
	}
	


	if ((objects.getCarriedObject() != null) && (playerRitualDist < 2) && game.input.keyboard.isDown(Phaser.Keyboard.M)  && Math.abs(game.time.now - switchTimer) > 200)
	{
		switchTimer = game.time.now;
		if (fsm.is('move'))
		{
			fsm.activateSpellMenu();
		}
		else
		{
			fsm.activateMoveMode();
		}
	}
}
