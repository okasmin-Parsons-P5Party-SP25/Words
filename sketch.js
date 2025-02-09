/**
a letter is randomly generated for each game
players have to input words that start with that letter
words must be at least 4 letters long and cannot be words they have already submitted
the player moves forward by the length of the word they entered
players race to reach the other side
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

let border_side = 30;
let top_height = 50;
let bottom_height = 120;
let inset_size = 20;
let outerWidth = width + border_side * 2 + inset_size * 2;
let outerHeight = height + top_height + bottom_height + inset_size * 2;

let game_header_height = 80;
let game_y = top_height + inset_size;

let startY = game_y + game_header_height + 20;
let spaceSize = 20;
let r = 20;
let startX = 30 + inset_size + r / 2;

let palette = [
	"#E6B101", //yellow
	"#FF477B", //pink
	"#C2D968", //green
	"#FF4E20", //red
];
let kodeMonoFont;

function preload() {
	partyConnect("wss://demoserver.p5party.org", "okasmin_words");

	shared = partyLoadShared("shared", {
		roundLetter: "",
		winner: {
			name: "",
			words: [],
		},
	});
	guests = partyLoadGuestShareds();
	me = partyLoadMyShared({
		position: { x: startX },
		myWords: [],
		name: "",
	});
	kodeMonoFont = loadFont("./assets/Kodemono.ttf");
}

function setup() {
	createCanvas(outerWidth, outerHeight);
	wordInput = createInput();
	wordInput.position(outerWidth / 2, outerHeight - bottom_height / 2);
	createButton("submit").mousePressed(onSubmit);
	createButton("reset").mousePressed(onReset);
	ellipseMode(CENTER);
	rectMode(CENTER);
	textAlign(CENTER);
	shared.roundLetter = random(allLetters);
	partyToggleInfo(true);
	noStroke();

<<<<<<< HEAD
	create_UI()
	console.log(guests)
=======
	create_UI();
>>>>>>> 76f264a46fcc2c9653bbc53a5d09cf293b596b59
}

function draw() {
	resetBackground();
	noStroke();
	fill("white");
	textSize(8);
	text(
		"type as many words starting with...",
		outerWidth / 2,
		game_y + game_header_height / 2 - 23
	);
	textSize(40);
	text(shared.roundLetter, outerWidth / 2, game_y + game_header_height / 2);

	drawBoard();
}

function drawBoard() {
	let guestIdx = 0;
	for (const guest of guests) {
		let y;
		if (guest === me) {
			y = startY;
		} else {
<<<<<<< HEAD
			y = (1 + guestIdx) * spaceSize *2 + startY;
			
=======
			y = (2 + guestIdx) * spaceSize * 2 + startY;

>>>>>>> 76f264a46fcc2c9653bbc53a5d09cf293b596b59
			guestIdx++;
		}

		drawPlayer(guest.position.x, y);

		const isMe = guest === me;
		drawWordRectangles(guest.myWords, y, isMe);
	}
}

function drawPlayer(x, y) {
	push();
	fill(color(palette[0])); //update this
	stroke(color(palette[0]));
	line(
		me.position.x,
		game_y + game_header_height,
		me.position.x,
		game_y + height
	);
	ellipse(x, y, r, r);
	pop();
}

function onSubmit() {
	const word = wordInput.value().toUpperCase();
	const valid = validateWord(word);
	if (!valid) {
		return;
	} else {
		me.myWords.push(word);
		wordInput.value("");

		const newX = me.position.x + word.length * spaceSize;

		if (newX >= 390) {
			me.position.x = 390;
			console.log("you win!");
			// shared.winner.name = me.name
			// shared.winner.words = me.myWords
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

function drawWordRectangles(words, y, isMe) {
	let letters = [];
	words.forEach((word) => letters.push(...word.split("")));

	const maxLettersDraw = width / spaceSize - 1;
	if (letters.length > maxLettersDraw) {
		letters = letters.slice(0, maxLettersDraw);
	}

	// draw rectangle for each letter
	for (let i = 0; i < letters.length; i++) {
		const x = i * spaceSize + startX;
		push();
		noFill();
		stroke("white");
		rectMode(CENTER);
		rect(x, y, r, r);
		pop();

		// fill each rectangle with letter if is me
		if (isMe) {
			push();
			textAlign(CENTER, CENTER);
			textSize(16);
			textSize(round(r * 0.7));
			text(letters[i], x, startY);
			pop();
		}
	}
}

// submit on enter
function keyPressed() {
	if (keyCode === ENTER) {
		onSubmit();
	}
}

// reset game
function onReset() {
	for (const guest of guests) {
		guest.myWords = [];
		guest.position.x = startX;
	}
	shared.roundLetter = random(allLetters);
	drawBoard();
}

function resetBackground() {
	fill("black");
	rect(border_side + inset_size, top_height + inset_size, width, height);

	//ingame UI
	noFill();
	stroke("white");
	rect(border_side + inset_size, game_y, width, game_header_height);
}

function create_UI() {
	rectMode(CORNER);

	textSize(20);
	textFont(kodeMonoFont);
	textAlign(CENTER, CENTER);

	//1. CREATE THE GAME CONSOLE SHAPE
	resetBackground(); //game area
	stroke("black");
	noFill();
	rect(0, 0, outerWidth, top_height);
	rect(0, outerHeight - bottom_height, outerWidth, bottom_height);
	//inset lines
	line(
		0,
		outerHeight - bottom_height,
		border_side + inset_size,
		outerHeight - bottom_height - inset_size
	); //bottom left
	line(
		outerWidth,
		outerHeight - bottom_height,
		outerWidth - border_side - inset_size,
		outerHeight - bottom_height - inset_size
	); //bottom right
	line(0, top_height, border_side + inset_size, top_height + inset_size); //top left
	line(
		outerWidth,
		top_height,
		outerWidth - border_side - inset_size,
		top_height + inset_size
	); //top right

	//2. ADD THE TOP TEXT
	noStroke();
	fill("black");
	text("WORDS", outerWidth / 2, top_height / 2);

	//3. ADD THE BOTTOM INPUTS
	textSize(10);
	text(
		"Enter Your Words Above ^",
		outerWidth / 2,
		outerHeight - bottom_height / 2 + 30
	);
}

function drawScreen(type) {
	// draw rectangle over whole canvas

	if (type === start) {
		show_opening_screen();
	} else if (type === win) {
		show_win_screen();
	}
}

function show_opening_screen() {
	// text instructions
	// input name - save to me object
	// button to start game - can call onReset()
}

function show_win_screen() {
	// {player name} won! (shared.winner.name)
	// list of all their words (shared.winner.words)
	// check that the player's words are all correct!
}

function update_minimap() {
	//if time
}
