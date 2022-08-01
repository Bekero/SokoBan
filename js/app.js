'use strict'
// 6/21/2022 [x, x, x]

var BOX = 'BOX'
var GLUE = 'GLUE'
var GOLD = 'GOLD'
var WALL = 'WALL'
var FLOOR = 'FLOOR'
var CLOCK = 'CLOCK'
var GAMER = 'GAMER'
var TARGET = 'TARGET'

var GLUE_IMG = '🛑'
var GAMER_IMG = '🏃'
var CLOCK_IMG = '⏰'
var GOLD_IMG = '<img src="images/gold.png" ><img>'
var BOX_IMG = '<img src="images/box1.png" ><img>'
var BOX_TARGET_IMG = '<img src="images/box-target.png" ><img>'

var gBoard
var gBoxPos
var gIsStuck
var gGamerPos
var gIsGameOn
var gIsVictory
var gCountMoves
var gGlueInterval
var gGoldInterval
var gClockInterval

function initGame() {
    gIsGameOn = true
    gIsStuck = false
    gIsVictory = false
    gCountMoves = 100
    gGamerPos = { i: 2, j: 9 };

    gBoard = createBoard()
    hideModals()
    renderBoard(gBoard);

    //Intervals
    gGlueInterval = setInterval(() => { // "one time function"
        addGameElement(GLUE, GLUE_IMG)
    }, 5000)
    gGoldInterval = setInterval(() => { // "one time function"
        addGameElement(GOLD, GOLD_IMG)
    }, 6000)
    gClockInterval = setInterval(() => { // "one time function"
        addGameElement(CLOCK, CLOCK_IMG)
    }, 7000)
}

function createBoard() {
    var board = createMat(10, 12)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var cell = { type: FLOOR, gameElement: null };

            if (i === 0 || i === board.length - 1 ||
                j === 0 || j === board[0].length - 1) {
                cell.type = WALL;
            }
            if (i === 0 && j === 0 || i === 0 && j === 1 || i === 0 && j === 2 ||
                i === 1 && j === 0 || i === 1 && j === 1 || i === 1 && j === 2 ||
                i === 2 && j === 0 || i === 2 && j === 1 || i === 2 && j === 2
            ) {
                cell.type = TARGET
            }
            board[i][j] = cell;
        }
    }

    //Locate the GAMER
    board[gGamerPos.i][gGamerPos.j].gameElement = 'GAMER';
    //(Hard Winning)Locate the BOXES manually
    board[3][3].gameElement = BOX;
    board[5][7].gameElement = BOX;
    board[7][9].gameElement = BOX;
    board[7][7].gameElement = BOX;
    board[7][6].gameElement = BOX;
    board[7][5].gameElement = BOX;
    board[4][8].gameElement = BOX;
    board[7][2].gameElement = BOX;
    board[7][1].gameElement = BOX;

    //(Easy Winnings for Checking)   Locate the BOXES manually for Victory Check
    // board[1][3].gameElement = BOX;
    // board[2][3].gameElement = BOX;
    // board[3][3].gameElement = BOX;
    // board[3][2].gameElement = BOX;
    // board[3][1].gameElement = BOX;
    // board[1][5].gameElement = BOX;
    // board[2][7].gameElement = BOX;
    // board[4][9].gameElement = BOX;
    // board[6][2].gameElement = BOX;

    //Locate the middle WALLS manually
    board[4][3].type = WALL;
    board[4][4].type = WALL;
    board[5][4].type = WALL;
    board[5][5].type = WALL;
    board[6][5].type = WALL;

    return board;
}

function renderBoard(board) {
    var strHTML = '';

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })

            if (currCell.type === FLOOR) cellClass += ' floor';
            else if (currCell.type === WALL) cellClass += ' wall';
            else if (currCell.type === TARGET) cellClass += ' target'

            strHTML += `\t<td data-i="${i}" data-j="${j}" class="cell + ${cellClass} + " onclick="moveTo(${i} , ${j})">\n`

            switch (currCell.gameElement) {
                case GAMER:
                    strHTML += GAMER_IMG
                    break;

                case BOX:
                    strHTML += BOX_IMG
                    break;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function moveTo(i, j) {
    if (gIsStuck) return
    if (!gIsGameOn) return
    checkGameOver()

    gCountMoves--
    renderScore()
    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;

    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);
    
    if ((iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0)) {
        
        if (targetCell.gameElement === CLOCK) {
            gCountMoves += 10
            currGamerCell(i, j)
            renderScore()
        }
        if (targetCell.gameElement === GOLD) {
            gCountMoves += 100
            currGamerCell(i, j)
        }
        if (targetCell.gameElement === GLUE) {
            gIsStuck = true
            currGamerCell(i, j)
            renderGamerGlueCell(i, j)
            setTimeout(function () {
                gIsStuck = false
            }, 3500);
        }
        
        // MOVING from current position
        //REMOVE
        // Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
        // Dom:
        renderCell(gGamerPos, '');
        
        // MOVING to selected position
        //ADD
        // Model:
        gGamerPos.i = i;
        gGamerPos.j = j;
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
        
        // DOM:
        renderCell(gGamerPos, GAMER_IMG);
    }
}

function moveBox(i, j) {
    if (gBoard[i][j].type === WALL) return
    gBoard[i][j].gameElement = BOX
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    var nextPosition = { i, j }
    if (gBoard[i][j].type === TARGET) {
        renderCell(nextPosition, BOX_TARGET_IMG)
    } else {
        renderCell(nextPosition, BOX_IMG)
    }
}


function handleKey(event) {
    
    var i = gGamerPos.i;
    var j = gGamerPos.j;
    
    switch (event.key) {
        case 'ArrowLeft':
            if (gBoard[i][j - 1].gameElement === BOX) {
                if (gBoard[i][j - 2].type === WALL ||
                    gBoard[i][j - 2].gameElement === BOX) return
                moveBox(i, j - 2)
            }
            moveTo(i, j - 1)
            checkGameVictory()
            break;
        case 'ArrowRight':
            if (gBoard[i][j + 1].gameElement === BOX) {
                if (gBoard[i][j + 2].type === WALL ||
                    gBoard[i][j + 2].gameElement === BOX) return
                moveBox(i, j + 2)
            }
            moveTo(i, j + 1);
            checkGameVictory()
            break;
        case 'ArrowUp':
            if (gBoard[i - 1][j].gameElement === BOX) {
                if (gBoard[i - 2][j].type === WALL ||
                    gBoard[i - 2][j].gameElement === BOX) return
                moveBox(i - 2, j);
            }
            moveTo(i - 1, j);
            checkGameVictory()
            break;
        case 'ArrowDown':
            if (gBoard[i + 1][j].gameElement === BOX) {
                if (gBoard[i + 2][j].type === WALL || gBoard[i + 2][j].gameElement === BOX) return
                moveBox(i + 2, j)
                
            }
            moveTo(i + 1, j);
            checkGameVictory()
            break;
    }
}

function currGamerCell(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) {
                renderGamerGoldCell(i, j)
            }
        }
    }
}

//Checks
function checkGameVictory() {

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.gameElement === BOX) {
                if (currCell.type === FLOOR) {
                    return
                }
            }
        }
    }
    gIsVictory = true
    gIsGameOn = false
    
    console.log('Victory');
    clearInterval(gGlueInterval)
    clearInterval(gGoldInterval)
    clearInterval(gClockInterval)
    showWinModal()
}



function checkGameOver() {
    if (gCountMoves === 0) {
        showLoseModal()
        console.log('KKK');
        gIsGameOn = false
    }
}

//Add/Remove gameElements
function addGameElement(element, img) {
    var randLocation = getEmptyCell()
    if (!randLocation) return
    var cell = gBoard[randLocation.i][randLocation.j]
    //Update the MODEL
    cell.gameElement = element
    //Update the DOM
    renderCell(randLocation, img)
    removeGameElement(element, cell, randLocation)
}
function removeGameElement(gameElement, cell, location) {
    setTimeout(function () {
        if (cell.gameElement === gameElement) {
            cell.gameElement = null
            renderCell(location, '')
        }
    }, 3500);
}

//Modals
function showLoseModal() {
    clearInterval(gGlueInterval)
    clearInterval(gGoldInterval)
    clearInterval(gClockInterval)

    var elModal = document.querySelector('.lose-modal')
    elModal.style.display = 'block'
    elModal.innerHTML = ` <h1>You Lost Man!!</h1> <h3> Click to restart</h3>   <br><br><br><br>   <button class="restart" onclick="initGame()">
    restart Game</button>`
}
function showWinModal() {
    var elModal = document.querySelector('.win-modal')
    elModal.style.display = 'block'
    elModal.innerHTML = ` <h1>You Won!!!!! Lets goooo </h1> <h3> Click to restart</h3>   <br><br><br><br>   <button class="restart" onclick="initGame()">
    restart Game</button>`

}
function hideModals() {
    var elWinModal = document.querySelector('.win-modal')
    var elLoseModal = document.querySelector('.lose-modal')
    elWinModal.style.display = 'none'
    elLoseModal.style.display = 'none'
}

//Renders
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

function renderScore() {
    var elScore = document.querySelector('.score span')
    elScore.innerHTML = gCountMoves
}

function renderToRegularCell(i, j) {
    setTimeout(function () {
        var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
        elCell.style.background = 'gray';
        return elCell
    }, 3500);

}

function renderGamerGoldCell(i, j) {
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
    elCell.style.background = 'rgb(133, 184, 156)';
    renderToRegularCell(i, j)
    return elCell
}

function renderGamerGlueCell(i, j) {
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
    elCell.style.background = 'rgb(167, 85, 85)';
    return elCell
}
