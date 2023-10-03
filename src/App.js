import "./App.css";
import "../node_modules/leaflet/dist/leaflet.css";

import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl } from "react-leaflet";
import { Control, Icon } from "leaflet";
import options from "./data/options";
import themesTilesUrl from "./data/themesTiles";
import ThemeSwitcher from "./components/ThemeSwitcher";

const App = () => {
    const [theme, setTheme] = useState("light");
    const [data, setData] = useState({});


    const HandleMapClick = () => {
        useMapEvents({
            click: async (e) => {
                options["params"] = {
                    q: `${e.latlng["lat"]},${e.latlng["lng"]}`, 
                    lang: "pl"
                };

                try {
                    const response = await axios.request(options);

                    // https://www.weatherapi.com/docs/#apis-forecast
                    setData(data => ({
                        "country": response.data.location["country"],
                        "city": response.data.location["name"],
                        "icon": response.data.current.condition["icon"],
                        "msg": response.data.current.condition["text"],
                        "temp": response.data.current["temp_c"],
                        "feelsLikeTemp": response.data.current["feelslike_c"],
                        "cloud": response.data.current["clout"],
                        "wind": response.data.current["wind_kph"],
                        "windDirection": response.data.current["wind_dir"],
                        "humidity": response.data.current["humidity"],
                        "precip": response.data.current["precip_mm"],
                        "pressure": response.data.current["pressure_mb"],
                        "uv": response.data.current["uv"],
                        "visibility": response.data.current["vis_km"],
                        "lastUpdated": response.data.current["last_updated"]
                    }));

                    console.log(response.data);
                } catch (error) {
                    console.error(error.message);
                }
            },
        });
    };

    const changeTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    const checkData = (data) => {
        return data.length > 0 ? true : false
    };

    return (
      <main className="App">
        <div className="leaflet-container">
            
            <MapContainer center={[54.60, 18.23]} minZoom={7} maxZoom={17} zoom={14} scrollWheelZoom={true} >
                <TileLayer
                    url={
                        theme === "light" 
                        ? themesTilesUrl["light"]
                        : themesTilesUrl["dark"]
                    }
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                <HandleMapClick />
            </MapContainer>
        </div>

        <div className="panel" data-theme={theme === "dark" ? "dark" : "light"}>
            <div className="heading-container">
                <h1 className="logo-heading">Clima</h1>
            </div>

            <ThemeSwitcher changeTheme={changeTheme} />

            <div>
                <h2>{data["country"] == "" ? "Nie wybrano miejsca" : `Pogoda dla: ${data["country"]}/${data["city"]}`}</h2>
            
                <div>
                    <img src={data["icon"]} alt="Pogoda zdj" />
                    <p>{data["msg"]}</p>
                </div>
                <h3>{data["temp"]} &#176;C</h3>
            </div>
        </div>
      </main>
    );
}

export default App;