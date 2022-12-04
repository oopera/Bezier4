import "./style.css";

var canvas, ctx;
var CP = Array(0);
var line_width = 1;
var point_size = 4;
var back_color = "transparent";
var line_color = "transparent";
var point_color = "transparent";
var const_color = "#2b2b2b";
("#daff01");
var depth = 15;
var t = Math.random();
document.getElementById("range").value = t;
var mouseDown = false;
var hasMoved = 0;
var rect;
var selectedPoint = false;
var speed = document.getElementById("speed").value;
var autoplay = document.getElementById("autoplay").value;
var interval;

var guides = true;
var aop = 25;

function deCasteljau(points, d = 1) {
  const floor = [],
    ceil = [];

  if (depth <= d) {
    return [points[0], points[points.length - 1]];
  }

  const range = {
    x: Math.abs(
      Math.floor(points[0].x) - Math.floor(points[points.length - 1].x)
    ),
    y: Math.floor(points[0].y) - Math.floor(points[points.length - 1].y),
  };

  if (
    Math.max(range.x, range.y) <= 1 &&
    points[0] !== CP[0] &&
    points[points.length - 1] !== CP[CP.length - 1]
  ) {
    return [points[0], points[points.length - 1]];
  }

  calc(points, true).forEach((i) => {
    floor.push(i[0]);
    ceil.push(i[i.length - 1]);
  });

  return deCasteljau(floor, ++d).concat(
    deCasteljau(ceil, ++d).reverse().slice(1)
  );
}

function calc(points, bool) {
  if (points.length < 2) {
    return [points];
  }
  var varT;
  !bool ? (varT = t) : (varT = 0.5);
  var post = [...Array(points.length - 1)];

  post.forEach((_, i) => {
    post[i] = {
      x: (1 - varT) * points[i].x + varT * points[i + 1].x,
      y: (1 - varT) * points[i].y + varT * points[i + 1].y,
    };
  });

  return [points].concat(calc(post, bool));
}

function deletePoint(e) {
  const newPoint = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
  if (findPoint(newPoint)) {
    CP.splice(findPoint(newPoint), 1);
    draw();
    return true;
  }
  return false;
}

function draw(e) {
  e && (CP[CP.length] = { x: e.clientX - rect.left, y: e.clientY - rect.top });
  if (ctx) {
    ctx.fillStyle = back_color;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = line_width;
    ctx.strokeStyle = line_color;
    drawLine(deCasteljau(CP));

    ctx.lineWidth = line_width / 2;
    ctx.strokeStyle = point_color;
    drawLine(CP);
    if (guides) {
      const lines = calc(CP);
      ctx.strokeStyle = const_color;
      lines.slice(1, CP.length - 1).forEach((line) => {
        ctx.strokeStyle = drawLine(line);
      });
    }
    CP.forEach((i) => drawPoint(i));
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
  ctx.fillRect(
    P.x - point_size / 2,
    P.y - point_size / 2,
    point_size,
    point_size
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

function handleMouseDown(e) {
  if (e.which === 3) {
    handleRightClick(e);
    return;
  }
  mouseDown = true;
  setListener();
}

function setListener() {
  if (mouseDown) {
    canvas.addEventListener("mousemove", handleMove);
  } else {
    canvas.removeEventListener("mousemove", handleMove);
  }
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
  e.preventDefault();
  hasMoved++;

  const newPoint = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
  var index = findPoint(newPoint) || findPoint(newPoint) === 0;

  if (selectedPoint === false) {
    if (findPoint(newPoint) || findPoint(newPoint) === 0) {
      selectedPoint = CP[findPoint(newPoint)];
      selectedPoint.x = e.clientX - rect.left;
      selectedPoint.y = e.clientY - rect.top;
      draw();
    }
  } else {
    hasMoved = 50;
    selectedPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    CP[index] = selectedPoint;
    draw();
  }
}

function handleRightClick(e) {
  // e.preventDefault();
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

window.addEventListener(
  "load",
  () => {
    canvas = document.getElementById("beziers");

    if (canvas && canvas.getContext) {
      ctx = canvas.getContext("2d");

      rect = canvas.getBoundingClientRect();
      handleResize();

      // interval = setInterval(drawRandomBezier, speed);

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
        console.log(t);
        draw();
      });
      document.getElementById("speed").addEventListener("input", (e) => {
        if (autoplay) {
          speed = e.target.value;
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
        if (e.target.checked) {
          const_color = "#2b2b2b";
        } else {
          const_color = "transparent";
        }
        draw();
      });

      document.getElementById("handles").addEventListener("input", (e) => {
        if (e.target.checked) {
          point_color = "#6758F7";
        } else {
          point_color = "transparent";
        }
        draw();
      });

      document.getElementById("line").addEventListener("input", (e) => {
        if (e.target.checked) {
          line_color = document.body.classList.contains("dark")
            ? "#FFFFFF"
            : "#ff00fb";
        } else {
          line_color = "transparent";
        }
        draw();
      });

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
        draw();
      });

      // document.getElementById("dark").addEventListener("input", (e) => {
      //   if (e.target.checked) {
      //     document.body.classList.add("dark");
      //   } else {
      //     document.body.classList.remove("dark");
      //   }
      //   draw();
      // });
    }
  },
  false
);
