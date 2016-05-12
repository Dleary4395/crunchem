#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var fileArray = [];
var recursive = require('recursive-readdir');
var SVGO = require('svgo');
var svgo = new SVGO();
var imagemin = require('imagemin');
var imageminOptipng = require('imagemin-optipng');
var imageminMozjpeg = require('imagemin-mozjpeg');
var ProgressBar = require('progress');


function scanDirectory(srcpath) {
  recursive('./', function (err, files) {
    // Files is an array of filename 
    fileArray = files;
   	iterateFiles(fileArray);
  });
}

function optimizeImage(file) {
  if((file.indexOf('.jpg') > -1 || file.indexOf('.svg') > -1 || file.indexOf('.png') > -1) && file.indexOf("node_modules") != 0) {
	var fileParts = file.split('.');
	switch(fileParts[1]) {
      case 'svg':
        fs.readFile(file, 'utf8', function(err, data) {
          if (err) {
              throw err;
          }
          svgo.optimize(data, function(result) {
          	fs.writeFile(file, result.data, 'utf8');
          	console.log(file + " has been optimized");
          });
        });
        break;
      case 'png':
		imagemin([file], './', {use: [imageminOptipng()]}).then(() => {
		    console.log(file + " has been optimized");
		});
		break;
	  case 'jpg':
	  case 'jpeg':
	  	imagemin([file], './', {use: [imageminMozjpeg()]}).then(() => {
		    console.log(file + " has been optimized");
		});
	  	break;
    }
    return true;
  }
  return false;
}

//Iterate through array of items given
function iterateFiles(files) {
  if(files) {
  	var imageFiles = 0;
    for(var i=0;i<files.length;i++) {
      var file = files[i];
      if(optimizeImage(file)) {
      	imageFiles++;
      }
    }
    if(imageFiles === 0) {
    	console.log("Couldn't find any image files in this directory");
    }
  }
}

scanDirectory();