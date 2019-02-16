"use strict";

const Homey = require('homey');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

class OwneyApp extends Homey.App {

  onInit() {

    this.log('Initializing Owney app ...');

    // SPEECH PARSER
    new Homey.FlowCardAction('say_parsed_text')
      .register()
      .registerRunListener((args, state) => {
        return Homey.ManagerSpeechOutput.say(parse(args.text), {session: state.session});
      })

    // PERSONAL LED COLLECTION
    Array.prototype.concat.apply([], [
      [
        { id: 'led_red_blue_alert', colors: [[255, 0, 0], [0, 0, 255]] }
    	].map(screensaver => Object.assign(
    		{ generator: generateLedAlert, options: Object.assign({ fps: 1, tfps: 4, rpm: 60 }, screensaver.options) },
    		screensaver
    	)),
      [
    		{ id: 'led_flash_red', colors: [[255, 0, 0]] }
    	].map(screensaver => Object.assign(
    		{ generator: generateFlash, options: Object.assign({ fps: 16, tfps: 16, rpm: 0 }, screensaver.options) },
    		screensaver
    	)),
      [
    		{ id: 'led_eyes_red', colors: [[255, 0, 0], [255, 0, 0]] }
    	].map(screensaver => Object.assign(
    		{ generator: generateEyes, options: Object.assign({ fps: 2, tfps: 60, rpm: 0 }, screensaver.options) },
    		screensaver
    	)),
    	[
    		{ id: 'led_swirl_green', colors: [[0, 25, 0]] },
        { id: 'led_swirl_colorflow', colors: [[0, 0, 0]] }
    	].map(screensaver => Object.assign(
    		{ generator: generateSwirl, options: Object.assign({ fps: 1, tfps: 60, rpm: 4 }, screensaver.options) },
    		screensaver
    	)),
    	[
    		{ id: 'led_rain', colors: [[0, 0, 255]] }
    	].map(screensaver => Object.assign(
    		{ generator: generateRain, options: Object.assign({ fps: 1, tfps: 12, rpm: 24 }, screensaver.options) },
    		screensaver
    	)),
    ]).forEach((screensaver) => {

      let animation = new Homey.LedringAnimation({
        options: screensaver.options,
        frames: screensaver.generator.apply(null, screensaver.colors)
      })

      animation
        .register()
          .then(() => {
            const createScreensavers = async () => {
              try {
                await setTimeoutPromise(1000, 'waiting is done');
                await animation.registerScreensaver(screensaver.id);
              } catch (error) {
                this.log(error);
              }
            }
            createScreensavers();
          })
          .catch(() => {
            this.log('Error registering animation');
          })

    });

  }
}

module.exports = OwneyApp;

// ============ SPEECH PARSER ============== //
function parse (text) {
  var replaceMap = [
    ['km/u', ' kilometer per uur'],
    ['kWh', 'kilowatt uur'],
    [' Z ', ' zuiden '],
    [' ZW ', ' zuidwesten '],
    [' WZW ', ' westzuidwesten '],
    [' W ', ' westen '],
    [' NW ', ' noordwesten '],
    [' N ', ' noorden '],
    [' NO ', ' noordoosten '],
    [' O ', ' oosten '],
    [' ZO ', ' zuidoosten '],
    [/(.*?\d+)(C)\b/gi, function(match, g1) { return g1 + ' graden celcius'} ]
  ]

  var result = text
  Object.keys(replaceMap).forEach(function (key) {
    result = result.replace(replaceMap[key][0], replaceMap[key][1])
  })

  return result
}

// ==================== Pattern generators ==================== //
function generateSwirl( colRGB ){
	var frames = [];

	if(colRGB[0] == 0 && colRGB[1] == 0 && colRGB[2] == 0){ // color flow
		var col = getColorFlow();
	} else { // fixed color
		var col = [colRGB];
	}

	// for every frame...
	for( var fr = 0; fr < col.length; fr++ ){
		var frame = [];

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {

			if( ( pixel == 6 ) || ( pixel == 18 ) ){
				var color = col[fr];
			} else {
				var color = [0,0,0];
			}
			frame.push({ r: color[0], g: color[1], b: color[2] });
		}
		frames.push(frame);
	}
	return frames;
}

function generateFlash( colRGB ) {
	var frames = [];

	// for every frame...
	for( var fr = 0; fr < 32; fr++ ){
		var frame = [];
		if( fr == 2 ){
			var color = colRGB;
		} else {
			var color = [0, 0, 0];
		}

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			frame.push({ r: color[0], g: color[1], b: color[2] });
		}
		frames.push(frame);
	}
	return frames;
}

function generateEyes( colRGB1, colRGB2 ) {
	var frames = [];
	var color = [];
	var pixcenter = 21, pixdest = 0, pixnum =[];
	var blinkOn = false;
	var nFrame = 120;

	if(colRGB1[0]==colRGB2[0] && colRGB1[1]==colRGB2[1] && colRGB1[2]==colRGB2[2]){
		if( colRGB1[0] == 255 && colRGB1[1] == 255 && colRGB1[2] == 255 ){
			var colRGB2 = [4, 4, 4];
			var colRGB3 = [2, 2, 2];
		} else {
			var colRGB2 = [Math.round((255-colRGB1[0])/64), Math.round((255-colRGB1[1])/64), Math.round((255-colRGB1[2])/64) ];
			var colRGB3 = [Math.round((255-colRGB1[0])/128), Math.round((255-colRGB1[1])/128), Math.round((255-colRGB1[2])/128) ];
		}
		var colRGB4 = [Math.round(colRGB1[0]/32), Math.round(colRGB1[1]/32), Math.round(colRGB1[2]/32) ];

	} else {
		var colDiv1 = 0; for(var i = 0; i<3; i++){ if( colRGB1[i] > 0){ colDiv1++; } }
		var colDiv2 = 0; for(var i = 0; i<3; i++){ if( colRGB2[i] > 0){ colDiv2++; } }

		if( colDiv1 == colDiv2 ){ colDiv1 = 1; colDiv2 = 2; } else { colDiv2++; }

		colRGB1 = [Math.round(colRGB1[0]/Math.pow( 2, colDiv1)), Math.round(colRGB1[1]/Math.pow( 2, colDiv1)), Math.round(colRGB1[2]/Math.pow( 2, colDiv1)) ];
		colRGB2 = [Math.round(colRGB2[0]/Math.pow( 2, colDiv2)), Math.round(colRGB2[1]/Math.pow( 2, colDiv2)), Math.round(colRGB2[2]/Math.pow( 2, colDiv2)) ];

		var colRGB3 = [Math.round(colRGB2[0]/1.5), Math.round(colRGB2[1]/1.5), Math.round(colRGB2[2]/1.5) ];
		var colRGB4 = [Math.round(colRGB2[0]/8), Math.round(colRGB2[1]/8), Math.round(colRGB2[2]/8) ];
	}


	// for every frame...
	for( var fr = 0; fr < nFrame ; fr++ ){
		var frame = [];

		// if at destination, set new center destination... or not
		if( !blinkOn && pixdest == 0 && Math.random() >= 0.7 ){
			pixdest = 21 + Math.round(Math.random()*6-3);
		}
		// move center toward destination
		if(pixdest > 0 ){
			blinkOn = false;

			if( pixcenter > pixdest ){
				pixcenter -= 1;
			} else if( pixcenter < pixdest ){
				pixcenter += 1;
			} else { pixdest = 0; } // set arrived at the destination
		} else {
			if(blinkOn){
				blinkOn = false;
			} else {
				blinkOn = Math.random()<0.1;
			}
		}
		// last frames: move to start position
		if( fr >= nFrame -3 ){ pixdest = 21; }

		// get eye pixels
		for( var i = 1; i<7; i++){
			if(Math.floor(i/2)*2 == i ){
				pixnum[i] = pixcenter - 1 - Math.floor((i+1)/2);
				//if( i == 6 ){ pixnum[i]--; }
			} else {
				pixnum[i] = pixcenter + 1 + Math.floor((i+1)/2);
				//if( i == 5 ){ pixnum[i]++; }
			}
			if( pixnum[i] > 23){ pixnum[i] -=24; } else if ( pixnum[i] < 0 ){pixnum[i] += 24;}
		}

		// for every pixel...
		for( var pixel = 0; pixel < 24; pixel++ ) {
			if( pixel == pixnum[1] || pixel == pixnum[2] ) { // eyes center side
				if(blinkOn){
					color =  colRGB4;
				} else {
					color =  colRGB3;
				}
			} else if( pixel == pixnum[3] || pixel == pixnum[4] ) { // eyes center
				if(blinkOn){
					color =  [0, 0, 0];
				} else {
					color =  colRGB1;
				}
			} else if( pixel == pixnum[5] || pixel == pixnum[6] ) { // eyes outside
				if(blinkOn){
					color =  colRGB4;
				} else {
					color =  colRGB2;
				}
			} else  { color = [0, 0, 0]; }

			frame.push({ r: color[0], g: color[1], b: color[2] });
		}
		frames.push(frame);
	}
	return frames;
}

function generateLedAlert( colRGB1, colRGB2 ) {
	var frames = [];
	var frame = [];
	var color = [];

	// for every pixel...
	for( var pixel = 0; pixel < 24; pixel++ ) {
		if( pixel < 12 ) { color = colRGB1; } else  { color = colRGB2; }
		frame.push({ r: color[0], g: color[1], b: color[2] });
	}
	frames.push(frame);
	return frames;
}

function generateRain( colRGB ) {
	var frames = [];
	var frame = [];
  var randomNumbers = [];

	// for every pixel...
  for (var pixel = 0; pixel < 24; pixel++) {
    var color = [0,0,0];
    for (var i = 0; i < 8; i++) {
      randomNumbers[i] = randomPixel(0,23);
    }
  	if (isInArray(pixel, randomNumbers)) {
      color = colRGB;
    }
    frame.push({
      r: color[0], // 0 - 255
      g: color[1], // 0 - 255
      b: color[2]  // 0 - 255
    })
  }
	frames.push(frame);
	return frames;
}

// ==================== Helper functions ==================== //
function getColorFlow(){
	var fStep = 5, col = [], r = 25, g = 0, b = 0;
	while( g < 25 ){ g += fStep; col.push([r, g, b]); }
	while( r >0 )	{ r -= fStep; col.push([r, g, b]); }
	while( b < 25 ){ b += fStep; col.push([r, g, b]); }
	while( g >0 )	{ g -= fStep; col.push([r, g, b]); }
	while( r < 25 ){ r += fStep; col.push([r, g, b]); }
	while( b >0 )	{ b -= fStep; col.push([r, g, b]); }
	return col;
}

function randomPixel (low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}
