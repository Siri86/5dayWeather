/**
 * Weather Forecast App
 * Uses OpenWeatherMap API to fetch 5-day weather forecasts by city name or geolocation.
 * Author: [Your Name]
 */

const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

// Replace with your OpenWeatherMap API key
const API_KEY = "e691a6e46bffc7c94754a87569a7e028";

/**
 * Create weather card HTML
 */
const createWeatherCard = (cityName, weatherItem, index) => {
  const date = weatherItem.dt_txt.split(" ")[0];
  const temp = (weatherItem.main.temp - 273.15).toFixed(2);
  const wind = weatherItem.wind.speed;
  const humidity = weatherItem.main.humidity;
  const icon = weatherItem.weather[0].icon;
  const description = weatherItem.weather[0].description;

  if (index === 0) {
    return `
      <div class="details">
        <h2>${cityName} (${date})</h2>
        <h6>Temperature: ${temp}°C</h6>
        <h6>Wind: ${wind} M/S</h6>
        <h6>Humidity: ${humidity}%</h6>
      </div>
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="icon">
        <h6>${description}</h6>
      </div>`;
  }

  return `
    <li class="card">
      <h3>(${date})</h3>
      <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="icon">
      <h6>Temp: ${temp}°C</h6>
      <h6>Wind: ${wind} M/S</h6>
      <h6>Humidity: ${humidity}%</h6>
    </li>`;
};

/**
 * Fetch and display weather details
 */
const getWeatherDetails = (cityName, lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const uniqueDays = [];
      const forecast = data.list.filter(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!uniqueDays.includes(date) && item.dt_txt.includes("12:00:00")) {
          uniqueDays.push(date);
          return true;
        }
        return false;
      });

      currentWeatherDiv.innerHTML = createWeatherCard(cityName, forecast[0], 0);
      weatherCardsDiv.innerHTML = "";

      forecast.slice(1).forEach((item, i) => {
        weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, item, i + 1));
      });
    })
    .catch(() => alert("Failed to fetch weather data."));
};

/**
 * Fetch coordinates using city name
 */
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;

  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return alert("City not found!");
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => alert("Failed to fetch coordinates."));
};

/**
 * Fetch coordinates using user's location
 */
const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const cityName = data[0].name;
          getWeatherDetails(cityName, latitude, longitude);
        })
        .catch(() => alert("Failed to fetch city from coordinates."));
    },
    err => {
      if (err.code === 1) {
        alert("Permission denied for location.");
      } else {
        alert("Error getting location.");
      }
    }
  );
};

searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
