'use strict';

// Declare app level module which depends on views, and core components
var app = angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
  config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    // $routeProvider.otherwise({ redirectTo: '/view1' });
  }]);

//CREATE CONTROLLER TO BIND DATA
app.controller('AppController', function ($scope, $http, $timeout, ImageDownload) {

  var prev;
  var firstTime = true;
  var currentMove = [];
  var showTextEditor = false;
  var editHistory = [];

  //CREATE CANVAS
  var myDesign = new fabric.Canvas('canvas', { backgroundColor: "#2e2e2e",
  preserveObjectStacking: true });
  $scope.fabric = myDesign;
  myDesign.setDimensions({
    width: 700,
    height: 685
  });

  //DEFAULT TEXT BOX
  var txtBox = new fabric.IText('New Text', {
    left: 50,
    top: 50,
    fontFamily: 'monospace',
    fill: '#fff',
    lineHeight: 1
  });
  myDesign.add(txtBox);

  //SET FALSE TO IGNORE STACKING ISSUES
  // myDesign.preserveObjectStacking = true;
  document.getElementById("textEditor").style.display = "none";



  //IMAGE UPLOADER
  $scope.uploadImage = document.getElementById('uploadFile').addEventListener("change", function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function (f) {
      var data = f.target.result;
      fabric.Image.fromURL(data, function (img) {
        var uploadedImage = img.set({
          left: 0,
          top: 0,
          angle: 0
        }).scale(0.5);
        myDesign.add(uploadedImage).renderAll();
        var a = myDesign.setActiveObject(uploadedImage);
        var dataURL = myDesign.toDataURL({
          format: 'png', //CONVERT ALL IMAGES TO PNG SO AS TO MAINTAIN A STANDARD
          quality: 1 //PRESERVE IMAGE QUALITY
        });
      });
    };
    reader.readAsDataURL(file);
  });

  //NEW INSTANCES OF TEXT OBJECTS
  $scope.addText = function () {
    var tText = new fabric.IText('New Text', {
      left: 100,
      top: 100,
    });
    myDesign.add(tText);
    myDesign.setActiveObject(tText);
    var selectedObject = myDesign.getActiveObject();
    myDesign.bringToFront(selectedObject);
    $scope.objectModified();
  };

  $scope.bringToFront = function () {
    var selectedObject = myDesign.getActiveObject();
    myDesign.bringToFront(selectedObject);
    $scope.objectModified();
  };

  $scope.bringToBack = function () {
    var selectedObject = myDesign.getActiveObject();
    myDesign.sendToBack(selectedObject);
    $scope.objectModified();
  };



  //DELETE OBJECT
  $scope.deleteObject = function () {
    myDesign.remove(myDesign.getActiveObject());
    $scope.objectModified();
  }



  //TRACK AND STORE HISTORY
  $scope.trackEditHistory = function () {
    myDesign.on('object:modified', function (options) {
      currentMove = [];
      currentMove.push(myDesign.toJSON());
      prev = currentMove;
    });
    editHistory.push(prev[0]);
    $scope.history = editHistory;
    $scope.$apply();
  }


  //TO SHOW/HIDE TEXT EDITOR
  myDesign.on('mouse:down', function (options) {
    // alert('hey i am clicked!')
    // if (firstTime) {
    //   firstTime = false;
    //   currentMove = [];
    //   currentMove.push(myDesign.toJSON());
    //   prev = currentMove;
    //   editHistory.push(prev[prev.length - 1]);
    //   $scope.history = editHistory;
    // }
    var obj = myDesign.getActiveObject();
    if (obj != null && obj.type == 'i-text') {
      //SHOW EDITOR ONLY WHEN SELECTED OBJECT IS TEXT
      document.getElementById("textEditor").style.display = "block";
    }
    else
      document.getElementById("textEditor").style.display = "none";
  });




  //GETTING STORED DATA FROM DESIGNERDB
  $scope.getDesigns = function () {
    $http({
      method: "GET",
      url: "http://localhost:3000/api/saved_designs" //PARAMETERS CAN BE LOADED FROM CONFIG FILES TOO.
    }).then(function mySuccess(response) {
      $scope.loadedDesigns = [];
      $scope.loadedDesigns = response.data;
      $scope.$apply();
    }, function myError(response) {
      $scope.loadedDesigns = response.statusText;
    });
  }

  //FIRST CALL FROM THE FILE
  $scope.getDesigns(); 

  //SEND DATA TO DESIGNERDB
  $scope.saveDesign = function () {
    $scope.designName;
    var designToBeSaved = [{
      id: $scope.designName,
      imagedata: ""
    }];

    var json = myDesign.toJSON();
    json = JSON.stringify(json);

    designToBeSaved[0]['imagedata'] = json;

    $http.post('http://localhost:3000/api/saved_designs', designToBeSaved).then(function (response) {
      if (response.data)
      $scope.designName = ""; //CLEAR SAVED NAME
      $scope.closeForm();
      setInterval($scope.getDesigns(), 1000); //RELOAD DESIGNS
      $scope.$apply();
    }, function (response) {
      console.log("Post failed!")
    });

  };


  //LOAD CANVAS FROM JSON
  $scope.reloadCanvas = function (json) {
    myDesign.loadFromJSON(json, function () {
      myDesign.renderAll();
    }, function (o, object) {
    });
    document.getElementById("textEditor").style.display = "none";
    $scope.closeLoadForm();
  }

  //DOWNLOAD AS IMAGE
  $scope.downloadImage = function () {
    ImageDownload.downloader(myDesign, 'myDesign');
  }


  $scope.openForm = function () {
    document.getElementById("saveForm").style.display = "block";
  }

  $scope.closeForm = function () {
    document.getElementById("saveForm").style.display = "none";
  }

  $scope.openLoadForm = function () {
    $scope.getDesigns();
    document.getElementById("loadForm").style.display = "block";
  }

  $scope.closeLoadForm = function () {
    document.getElementById("loadForm").style.display = "none";
  }



  //TEXT CONTROL FUNCTIONS AND EVENTS
  //*******************************************************//
  $scope.objectModified = function () {
    currentMove = [];
    currentMove.push(myDesign.toJSON());
    prev = currentMove;
    editHistory.push(prev[prev.length - 1]);
    $scope.history = editHistory;
    $scope.$apply();
  }

  //TEXT COLOR
  document.getElementById('text-color').onchange = function () {
    //CONVERT 6 DIGIT HEX to 3 DIGIT HEX #e2e2e2
    var c1 = this.value.substring(1, 2);
    var c2 = this.value.substring(3, 4);
    var c3 = this.value.substring(5, 6);
    var color = "#" + c1 + c2 + c3;
    var obj = myDesign.getActiveObject();
    obj.set({
      'fill': color
    });
    myDesign.renderAll();
    $scope.objectModified();
  };

  //TEXT BG COLOR
  document.getElementById('text-bg-color').onchange = function () {
    var obj = myDesign.getActiveObject();
    console.log(JSON.stringify(obj))
    obj.set({
      'textBackgroundColor': this.value
    });
    myDesign.renderAll();
    $scope.objectModified();
  };

  //TEXT STROKE COLOR
  document.getElementById('text-stroke-color').onchange = function () {
    var obj = myDesign.getActiveObject();
    console.log(JSON.stringify(obj))
    obj.set({
      'stroke': this.value
    });
    myDesign.renderAll();
    $scope.objectModified();
  };

  //TEXT STROKE WIDTH
  document.getElementById('text-stroke-width').onchange = function () {
    var obj = myDesign.getActiveObject();
    console.log(JSON.stringify(obj))
    obj.set({
      'strokeWidth': this.value
    });
    myDesign.renderAll();
    $scope.objectModified();
  };

  //FONT FAMILY
  document.getElementById('font-family').onchange = function () {
    var obj = myDesign.getActiveObject();
    console.log(JSON.stringify(obj))
    obj.set({
      'fontFamily': this.value
    });
    myDesign.renderAll();
    $scope.objectModified();
  };

  //FONT SIZE
  document.getElementById('text-font-size').onchange = function () {
    var obj = myDesign.getActiveObject();
    console.log(JSON.stringify(obj))
    obj.set({
      'fontSize': this.value
    });
    myDesign.renderAll();
    $scope.objectModified();
  };

  //LINE HEIGHT
  document.getElementById('text-line-height').onchange = function () {
    var obj = myDesign.getActiveObject();
    console.log(JSON.stringify(obj))
    obj.set({
      'lineHeight': this.value
    });
    myDesign.renderAll();
    $scope.objectModified();
  };

  //ALIGN
  document.getElementById('text-align').onchange = function () {
    var obj = myDesign.getActiveObject();
    console.log(JSON.stringify(obj))
    obj.set({
      'textAlign': this.value
    });
    myDesign.renderAll();
    $scope.objectModified();
  };


  //COMPARE RADIO BUTTONS AND SET TEXT DECORATIONS
  var radios = document.getElementsByName("fonttype");
  for (var i = 0, max = radios.length; i < max; i++) {
    radios[i].onclick = function () {
      var obj = myDesign.getActiveObject();
      $scope.objectModified();
      if (document.getElementById(this.id).checked == true) {
        if (this.id == "text-cmd-bold") {
          obj.set({
            'fomtWeight': "bold"
          });
        }
        if (this.id == "text-cmd-italic") {
          obj.set({
            'fontStyle': "italic"
          });
        }
        if (this.id == "text-cmd-underline") {
          obj.set({
            'underline': true
          });
        }
        if (this.id == "text-cmd-linethrough") {
          obj.set({
            'linethrough': true
          });
        }
        if (this.id == "text-cmd-overline") {
          obj.set({
            'overline': true
          });
        }

      } else {
        if (this.id == "text-cmd-bold") {
          obj.set({
            'fontWeight': ""
          });
        }
        if (this.id == "text-cmd-italic") {
          obj.set({
            'fontStyle': ""
          });
        }
        if (this.id == "text-cmd-underline") {
          obj.set({
            'underline': false
          });
        }
        if (this.id == "text-cmd-linethrough") {
          obj.set({
            'linethrough': false
          });
        }
        if (this.id == "text-cmd-overline") {
          obj.set({
            'overline': false
          });
        }
      }
      myDesign.renderAll();
    }
  }







});


//ImageDownload service
app.service('ImageDownload', function () {
  this.downloader = function (myDesign, name) {
    //CONVERT OBJECT TO DOWNLOADABLE CONTENT / DATA URL
    download(myDesign.toDataURL(), name +'.png');
  }

  function download(url, fileName) {
    //CREATE NEW DOWNLOADABLE LINK
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    //REMOVE LINK TAG FROM MEMORY
    setTimeout(function () {
      document.body.removeChild(a);
    }, 100);
  };

});

