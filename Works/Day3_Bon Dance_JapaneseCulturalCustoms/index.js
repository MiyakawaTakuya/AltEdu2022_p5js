//https://qiita.com/kibinag0/items/f1a9021cb0383c4771d5 こちらのファイルを参照
//jshint esversion:6

//expressをロードする
const express = require("express");
const app = express();


// public内ファイルを使用できるようにする
app.use(express.static("public"));

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));  うまくいかないのでコメントアウト
//requestがあった時のresponse処理
app.get("/", function (req, res) {
    // res.sendFile(__dirname + "/index.html");
    res.sendFile(__dirname + "/public/index.html");

});

// process.env.PORTはdynamic portとしての機能
app.listen(process.env.PORT || 3000, function () {
    console.log("The server is runnning on port 3000.");
});