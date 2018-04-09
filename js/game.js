var width = 960;
var height = 640;
var FPS = 60;
var FPSLoop = 0;
var coinsStop = false;
var menu = 1;
var flute = new Image();
var stave = new Image();
var fluteSrc = null;
var staveSrc = null;

var gBackground = document.getElementById("canvas_background").getContext("2d");
var gPlayer = document.getElementById("canvas_player").getContext("2d");
var gCoins = document.getElementById("canvas_coins").getContext("2d");
var gGui = document.getElementById("canvas_gui").getContext("2d");

var stars = [];
var coins = [];
var song = ["E", "E", "E", "E", "E", "G", "G", "G", "F", "F", "F", "A", "A", "G", "G", "E", "E", "E", "E", "E", "G", "G", "G", "A", "G", "F", "D", "D"];

var steps = (height / (noteStrings.length + 1));
var playSong = 1;

var player = {
	width: 16,
	height: 16,
	step: 6,
	x: 16 * 1.5,
	y: steps * 6,
	score: 300,

	render: function() {
		gPlayer.fillStyle = "aqua";
		gPlayer.fillRect(this.x, this.y - (this.height / 2), this.width, this.height);
	},
	update: function() {
		FPSLoop++;
		switch(true) {
			case(FPSLoop % (FPS*2) == 0 && !coinsStop):
				player.score--;
				break;
			case(FPSLoop % (FPS) == 0 && coinsStop):
				player.score--;
				break;
		}
		if(this.step - 1 >= 1) {
			this.y = steps * (this.step - 1);
			this.step--;
		}
		if(this.step + 1 <= noteStrings.length) {
			this.y = steps * (this.step + 1);
			this.step++;
		}
	}
}

function Star(x, y) {
	this.x = x;
	this.y = y;
	this.size = Math.random() * 2.5;

	this.render = function() {
		gBackground.fillStyle = "white";
		gBackground.fillRect(this.x, this.y, this.size, this.size);
	}

	this.update = function() {
		if (this.x < -3) {
			var index = stars.indexOf(this);
			stars.splice(index, 1);
			createStars(1);
			return;
		}

		switch(true) {
			case (this.size >= 0 && this.size < 0.5):
				this.x = this.x - 0.5;
				break;
			case (this.size >= 0.5 && this.size < 1):
				this.x = this.x - 0.6;
				break;
			case (this.size >= 1 && this.size < 1.5):
				this.x = this.x - 0.7;
				break;
			case (this.size >= 1.5 && this.size < 2):
				this.x = this.x - 0.8;
				break;
			case (this.size >= 2 && this.size < 2.5):
				this.x = this.x - 0.9;
				break;
			case (this.size >= 2.5 && this.size < 3):
				this.x = this.x - 1;
				break;
		}
	}
}

function createStars(amount) {
	for (i = 0; i < amount; i++) {
		stars.push(new Star(width + 3, Math.random() * height));
	}
}

function initStars(amount) {
	for (i = 0; i < amount; i++) {
		stars.push(new Star(Math.random() * width, Math.random() * height));
	}
}

function Coin(note, place, speed, size) {
	this.note = note;
	this.place = place;
	this.speed = speed || 3;
	this.size = ((size || 8) / 1.5);
	this.width = this.size;
	this.height = this.size;
	this.noteNumber = noteStrings.indexOf(this.note) + 1;
	this.x = width + ((this.place * 40) + this.size);
	this.y = steps * this.noteNumber;

	this.render = function() {
		gCoins.beginPath();
		gCoins.fillStyle = "yellow";
		gCoins.font = "bold 16px consolas";
		gCoins.fillText(this.note, this.x, this.y);
		//gCoins.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		//gCoins.fill();
	}
	this.update = function() {
		if (!coinsStop) {
			if (this.x < (player.x + 5)) {
				coinsStop = true;
				for (var i = 0; i < coins.length; i++) {
					coins[i].x = coins[i].x;
				}
			} else {
				if (this.x < (this.size * -1)) {
					var index = coins.indexOf(this);
					coins.splice(index, 1);
					return;
				}
				switch(true) {
					case (this.size >= 0 && this.size < 0.5):
						this.x = this.x - 0.5;
						break;
					case (this.size >= 0.5):
						this.x = this.x - 2;
						break;
				}
			}
		}
		if (collision(this, player)) {
			var index = coins.indexOf(this);
			coins.splice(index, 1);
			coinsStop = false;
		}
	}
}

function initSong(song, repeat) {
	this.song = song;
	var place = 6;

	for (i = 0; i < repeat; i++) {
		for (j = 0; j < this.song.length; j++) {
			coins.push(new Coin(song[j], place));
			place++;
		}
		place += 10;
	}
}

function init() {
	initStars(200);
	initSong(song, 2);
}

function render() {
	gBackground.clearRect(0, 0, width, height);
	for(i in stars) stars[i].render();

	switch(menu) {
		case 1:
			var circ = Math.PI * 2;
			var quart = Math.PI / 2;
			current = playSong / 100;

			gGui.clearRect(0, 0, width, height);
			gGui.beginPath();
			gGui.strokeStyle = 'white';
			gGui.lineCap = 'round';
			gGui.closePath();
			gGui.fill();
			gGui.lineWidth = 10;

			gGui.fillStyle = "white";
			gGui.textBaseline = "top";
			gGui.font = "bold 40px consolas";
			gGui.fillText("Leer een blokfluit spelen!", 200, 100);
			gGui.font = "bold 18px consolas";
			gGui.fillText("Speel een G om te beginnen...", 200, 200);

			imd = gGui.getImageData(0, 0, 100, 100);

			gGui.putImageData(imd, 0, 0);
			gGui.beginPath();
			gGui.arc(480, 320, 30, -(quart), ((circ) * current) - quart, false);
			gGui.stroke();
		break;

		case 2:
			gPlayer.clearRect(player.width * 1.5, 0, player.width * 1.5 + player.width, height);
			player.render();

			gCoins.clearRect(0, 0, width, height);
			for(i in coins) coins[i].render();

			gGui.clearRect(0, 0, width, height);
			gGui.fillStyle = "white";
			gGui.textBaseline = "top";
			gGui.font = "bold 16px consolas";
			gGui.fillText("Score: " + player.score, 4, 4);
		break;

		case 3:
			gPlayer.clearRect(0, 0, width, height);
			gCoins.clearRect(0, 0, width, height);
			gGui.clearRect(0, 0, width, height);

			gGui.font = "bold 40px consolas";
			gGui.fillText("Jouw score is:", 200, 100);
			gGui.font = "bold 24px consolas";
			gGui.fillText(player.score + ", goed gedaan!", 200, 200);
			gGui.font = "bold 18px consolas";
			gGui.fillText("Speel een C om terug naar het menu te gaan.", 200, 240);

			var circ = Math.PI * 2;
			var quart = Math.PI / 2;
			current = playSong / 100;

			gGui.beginPath();
			gGui.strokeStyle = 'white';
			gGui.lineCap = 'round';
			gGui.closePath();
			gGui.fill();
			gGui.lineWidth = 10;

			imd = gGui.getImageData(0, 0, 100, 100);

			gGui.putImageData(imd, 0, 0);
			gGui.beginPath();
			gGui.arc(480, 320, 30, -(quart), ((circ) * current) - quart, false);
			gGui.stroke();
		break;
	}

	if (noteStrings[note%12] != null) {
		gGui.fillText("Note: " + noteStrings[note%12], 810, 597);
	}

	if (noteStrings[note%12] != null) {
		var noteThing = null;

		switch(String(noteStrings[note%12])) {
			case "C#":
				noteThing = 'C-hoog';
			break;

			case "D#":
				noteThing = 'D-hoog';
			break;

			case "F#":
				noteThing = 'E-hoog';
			break;

			case "G#":
				noteThing = 'C-hoog';
			break;

			case "A#":
				noteThing = 'C-hoog';
			break;

			default:
				noteThing = String(noteStrings[note%12]);
			break;
		}

		fluteSrc = './images/' + noteThing + '.png';
		flute.src = fluteSrc;
		gGui.drawImage(flute, 915, 432, 30, 193);
		staveSrc = './images/' + noteThing + '-stave.png';
		stave.src = staveSrc;
		gGui.drawImage(stave, 790, 499, 100, 88);
	}
}

function update() {
	for(i in stars) stars[i].update();

	if (menu === 2) {
		player.update();
		for(i in coins) coins[i].update();
	}

	if (coins.length === 0) {
		menu = 3;
		playSong = 1;
	}
}

function collision(obj1, obj2) {
	return (
		obj1.x < obj2.x + obj2.width &&
		obj1.x + obj1.width > obj2.x &&
		obj1.y < obj2.y + obj2.height &&
		obj1.y + obj1.height > obj2.y
	);
}

init();

setInterval(function() {
	render();
	update();
}, 1000/FPS);