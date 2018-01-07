function generateHexColor() {
    return '' + (function co(lor) {
        return (lor += [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)]) &&
            (lor.length == 6) ? lor : co(lor);
    })('');
}

var brain = require('brain');
var http = require('http');
var fs = require('fs');


function checkBin(n) {
    return /^[01]{1,64}$/.test(n)
}

function checkDec(n) {
    return /^[0-9]{1,64}$/.test(n)
}

function checkHex(n) {
    return /^[0-9A-Fa-f]{1,64}$/.test(n)
}

function pad(s, z) {
    s = "" + s;
    return s.length < z ? pad("0" + s, z) : s
}

function unpad(s) {
    s = "" + s;
    return s.replace(/^0+/, '')
}

//Decimal operations
function Dec2Bin(n) {
    if (!checkDec(n) || n < 0) return 0;
    return n.toString(2)
}

function Dec2Hex(n) {
    if (!checkDec(n) || n < 0) return 0;
    return n.toString(16)
}

//Binary Operations
function Bin2Dec(n) {
    if (!checkBin(n)) return 0;
    return parseInt(n, 2).toString(10)
}

function Bin2Hex(n) {
    if (!checkBin(n)) return 0;
    return parseInt(n, 2).toString(16)
}

function Hex2Bin(n) {
    if (!checkHex(n)) return 0;

    var binString = parseInt(n, 16).toString(2);

    for (var i = binString.length; i < 24; i++) {
        binString = '0' + binString;
    }

    return binString

}

function Hex2Dec(n) {
    if (!checkHex(n)) return 0;
    return parseInt(n, 16).toString(10)
}

var colorString = generateHexColor();

function generateNewColor() {
    colorString = generateHexColor();
}

var net = new brain.NeuralNetwork();

function binArrayFromString(binStringColor) {
    var binInputArray = [];

    for (var i = 0; i < binStringColor.length; i++) {
        binInputArray.push(+binStringColor[i]);
    }

    return binInputArray;
}

var learnArray = [];

function learnColor(isDark) {
    var binInputArray = binArrayFromString(Hex2Bin(colorString));

    learnArray.push({
        input: binInputArray,
        output: [isDark]
    });

    net.train(learnArray);
}

var express = require('express');
var app = express();

app.get('/', function(req, res) {
    fs.readFile(__dirname + '/index.html', function(err, data) {
        if (err) {
            res.send(404);
        } else {
            res.contentType('text/html');

            generateNewColor();

            if (learnArray.length) {
                console.log(Hex2Bin(colorString));
                var output = net.run(binArrayFromString(Hex2Bin(colorString)));

                console.log('kolor:', output);

                if (output > 0.5) {
                    var colorType = 'ciemny';
                } else {
                    var colorType = 'jasny';
                }

                data = data.toString('utf8').replace('${typKoloru}', colorType);
            }

            data = data.toString('utf8').replace('${nazwaZmiennej}', '#' + colorString);

            res.send(data);
        }
    });
});

app.get('/dark/', function(req, res) {
    res.send('Hello dark<script type="text/javascript">parent.location.reload();</script>');
    learnColor(1);
})

app.get('/light/', function(req, res) {
    res.send('Hello light<script type="text/javascript">parent.location.reload();</script>');
    learnColor(0);
})

var server = app.listen(8081, function() {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})