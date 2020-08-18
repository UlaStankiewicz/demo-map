import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { MapComponent } from "./components/Map";
import "./App.scss";

ReactDOM.render(
    <React.StrictMode>
        <MapComponent />
    </React.StrictMode>,
    document.getElementById("root")
);

serviceWorker.unregister();
