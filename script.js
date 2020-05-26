const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
context.scale(30, 30);

// sound effects

const audio = new Audio('sound.mp3')
const gameOverAudio = new Audio('gameover.wav')
const thing = new Audio('thing.wav')

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

/*
  create piece
*/

const createPiece = (type) => {
  switch (type) {
    case 'I':
      return [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ];
    case 'L':
      return [
        [0, 2, 0],
        [0, 2, 0],
        [0, 2, 2],
      ];
    case 'J':
      return [
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0],
      ];
    case 'O':
      return [
        [4, 4],
        [4, 4],
      ];
    case 'Z':
      return [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0],
      ];
    case 'S':
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
      ];
    case 'T':
      return [
        [0, 7, 0],
        [7, 7, 7],
        [0, 0, 0],
      ];
  }
}

/*
  arena sweep
*/

const arenaSweep = () => {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y++;

    audio.play();

    if (dropInterval >= 520) {
      dropInterval = dropInterval - 20
    } else {
      dropInterval = 500
    }

    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

/*
  collide
*/

const collide = (arena, player) => {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

/*
  create matrix
*/

const createMatrix = (w, h) => {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

/*
  draw matrix
*/

const drawMatrix = (matrix, offset) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x,
          y + offset.y,
          1, 1);
      }
    });
  });
}

/*
  draw
*/

const draw = () => {
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

/*
  merge
*/

const merge = (arena, player) => {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
  thing.play()
}

/*
  rotate
*/

const rotate = (matrix, dir) => {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
          matrix[y][x],
          matrix[x][y],
        ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

/*
  player drop
*/

const playerDrop = () => {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

/*
  player move
*/

const playerMove = (offset) => {
  player.pos.x += offset;
  if (collide(arena, player)) {
    player.pos.x -= offset;
  }
}

/*
  player reset
*/

const playerReset = () => {
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
    (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    gameOverAudio.play()
    dropInterval = 1000
  }
}

/*
  player rotate
*/

const playerRotate = (dir) => {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

let dropCounter = 0;
var dropInterval = 1000;
let lastTime = 0;

/*
  update
*/

const update = (time = 0) => {
  const deltaTime = time - lastTime;
  dropCounter += deltaTime;

  if (dropCounter > dropInterval) {
    playerDrop();
  }

  lastTime = time;

  draw();
  requestAnimationFrame(update);
}

const updateScore = () => {
  document.querySelector('#score').innerText = `SCORE: ${player.score}`
}

/*
  listens to keypress
*/

document.addEventListener('keydown', event => {
  switch (event.keyCode) {
    case 37:
      playerMove(-1)
      return
    case 39:
      playerMove(1)
      return
    case 40:
      playerDrop()
      return
    case 81:
      playerRotate(-1)
      return
    case 87:
      playerRotate(1)
      return
  }
});

/*
  colors of tetris pieces
*/

const colors = [
  null,
  '#00F0F0',
  '#0000F0',
  '#F0A000',
  '#F0F001',
  '#00F000',
  '#A001F0',
  '#F00100',
];

const arena = createMatrix(12, 20);

playerReset();
updateScore();
update();
