const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const MongoClient = require("mongodb").MongoClient;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const { render } = require("express/lib/response");
const { stringify } = require("nodemon/lib/utils");

require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
app.use(
	session({
		secret: "secret-code",
		resave: true,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session()); //미들 웨어(요청 응답 사이에 실행됨)

const newLocal = express.static;
app.use(newLocal("imgs"));

const newLocal2 = express.static;
app.use(newLocal2("public")); 

var db;
MongoClient.connect(process.env.DB_URL, function (error, client) {

	if (error) return console.log(error);

	db = client.db("cpc");

	app.get("/", function (call, answer) {
		answer.render("index.ejs");
	});
	

	app.get("/ox", function (call, answer) {
		db.collection("oxQuestion")
		.find()
		.toArray(function (error, result) {
			answer.render("ox.ejs", {
				posts: result,
			});
		});
	});

	app.post("/ox", function (call, answer) {
		db.collection("oxAnswer").insertOne(
			{
				fake : call.body.ans
			},
			function (error, result) {
				if (error) {
					console.log("연결 오류");
					answer.send("<script>alert('서버 연결에 실패했습니다.'); window.location.replace('/ox')</script>");
				} else {
					answer.send("<script>alert('제출했당!'); window.close()</script>");
				}
			}
		);
	});

	app.get("/short", function (call, answer) {
		db.collection("shortQuestion")
		.find()
		.toArray(function (error, result) {
			answer.render("short.ejs", {
				posts: result,
			});
		});
	});

	app.post("/short", function (call, answer) {
		db.collection("shortAnswer").insertOne(
			{
				fake : call.body
			},
			function (error, result) {
				if (error) {
					console.log("연결 오류");
					answer.send("<script>alert('서버 연결에 실패했습니다.'); window.location.replace('/short')</script>");
				} else {
					answer.send("<script>alert('제출했당!'); window.close()</script>");
				}
			}
		);
	});

	app.listen(process.env.PORT, function () {
		console.log("listening on 8080");
	});

});