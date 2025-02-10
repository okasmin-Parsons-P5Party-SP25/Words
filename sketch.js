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

let width = 400; //width of screen play area
let height = 400; //height of screen play area

let border_side = 30;
let top_height = 50;
let bottom_height = 120;
let inset_size = 20;
let outerWidth = width + border_side * 2 + inset_size * 2;
let outerHeight = height + top_height + bottom_height + inset_size * 2;

let game_header_height = 80;
let game_y = top_height + inset_size;

let win_x = width + border_side + inset_size;

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
	});
	guests = partyLoadGuestShareds();
	me = partyLoadMyShared({
		position: { x: startX },
		myWords: [],
	});
	kodeMonoFont = loadFont("./assets/Kodemono.ttf");
}

function setup() {
	createCanvas(outerWidth, outerHeight);
	wordInput = createInput();
	wordInput.position(outerWidth / 2, outerHeight - bottom_height / 2);
	// createButton("submit").mousePressed(onSubmit).position(10,top_height/2);
	createButton("reset")
		.mousePressed(onReset)
		.position(10, top_height / 2);
	ellipseMode(CENTER);
	rectMode(CENTER);
	textAlign(CENTER);
	shared.roundLetter = random(allLetters);
	partyToggleInfo(true);
	noStroke();

	create_UI();
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

	if (me.myWords.length < 2) {
		showTooltip();
	}
	// show_opening_screen()

	// show winning screen
	if (shared.winner.words.length) {
		drawScreen("win");
	}
}

function showTooltip() {
	fill("#FF477B");
	textSize(8);
	text(
		"Press Enter to Submit ->",
		outerWidth / 2 + 60,
		outerHeight - bottom_height / 2
	);
}

function drawBoard() {
	let guestIdx = 0;
	for (const guest of guests) {
		let y;
		const isMe = guest === me;

		if (isMe) {
			y = startY;
		} else {
			y = (2 + guestIdx) * spaceSize * 2 + startY;
		}

		drawPlayer(guest.position.x, y, isMe, guestIdx);
		drawWordRectangles(guest.myWords, y, isMe);
		if (!isMe) guestIdx++;
	}
}

function drawPlayer(x, y, isMe, idx) {
	let playerColor;

	// first color reserved for me
	if (isMe) {
		playerColor = color(palette[0]);
	} else {
		const guestPalette = palette.slice(1);
		let colorIdx = idx;
		if (colorIdx > guestPalette.length - 1) {
			colorIdx = idx % guestPalette.length;
		}
		playerColor = color(guestPalette[colorIdx]);
	}

	push();
	fill(playerColor);
	stroke(playerColor);
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
			me.position.x = win_x - r / 2;
			console.log("you win!");
			shared.winner.name = me.name;
			shared.winner.words = me.myWords;
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
	shared.winner = { name: "", words: [] };
	shared.roundLetter = random(allLetters);
	drawBoard();
}

function resetBackground() {
	rectMode(CORNER);
	stroke("black");
	fill("black");
	rect(border_side + inset_size, top_height + inset_size, width, height);

	//ingame UI
	noFill();
	stroke("white");
	line(
		border_side + inset_size,
		game_y + game_header_height,
		border_side + inset_size + width,
		game_y + game_header_height
	);

	fill("#f5f3f1");
	noStroke();

	rect(outerWidth / 2 - 250 / 2, outerHeight - bottom_height / 2 - 15, 250, 30);
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
		"Type Your Words Below",
		outerWidth / 2,
		outerHeight - bottom_height / 2 - 30
	);
}

function drawScreen(type) {
	// draw black rectangle over whole playing area
	fill("black");
	rect(border_side + inset_size, top_height + inset_size, width, height);

	// render the relevant text
	if (type === "start") {
		show_opening_screen();
	} else if (type === "win") {
		show_win_screen();
	}
}

function show_opening_screen() {
	resetBackground();
	textSize(40);
	fill("white");
	text("HOW TO PLAY", outerWidth / 2, game_y + game_header_height / 2);

	//skip button
	function drawSkipButton(x, y) {
		textSize(13);
		triangle(x, y, x - 20, y + 10, x - 20, y - 10);
		if (frameCount % 20 < 10) {
			stroke("white");
		} else {
			noStroke();
		}
		text("CLICK TO SKIP", x - 6, y - 30);
	}

	// drawSkipButton(outerWidth/2 + 150, outerHeight/2)
	drawSkipButton(mouseX + 15, mouseY);

	//preview gif goes here
	noFill();
	stroke("#FF477B");
	rectMode(CENTER);
	rect(outerWidth / 2, outerHeight / 2, 200, 200);

	noStroke();
	fill("#FF477B");
	text(
		"Type as many words as you can ",
		outerWidth / 2,
		game_y + game_header_height + 100
	);
}

function show_win_screen() {
	const xText = border_side + inset_size + 40;
	const yTextFirstLine = top_height + inset_size + 40;
	const yTextSecondLine = yTextFirstLine + 40;
	const yTextWords = yTextFirstLine + 80;

	push();
	textAlign(LEFT);
	fill("white");
	textSize(18);
	// TODO - update with player name once add input
	text("[player] wins!", xText, yTextFirstLine);
	textSize(14);
	text("Check that their words are all legit:", xText, yTextSecondLine);
	const { words } = shared.winner;
	for (let i = 0; i < words.length; i++) {
		text(words[i], xText, yTextWords + i * 20);
	}
	pop();
}

function update_minimap() {
	//if time
}
