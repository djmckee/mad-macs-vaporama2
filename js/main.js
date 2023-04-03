// Initialising the canvas
let canvas = document.querySelector('#canvas'),
  ctx = canvas.getContext('2d');

// Setting the width and height of the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let letters = '$LICK KING';
letters = letters.split('');

// Setting up the columns
let fontSize = 24,
  columns = canvas.width / fontSize;

// Setting up the drops
let drops = [];
for (let i = 0; i < columns; i++) {
  drops[i] = 1;
}

let tweets = [];

let drawingTimer = null;

let colours = [
  "#ff0000",
  "#ffff00",
  "#2196F3",
  "#0000ff",
  "#ff00ff",
  "#0f0",
];

let counter = 0;

function domReady(fn) {
  // If we're early to the party
  document.addEventListener("DOMContentLoaded", fn);
  // If late; I mean on time.
  if (document.readyState === "interactive" || document.readyState === "complete") {
    fn();
  }
}


function update() {
  fetch('https://baconipsum.com/api/?type=all-meat&paras=1&start-with-lorem=1').then(function (response) {
    return response.json();
  }).then(function (data) {
    // The API call was successful!
    console.log('data!', data);

    let inQueue = false;
    data.forEach((newTweet, _) => {
      tweets.forEach((existingTweet, _) => {
        if (newTweet === existingTweet) {
          inQueue = true;
        }
      });

      if (!inQueue) {
        // Remove the first item from the queue if it's > 20 tweets long...
        if (tweets.length > 20) {
          tweets.shift();
        }
        // Add new tweet to end of queue...
        tweets.push(newTweet);
        console.log("adding newTweet");
      }
    });
  }).catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
  });
}

function render() {
  letters = '$LICK KING';
  if (tweets.length > 0) {
    letters = tweets[Math.floor(Math.random() * tweets.length)];
    let elem = document.querySelector('#text');
    elem.innerText = letters;
    elem.setAttribute("data-text", letters);
  }
  letters = letters.split('');
  counter = 0;
  // Loop the animation
  drawingTimer = setInterval(draw, 20);
}

startTweetTimer = () => {
  //clearInterval(tweetTimerInterval);
  // Next we set an interval every 30 secs
  tweetTimerInterval = setInterval(function () {
    update();
  }, 30000);
};

startRenderPipeline = () => {
  //clearInterval(renderTimerInterval);
  // Next we set an interval every 3 secs
  renderTimerInterval = setInterval(function () {
    render();
  }, 3000);
};

domReady(() => {
  startTweetTimer();
  startRenderPipeline();
  update();
  render();
  drawLines();
  startMic();
});


function startMic() {
  let canvas = document.getElementById("oscilloscope");
  let canvasCtx = canvas.getContext("2d");
  let oscilloscopeColor = "#2196F3";

  navigator.mediaDevices.getUserMedia({audio: true})
    .then(function (stream) {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const microphone = audioCtx.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      let dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      function drawSillyScope() {
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = oscilloscopeColor;
        canvasCtx.beginPath();
        let sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          //bufferLength is frequency control
          let v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;
          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }

      drawSillyScope();
    }).catch(function () {
    /* handle the error */
    console.log('Please allow access to microphone');
  });
}


function getHeight() {
  return window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;
}

function drawLines() {
  const lines = document.getElementsByClassName('line');
  if (lines.length) {
    for (let i = 0; i < lines.length; i++) {
      document.body.removeChild(lines[i]);
    }
  }

  for (let i = 0; i < getHeight() / 10; i++) {
    const line = document.createElement("div");
    line.className = `line line-${i}`;
    line.style.top = `${i * 10}px`;
    const time = Math.random() * 5;
    line.style.animation = `lines ${time}s infinite`;
    document.body.appendChild(line);
  }
}

window.onresize = function (event) {
  drawLines();
};

// Setting up the draw function
function draw() {
  counter++;
  ctx.fillStyle = 'rgba(0, 0, 0, .1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < drops.length; i++) {
    let text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillStyle = colours[Math.floor(Math.random() * colours.length)];
    ctx.font = "bold 48px VCR OSD";
    ctx.globalAlpha = 0.3;

    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    drops[i]++;
    if (drops[i] * fontSize > canvas.height && Math.random() > .95) {
      drops[i] = 0;
    }
  }
  if (counter > 200) {
    clearInterval(drawingTimer);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}




