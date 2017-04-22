/**
 * Dependencies
 */
var mqtt = require('mqtt');
var SpotifyWebHelper = require('spotify-web-helper');

/**
 * Config
 */
var config = require('./config.json');

/**
 * MQTT
 */
var client  = mqtt.connect(config.handle, {
  username: config.username,
  password: config.password
}).on('connect', function () {
  console.log('Connected to ' + config.handle);

  // Subscriptions
  this.subscribe(config.topicPrefix + '/play');
  //this.subscribe(topicPrefix + '/#');
}).on('message', function(topic, message) {
  var topicParts = topic.split('/');
  topicParts.shift();

  console.log(topicParts);
  var subTopic = topicParts.shift();

  switch(subTopic) {
    /**
     * Pause/play
     */
    case 'pause':
      break;

    /**
     * Play a track
     */
    case 'play':
      break;
  }
});

// Detect whether Spotify.app is opened
var isOpened;
setInterval(function() {
  require('child_process').exec('ps A|grep Spotify', function(error, stdout, stderr) {
    var opened = stdout.indexOf('Spotify\.app') != -1;
    if(opened === isOpened) return;
    isOpened = opened;
    client.publish(config.topicPrefix + '/opened', Buffer.from(isOpened ? '1' : '0'));
  });
}, 1000);

var spotify = SpotifyWebHelper().player

.on('error', err => {
  if (error.message.match(/No user logged in/)) {
    // also fires when Spotify client quits
    console.log('No user logged in');
  } else {
    console.log('Spotify not started');
    // other errors: /Cannot start Spotify/ and /Spotify is not installed/
  }
})

.on('status-will-change', function(status) {
  console.log('Event: status-will-change');
  client.publish(config.topicPrefix + '/status', Buffer.from(JSON.stringify({
    playing: status.playing,
    shuffle: status.shuffle,
    playing_position: status.playing_position,
  })), {retain: true});
})

.on('play', function() {
  console.log('Event: play');

  client.publish(config.topicPrefix + '/paused', Buffer.from('0'), {retain: true});
})

.on('pause', function() {
  console.log('Event: pause');

  client.publish(config.topicPrefix + '/paused', Buffer.from('1'), {retain: true});
})

.on('track-will-change', function(track) {
  console.log('Event: track-will-change');
  
  client.publish(config.topicPrefix + '/track', JSON.stringify(track), {retain: true});
});