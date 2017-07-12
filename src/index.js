const canvas = document.createElement('canvas');
canvas.width = 1280;
canvas.height = 720;
document.body.appendChild(canvas);

// ffmpeg is loaded async because it's too slow to build
const interval = setInterval(() => {
  if(window.ffmpeg){
    clearInterval(interval);
    start();
  }
}, 100);

function canvasToBuffer(canvas, callback){
  canvas.toBlob(function(blob){
    var reader = new FileReader();
    reader.addEventListener("loadend", event => callback(null, event.target.result));
    reader.readAsArrayBuffer(blob);
  }, 'image/jpeg');
}

function stringify(buffer){
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return btoa(binary);
}

function start(){
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'red';
  ctx.fillRect(100,100,100,100);
  canvasToBuffer(canvas, (err, buffer) => {
    var testData = new Uint8Array(buffer);

    // Encode test video to VP8.
    var result = ffmpeg({
      MEMFS: [{name: "in.jpg", data: testData}],
      arguments: ["-framerate", "1", "-i", "in.jpg", "out.webm"],
      // Ignore stdin read requests.
      stdin: function() {},
    });
    // Write out.webm to disk.
    var out = result.MEMFS[0].data;

    const video = document.createElement('video');
    video.width = 1280;
    video.height = 720;
    video.src = 'data:video/webm;base64,'+(stringify(out));
    document.body.appendChild(video);
  });
}
