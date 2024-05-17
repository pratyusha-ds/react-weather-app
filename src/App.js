import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

function WeatherApp() {
  const [currentWeather, setCurrentWeather] = useState({});
  const [city, setCity] = useState("New Delhi");
  const [cityImage, setCityImage] = useState("");
  const [apiError, setApiError] = useState(null);
  const [dailyForecast, setDailyForecast] = useState([]);

  const fetchCityImage = useCallback((weatherData) => {
    fetch(
      `https://api.unsplash.com/search/photos?query=${city}&client_id=o2o58o18XYc-eHm37643WzWt6E1XyRnCBUf5QsDDgR4`
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Unsplash API request failed");
        }
      })
      .then((imageData) => {
        setCityImage(imageData?.results[0]?.urls?.raw || "");
      })
      .catch((error) => console.log(error));
  }, [city]);

  const fetchWeatherAndImage = useCallback(() => {
    fetch(
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=3d975a35bcfff41486428dddabbcc27a&units=metric`
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Weather API request failed");
        }
      })
      .then((weatherData) => {
        setCurrentWeather(weatherData);
        setApiError(null);
        fetchCityImage(weatherData); 
      })
      .catch((error) => {
        console.log(error);
        setApiError("Weather data not found");
        setCurrentWeather({});
        setCityImage("");
      });
  }, [city, fetchCityImage]);

  useEffect(() => {
    fetchWeatherAndImage();
  }, [fetchWeatherAndImage]);

  const handleLocationSearch = () => {
    fetchWeatherAndImage();
  };

  const fetchDailyForecast = useCallback(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${currentWeather.coord.lat}&lon=${currentWeather.coord.lon}&appid=3d975a35bcfff41486428dddabbcc27a&units=metric`
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Daily Forecast API request failed");
        }
      })
      .then((data) => {
        setDailyForecast(data.list.slice(0, 5)); 
      })
      .catch((error) => {
        console.log(error);
        setApiError("Daily forecast data not found");
      });
  }, [currentWeather, setDailyForecast, setApiError]);

  useEffect(() => {
    if (currentWeather.coord) {
      fetchDailyForecast();
    }
  }, [currentWeather, fetchDailyForecast]);

  return (
    <div className="weather-app">
      <h1 className="heading">Weather Application</h1>
      <div className="search-bar">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter location"
          className="input-field"
        />
        <button className="search-button" onClick={handleLocationSearch}>
          Search Location
        </button>
      </div>
      <div className="content-wrapper">
        {apiError && <p className="error-message">{apiError}</p>}
        <div className="weather-details">
          <p className="temperature">
            Current Temperature: {currentWeather.main && currentWeather.main.temp}°C
          </p>
        </div>
        {cityImage && <img className="location-image" src={cityImage} alt="" />}
      </div>
      <div><h1>3-hour Forecast</h1></div>
      <div className="daily-forecast">
        {dailyForecast.map((forecast, index) => (
          <div key={index} className="forecast-card">
            <p>{forecast.dt_txt}</p>
            <p> {forecast.main.temp}°C</p>
            <img
              src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
              alt={forecast.weather[0].description}
            />
            <p>{forecast.weather[0].description}</p>  
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherApp;
