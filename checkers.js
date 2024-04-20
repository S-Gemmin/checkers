// By: Gemmin Sugiura, Selena Chow, Trevor Weiler, Tyler Qiu

let board = new Array(8);
let WIDTH = 8, HEIGHT = 8;

let RED = "red";  // could use map instead
let GREY = "grey";
let WHITE = "white";
let BIEGE = "#dbcdb8";
let BLACK = "black";
let YELLOW = "yellow";

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
canvas.addEventListener("click", onClicked);

let outputText = document.getElementById("outputText");
let outputGreyPieceCount = document.getElementById("outputGreyPieceCount");
let outputRedPieceCount = document.getElementById("outputRedPieceCount");
let greyTurn = true;
let greyPieceCount = 12, redPieceCount = 12;

window.onload = function () { fillBoard(), drawBoard(), drawPieces() };

function fillBoard() {
    for (let x = 0; x < WIDTH; x++) {
        board[x] = [];
        for (let y = 0; y < HEIGHT; y++)
            board[x].push(null);
    } 
    
    for (let y = 0; y < 3; y++) // red pieces
        for (let x = 0; x < WIDTH; x++)
            if ((x + y) % 2 === 1) 
                board[x][y] = new Piece(x, y, RED, false, false);
    
    for (let y = 5; y < HEIGHT; y++) // grey pieces
        for (let x = 0; x < WIDTH; x++)
            if ((x + y) % 2 === 1) 
                board[x][y] = new Piece(x, y, GREY, false, false);
}

function drawBoard() {
    for (let x = 0; x < WIDTH; x++)
        for (let y = 0; y < HEIGHT; y++) {
            ctx.fillStyle = (x + y) % 2 === 1 ? BIEGE : BLACK;
            ctx.fillRect(x * 100, y * 100, 100, 100);
        }
}

function drawPieces() {
    for (let x = 0; x < WIDTH; x++)
        for (let y = 0; y < HEIGHT; y++)
            if (board[x][y] !== null)
                board[x][y].draw();
}

function getSelectedPiece() { // could store piece instead
    for (let x = 0; x < WIDTH; x++)
        for (let y = 0; y < HEIGHT; y++)
            if (board[x][y] !== null && board[x][y].isClicked)
                return board[x][y];

    return null;
}

function onClicked(event) {
    let x = Math.floor(event.offsetX / 100);
    let y = Math.floor(event.offsetY / 100);
    let sqr = board[x][y];
    let prevPiece = getSelectedPiece();

    if (sqr !== null) {
        if (prevPiece !== null)
            prevPiece.isClicked = !prevPiece;
        if (sqr.isTurn())
            sqr.isClicked = !sqr.isClicked;
    } else {
        if (prevPiece !== null && prevPiece.isValidMove(x, y)) {
            board[prevPiece.row][prevPiece.col] = null;
            prevPiece.move(x, y);
            board[x][y] = prevPiece;
            prevPiece.isClicked = false;
            greyTurn = !greyTurn;

            outputText.innerHTML = "Turn: " + (greyTurn ? GREY : RED);
            outputGreyPieceCount.innerHTML = "Grey pieces: " + greyPieceCount;
            outputRedPieceCount.innerHTML = "Red pieces: " + redPieceCount;

            if (greyPieceCount === 0) 
                outputText.innerHTML = "Red WINS!";
            else if (greyPieceCount === 0)
                outputText.innerHTML = "Grey WINS!";  
        }
    }

    ctx.clearRect(0, 0, 800, 800);
    drawBoard();
    drawPieces();
}

function Piece(row, col, color, isClicked, isKing) {
    this.row = row,
    this.col = col,
    this.color = color,
    this.isClicked = false,
    this.isKing = false,

    this.draw = function () {
        if (this.isClicked) { // draws border to show which piece is selected
            ctx.fillStyle = YELLOW;
            ctx.beginPath();
            ctx.arc(this.row * 100 + 50, this.col * 100 + 50, 38, 0, 2 * Math.PI);
            ctx.fill();
        }

        ctx.fillStyle = this.color; // draws the piece
        ctx.beginPath();
        ctx.arc(this.row * 100 + 50, this.col * 100 + 50, 35, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = BLACK; // borders
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.row * 100 + 50, this.col * 100 + 50, 34, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.row * 100 + 50, this.col * 100 + 50, 32, 0, 2 * Math.PI);
        ctx.stroke();

        if (this.isKing) { // draws crown
            ctx.fillStyle = WHITE;
            ctx.strokeStyle = BLACK;
            ctx.beginPath();
            ctx.lineTo(this.row * 100 + 40, this.col * 100 + 40); 
            ctx.lineTo(this.row * 100 + 45, this.col * 100 + 45);
            ctx.lineTo(this.row * 100 + 50, this.col * 100 + 40);
            ctx.lineTo(this.row * 100 + 55, this.col * 100 + 45);
            ctx.lineTo(this.row * 100 + 60, this.col * 100 + 40);
            ctx.lineTo(this.row * 100 + 60, this.col * 100 + 60);
            ctx.lineTo(this.row * 100 + 40, this.col * 100 + 60);
            ctx.lineTo(this.row * 100 + 40, this.col * 100 + 40);
            ctx.fill();
            ctx.stroke();
        }
    }

    this.checkKing = function() {
        this.isKing = this.isKing
            || (this.color === RED && this.col === HEIGHT - 1) || (this.color === GREY && this.col === 0);
    }

    this.move = function(newRow, newCol) {
        this.row = newRow;
        this.col = newCol;
        this.checkKing();
    }

    this.isValidMove = function(newRow, newCol) {
        if (this.col === newCol && (this.row - 1 === newRow || this.row + 1 === newRow) // check if white space
            || this.row === newRow && (this.col - 1 === newCol || this.col + 1 === newCol)) return false;

        if (this.color === RED || this.isKing) {
            if (newRow === this.row - 1 && newCol === this.col + 1 && board[newRow][newCol] === null // standard red move
                || newRow === this.row + 1 && newCol === this.col + 1 && board[newRow][newCol] === null) return true;
            else if (newRow === this.row - 2 && newCol === this.col + 2 && board[this.row - 1][this.col + 1] !== null && board[this.row - 1][this.col + 1].color !== this.color) {
                this.killPiece(board[this.row - 1][this.col + 1]);
                return true;
            } else if (newRow === this.row + 2 && newCol === this.col + 2 && board[this.row + 1][this.col + 1] !== null && board[this.row + 1][this.col + 1].color !== this.color) {
                this.killPiece(board[this.row + 1][this.col + 1]);
                return true;
            }
        }

        if (this.color === GREY || this.isKing) {
            if (newRow === this.row - 1 && newCol === this.col - 1 && board[newRow][newCol] === null // standard grey move
                || newRow === this.row + 1 && newCol === this.col - 1 && board[newRow][newCol] === null) return true;
            else if (newRow === this.row - 2 && newCol === this.col - 2 && board[this.row - 1][this.col - 1] !== null && board[this.row - 1][this.col - 1].color !== this.color) {
                this.killPiece(board[this.row - 1][this.col - 1]);
                return true;
            } else if (newRow === this.row + 2 && newCol === this.col - 2 && board[this.row + 1][this.col - 1] !== null && board[this.row + 1][this.col - 1].color !== this.color) {
                this.killPiece(board[this.row + 1][this.col - 1]);
                return true;
            }
        }

        return false;
    }

    this.killPiece = function(piece) {
        if (piece.color === GREY) greyPieceCount--; 
        else redPieceCount--;
        board[piece.row][piece.col] = null;
    }

    this.isTurn = function() {
        return greyTurn ? this.color === GREY : this.color === RED;
    }
}