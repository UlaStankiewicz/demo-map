import React, { Component } from "react";
import { Map, View, Feature } from "ol";
import { fromLonLat } from "ol/proj";
import { asString } from "ol/color";
import VectorLayer from "ol/layer/Vector";
import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";
import Point from "ol/geom/Point";

import MarkerModel from "./MarkerModel";
import openSocket from "socket.io-client";
import logo from "./../assets/gps.png";

import "./Map.scss";

export class MapComponent extends Component {
    state = {
        markers: [] as MarkerModel[],
        searchedID: "" as string,
    };

    private mapSource: VectorSource = new VectorSource();
    private mapLayer: VectorLayer = new VectorLayer();
    private mapData: Map = new Map({
        layers: [
            new TileLayer({
                source: new OSM(),
            }),
        ],
        view: new View({
            center: fromLonLat([18.638306, 54.372158]),
            zoom: 6,
        }),
    });

    private host: string = "http://localhost";
    private port: string = "8000";

    componentDidUpdate() {
        this.updateVisibility();
    }

    componentDidMount() {
        // Create socket.io-client
        const socket = openSocket(this.host + ":" + this.port, {
            transports: ["websocket"],
        });

        // Bound map data
        this.mapLayer.setSource(this.mapSource);
        this.mapData.addLayer(this.mapLayer);
        this.mapData.setTarget("map");

        // Bound socket
        socket.on("connect", () => {
            socket.on("update_data", (data: MarkerModel[]) => {
                let oldMarkers = [...this.state.markers];

                data.forEach((d) => {
                    let index = oldMarkers.findIndex((m) => m.id === d.id);
                    if (index !== -1) {
                        oldMarkers[index] = d;
                        let feature = this.mapSource.getFeatureById(d.id);
                        if (feature)
                            feature.setGeometry(
                                new Point(fromLonLat([d.lon, d.lat]))
                            );
                    } else {
                        oldMarkers.push(d);
                        this.mapSource.addFeature(this.getFeatureFromMarker(d));
                    }
                });

                this.setState({ markers: oldMarkers });
            });
        });
    }

    // Get marker icon's data
    getMarkerIcon(label: string | number): Style {
        return new Style({
            image: new Icon({
                src: logo,
                anchor: [0.5, 1],
            }),
            text: new Text({
                text: "" + label,
                offsetY: -19,
                fill: new Fill({ color: asString("rgba(0,0,0,1)") }),
                font: "bold 11px Roboto",
            }),
        });
    }

    // Transforms marker model into feature
    getFeatureFromMarker(model: MarkerModel): Feature {
        const result = new Feature({
            geometry: new Point(fromLonLat([model.lon, model.lat])),
        });

        result.setId(model.id);
        result.setStyle(this.getMarkerIcon(model.id));
        return result;
    }

    // Get last update time
    getTime(marker: MarkerModel): string {
        return new Date(marker.lastUpdate).toLocaleTimeString();
    }

    // Get HTML/JSX schema
    getData(marker: MarkerModel) {
        return (
            <li key={marker.id} onClick={() => this.centerMapAt(marker)}>
                <header>ID #{marker.id}</header>
                <span className="axis">Longitude</span>
                <span className="axis">Latitude</span>
                <span className="value">{marker.lon.toFixed(4)}</span>
                <span className="value">{marker.lat.toFixed(4)}</span>
                <span className="time">
                    Last update at {this.getTime(marker)}
                </span>
            </li>
        );
    }

    // Update visibility of the markers
    updateVisibility() {
        if (this.state.searchedID === "") {
            this.mapSource
                .getFeatures()
                .forEach((f) => f.setStyle(this.getMarkerIcon(f.getId())));
        } else {
            this.mapSource.getFeatures().forEach((f) => {
                if (f.getId().toString().search(this.state.searchedID) === -1)
                    f.setStyle(new Style({}));
                else f.setStyle(this.getMarkerIcon(f.getId()));
            });
        }
    }

    // Center map's view at given marker
    centerMapAt(marker: MarkerModel) {
        this.mapData.getView().setCenter(fromLonLat([marker.lon, marker.lat]));
    }

    // Handle search input
    handleInputChange(event: any) {
        this.setState({ searchedID: event.target.value });
    }

    // Display list data
    renderListData() {
        let result: any;
        if (this.state.markers.length === 0)
            return <span className="no-results">There are no pins!</span>;
        if (this.state.searchedID !== "") {
            let availableData = this.state.markers.filter(
                (m) => m.id.search(this.state.searchedID) >= 0
            );
            result = availableData.map((marker) => this.getData(marker));
        } else
            result = this.state.markers.map((marker) => this.getData(marker));

        if (result.length === 0)
            return (
                <span className="no-results">
                    There are no pins with the name{" "}
                    <strong>"{this.state.searchedID}"</strong>
                </span>
            );
        return result;
    }

    // Display
    render() {
        return (
            <React.Fragment>
                <div id="map"></div>
                <input
                    type="text"
                    placeholder="Search markers by ID..."
                    onChange={(event) => this.handleInputChange(event)}
                    value={this.state.searchedID}
                />
                <ul id="data">{this.renderListData()}</ul>
            </React.Fragment>
        );
    }
}
