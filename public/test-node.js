var fs = require('fs')
var path = require('path')
var resolve = path.resolve
var Canvas = require('canvas')
var FFMpegRunner = require('../lib/ffmpeg-runner');
var utils        = require('../lib/utils');

var framesPerSecond = 25;
var numFrames = framesPerSecond * 2;
var thickness = 100;
var speed = 4;
var frameNum = 0;
// const PATH = 'z:\\'
const PATH = __dirname
var timer = null
var timeStart = null
var timeEnd = null

var canvas = new Canvas(1280, 720);
var ctx = canvas.getContext("2d");

function render(time) {
  let start = new Date().getTime();
  // if (frameNum == 1) {
  //   start = new Date().getTime();
  // }
  // console.log(new Date().getTime())
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FFF";
  ctx.font = "400px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(frameNum + 1, canvas.width / 2, canvas.height / 2);

  ++frameNum;

  var outPath = resolve(PATH, 'frame_' + frameNum + '.png')
  var stream = fs.createWriteStream(outPath);

  stream.on('finish', function() {
    // console.log('item use ' + (new Date().getTime() - start) + 'ms');
  })
  
  canvas.createPNGStream().pipe(stream);

  if (frameNum === numFrames) {
    clearInterval(timer);
    console.log('images done')
    console.log(new Date().getTime())
    makeVideo()
  }
}

function cleanup(name, length, extension) {
  name = path.join(PATH, name);
  console.log('cleanup', name, length, extension)
  for (var i = 1; i <= length; i++) {
    utils.deleteNoFail(name + '_' + i + extension);
  }
}

function makeVideo() {
  var name = 'frame'
  var extension = '.mp4'
  var framerate = 25;
  var codec = null;
  var videoname = path.join(PATH, name + extension);
  var framesname = path.join(PATH, name + "_%d.png");
  console.log("converting " + framesname + " to " + videoname);

  var args = [];

  args = args.concat([
    "-framerate", framerate,
    "-pattern_type", "sequence",
    "-start_number", "0",
    "-i", framesname,
    "-y",
  ]);

  if (codec) {
    args.push("-c:v", codec);
  } else if (extension === ".mp4") {
    args.push("-c:v", "libx264", "-pix_fmt", "yuv420p");
  }

  // if (Array.isArray(ffmpegArguments)) {
  //   args = args.concat(ffmpegArguments);
  // }
  args.push(videoname)


  var handleFFMpegError = function(result) {
    console.log("error running ffmpeg: " + JSON.stringify(result))
    // debug("error running ffmpeg: " + JSON.stringify(result));
    // sendCmd("error", { result: result });
    // cleanup();
    name = undefined;
  };

  var handleFFMpegDone = function(result) {
    console.log("converted frames to: " + videoname);
    timeEnd = new Date().getTime();
    cleanup(name, numFrames, '.png');
    console.log('time use', timeEnd - timeStart + 'ms')
    // server.addFile(videoname)
    // .then(function(fileInfo) {
    //   sendCmd("end", fileInfo);
    //   cleanup();
    //   name = undefined;
    // })
    // .catch(function(e) {
    //   console.log("error adding file: " + videoname);
    //   throw e;
    // });
  };

  var handleFFMpegFrame = function(frameNum) {
    console.log("progress " + frameNum / numFrames);
    // sendCmd("progress", {
    //   progress: frameNum / frames.length,
    // });
  };

  var runner = new FFMpegRunner(args);
  runner.on('error', handleFFMpegError);
  runner.on('done', handleFFMpegDone);
  runner.on('frame', handleFFMpegFrame);
}

console.log(new Date(), PATH)
timeStart = new Date().getTime()
timer = setInterval(render, 40)
// render();

