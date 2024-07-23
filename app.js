let start = Date.now();
let time = 0;
const canvas = document.getElementsByTagName('canvas')[0];
const context = canvas.getContext('2d');
let data;
let img = new Image();
let img1 = new Image();
let img2 = new Image();
let img3 = new Image();
let hiddenCanvas = document.createElement('canvas');
let mouse = {
  x: -1,
  y: -1
};
let mouseInCanvas = false;
let captureLink;
const allowedTypes = ['image/png', 'image/jpeg'];

let squares = [];
let maxTime = 150;
let minSide;


img1.src = 'images/neko.png';
img2.src = 'images/sirena.png';
img3.src = 'images/trigo.png';

img = img1;

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
    this.state = "birth";
    this.birthTime = time;
  };

  update() {
    if (this.state == 'birth') {
      if (time - this.birthTime > maxTime) {
        this.state = 'live';
      }
    }
  };

  show() {
    if (this.state == "birth") {
      let colorString = 'rgba(';
      let aux = getImagePixel(this.x + this.side / 2, this.y + this.side / 2)[0];
      colorString += aux.toString(10) + ',';
      aux = getImagePixel(this.x + this.side / 2, this.y + this.side / 2)[1];
      colorString += aux.toString(10) + ',';
      aux = getImagePixel(this.x + this.side / 2, this.y + this.side / 2)[2];
      colorString += aux.toString(10) + ',';
      aux = (time - this.birthTime) * 1 / maxTime
      colorString += aux.toString(10) + ')'

      context.fillStyle = colorString;
      context.fillRect(imageToCanvasCoord(this.x, this.y)[0], imageToCanvasCoord(this.x, this.y)[1], imageToCanvasScale(this.side), imageToCanvasScale(this.side));

      aux = Math.floor(256 * Math.random());
      colorString = 'rgb(' + aux.toString(10) + ',' + aux.toString(10) + ',' + aux.toString(10) + ')'

      context.lineWidth = imageToCanvasScale(this.side) / 30;
      context.strokeStyle = colorString;
      context.strokeRect(imageToCanvasCoord(this.x, this.y)[0], imageToCanvasCoord(this.x, this.y)[1], imageToCanvasScale(this.side), imageToCanvasScale(this.side));
    }
  };
};

img.addEventListener('load', () => {
  iniciar()
});

function iniciar() {
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

  setTimeout(() => {
    if (img.width < img.height) {
      squares[0] = new Square(0, Math.floor((img.height - img.width) / 2), img.width);
    } else {
      squares[0] = new Square(Math.floor((img.width - img.height) / 2), 0, img.height);
    }
  }, 100);

}

let loop = setInterval(game, 10);

function game() {
  time = Date.now() - start;

  for (i = 0; i < squares.length; i++) {
    if (
      mouseInCanvas &&
      mouse.x < squares[i].x + squares[i].side &&
      mouse.x > squares[i].x &&
      mouse.y < squares[i].y + squares[i].side &&
      mouse.y > squares[i].y &&
      squares[i].side > minSide &&
      squares[i].state == 'live'
    ) {
      squares.push(
        new Square(squares[i].x, squares[i].y, Math.ceil(squares[i].side / 2))
      );
      squares.push(
        new Square(
          squares[i].x + Math.floor(squares[i].side / 2),
          squares[i].y,
          Math.ceil(squares[i].side / 2)
        )
      );
      squares.push(
        new Square(
          squares[i].x,
          squares[i].y + Math.floor(squares[i].side / 2),
          Math.ceil(squares[i].side / 2)
        )
      );
      squares.push(
        new Square(
          squares[i].x + Math.floor(squares[i].side / 2),
          squares[i].y + Math.floor(squares[i].side / 2),
          Math.ceil(squares[i].side / 2)
        )
      );
      squares.splice(i, 1)
      i--;
      break;
    };
  };

  for (i = 0; i < squares.length; i++) {
    squares[i].update()
    squares[i].show()

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
    img = img1;
  };
  if (radioValue == 'image-2') {
    img = img2;
  };
  if (radioValue == 'image-3') {
    img = img3;
  };

  iniciar();

  window.location.href = '#'
})


captureLink = document.createElement('a');
captureLink.download = 'Pixénesis.png';
document.getElementById('save-btn').addEventListener('click', () => {
  captureLink.href = canvas.toDataURL("image/png", 1.0);
  captureLink.click();
})

document.getElementById('input-file').addEventListener('input', (ev) => {
  if (ev.target.files[0]) {
    if (!allowedTypes.includes(ev.target.files[0].type)) {
      document.getElementById('file-rejected').style.display = 'block';
      return 0;
    };

    document.getElementById('file-rejected').style.display = 'none';

    img.src = URL.createObjectURL(ev.target.files[0]);
    setTimeout(() => { iniciar();}, 300);
  };

  for(i = 0; i < 3; i ++)
  document.getElementsByClassName('image-radio')[i].checked = false;
});

