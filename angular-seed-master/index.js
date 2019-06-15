var mysql = require('mysql'); //used to connect to mysql
var express = require('express')
var app = express();
var bodyParser = require('body-parser'); //used to parse body of response
var responseData;

//ABSOLUTE DIRECTORY
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({
    limit: "100mb"
}));

//SET LIMIT TO 50MB TO AVOID POST OVERHEADS
app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
}));

//CONNECTION PARAMETERS //TO BE LOADED FROM CONFIG FILE
var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'designerdb'
});

//ESTABLISH CONNECTION TO DESIGNERDB
mysqlConnection.connect((err) => {
    if (!err)
        console.log("Connection to MySQL DB Successful");
    else
        console.log("Connection to MySQL DB Failed \n" + JSON.stringify(err));
});


//ESTABLISH A PORT TO BIND
app.listen(3000, () => {
    console.log("Express Server is running at port 3000");
});

//LOAD SAVED EDIT DATA
app.get('/api/saved_designs', (req, res) => {
    var selectAllQuery = 'SELECT * FROM saveddesigns';
    mysqlConnection.query(selectAllQuery, function (error, results, fields) {
        if (error) throw error;
        responseData = results;
        console.log(responseData);
    });
    res.send(responseData);
});

//SEND SAVED EDIT DATA
app.post('/api/saved_designs', function (req, res) {
    var request = req.body;
    var id, data;
    var imageToBeStored = [];
    var insertQuery = 'insert into saveddesigns (id,imagedata) values ?';
    //GET REQUEST FROM CLIENT AND STORE IT IN AN ARRAY
    for (i = 0; i < request.length; i++) {
        id = request[i]['id'];
        imagedata = request[i]['imagedata'];
        imageToBeStored.push([id, imagedata]);
    }
    mysqlConnection.query(insertQuery, [imageToBeStored], function (err) {
        if (err) {
            res.send('Error');
            console.log(err)
        } else {
            res.send('Success');
        }
    });
});

