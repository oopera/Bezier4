import "./style.css";

var canvas, ctx, rect;
var CP = Array(0);
var line_width = 1;
var point_size = 4;
var back_color = "transparent";
var line_color = " #6e60fb";
var point_color = "#6758F7";
var const_color = "#2b2b2b";
("#daff01");
var handles, lines, interval, autoplay, speed, aop, t;
var depth = 15;
var mouseDown = false;
var hasMoved = 0;
var selectedPoint = false;
var guides = true;

function deCasteljau(points, d = 1) {
  if (points <= 2) {
    return [points];
  }

  if (depth <= d) {
    return [points[0], points[points.length - 1]];
  }

  const start = [],
    end = [];

  calc(points).forEach((i) => {
    start.push(i[0]);
    end.push(i[i.length - 1]);
  });

  return deCasteljau(start, ++d).concat(deCasteljau(end, ++d).reverse());
}

function calc(points, varT = false) {
  if (points.length < 2) {
    return [points];
  }

  varT ? varT : (varT = 0.5);

  var newPoints = [...Array(points.length - 1)];

  newPoints.forEach((_, i) => {
    newPoints[i] = {
      x: varT * points[i].x + (1 - varT) * points[i + 1].x,
      y: varT * points[i].y + (1 - varT) * points[i + 1].y,
    };
  });
  return [points].concat(calc(newPoints, varT));
}

function deletePoint(e) {
  const newPoint = {
    x: e.clientX,
    y: e.clientY,
  };
  if (findPoint(newPoint)) {
    CP.splice(findPoint(newPoint), 1);
    draw();
    return true;
  }
  return false;
}

function draw(e) {
  e && (CP[CP.length] = { x: e.clientX, y: e.clientY });
  if (ctx) {
    ctx.fillStyle = back_color;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = line_width;
    ctx.strokeStyle = line_color;
    if (lines) {
      drawLine(deCasteljau(CP));
    }
    ctx.lineWidth = line_width / 2;
    ctx.strokeStyle = const_color;
    if (guides) {
      calc(CP, t).forEach((line) => {
        drawLine(line);
      });
    }
    if (handles) {
      CP.forEach((i) => drawPoint(i));
    }
  }
}

function drawLine(points) {
  if (points.length < 1) {
    return;
  }
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((slice) => ctx.lineTo(slice.x, slice.y));
  ctx.stroke();
}

function drawPoint(P) {
  ctx.fillStyle = point_color;
  var divisor = 1;
  if (P === selectedPoint) {
    divisor = 1 / 2;
  }
  ctx.fillRect(
    P.x - point_size / 2,
    P.y - point_size / 2,
    point_size / divisor,
    point_size / divisor
  );
}

function findPoint(point) {
  var bool = false;
  for (var i = 0; i < CP.length; ++i) {
    if (
      Math.abs(CP[i].x - point.x) < point_size * 5 &&
      Math.abs(CP[i].y - point.y) < point_size * 5
    ) {
      bool = i;
      return bool;
    }
  }
  return bool;
}

function setListener() {
  if (mouseDown) {
    canvas.addEventListener("mousemove", handleMove);
  } else {
    canvas.removeEventListener("mousemove", handleMove);
  }
}

function handleMouseDown(e) {
  if (e.which === 3) {
    handleRightClick(e);
    return;
  }
  mouseDown = true;
  setListener();
}

function handleMouseup(e) {
  mouseDown = false;
  if (e.which === 3) {
    return;
  }
  if (hasMoved < 50) {
    draw(e);
  }
  setListener();
  hasMoved = false;
  selectedPoint = false;
}

function handleMove(e) {
  hasMoved++;

  const newPoint = {
    x: e.clientX,
    y: e.clientY,
  };
  var index = findPoint(newPoint);
  if (selectedPoint === false) {
    if (findPoint(newPoint) || findPoint(newPoint) === 0) {
      selectedPoint = CP[findPoint(newPoint)];
      selectedPoint.x = e.clientX;
      selectedPoint.y = e.clientY;
      draw();
    }
  } else {
    hasMoved = 50;
    selectedPoint = {
      x: e.clientX,
      y: e.clientY,
    };
    CP[index] = selectedPoint;

    draw();
  }
}

function handleRightClick(e) {
  e.preventDefault();
  if (CP.length > 0) {
    deletePoint(e);
  }
}

function handleResize() {
  const ratio = Math.ceil(window.devicePixelRatio);
  var width = document.body.clientWidth;
  var height = document.body.clientHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  CP.length > 2 && draw();
}

function drawRandomBezier() {
  if (CP.length === 0) {
    CP.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    });
    return;
  }
  if (CP.length > aop) {
    CP.shift();
    CP.length = aop;
  }

  var marginY = CP[CP.length - 1].y + 150 > canvas.height ? -150 : 150;
  var marginX = CP[CP.length - 1].x + 150 > canvas.width ? -150 : 150;

  CP.push({
    x: Math.random() * CP[CP.length - 1].x * 1.5 + marginX,
    y: Math.random() * CP[CP.length - 1].y * 1.5 + marginY,
  });

  draw();
}

function setValues() {
  t = Math.random();
  document.getElementById("range").value = t;
  aop = Math.ceil(Math.random() * 150);
  document.getElementById("points").value = aop;
  speed = 25;
  document.getElementById("speed").value = 150 - speed;
  autoplay = document.getElementById("autoplay").checked;
}

window.addEventListener(
  "load",
  () => {
    setValues();
    canvas = document.getElementById("beziers");

    if (canvas && canvas.getContext) {
      ctx = canvas.getContext("2d");

      rect = canvas.getBoundingClientRect();
      handleResize();

      if (autoplay) {
        interval = setInterval(drawRandomBezier, speed);
      }
      document.addEventListener("contextmenu", (e) => {
        handleRightClick(e), true;
      });
      canvas.addEventListener("mousedown", (e) => {
        handleMouseDown(e), false;
      });
      canvas.addEventListener("mouseup", (e) => {
        handleMouseup(e), false;
      });

      window.addEventListener("resize", handleResize, false);

      document.getElementById("range").addEventListener("input", (e) => {
        t = e.target.value;
        draw();
      });

      document.getElementById("speed").addEventListener("input", (e) => {
        if (autoplay) {
          speed = 150 - e.target.value;
          clearInterval(interval);
          interval = setInterval(drawRandomBezier, speed);
          draw();
        }
      });

      document.getElementById("points").addEventListener("input", (e) => {
        aop = e.target.value;
        draw();
      });

      document.getElementById("guides").addEventListener("input", (e) => {
        guides = e.target.checked;
        draw();
      });

      document.getElementById("handles").addEventListener("input", (e) => {
        handles = e.target.checked;
        draw();
      });

      document.getElementById("line").addEventListener("input", (e) => {
        lines = e.target.checked;
        draw();
      });

      document.body.onkeyup = function (e) {
        if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
          console.log(document.getElementById("autoplay").checked);
          document.getElementById("autoplay").checked =
            !document.getElementById("autoplay").checked;
          autoplay = document.getElementById("autoplay").checked;
          clearInterval(interval);
          if (autoplay) {
            interval = setInterval(drawRandomBezier, speed);
            draw();
          }
        }
      };

      document.getElementById("autoplay").addEventListener("input", (e) => {
        autoplay = e.target.checked;
        clearInterval(interval);
        if (autoplay) {
          interval = setInterval(drawRandomBezier, speed);
          draw();
        }
      });

      document.getElementById("reset").addEventListener("click", (e) => {
        CP = [];
        setValues();

        draw();
      });
    }
  },
  false
);
