import DataController from "./data.controller";
import { DataModel } from "./models";

const port = 8000;

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http).listen(port);

io.on("connection", (socket: any) => {
    console.log("CONNECTION");
});

new DataController(50, (updatedData: DataModel[]) => {
    io.emit("update_data", updatedData);
});
