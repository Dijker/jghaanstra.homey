"use strict";

var sentence = '';

function init() {

    // SPEECH PARSER
    Homey.manager('flow').on('action.say_parsed_text', function (callback, args, state) {
        Homey.manager('speech-output').say(parse(args.text), {session: state.session})
        callback(null, true)
    })

    // ECHO
    Homey.manager('speech-input').on('speech', onSpeech);

};

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

// ============ ECHO ============== //
function onSpeech(speech) {

    speech.triggers.some(function (trigger) {
        sentence = speech.transcript.replace(trigger.text, '');
        Homey.manager('speech-output').say(sentence)
    });

}

module.exports.init = init

// ============ PERSONAL LED COLLECTION ============== //

var Animation = Homey.manager('ledring').Animation;

Array.prototype.concat.apply([], [
	[
		{ id: 'led_swirl_green', colors: [[0, 25, 0]] },
        { id: 'led_swirl_colorflow', colors: [[0, 0, 0]] },
	].map(screensaver => Object.assign(
		{ generator: generateSwirl, options: Object.assign({ fps: 1, tfps: 60, rpm: 4 }, screensaver.options) },
		screensaver
	)),
	[
		{ id: 'led_rain', colors: [[0, 0, 255]] },
	].map(screensaver => Object.assign(
		{ generator: generateRain, options: Object.assign({ fps: 1, tfps: 12, rpm: 24 }, screensaver.options) },
		screensaver
	)),
]).forEach((screensaver) => {

	// create animation with screensaver.options and generator(colors) function
	var animation = new Animation({
		options: screensaver.options,
		frames: screensaver.generator.apply(null, screensaver.colors)
	});

	// register animation
	animation.register(function (err, result) {
		Homey.manager('ledring').registerScreensaver(screensaver.id, animation);
		if (err) return Homey.error(err);
	})
});

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
