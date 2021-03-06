var fs      = require('fs');
var gm      = require('gm');
var path    = require('path');
var express = require('express');
var multer  = require('multer');
var bodyParser = require('body-parser');
var cors    = require('cors');

var app     = express();
app.use(express.static('public'));

app.use(cors());

var multerUploader  = multer(
    {
        storage: multer.diskStorage({
            destination: 'public/uploads'
        }),
        onError: function(err, next)
        {
            if(err)
            {
                console.log('multer error: ', err);
                next(err);
            }
        }
    }
).array('files[]');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({extended: false});

app.get('/', function(req, res, next) {
    res.send('hello root, world');
});
app.get('/upload', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

app.post('/uploadImageData', urlencodedParser, function(req, res, next){
    console.log(req.body);
    var data = req.body.imageData.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    
    var filename = Math.random() + Date.now() + '.png';
    var filePath = path.resolve('public/uploads', filename);
    fs.writeFile(filePath, buf, function(err){
        if (err)
        {
            console.log(err)
            return res.json({
                status: -1,
                msg: 'error, ' + JSON.stringify(err)
            })            
        }
        else
        {
            return res.json({
                status: 1,
                fileUrl: filename
            })
        }
    })
});
app.post('/upload', function(req, res, next){
    multerUploader(req, res, function(err){
        if (err)
        {
            console.log(err);
            res.json({
                status: '-1',
                msg: 'multer Error: ' + err,
                fileUrl: null
            });
        }
        else
        {
            console.log(req.files);

            if (req.files.length == 1)
            {
                res.json({
                    'status': 1,
                    'fileUrl': req.files[0].filename
                });
            }
            else
            {
                var arr = req.files.map(function(v, i){
                    return {
                        'status': 1,
                        'fileUrl': v.filename
                    }
                });

                res.json(arr);
            }
        }

    })
});
app.post('/crop', urlencodedParser, function(req, res){
    console.log(req.body);
    var cx = req.body.cx;
    var cy = req.body.cy;
    var cw = req.body.cw;
    var ch = req.body.ch;

    var filePath = path.join(__dirname, 'public/uploads', req.body.fileUrl);

    // console.log(cx, cy, cw, ch, filePath);process.end();
    gm(filePath)
    .crop(cw, ch, cx, cy)
    .write(filePath+'-avatar', function(err){
        if (err){
            console.log(err);
            res.json({
                status: '-1',
                msg: err
            });
        }else {
            res.json({
                fileUrl: '/files/'+path.basename(filePath+'-avatar')+'?v='+Math.random()
            });
        }
    });
});
app.get('/files/:hash', function(req, res) {
    var filePath = path.join(__dirname, 'public/uploads', req.params.hash);

    fs.stat(filePath, function(err, stats){
        if (err)
        {
            res.status(404).send('Sorry, no file found!!');
        }
        else
        {
            var size = req.query.size;
            if (size)
            {
                console.log(size);

                gm(filePath)
                .resize(size, size, "!")
                // .write(filePath+'x'+size, function(err){
                //     if (err)
                //     {
                //         console.log(err)
                //         res.end();
                //     }
                //     else {
                //         res.setHeader('Content-Type', 'image/png');
                //         res.sendFile(filePath+'x'+size);
                //     }
                // })
                .toBuffer('png', function(err, buffer){
                    if (err)
                    {
                        console.log(err);
                        res.end();
                    }
                    else
                    {
                        res.setHeader('Content-Type', 'image/png');
                        res.send(buffer);
                    }
                })
            }
            else
            {
                res.setHeader('Content-Type', 'image/png');
                res.sendFile(filePath);
            }
        }
    });
});


var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
