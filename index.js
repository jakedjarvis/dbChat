var express = require('express');
var app = express();
//var app = require('express')();
var router = express.Router();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3001;
var mongoose = require('mongoose');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/chatDB', {useMongoClient:true});

var chatSchema = mongoose.Schema({
    Name:String,
    Message:String
});

var message = mongoose.model('message', chatSchema);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open',function() {
    console.log("Connected to Chat DB");
});

router.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

router.post('/messages', function(req, res) {
    console.log("We are posting a message");

    console.log(req);

    var chat = new message(req.body);

    chat.save(function(err,post) {
        if (err){
            res.sendStatus(400);
            return console.error(err);
        }
        console.log(post);
        res.sendStatus(200);
    });
});

router.get('/messages', function(req, res) {
    console.log("We are getting in /messages");

    message.find(function(err,messageList) {
        if (err){
            res.sendStatus(400);
            return console.error(err);
        }
        else {
            console.log(messageList);

            res.json(messageList);
        }
    });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

app.use('/', router);

http.listen(port, function(){
  console.log('listening on *:' + port);
});


