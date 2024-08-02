let started = true;
let imageLoaded = true;
let startTime = Date.now();
let time = 0;
let lastImageUploaded = '';
const canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');
let data;
let img = new Image();
let hiddenCanvas = document.createElement('canvas');
let mouse = {
  x: -1.0,
  y: -1.0
};
let mouseInCanvas = false;
let captureLink;
const allowedTypes = ['image/png', 'image/jpeg'];

let squares = [];
let maxTime = 230;
let minSide;

img.src = 'images/neko.png';

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

canvas.addEventListener("mouseover", () => {
  mouseInCanvas = true;
})

canvas.addEventListener("mouseout", () => {
  mouseInCanvas = false;
})

canvas.addEventListener("mousemove", (ev) => {
  mouse.x = canvasToImageCoord(ev.clientX - ev.target.getBoundingClientRect().left, ev.clientY)[0];
  mouse.y = canvasToImageCoord(ev.clientX, ev.clientY - ev.target.getBoundingClientRect().top)[1];
})

class Square {
  constructor(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
    this.showing = true;
    this.initialTime = time;
    this.showed = false;
    this.strokeColor;
    this.fillColor;
  };

  setColors() {
    let aux = Math.floor(256 * Math.random());
    this.strokeColor = 'rgb(' + aux.toString(10) + ',' + aux.toString(10) + ',' + aux.toString(10) + ')'
  }
  update() {
    if (this.showing) {
      if (time - this.initialTime > maxTime) {
        this.showing = false;
      }
    }
  };

  show() {
    if (this.showing) {
      this.fillColor = 'rgb(';
      let aux = getImagePixel(this.x + this.side / 2, this.y + this.side / 2)[0];
      this.fillColor += aux.toString(10) + ',';
      aux = getImagePixel(this.x + this.side / 2, this.y + this.side / 2)[1];
      this.fillColor += aux.toString(10) + ',';
      aux = getImagePixel(this.x + this.side / 2, this.y + this.side / 2)[2];
      this.fillColor += aux.toString(10) + ',';
      aux = (time - this.initialTime) * 1 / maxTime
      this.fillColor += aux.toString(10) + ')'



      context.fillStyle = this.fillColor;
      context.fillRect(imageToCanvasCoord(this.x, this.y)[0], imageToCanvasCoord(this.x, this.y)[1], imageToCanvasScale(this.side), imageToCanvasScale(this.side));

      aux = Math.floor(256 * Math.random());
      let colorString = 'rgb(' + aux.toString(10) + ',' + aux.toString(10) + ',' + aux.toString(10) + ')'

      context.lineWidth = imageToCanvasScale(this.side) / 30;
      context.strokeStyle = colorString;
      context.strokeRect(imageToCanvasCoord(this.x, this.y)[0], imageToCanvasCoord(this.x, this.y)[1], imageToCanvasScale(this.side), imageToCanvasScale(this.side));
    }

  };
};

img.addEventListener('load', () => {
  started = false;
  imageLoaded = true;
});

function start() {
  if (img.width == 0) {
    return 0
  }

  hiddenCanvas.width = img.width;
  hiddenCanvas.height = img.height;
  hiddenCanvas.getContext('2d').drawImage(img, 0, 0);
  data = hiddenCanvas.getContext('2d').getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height).data;

  if (img.width < img.height) {
    minSide = img.width / 32;
  } else {
    minSide = img.height / 32;
  }
  squares.splice(0, squares.length);

  if (img.width < img.height) {
    squares[0] = new Square(0, Math.floor((img.height - img.width) / 2), img.width);
  } else {
    squares[0] = new Square(Math.floor((img.width - img.height) / 2), 0, img.height);
  }
  squares[0].setColors();

  started = true;
}

let loop = setInterval(game, 10);

function game() {
  if (!imageLoaded) {
    start();
    return 0;
  }
  if (!started) {
    start();
    return 0;
  }
  time = Date.now() - startTime;

  for (i = 0; i < squares.length; i++) {
    if (
      mouseInCanvas &&
      mouse.x < squares[i].x + squares[i].side &&
      mouse.x > squares[i].x &&
      mouse.y < squares[i].y + squares[i].side &&
      mouse.y > squares[i].y &&
      squares[i].side > minSide &&
      !squares[i].showing
    ) {
      squares.push(
        new Square(squares[i].x, squares[i].y, squares[i].side / 2)
      );
      squares.push(
        new Square(
          squares[i].x + squares[i].side / 2,
          squares[i].y,
          squares[i].side / 2
        )
      );
      squares.push(
        new Square(
          squares[i].x,
          squares[i].y + squares[i].side / 2,
          squares[i].side / 2
        )
      );
      squares.push(
        new Square(
          squares[i].x + squares[i].side / 2,
          squares[i].y + squares[i].side / 2,
          squares[i].side / 2
        )
      );
      squares[squares.length - 1].setColors();
      squares[squares.length - 2].setColors();
      squares[squares.length - 3].setColors();
      squares[squares.length - 4].setColors();
      squares.splice(i, 1)
      i--;
      break;
    };
  };

  for (i = 0; i < squares.length; i++) {
    squares[i].show()
    squares[i].update()
  };
};


function getImagePixel(x, y) {
  x = Math.floor(x);
  y = Math.floor(y);
  let position = 4 * (x - 1) + 4 * (y - 1) * img.width;
  return [data[position], data[position + 1], data[position + 2], data[position + 3]];
};

function imageToCanvasCoord(x, y) {
  let canvasX
  let canvasY
  if (img.width < img.height) {
    canvasX = x * canvas.width / img.width;
    canvasY = y * canvas.width / img.width - (img.height * canvas.width / img.width - canvas.width) / 2;
  } else {
    canvasX = x * canvas.width / img.height - (img.width * canvas.width / img.height - canvas.width) / 2;
    canvasY = y * canvas.width / img.height;
  };
  return [canvasX, canvasY]
};

function canvasToImageCoord(x, y) {
  let imageX;
  let imageY;
  if (img.width < img.height) {
    imageX = x * img.width / canvas.width;
    imageY = y * img.width / canvas.width + (img.height - img.width) / 2;
  } else {
    imageX = x * img.height / canvas.width + (img.width - img.height) / 2;
    imageY = y * img.height / canvas.width;
  }
  return [imageX, imageY];
}


function imageToCanvasScale(num) {
  if (img.width < img.height) {
    return num * canvas.width / img.width;
  } else {
    return num * canvas.width / img.height;
  };
};

function canvasToImageScale(num) {
  if (img.width < img.height) {
    return num * img.width / canvas.width;
  } else {
    return num * img.height / canvas.width;
  };
};

document.getElementById('images-buttons-div').addEventListener('change', () => {
  let radioValue = document.querySelector('input[type=radio]:checked').value;

  if (radioValue == 'image-1') {
    img.src = 'images/neko.png';

  };
  if (radioValue == 'image-2') {
    img.src = 'images/sirena.png';

  };
  if (radioValue == 'image-3') {
    img.src = 'images/trigo.png';
  };
})


captureLink = document.createElement('a');
captureLink.download = 'Pixénesis.png';
document.getElementById('save-btn').addEventListener('click', () => {
  captureLink.href = canvas.toDataURL("image/png", 1.0);
  captureLink.click();
})


document.getElementById('input-file').addEventListener('click', () => {
  if (img.src != lastImageUploaded) {
    img.src = lastImageUploaded;
    imageLoaded = false;
  }
});

document.getElementById('input-file').addEventListener('input', (ev) => {
  if (ev.target.files[0]) {
    if (!allowedTypes.includes(ev.target.files[0].type)) {
      document.getElementById('file-rejected').style.display = 'block';
      return 0;
    };

    document.getElementById('file-rejected').style.display = 'none';
    lastImageUploaded = URL.createObjectURL(ev.target.files[0]);
    img.src = lastImageUploaded;

    for (i = 0; i < 3; i++)
      document.getElementsByClassName('image-radio')[i].checked = false;

    imageLoaded = false;
  };
});

