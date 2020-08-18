import { DataModel } from "./models";

type OnChangeCallback = (updatedData: DataModel[]) => void | undefined;

export default class DataController {
    data: DataModel[] = [];

    constructor(carAmount: number, private changeEmitter: OnChangeCallback) {
        for (let i = 0; i < carAmount; i++) {
            this.data.push({
                id: (i + 1).toString(),
                lastUpdate: new Date().toISOString(),
                lat: this.getRandomPosition(46.195042, 53.252069),
                lon: this.getRandomPosition(11.469727, 28.432617),
            });

            this.update(this.data[this.data.length - 1]);
        }
    }

    update(data: DataModel): void {
        data.lon += this.getRandomPosition(-0.001, 0.001);
        data.lat += this.getRandomPosition(-0.001, 0.001);
        data.lastUpdate = new Date().toISOString();
        this.changeEmitter(this.data);
        setTimeout(() => this.update(data), this.getRandomDelay(500, 3000));
    }

    getRandomDelay(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    getRandomPosition(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
