var axios = require("axios");
var moment= require('moment');
var Spotify = require('node-spotify-api');
var dot = require("dotenv").config();
var keys = require("./keys.js");
var fs = require("fs");
var spotify = new Spotify(keys.spotify);

var command= process.argv[2];
var value= process.argv.slice(3).join(" ");

var input= false;
if(value!==""){
  input= true;
}

var concert= function(value){// this works
    var artist= value.replace(/\s/g, '');
    axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp").then(function(response){
            var result=[
              "Venue: "+response.data[0].venue.name,
              "Location: "+response.data[0].venue.city,
              "Date of Event: "+moment(response.data[0].datetime).format('MMMM Do YYYY, h:mm a')
            ].join("\n\n");
            console.log(result);
            write_file(result);
        }
    );
}

var spotify_this= function(value){ //this works
    var song= value;
    spotify.search({ type: 'track', query: song }).then(function(data) {
        var result=[
          "Artist(s): "+data.tracks.items[0].artists[0].name,
          "Song: "+data.tracks.items[0].name,
          "Preview Link: "+data.tracks.items[0].preview_url,
          "Album: "+data.tracks.items[0].album.name
        ].join("\n\n");
        console.log(result);
        write_file(result);
      });
}

var movie_this= function(value){
    var movie= value.replace(/\s/g, '');
    axios.get("http://www.omdbapi.com/?t="+movie+"&y=&plot=short&apikey=trilogy").then(function(response) {
          if(response.data.Response!='False'){
            var result=[
              "Title: "+response.data.Title,
              "Imdb Rating: "+response.data.imdbRating,
              "Rotten Tomatoes Rating: "+response.data.Ratings[1].Value,
              "Country Produced: "+response.data.Country,
              "Language: "+response.data.Language,
              "Plot: "+response.data.Plot,
              "Actors: "+response.data.Actors
            ].join("\n\n");
            console.log(result);
            write_file(result);
          }
          else{
            console.log("Could not be found.");
          }
        }
    );
}

var file_say= function(){

    fs.readFile("random.txt", "utf8", function(error, data) {
        if (error) {
          return console.log(error);
        }

        var dataArr= data.split(',');

        switch(dataArr[0]){
            case "concert-this":
              concert(dataArr[1]);
              break;
            case "spotify-this-song":
              value= dataArr[1];
              if (value==null){
                value= "I Want it That Way";
              }
              spotify_this(value);
              break;
            case "movie-this":
              value= dataArr[1];
              if (value==null){
                value= "Mr.Nobody";
              }
              movie_this(value);
              break; 
            default:
              console.log("Command duplicated or not found. Run Program again using concert-this, spotify-this-song, movie-this, do-what-it-says commands.");
              break;
        }
      });
}

function write_file(input){
  var divider= "\n-----------------------------------------------------------------------------------\n\n";
  fs.appendFile("searches.txt",input +divider,function(err){
    if(err) console.log(err);
  });
}

switch(command){
  case "concert-this":
        concert(value);
        break;
  case "spotify-this-song":
        if (!input){
          value= "I Want it That Way";
        }
        spotify_this(value);
        break;
  case "movie-this":
        if (!input){
          value= "Mr. Nobody";
        }
        movie_this(value);
        break;
  case "do-what-it-says":
        file_say();
        break;
  default:
        console.log("Command not found. Run Program again using concert-this, spotify-this-song, movie-this, do-what-it-says commands.");
        break;

}