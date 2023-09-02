const canvasId = 'canvas';
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');

  const noOfRows = 20;
  const noOfColumns = 10;
  const cellSize = 20;

  const offset = { x: Math.floor(noOfColumns / 2) - 1, y: -2 };

  function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.strokeStyle = 'lightgray';
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }

  const VACANT = 'WHITE';
  let board = [];
  for (r = 0; r < noOfRows; r++) {
    board[r] = [];
    for (c = 0; c < noOfColumns; c++) {
      board[r][c] = VACANT;
    }
  }

  function drawBoard() {
    for (r = 0; r < noOfRows; r++) {
      for (c = 0; c < noOfColumns; c++) {
        drawSquare(c, r, board[r][c]);
      }
    }
  }

  const blocks = [
    [Z, 'red'],
    [S, 'green'],
    [T, 'yellow'],
    [O, 'blue'],
    [L, 'purple'],
    [I, 'cyan'],
    [J, 'orange'],
  ];

  function randomBlock() {
    let r = (randomN = Math.floor(Math.random() * blocks.length));
    return { blockName: blocks[r][0], blockColor: blocks[r][1] };
  }

  let { blockName, blockColor } = randomBlock();

  let activeBlock = [];
  let blockIndex = 0;
  activeBlock = blockName[blockIndex];

  function drawBlock(blockColor, offset) {
    activeBlock.forEach((row, i) => {
      row.forEach((val, j) => {
        if (val !== 0) {
          drawSquare(j + offset.x, i + offset.y, blockColor);
        }
      });
    });
  }

  function drawWorld(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawBlock(blockColor, offset);
  }

  function rotateBlock() {
    let nextPattern = blockName[(blockIndex + 1) % blockName.length];
    let kick = 0;
    if (collision(0, 0, nextPattern)) {
      if (offset.x > noOfColumns / 2) {
        kick = -1;
      } else {
        kick = 1;
      }
    }

    if (!collision(kick, 0, nextPattern)) {
      offset.x += kick;
      blockIndex = (blockIndex + 1) % blockName.length;
      activeBlock = blockName[blockIndex];
    }
  }

  let lastAnimationTime;
  let gameOver = false;
  const step = (time) => {
    if (!lastAnimationTime) {
      lastAnimationTime = time;
    } else if (time - lastAnimationTime > 1000) {
      lastAnimationTime = time;
      moveDown();
    }
    if (!gameOver) {
      drawWorld(ctx);
      window.requestAnimationFrame(step);
    }
  };

  document.addEventListener('keyup', (evt) => {
    console.log('keyup', evt.key);
    switch (evt.key) {
      case 'ArrowLeft':
        if (!collision(-1, 0, activeBlock)) {
          offset.x--;
        }
        break;
      case 'ArrowRight':
        if (!collision(1, 0, activeBlock)) {
          offset.x++;
        }
        break;
      case 'ArrowUp':
        rotateBlock();
        break;
      case 'ArrowDown':
        moveDown();
        break;
    }
  });
  window.requestAnimationFrame(step);

  function collision(x, y, block) {
    for (r = 0; r < block.length; r++) {
      for (c = 0; c < block.length; c++) {
        if (!block[r][c]) {
          continue;
        }
        let newX = offset.x + c + x;
        let newY = offset.y + r + y;

        if (newX < 0 || newX >= noOfColumns || newY >= noOfRows) {
          return true;
        }
        if (newY < 0) {
          continue;
        }
        if (board[newY][newX] != VACANT) {
          return true;
        }
      }
    }
    return false;
  }

  function moveDown() {
    if (!collision(0, 1, activeBlock)) {
      offset.y++;
    } else {
      lock(activeBlock, blockColor);
      let p = randomBlock();
      blockName = p.blockName;
      blockColor = p.blockColor;
      blockIndex = 0;
      activeBlock = blockName[blockIndex];
      offset.x = Math.floor(noOfColumns / 2) - 1;
      offset.y = -2;
    }
  }

  let score = 0;
  function lock(block, color) {
    for (r = 0; r < block.length; r++) {
      for (c = 0; c < block.length; c++) {
        if (!block[r][c]) {
          continue;
        }
        if (offset.y + r < 0) {
          alert('Game Over');
          gameOver = true;
          break;
        }
        board[offset.y + r][offset.x + c] = color;
      }
    }
    for (r = 0; r < noOfRows; r++) {
      let isRowFull = true;
      for (c = 0; c < noOfColumns; c++) {
        isRowFull = isRowFull && board[r][c] != VACANT;
      }
      if (isRowFull) {
        for (y = r; y > 1; y--) {
          for (c = 0; c < noOfColumns; c++) {
            board[y][c] = board[y - 1][c];
          }
        }
        for (c = 0; c < noOfColumns; c++) {
          board[0][c] = VACANT;
        }
        score = score + 10;
      }
    }

    document.getElementById('score').innerHTML = score;
  }
});
