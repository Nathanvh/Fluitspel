window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var analyser = null;
var mediaStreamSource = null;
var newNote = null;
var newerNote = null;
var note = null;
var noteFlute = new Image();

var rafID = null;
var buflen = 1024;
var buf = new Float32Array(buflen);
var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

window.onload = function() {
	audioContext = new AudioContext();

	toggleLiveInput();
}

function toggleLiveInput() {
	getUserMedia(
		{
			"audio": {
			"mandatory": {
			"googEchoCancellation": "false",
			"googAutoGainControl": "false",
			"googNoiseSuppression": "false",
			"googHighpassFilter": "false"
		},
			"optional": []
		},
	}, gotStream);
}

function getUserMedia(dictionary, callback) {
	try {
		navigator.getUserMedia = 
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia;
		navigator.getUserMedia(dictionary, callback, error);
	} catch (e) {
		alert('getUserMedia threw exception :' + e);
	}
}

function gotStream(stream) {
	mediaStreamSource = audioContext.createMediaStreamSource(stream);

	analyser = audioContext.createAnalyser();
	analyser.fftSize = 2048;
	mediaStreamSource.connect(analyser);
	updatePitch();
}

function updatePitch(time) {
	analyser.getFloatTimeDomainData(buf);
	var pitch = autoCorrelate(buf, audioContext.sampleRate);

 	if (pitch != -1) {
	 	note = noteFromPitch(pitch);
		newNote = noteStrings[note%12];

		switch(menu) {
			case(1):
				if (newNote == newerNote && newNote == "G") {
		 			playSong++;
		 			if (playSong > 100) {
		 				console.log(menu);
		 				playSong = 100;
		 				menu = 2;
		 			}
		 		} else {
					if (playSong > 1) {
						playSong -= 2;
					} else {
						playSong = 1;
					}
		 		}
			break;

			case(2):
				player.y = steps * (this.step + 1);
				player.step = noteStrings.indexOf(newNote) + 1;
			break;

			case(3):
				if (newNote == newerNote && newNote == "C") {
		 			playSong++;
		 			if (playSong > 100) {
		 				playSong = 100;
		 				menu = 1;
		 			}
		 		} else {
					if (playSong > 1) {
						playSong -= 2;
					} else {
						playSong = 1;
					}
		 		}
			break;
	 	}
	} else {
		if (playSong > 1 ) {
			playSong -= 2;
		} else {
			playSong = 1;
		}
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	rafID = window.requestAnimationFrame( updatePitch );

	newerNote = newNote;
}

function autoCorrelate(buf, sampleRate) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.05)
		return -1;

	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i])-(buf[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation;
		if ((correlation>0.9) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		return sampleRate/best_offset;
	}
	return -1;
}

function noteFromPitch(frequency) {
	var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
	return Math.round( noteNum ) + 69;
}

function error() {

	alert('Stream generation failed.');
}