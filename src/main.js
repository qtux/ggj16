// global variables
var game = new Phaser.Game(1152, 752, Phaser.AUTO, '', { preload: preload, create: create, update: update, shutdown: shutdown});
var effects = new Effects();
var objects = new Objects();
var cursors;
var player;
var playerImmune = false;
var npcCG, tileCG, playerCG, bulletsCG, ritualResultCG;		// collision groups (not used: dmgObjCG)

// TODO local variables
var levelNames = ['level00', 'level01', 'level02', 'level03', 'level04', 'level05'];
var levelNum = 0;
var map, layer, layer1;		// tilemap related
var circleTile;
var ritualCircle = {
	posX : 0,
	posY : 0
};

var bgm;
var text;

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
var levelReq = {
	numFire : 1,
	numPoison : 0,
	numArcane : 0,
	numGoat : 0,
	numSheep : 0,
	numParrot : 0,
	numWorm : 0,
	sprites : []
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

function shutdown() {
	bgm.stop();
}

/**
 * preload - load assets
 */
function preload () {
	game.load.tilemap('map', 'assets/tilemaps/'+levelNames[levelNum]+'.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tileset', 'assets/tilesets/basictiles.png');
	game.load.atlas('spells', 'assets/spritesheets/spells.png','assets/spritesheets/spells.json');
	game.load.audio('bgm', 'assets/audio/background.ogg');
	
	objects.preload();
	effects.preload();
}

/**
 * create - generate and initialise game content
 */
function create () {
	// background music
	bgm = game.add.audio('bgm');
	bgm.play('', 0, 1, true);
	
	setLevelRequirements(levelNum);
	
	// start physics system
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true);
	
	// register collision groups
	npcCG = game.physics.p2.createCollisionGroup();
	tileCG = game.physics.p2.createCollisionGroup();
	playerCG = game.physics.p2.createCollisionGroup();
	bulletsCG = game.physics.p2.createCollisionGroup();
	ritualResultCG = game.physics.p2.createCollisionGroup();
	//dmgObjCG = game.physics.p2.createCollisionGroup();
	
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
		
		updateRequirementSprites();
		
	// create help text
	var style = { font: "22px Arial", fill: "#ff0044", wordWrap: true, wordWrapWidth: 1152, align: "center" };
	text = game.add.text(20, 725, "Use W/A/S/D to steer, E to shoot, F to lift entities, Y to release entities and M to do the ritual inside the ritual field.", style);
}

function gofull() {
	if (game.scale.isFullScreen) {
		game.scale.stopFullScreen();
	}
	else {
		game.scale.startFullScreen(false);
	}
}

function updateRequirementSprites()
{
	var tmpPos = 0;
//	console.log(levelReq.sprites.length);
	
	for (i in levelReq.sprites)
	{
		levelReq.sprites[i].kill();
		levelReq.sprites[i].destroy();
	}
//	console.log("after: " + levelReq.sprites.length);
	
	for (var i=0; i<levelReq.numFire; i++)
	{
		tmpSprite = game.add.sprite(objects.getPlayer().body.x, objects.getPlayer().body.y,'spells')
		tmpSprite.frameName = 'fire_spell';
		tmpSprite.x = 20 + tmpPos * 30;
		tmpSprite.y = 20;
		levelReq.sprites.push(tmpSprite);
		tmpPos++;
	}
	
	for (var i=0; i<levelReq.numPoison; i++)
	{
		tmpSprite = game.add.sprite(objects.getPlayer().body.x, objects.getPlayer().body.y,'spells')
		tmpSprite.frameName = 'poison_spell';
		tmpSprite.x = 20 + tmpPos * 30;
		tmpSprite.y = 20;
		levelReq.sprites.push(tmpSprite);
		tmpPos++;
	}
	
	for (var i=0; i<levelReq.numArcane; i++)
	{
		tmpSprite = game.add.sprite(objects.getPlayer().body.x, objects.getPlayer().body.y,'spells')
		tmpSprite.frameName = 'arcane_spell';
		tmpSprite.x = 20 + tmpPos * 30;
		tmpSprite.y = 20;
		levelReq.sprites.push(tmpSprite);
		tmpPos++;
	}
	
	var tmpTypes = ['goat', 'sheep', 'worm', 'parrot'];
	var tmpNum = [levelReq.numGoat, levelReq.numSheep, levelReq.numWorm, levelReq.numParrot];
	
	for (var j in tmpTypes)
	{
		for (var i=0; i<tmpNum[j]; i++)
		{
			tmpSprite = game.add.sprite(objects.getPlayer().body.x, objects.getPlayer().body.y, tmpTypes[j])
			tmpSprite.x = 20 + tmpPos * 30;
			tmpSprite.y = 20;
			levelReq.sprites.push(tmpSprite);
			tmpPos++;
		}
	}

	// next level?
	if (tmpPos == 0){
		objects.opendoor();
	}
}

function setLevelRequirements(theLevelNum)
{
	if (theLevelNum == 0)
	{
		levelReq.numFire = 1;
		levelReq.numPoison = 1;
		levelReq.numArcane = 0;
		levelReq.numGoat = 1;
		levelReq.numSheep = 0;
		levelReq.numWorm = 0;
		levelReq.numParrot = 0;
	} else if (theLevelNum == 1)
	{
		levelReq.numFire = 0;
		levelReq.numPoison = 1;
		levelReq.numArcane = 1;
		levelReq.numGoat = 0;
		levelReq.numSheep = 1;
		levelReq.numWorm = 0;
		levelReq.numParrot = 0;
	} else if (theLevelNum == 2)
	{
		levelReq.numFire = 1;
		levelReq.numPoison = 1;
		levelReq.numArcane = 0;
		levelReq.numGoat = 0;
		levelReq.numSheep = 0;
		levelReq.numWorm = 2;
		levelReq.numParrot = 0;
	} else if (theLevelNum == 3)
	{
		levelReq.numFire = 1;
		levelReq.numPoison = 0;
		levelReq.numArcane = 1;
		levelReq.numGoat = 1;
		levelReq.numSheep = 0;
		levelReq.numWorm = 0;
		levelReq.numParrot = 0;
	} else if (theLevelNum == 4)
	{
		levelReq.numFire = 0;
		levelReq.numPoison = 1;
		levelReq.numArcane = 1;
		levelReq.numGoat = 0;
		levelReq.numSheep = 0;
		levelReq.numWorm = 2;
		levelReq.numParrot = 0;
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
			//console.log(rot_tmp);
		}
		if (game.input.keyboard.isDown(Phaser.Keyboard.D) && Math.abs(game.time.now - switchTimer2) > 500) {
			selectIdx += 1;
			if (selectIdx >= nSpells) selectIdx = 0;
			ringSpeed = +1;
			switchTimer2 = game.time.now;
			rot_tmp = turnDist(spellSprites[0].rotation, angRange*selectIdx, ringSpeed);
			//console.log(rot_tmp);
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
			
			//0:f, 1:p, 2:a
			
			if (key == "goat")
			{
				if (levelReq.numGoat > 0)
				{
					levelReq.numGoat--;
				}
			} else if (key == "sheep")
			{
				if (levelReq.numSheep > 0)
				{
					levelReq.numSheep--;
				}
			} else if (key == "worm")
			{
				if (levelReq.numWorm > 0)
				{
					levelReq.numWorm--;
				}
			} else if (key == "parrot")
			{
				if (levelReq.numParrot > 0)
				{
					levelReq.numParrot--;
				}
			} 
			
			if (selectIdx == 0)
			{
				if (levelReq.numFire > 0)
				{
					levelReq.numFire--;
				}
			} else if (selectIdx == 2)
			{
				if (levelReq.numPoison > 0)
				{
					levelReq.numPoison--;
				}
			} else if (selectIdx == 1)
			{
				if (levelReq.numArcane > 0)
				{
					levelReq.numArcane--;
				}
			}
			
			// rituals go here
			if (selectIdx == 2) // && key == "goat")
			{
				//objects.opendoor();
				objects.setPlayerState('angeredNPC');
				objects.playRitualSoundRnd();
				
//				fsm.activateMoveMode();
			}
			
			// rituals blood rain
			if (selectIdx == 1) // && key == "goat")
			{
				effects.doStartRain();
				// color the goat
				if (key == "goat" || key == "sheep" || key == "worm" || key == "parrot") {
					tmpObj.sprite.tint = 0xff0000;
				} else {
					tmpObj.tint = 0xff0000;
				}
				objects.playRitualSoundRnd();
				
//				fsm.activateMoveMode();
			}
			
			// ritual kill
			if (selectIdx == 0 && key != "key")
			{
//				fsm.activateMoveMode();
				effects.doSomeEffects();
				tmpObj.emitter = effects.particleEffectBleeding(tmpSprite.x + tmpSprite.width / 2., tmpSprite.y + tmpSprite.height / 2., 20, 1000);
				tmpObj.ritualized = true;
				
				objects.playRitualSoundRnd();
			}
			
			// ritual kill
			if (selectIdx == 0 && key == "questionmark")
			{
//				fsm.activateMoveMode();
				effects.doSomeEffects();
				objects.changeToSth(tmpObj);
				
				objects.playRitualSoundRnd();
			}
			
			// ritual kill
			//if (selectIdx == 0 && key == "worm")
			//{
//				fsm.activateMoveMode();
	/*			effects.doSomeEffects();
				tmpObj.emitter = effects.particleEffectBleeding(tmpSprite.x + tmpSprite.width / 2., tmpSprite.y + tmpSprite.height / 2., 20, 1000);
				tmpObj.ritualized = true;
				
				objects.playRitualSoundRnd();
			}*/
			updateRequirementSprites();
			fsm.activateMoveMode();	
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
