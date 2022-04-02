"use strict";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const level = document.querySelector(".level");
let currentLevel = 1;
const tissueScore = document.querySelector(".tissue");
let tissueCurrentScore = 0;
const waterBucketScore = document.querySelector(".water");
let waterCurrentScore = 0;

let canvasSize = window.innerWidth / 2.5;

let gridCount = 3;
let cellSize = 100;

const visitedCell = [];
const cells = [];
const carrots = [];

let player = undefined;

// Images
let background,
  character,
  door,
  vertical,
  horizontal,
  carrot,
  mask,
  tissue,
  water,
  tissueSound,
  waterSound,
  flushSound;

let increments = 0;

function init() {
  visitedCell.length = 0;
  cells.length = 0;

  const difficulty = "easy";

  if (canvasSize % 2 !== 0) {
    canvasSize += 1;
  }

  switch (difficulty) {
    case "easy":
      gridCount = 4;
      break;
    case "medium":
      gridCount = 30;
      break;
    case "hard":
      gridCount = 50;
      break;
    case "nightmare":
      gridCount = 100;
      break;
  }
  gridCount += increments;

  cellSize = Math.ceil(canvasSize / gridCount);
  canvasSize = gridCount * cellSize;

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  player = new Player({ color: "pink" });

  background = rqeuestImage("./img/Background.jpg", true);
  character = rqeuestImage("./img/Character.png", false);
  door = rqeuestImage("./img/Door.png", false);
  vertical = rqeuestImage("./img/Vertical.png", true);
  horizontal = rqeuestImage("./img/Horizontal.png", true);
  carrot = rqeuestImage("./img/Carrots.png", false);
  mask = rqeuestImage("./img/Mask.png", true);
  tissue = rqeuestImage("./img/Tissue.png", false);
  water = rqeuestImage("./img/Water.png", false);
  tissueSound = new Audio("./audio/tissue-sound.mp3");
  waterSound = new Audio("./audio/water-sound.mp3");
  flushSound = new Audio("./audio/flush-sound.mp3");

  createGrid();
  animate();
}

class Carrots {
  constructor({ x, y, image, audio }) {
    this.position = {
      x,
      y,
    };
    this.image = image;
    this.audio = audio;
  }

  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      cellSize,
      cellSize
    );
  }

  update() {
    this.draw();
  }
}

class Cell {
  constructor({ x, y, up, down, left, right }) {
    this.position = {
      x,
      y,
    };
    this.up = up;
    this.down = down;
    this.right = right;
    this.left = left;
  }

  draw() {
    c.drawImage(
      door,
      canvas.width - cellSize,
      canvas.height - cellSize,
      cellSize,
      cellSize
    );

    if (!this.up) {
      //   c.drawImage(
      //     horizontal,
      //     this.position.x,
      //     this.position.y - horizontal.height / 2
      //   );
      c.beginPath();
      c.strokeStyle = "rgba(34, 67, 4, 1)";
      c.lineWidth = "5";
      c.moveTo(this.position.x, this.position.y);
      c.lineTo(this.position.x + cellSize, this.position.y);
      c.stroke();
    }
    if (!this.down) {
      //   c.drawImage(
      //     horizontal,
      //     this.position.x,
      //     this.position.y + cellSize - horizontal.height / 2
      //   );
      c.beginPath();
      c.strokeStyle = "rgba(34, 67, 4, 1)";
      c.moveTo(this.position.x, this.position.y + cellSize);
      c.lineTo(this.position.x + cellSize, this.position.y + cellSize);
      c.stroke();
    }
    if (!this.left) {
      //   c.drawImage(
      //     vertical,
      //     this.position.x - horizontal.height / 2,
      //     this.position.y
      //   );
      c.beginPath();
      c.strokeStyle = "rgba(34, 67, 4, 1)";
      c.moveTo(this.position.x, this.position.y);
      c.lineTo(this.position.x, this.position.y + cellSize);
      c.stroke();
    }
    if (!this.right) {
      //   c.drawImage(
      //     vertical,
      //     this.position.x + cellSize - horizontal.height / 2,
      //     this.position.y
      //   );
      c.beginPath();
      c.strokeStyle = "rgba(34, 67, 4, 1)";
      c.moveTo(this.position.x + cellSize, this.position.y);
      c.lineTo(this.position.x + cellSize, this.position.y + cellSize);
      c.stroke();
    }
  }

  update() {
    this.draw();
  }
}

class Player {
  constructor({ color }) {
    this.position = {
      x: 0,
      y: 0,
    };
    this.width = cellSize;
    this.height = cellSize;
    this.color = color;
    this.winner = false;
  }

  move(direction) {
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      if (
        this.position.y === cell.position.y &&
        this.position.x === cell.position.x
      ) {
        switch (direction) {
          case "up":
            if (cell.up) {
              this.position.y -= cellSize;
              return;
            }
            break;
          case "down":
            if (cell.down) {
              this.position.y += cellSize;
              return;
            }
            break;
          case "left":
            if (cell.left) {
              this.position.x -= cellSize;
              return;
            }
            break;
          case "right":
            if (cell.right) {
              this.position.x += cellSize;
              return;
            }
            break;
        }
      }
    }
  }

  draw() {
    // c.fillStyle = this.color;
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);
    character.width = this.width;
    character.height = this.height;

    c.drawImage(
      character,
      this.position.x,
      this.position.y,
      cellSize,
      cellSize
    );
    // c.drawImage(
    //   mask,
    //   this.position.x - canvas.width + this.width / 2,
    //   this.position.y - canvas.height + this.height / 2
    // );

    // c.fillStyle = "black";
    // c.fillRect(0, 0, canvas.width, canvas.height);
    // c.clearRect(
    //   this.position.x - this.width / 2,
    //   this.position.y - this.height / 2,
    //   this.width * 2,
    //   this.height * 2
    // );
  }

  update() {
    if (this.winner) return;
    if (
      this.position.x === canvas.width - cellSize &&
      this.position.y === canvas.height - cellSize &&
      carrots.length <= 0
    ) {
      flushSound.play();
      console.log("You Won");
      this.winner = true;
      increments += 2;

      currentLevel++;
      level.textContent = `Level: ${currentLevel}`;

      init();
    }

    carrots.forEach((carrot, index) => {
      if (
        this.position.x === carrot.position.x &&
        this.position.y === carrot.position.y
      ) {
        switch (carrot.audio) {
          case "tissue":
            tissueSound.pause();
            tissueSound.currentTime = 0;
            tissueSound.play();
            tissueCurrentScore++;
            tissueScore.textContent = `Tissue: ${tissueCurrentScore}`;
            break;
          case "water":
            waterSound.pause();
            waterSound.currentTime = 0;
            waterSound.play();
            waterCurrentScore++;
            waterBucketScore.textContent = `Water Bucket: ${waterCurrentScore}`;
            break;
        }
        carrots.splice(index, 1);
      }
    });

    this.draw();
  }
}

function createGrid() {
  let currentCell = [0, 0];
  let cell = new Cell({
    x: currentCell[0],
    y: currentCell[1],
    up: false,
    down: false,
    left: false,
    right: false,
  });
  visitedCell.push(cell);

  let visitedUp = false;
  let visitedDown = false;
  let visitedLeft = false;
  let visitedRight = false;

  while (visitedCell.length !== 0) {
    if (visitedCell.length === 1 && cells.length >= gridCount ** 2 - 2) {
      const finalCell = visitedCell.pop();
      cells.push(finalCell);
      return;
    }

    const direction = getDirection();
    let nextCellCoords;

    switch (direction) {
      case "up":
        nextCellCoords = [cell.position.x, cell.position.y - cellSize];
        visitedUp = true;
        break;
      case "down":
        nextCellCoords = [cell.position.x, cell.position.y + cellSize];
        visitedDown = true;
        break;
      case "left":
        nextCellCoords = [cell.position.x - cellSize, cell.position.y];
        visitedLeft = true;
        break;
      case "right":
        nextCellCoords = [cell.position.x + cellSize, cell.position.y];
        visitedRight = true;
        break;
    }

    if (
      nextCellCoords[0] >= 0 &&
      nextCellCoords[0] + cellSize <= canvas.width &&
      nextCellCoords[1] >= 0 &&
      nextCellCoords[1] + cellSize <= canvas.height
    ) {
      // Check if the nextCell is visited then skip if yes
      if (containsClass(cells, nextCellCoords)) continue;

      if (containsClass(visitedCell, nextCellCoords)) {
        if (visitedUp && visitedDown && visitedLeft && visitedRight) {
          const finalCell = visitedCell.pop();

          cells.push(finalCell);

          if (Math.random() < 0.1) {
            if (
              finalCell.position.x === canvas.width - cellSize &&
              finalCell.position.y === canvas.height - cellSize
            ) {
              continue;
            }

            const img = Math.random() < 0.5 ? tissue : water;
            carrots.push(
              new Carrots({
                x: finalCell.position.x,
                y: finalCell.position.y,
                image: img,
                audio: img === tissue ? "tissue" : "water",
              })
            );
          }

          cell = visitedCell[visitedCell.length - 1];

          visitedUp = false;
          visitedDown = false;
          visitedLeft = false;
          visitedRight = false;
        }
      } else {
        visitedUp = false;
        visitedDown = false;
        visitedLeft = false;
        visitedRight = false;

        handleGate(cell, direction, true, true);

        const newCell = new Cell({
          x: nextCellCoords[0],
          y: nextCellCoords[1],
          up: false,
          down: false,
          left: false,
          right: false,
        });

        handleGate(newCell, direction, false, true);
        visitedCell.push(newCell);
        cell = newCell;
      }
    }
  }
}

function containsClass(array, object) {
  for (let i = 0; i < array.length; i++) {
    const arr = array[i];
    if (arr.position.x === object[0] && arr.position.y === object[1]) {
      return true;
    }
  }
  return false;
}

function handleGate(object, direction, regular, open) {
  if (regular) {
    switch (direction) {
      case "up":
        object.up = open;
        break;
      case "down":
        object.down = open;
        break;
      case "left":
        object.left = open;
        break;
      case "right":
        object.right = open;
        break;
    }
  } else {
    switch (direction) {
      case "up":
        object.down = open;
        break;
      case "down":
        object.up = open;
        break;
      case "left":
        object.right = open;
        break;
      case "right":
        object.left = open;
        break;
    }
  }
}

function getDirection() {
  const random = Math.random();
  let direction;
  if (random <= 0.25) {
    direction = "up";
  } else if (random <= 0.5) {
    direction = "down";
  } else if (random <= 0.75) {
    direction = "left";
  } else {
    direction = "right";
  }
  return direction;
}

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
      player.move("up");
      break;
    case "a":
      player.move("left");
      break;
    case "s":
      player.move("down");
      break;
    case "d":
      player.move("right");
      break;
  }
});

function rqeuestImage(src) {
  let image = new Image();
  image.src = src;
  return image;
}

function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.drawImage(background, 0, 0);

  carrots.forEach((carrot) => {
    carrot.update();
  });

  cells.forEach((cell) => cell.update());

  player.update();
}

init();
