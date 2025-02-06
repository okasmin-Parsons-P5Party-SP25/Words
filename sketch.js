/**
a letter is randomly generated for each game
players have to input words that start with that letter
words must be at least 4 letters long and cannot be words they have already submitted
the player moves forward by the length of the word they entered
players race to reach the other side
 */

/**
 * TODO:
 * round should reset when a new client joins (myWords = [])
 * potentially limit to 4 guests, or adjust colors and canvas size accordingly
 * submit on press Enter key
 * styling
 */

let shared;
let wordInput;
let guests;
let me;
let allLetters = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
];

let width = 400;
let height = 400;

let startY = 80;
let spaceSize = 20;
let r = 20;
let startX = 0 + r / 2;

let palette = [
	[3, 135, 62], // green
	[255, 183, 0], // dark yellow
	[255, 115, 0], // orange
	[8, 79, 255], // blue
	[255, 255, 255], // white
];

function preload() {
	partyConnect("wss://demoserver.p5party.org", "okasmin_words");

	shared = partyLoadShared("shared", {
		roundLetter: "",
	});
	guests = partyLoadGuestShareds();
	me = partyLoadMyShared({
		position: { x: startX },
		myWords: [],
	});
}

function setup() {
	createCanvas(width, height);
	wordInput = createInput();
	createButton("submit").mousePressed(onSubmit);
	ellipseMode(CENTER);
	rectMode(CENTER);
	textAlign(CENTER);
	shared.roundLetter = random(allLetters);
	partyToggleInfo(true);
	noStroke();
}

function draw() {
	background(color([255, 204, 204])); //pink
	textFont("Courier New");
	textSize(40);

	text(shared.roundLetter, width / 2, 40);

	drawPlayers();
	if (me.myWords.length > 0) {
		drawMyWords();
	}
}

function drawPlayers() {
	// draw me
	push();
	fill(color(palette[0]));
	ellipse(me.position.x, startY, r, r);
	pop();

	// draw other guests
	let guestIdx = 0;
	for (const guest of guests) {
		if (guest === me) continue;

		push();
		// note: will need to fix this if # guests exceed palette
		// first color is reserved for me
		fill(color(palette[guestIdx + 1]));
		ellipse(guest.position.x, 2 * startY + guestIdx * startY, r, r);
		pop();

		guestIdx++;
	}
}

function onSubmit() {
	const word = wordInput.value().toUpperCase();
	const valid = validateWord(word);
	if (!valid) {
		return;
	} else {
		me.myWords.push(word);

		const newX = me.position.x + word.length * spaceSize;

		if (newX >= 390) {
			me.position.x = 390;
			console.log("you win!");
		} else {
			me.position.x = newX;
		}
		return;
	}
}

function validateWord(word) {
	// check if starts with correct letter
	if (word[0] !== shared.roundLetter) {
		console.log("first letter needs to match");
		return false;
	}

	// check if already submitted that word
	if (me.myWords.includes(word)) {
		console.log("already did that");
		return false;
	}

	// check if at least 4 letters
	if (word.length < 4) {
		console.log("word should be at least 4 letters");
		return false;
	}

	return true;
}

function drawMyWords() {
	const words = me.myWords;
	let letters = [];
	words.forEach((word) => letters.push(...word.split("")));

	const maxLettersDraw = width / spaceSize - 1;
	if (letters.length > maxLettersDraw) {
		letters = letters.slice(0, maxLettersDraw);
	}

	for (let i = 0; i < letters.length; i++) {
		const x = i * spaceSize + startX;
		push();
		rectMode(CENTER);
		fill("white");
		stroke("black");
		rect(x, startY, r, r);
		pop();

		push();
		textAlign(CENTER);
		textSize(16);
		text(letters[i], x, startY + 4);
		pop();
	}
}
