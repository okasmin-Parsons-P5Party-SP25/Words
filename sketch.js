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

let width = 500; //width of screen play area
let height = 500; //height of screen play area

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
let error_message;
let startGameButton;
let nameInput;

function preload() {
	partyConnect("wss://demoserver.p5party.org", "okasmin_words");

	shared = partyLoadShared("shared", {
		roundLetter: "",
		gameStarted:false,
		winner: {
			words: [],
			name: "placeholder", //this should be set by the input field
		},
	});
	guests = partyLoadGuestShareds();
	me = partyLoadMyShared({
		position: { x: startX },
		myWords: [],
		name:"",
		gameState:0, //0 means theyre on instruction screen, 1 means name is entered
	});
	kodeMonoFont = loadFont("./assets/Kodemono.ttf");
}

function setup() {
	createCanvas(outerWidth, outerHeight);
	wordInput = createInput();
	wordInput.position(outerWidth / 2, outerHeight - bottom_height / 2).addClass('hidden');
	// createButton("submit").mousePressed(onSubmit).position(10,top_height/2);
	createButton("reset")
		.mousePressed(onReset)
		.position(10, top_height / 2);
	ellipseMode(CENTER);
	rectMode(CENTER);
	textAlign(CENTER);
	shared.roundLetter = random(allLetters);
	// partyToggleInfo(true);
	noStroke();


	//name input
	nameInput = createInput();
	nameInput.position(outerWidth/2,top_height+inset_size+100).addClass('light').addClass('hidden')
	
	//start button
	if(partyIsHost()){
		startGameButton = createButton('start game')
		startGameButton.mousePressed(onStart).position(outerWidth/2,outerHeight-bottom_height-inset_size-100).addClass('light').addClass('hidden')
	}
	

	create_UI();
}

function draw() {
	resetBackground();
	noStroke();
	fill("white");
	textSize(12);
	text(
		"type as many words as you can starting with...",
		outerWidth / 2,
		game_y + 12
	);
	textSize(40);
	text(shared.roundLetter, outerWidth / 2, game_y + game_header_height / 2);

	drawBoard();

	
	
	if(!shared.gameStarted){
		if(me.gameState == 0){
			drawScreen("instructions");
		}else if(me.gameState == 1){
			drawScreen("start");
		}
	}else{
		wordInput.removeClass('hidden')
		
	}
	
	// show winning screen
	if (shared.winner && shared.winner.words.length) {
		show_win_screen();
	}

	create_UI();
	if(shared.gameStarted){
		if (me.myWords.length < 2) {
			showTooltip();
		}
		drawErrorMessage()
		textSize(12);
		fill("black")
		text(
			"enter your words below",
			outerWidth / 2,
			outerHeight - bottom_height / 2 - 30
		);

	}
	
}

function showTooltip() {
	push();
	fill("#FF477B");
	textSize(10);
	text(
		"Press Enter to Submit ->",
		outerWidth / 2 + 60,
		outerHeight - bottom_height / 2
	);
	pop();
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
	line(x, game_y + game_header_height, x, game_y + height);
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

		if (newX >= win_x - r / 2) {
			me.position.x = newX;
			console.log("you win!");
			console.log(me.name)
			shared.winner.name = me.name;
			shared.winner.words = me.myWords;
		} else {
			me.position.x = newX;
		}
		return;
	}
}

function validateWord(word) {
	error_message = "";
	// check if starts with correct letter
	if (word[0] !== shared.roundLetter) {
		console.log("first letter needs to match");
		error_message = `first letter needs to be ${shared.roundLetter}`;
		return false;
	}

	// check if already submitted that word
	if (me.myWords.includes(word)) {
		console.log("already did that");
		error_message = "already used that word";
		return false;
	}

	// check if at least 4 letters
	if (word.length < 4) {
		console.log("word should be at least 4 letters");
		error_message = "word should be at least 4 letters";
		return false;
	}
	error_message = "";
	return true;
}

function drawErrorMessage() {
	
	// rect(outerWidth / 2 - 130, outerHeight - bottom_height / 2 + 20, 200, 30);
	if (error_message != "") {
		textAlign(LEFT);
		fill("#FF477B");
		textSize(8);
		text(
			error_message,
			outerWidth / 2 - 130,
			outerHeight - bottom_height / 2 + 25
		);
		textAlign(CENTER);
	}
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
		if(shared.gameStarted){
			onSubmit();
		}
		if(me.gameState == 1){
			me.name = nameInput.value()
			console.log('name set:', me.name)
			nameInput.value("").addClass('hidden')
			nameInput.remove()
		}
		
	}
}
//start game
function onStart(){
	if(partyIsHost){
		startGameButton.remove()
	}
	if(nameInput){
		nameInput.remove()
	}
	
	shared.gameStarted = true
	onReset() 

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
	// rect(outerWidth / 2 - 250 / 2, outerHeight - bottom_height / 2 - 15, 250, 30);
}

function create_UI() {
	rectMode(CORNER);

	textSize(20);
	textFont(kodeMonoFont);
	textAlign(CENTER, CENTER);

	//create all the outside shapes
	fill("#f5f3f1")
	rect(0, 0, outerWidth, top_height +inset_size);
	rect(0, outerHeight - bottom_height-inset_size, outerWidth, bottom_height+inset_size);
	rect(0, 0, border_side+ inset_size, outerHeight);
	rect(outerWidth-border_side- inset_size, 0, border_side+ inset_size, outerHeight);
	stroke("black");
	rect(0, 0, outerWidth, top_height );
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
	
}

function drawScreen(type) {
	// draw black rectangle over whole playing area
	fill("black");
	rect(border_side + inset_size, top_height + inset_size, width, height);

	// render the relevant text
	if (type === "instructions"){
		show_instructions()
	}else if(type === "start") {
		show_opening_screen();
	} else if (type === "win") {
		show_win_screen();
	}
}


function mousePressed(){
	if(me.gameState == 0){
		me.gameState = 1
	}
}




function show_instructions(){
	push()
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

	textSize(30);
	noStroke()
	fill("white");
	text("HOW TO PLAY", outerWidth / 2, game_y + game_header_height / 2);
	let text_x = outerWidth/2
	let text_y= 30

	textAlign(CENTER)
	textSize(12)
	noStroke();

	text(
		"Submit as many words that...",
		text_x,
		game_y + game_header_height + text_y
	);
	text(
		"1. Start with the given letter",
		text_x,
		game_y + game_header_height + text_y+30
	);
	text(
		"2. Are at least 4 letters long",
		text_x,
		game_y + game_header_height + text_y+50
	);

	stroke('white')
	text(
		"First person to reach the end wins!",
		text_x,
		game_y + game_header_height + text_y + 100
	);

	drawSkipButton(mouseX+10, mouseY)
	pop()
}

function show_opening_screen() {
	let bottom_pos = outerHeight-bottom_height-inset_size-100
	let top_pos = top_height+inset_size+50
	let text_x = outerWidth/2
	textAlign(CENTER)
	textSize(12)
	fill("white")

	//input for your name
	nameInput.removeClass('hidden')
	text("Enter your name", text_x,top_pos+20)
	

	//show previews
	let guestIdx =  0
	let player_x = text_x - 100
	// console.log(me.name)
	for(const guest of guests){
		if(guest.name != ""){
			fill(palette[guestIdx%(palette.length)])
			ellipse(player_x, top_pos + 130, r,r)
			textSize(10)
			text(guest.name, player_x, top_pos + 150)
			player_x += r + 20
			guestIdx++;
		}
		
	}

	fill('white')
	textSize(10)
	if(partyIsHost()){
		//draw a button
		text("You are the host", text_x,bottom_pos-30)
		startGameButton.removeClass("hidden")
		
	}else{
		if (frameCount % 40 < 10) {
			text("Waiting for host to start game", text_x,bottom_pos)
		} else if(frameCount % 40 < 20) {
			text("Waiting for host to start game.", text_x,bottom_pos)
		}else if(frameCount % 40 < 30){
			text("Waiting for host to start game..", text_x,bottom_pos)
		}else{
			text("Waiting for host to start game...", text_x,bottom_pos)
		}
	}
}

function show_win_screen() {
	resetBackground();
	const xText = border_side + inset_size + 40;
	const yTextSecondLine = game_y + game_header_height + 20;
	const yTextWords = yTextSecondLine + 32;

	textSize(32);
	fill("white");
	text(
		`${shared.winner.name} wins!`,
		outerWidth / 2,
		game_y + game_header_height / 2
	);

	push();
	textAlign(LEFT);
	fill("white");
	textSize(14);
	text("Check that their words are all legit:", xText, yTextSecondLine);
	const { words } = shared.winner;
	for (let i = 0; i < words.length; i++) {
		text(words[i], xText, yTextWords + i * 20);
	}
	pop();
}
