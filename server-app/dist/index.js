"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var data_controller_1 = __importDefault(require("./data.controller"));
var port = 8000;
var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http).listen(port);
io.on("connection", function (socket) {
    console.log("CONNECTION");
});
new data_controller_1.default(50, function (updatedData) {
    io.emit("update_data", updatedData);
});
