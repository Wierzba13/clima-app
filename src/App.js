import "./App.css";
import "../node_modules/leaflet/dist/leaflet.css";

import React, {useState} from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";

const App = () => {
    const HandleMapClick = () => {
        useMapEvents({
            click: (e) => {
                console.log(e.latlng);
            },
        });
        return null;
    };

    return (
      <main className="App">
        <div className="leaflet-container">
            <MapContainer center={[54.60, 18.23]} minZoom={7} maxZoom={17} zoom={14} scrollWheelZoom={true} >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                <HandleMapClick />
                
            </MapContainer>
        </div>
      </main>
    );
}

export default App;