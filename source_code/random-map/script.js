// CONSTANTS
const blue = "blue";
const red = "red";
const white = "white";
const black = "black";
const grey = "grey";

const height = 10;
const width = 10;
const N = Math.floor(window.innerHeight / (height + 2));
const M = Math.floor(window.innerWidth / (width + 2));

const gridCtr = document.getElementsByClassName("grid")[0]
gridCtr.style.gridTemplateColumns = `repeat(${M}, ${width}px)`;
gridCtr.style.gridTemplateRows = `repeat(${N}, ${height}px)`;

for (el of gridCtr.children) {
  el.style.height = height;
  el.style.width = width;
}

let array = Array.from({ length: N }, () => Array(M).fill(0));

const deltaMap = {
  "D": {
    "R": [2, [0, 1]], // [ # of times to apply the move, move]
    "L": [2, [0, -1]],
    "D": [1, [1, 0]]
  },
  "U": {
    "R": [2, [0, 1]],
    "L": [2, [0, -1]],
    "U": [1, [-1, 0]]
  },
  "L": {
    "U": [2, [-1, 0]],
    "D": [2, [1, 0]],
    "L": [1, [0, -1]]
  },
  "R": {
    "U": [2, [-1, 0]],
    "D": [2, [1, 0]],
    "R": [1, [0, 1]]
  }
}


// Tune these to control density of the map
// Frequency with which decision should be made.
let turnFrequency = 10;
// Probability for decision to turn to be succesful.
let turnProbability = 300;


/*
--------- HELPER METHODS ----------
START
*/

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

let invalid = (x, y) => {
  return (x < 0 || x >= N || y < 0 || y >= M || array[x][y] == 1);
}

let hasAdjacentLine = (x, y, dir) => {
  if ((dir == "R" || dir == "L") &&
    (invalid(x - 1, y) || invalid(x + 1, y))
  ) return true;

  if ((dir == "U" || dir == "D") &&
    (invalid(x, y - 1) || invalid(x, y + 1))
  ) return true;

  return false;
}

let randomizeFreq = (val) => val > 0 ? val - 1 : getRandomInt(turnFrequency);

lastElement = [1, 1];
function colorElement(i, j, cell) {
  if (i == 1 && j == 1) {
    cell.style.backgroundColor = red;
  } else if (array[i][j] == 1) {
    if (i >= lastElement[0] && j >= lastElement[1]) lastElement = [i, j];
    cell.style.backgroundColor = grey;
  }
}

function createGrid(rows, cols, reset) {
  const gridContainer = document.getElementById('grid');

  // Clear any existing grid content
  gridContainer.innerHTML = '';

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement('div');
      cell.id = `${i},${j}`;
      colorElement(i, j, cell);
      gridContainer.appendChild(cell);
    }
  }
};

function resetGrid() {
  console.log("Resetting Grid")

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      let id = `${i},${j}`;
      const cell = document.getElementById(id);
      cell.style.backgroundColor = white;
      colorElement(i, j, cell);
    }
  }
  colorLastElement();
}

function colorLastElement() {
  document.getElementById(`${lastElement[0]},${lastElement[1]}`).style.backgroundColor = red;
}

function discolorLastElement() {
  document.getElementById(`${lastElement[0]},${lastElement[1]}`).style.backgroundColor = grey;
  lastElement = [1, 1];
}
/*
END
--------- HELPER METHODS ----------
*/



/*
---------------------------------------- MAIN TRAVEL -----------------------
*/

function travel(x, y, dir, movesBeforeTurning) {
  if (invalid(x, y)) return;

  array[x][y] = 1;

  // Tune this to control density of the map
  dontTurn = turnProbability > getRandomInt(1000);
  if (dontTurn || movesBeforeTurning > 0) {
    let move = deltaMap[dir][dir][1];
    let nextX = x + move[0];
    let nextY = y + move[1];

    if (invalid(nextX, nextY) || hasAdjacentLine(nextX, nextY, dir)) return;

    return travel(nextX, nextY, dir, randomizeFreq(movesBeforeTurning));
  }

  for (d in deltaMap[dir]) {
    count = deltaMap[dir][d][0];
    move = deltaMap[dir][d][1];

    if (invalid(x + count * move[0], y + count * move[1]))
      continue;

    let nextX = x + count * move[0];
    let nextY = y + count * move[1];

    if (hasAdjacentLine(nextX, nextY, d)) continue;

    array[x + move[0]][y + move[1]] = 1;

    travel(nextX, nextY, d, randomizeFreq(movesBeforeTurning));
  }
}

travel(1, 1, "D");
createGrid(N, M);
colorLastElement();

/* ------------------------------ END MAIN TRAVEL -------------------------------------------- */



/*
--------- TRAVERSAL ALGORITHMS ----------
START
*/

dx = [0, 0, -1, 1]
dy = [1, -1, 0, 0]

function dfs(x, y, path) {
  cell = document.getElementById(`${x},${y}`);
  if (cell.style.backgroundColor == blue) return false;
  cell.style.backgroundColor = blue;

  setTimeout(() => { }, 1000);

  if (x == lastElement[0] && y == lastElement[1]) {
    path.push([x, y]);
    return true;
  }

  for (let i = 0; i < 4; i++) {
    let ddx = x + dx[i]
    let ddy = y + dy[i]

    if (ddx < 1 || ddy < 1 || ddx >= N || ddy >= M || array[ddx][ddy] == 0
      || document.getElementById(`${ddx},${ddy}`).style.backgroundColor == blue
    ) continue;

    cellInPath = dfs(ddx, ddy, path);
    if (cellInPath) {
      path.push([x, y]);
      return true;
    }
  }

  return false;
}

function colorPath(path, color) {
  resetGrid();
  for (let i = 0; i < path.length; i++) {
    document.getElementById(`${path[i][0]},${path[i][1]}`).style.backgroundColor = color;
  }
}

function bfs() {
  prevMap = {}
  let q = [];
  start = [1, 1]
  q.push(start);
  document.getElementById("1,1").style.backgroundColor = blue
  while (q.length != 0) {
    cur = q.shift();
    let x = cur[0]
    let y = cur[1]
    if (cur[0] == lastElement[0] && cur[1] == lastElement[1]) {
      break;
    }
    for (let i = 0; i < 4; i++) {
      let ddx = x + dx[i]
      let ddy = y + dy[i]

      id = `${ddx},${ddy}`;
      if (ddx < 1 || ddy < 1 || ddx >= N || ddy >= M || array[ddx][ddy] == 0
        || document.getElementById(id).style.backgroundColor == blue
      ) continue;

      document.getElementById(id).style.backgroundColor = blue
      q.push([ddx, ddy]);
      prevMap[[ddx, ddy]] = cur;
    }
  }

  path = [];
  cur = lastElement
  while (prevMap[cur] != undefined) {
    path.push(prevMap[cur]);
    cur = prevMap[cur];
  }
  colorPath(path, red);
}


/*
END
--------- TRAVERSAL ALGORITHMS ----------
*/


/*
--------- EVENT LISTENERS ----------
START
*/

document.getElementById("bfs").onclick = () => {
  resetGrid();
  bfs();
}


document.getElementById("dfs").onclick = () => {
  resetGrid();
  path = []
  dfs(1, 1, path);
  colorPath(path, red);
}

document.getElementById("reset").onclick = () => resetGrid();

document.getElementById("refresh").onclick = function () {
  discolorLastElement();
  turnProbability = getRandomInt(300);
  array = Array.from({ length: N }, () => Array(M).fill(0));
  travel(1, 1, "D");
  resetGrid(N, M);
  colorLastElement();
};

const slider = document.getElementById("turnFrequencySlider");
slider.addEventListener("change", function () {
  discolorLastElement();
  turnFrequency = slider.value;
  array = Array.from({ length: N }, () => Array(M).fill(0));
  travel(1, 1, "D");
  resetGrid(N, M);
  colorLastElement();
});


/*
END
--------- EVENT LISTENERS ----------
*/