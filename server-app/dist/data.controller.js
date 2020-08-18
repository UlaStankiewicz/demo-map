"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataController = /** @class */ (function () {
    function DataController(carAmount, changeEmitter) {
        this.changeEmitter = changeEmitter;
        this.data = [];
        for (var i = 0; i < carAmount; i++) {
            this.data.push({
                id: (i + 1).toString(),
                lastUpdate: new Date().toISOString(),
                lat: this.getRandomPosition(46.195042, 53.252069),
                lon: this.getRandomPosition(11.469727, 28.432617),
            });
            this.update(this.data[this.data.length - 1]);
        }
    }
    DataController.prototype.update = function (data) {
        var _this = this;
        data.lon += this.getRandomPosition(-0.001, 0.001);
        data.lat += this.getRandomPosition(-0.001, 0.001);
        data.lastUpdate = new Date().toISOString();
        this.changeEmitter(this.data);
        setTimeout(function () { return _this.update(data); }, this.getRandomDelay(500, 3000));
    };
    DataController.prototype.getRandomDelay = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };
    DataController.prototype.getRandomPosition = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    return DataController;
}());
exports.default = DataController;
