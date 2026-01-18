// importing styles
import "../styles/App.css";
import "../styles/dashboard.css";
import "../../node_modules/leaflet/dist/leaflet.css";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";

// importing data and map tiles
import options from "../data/options";
import themesTilesUrl from "../data/themesTiles";

import React, { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { faTemperatureHigh, faCloud, faWind, faHouseFloodWater, faCloudShowersHeavy, faEyeSlash, faClock, faTachometerAlt, faSearch, faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import ThemeSwitcher from "./ThemeSwitcher";
import InfoBox from "./InfoBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import getCoordinates from "../scripts/coordinates";
import Alert from "react-bootstrap/Alert";

const App = () => {
    const [theme, setTheme] = useState("light");
    const [previousSearches, setpreviousSearches] = useState([]);
    const [cookies, setCookie] = useCookies([""]);
    const [data, setData] = useState({});
    const [coords, setCoords] = useState([54.5189, 18.5305]); // Default coords for Gdynia city
    const [alertOptions, setAlertOptions] = useState({
        show: false,
        title: "",
        content: "",
        variant: "info"
    });
    const mapRef = useRef(null);

    useEffect(() => {
        !cookies.theme ? setCookie("theme", "light", { path: "/" }) : setTheme(cookies.theme);
        
        !cookies.previousSearches ? setCookie("previousSearches", [], { path: "/" }) : setpreviousSearches(cookies.previousSearches);

        getCoordinates((error, coordinates) => {
            if (error) {
                setAlertOptions({
                    show: true,
                    title: "Brak pozwoleń na geolokalizacje",
                    content: "Zezwól na dostęp do lokalizacji w celu dostosowania aplikacji do twoich potrzeb!",
                    variant: "warning"
                });
            } else {
                setCoords([coordinates.lat, coordinates.long]);
            }
        });
    }, []);

    useEffect(() => {
        setCookie("theme", theme, { path: "/" });
    }, [theme]);

    useEffect(() => {
        setCookie("previousSearches", previousSearches, { path: "/" });
    }, [previousSearches]);

    const scrollToElement = (id) => {
        const element = document.getElementById(id);
    
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }

    const HandleMapClick = () => {
        const map = useMapEvents({
            click: async (e) => {
                if (!document.querySelector("#recenterBtn").contains(e.originalEvent.target)) {
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

                        if (window.innerWidth < 1566) scrollToElement("info-heading");
                    } catch (error) {
                        setAlertOptions({
                            show: true,
                            title: "Błąd podczas pozyskiwania danych",
                            content: "Niestety podczas pozyskiwania danych z serwera wystąpił błąd. Wyczyść ciasteczka lub spróbuj ponownie później. Przepraszamy za utrudnienia ~ zespół Clima",
                            variant: "danger"
                        });
                    }   
                }
            },
        });

        useEffect(() => {
            // Save map reference to the useRef after the component is mounted
            mapRef.current = map;
        }, [map]);
    };

    useEffect(() => {
        // Setup map view for new coords
        if(mapRef.current) mapRef.current.setView(coords, mapRef.current.getZoom(), { animate: true });
    }, [coords]);

    const changeTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    const clearAlertOptions = () =>  {
        setAlertOptions({
            show: false,
            title: "",
            content: ""
        });
    }

    const onSearchSubmit = async (e) => {
        e.preventDefault();

        const val = e.target.querySelector("#searchInput").value;

        setpreviousSearches(prevArr => [val, ...prevArr.slice(0,4)]);

        e.target.querySelector("#searchInput").value = "";

        options["params"] = {
            q: `${val}`, 
            lang: "pl"
        };

        try {
            const response = await axios.request(options);

            // Recenter map
            setCoords([response.data.location.lat, response.data.location.lon]);

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
        } catch (error) {
            setData({});
            if(error.response.status === 400) {
                setAlertOptions({
                    show: true,
                    title: "Błędna nazwa miasta",
                    content: "Podaj poprawną nazwę miasta w celu uzyskania informacji pogodowych",
                    variant: "info"
                });
            }
        }
    }

    return (
        <main className="App" data-theme={theme === "dark" ? "dark" : "light"}>
            <div className="leaflet-container">
                <MapContainer center={coords} minZoom={4} maxZoom={17} zoom={14} scrollWheelZoom={true} className="map-container">
                    <TileLayer
                        url={
                            theme === "light" 
                            ? themesTilesUrl["light"]
                            : themesTilesUrl["dark"]
                        }
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    <button className="recenter-button" id="recenterBtn" onClick={() => {
                        if(mapRef.current) mapRef.current.setView(coords, mapRef.current.getZoom(), { animate: true });
                    }}>
                    <HandleMapClick />
                        <FontAwesomeIcon icon={faLocationCrosshairs}/>
                    </button>
                </MapContainer>
            </div>

            <div className="panel">
                <div className="heading-container">
                    <h1 className="logo-heading">Clima</h1>
                </div>

                <div className="search-container">
                    <form onSubmit={onSearchSubmit} autoComplete="off">
                        <input type="search" id="searchInput" placeholder="Wyszukaj miasto..." list="previousSearches"/>
                        
                        <datalist id="previousSearches" >
                            {previousSearches.map((val, idx) => (
                                <option key={idx} value={val} />
                            ))}
                        </datalist>

                        <button type="submit" value="search">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </form>
                </div>

                <div className="mt-3">
                    { alertOptions.show &&
                        <Alert variant={alertOptions.variant} onClose={clearAlertOptions} dismissible className="p-2 small rounded-0">
                            <Alert.Heading>{ alertOptions.title }</Alert.Heading>
                            <p>{ alertOptions.content }</p>
                        </Alert>
                    }
                </div>

                <div className="information-container">
                    <h2 id="info-heading">{data["country"] != null ? `Pogoda dla: ${data["country"]}/${data["city"]}` : "Nie wybrano miejsca"}</h2>
                
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