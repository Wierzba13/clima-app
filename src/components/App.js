import "../styles/App.css";
import "../styles/dashboard.css";
import "../../node_modules/leaflet/dist/leaflet.css";

import React, {useState, useEffect, useRef} from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTemperatureHigh, faCloud, faWind, faHouseFloodWater, faCloudShowersHeavy, faEyeSlash, faClock, faTachometerAlt } from '@fortawesome/free-solid-svg-icons'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl } from "react-leaflet";
import { Control, Icon } from "leaflet";
import options from "../data/options";
import themesTilesUrl from "../data/themesTiles";
import ThemeSwitcher from "./ThemeSwitcher";
import InfoBox from "./InforBox";

const App = () => {
    const [theme, setTheme] = useState("light");
    const [cookies, setCookie] = useCookies([""]);
    const [data, setData] = useState({});

    useEffect(() => {
        if(!cookies.theme) {
            setCookie("theme", "light", { path: "/" })
        } else {
            setTheme(cookies.theme);
        }
    }, []);

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
                        "cloud": response.data.current["cloud"],
                        "wind": response.data.current["wind_kph"],
                        "humidity": response.data.current["humidity"],
                        "precip": response.data.current["precip_mm"],
                        "pressure": response.data.current["pressure_mb"],
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
        setCookie("theme", theme === "dark" ? "light" : "dark", { path: "/" });
    }

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

                <div className="information-container">
                    <h2>{data["country"] != null ? `Pogoda dla: ${data["country"]}/${data["city"]}` : "Nie wybrano miejsca"}</h2>
                
                    {
                        data["icon"] != null ?
                        <div className="information-shortcut">
                            <img src={data["icon"]} alt="Pogoda zdj" />
                            <p>{data["msg"]}</p>
                        </div>
                        : null
                    }
                    
                    <div className="info-list">
                        { data["temp"] != null ?
                            <InfoBox text={`${data["temp"]}°C`} icon={faTemperatureHigh} />
                            : null    
                        }

                        { data["cloud"] != null ?
                            <InfoBox text={`${data["cloud"]}%`} icon={faCloud} />
                            : null    
                        }

                        { data["wind"] != null ?
                            <InfoBox text={`${data["wind"]} km/h`} icon={faWind} />
                            : null    
                        }

                        { data["humidity"] != null ?
                            <InfoBox text={`${data["humidity"]}%`} icon={faHouseFloodWater} />
                            : null    
                        }

                        { data["precip"] != null ?
                            <InfoBox text={`${data["precip"]}mm`} icon={faCloudShowersHeavy} />
                            : null    
                        }

                        { data["pressure"] != null ?
                            <InfoBox text={`${data["pressure"]}hPa`} icon={faTachometerAlt} />
                            : null    
                        }

                        { data["visibility"] != null ?
                            <InfoBox text={`${data["visibility"]} km`} icon={faEyeSlash} />
                            : null    
                        }

                        { data["lastUpdated"] != null ?
                            <InfoBox text={`${data["lastUpdated"]}`} icon={faClock} />
                            : null    
                        }
                    </div>

                </div>

                <div className="dashboard-footer">
                    <ThemeSwitcher changeTheme={changeTheme} theme={theme} />
                    <p>Clima używa <a href="https://www.weatherapi.com/" target="_blank">Weather Api</a></p>
                </div>
            </div>
        </main>
    );
}

export default App;