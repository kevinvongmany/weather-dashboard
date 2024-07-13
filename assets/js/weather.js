const baseUrl = "https://api.openweathermap.org/data/2.5/forecast";
const apiKey = "9f56d69ab450c02cd489d786e4be2876";
const searchCityForm = document.getElementById("search-city");
const searchCityInput = document.getElementById("search-city-input");
const searchCityButton = document.getElementById("search-city-button");
const strDateFormat = "MMMM D, YYYY";
const forecastCardsDiv = document.getElementById("forecast-cards");


function buildUrl(city, apiKey, units) {
  console.log(`${baseUrl}?q=${city}&appid=${apiKey}&units=${units}`);
  return `${baseUrl}?q=${city}&appid=${apiKey}&units=${units}`;
}

function getWeather(city) {
  // make a fetch request to the API
  console.log(city);
  if (!city) {
    renderLandingPage();
    return;
  }
  const url = buildUrl(city, apiKey, localStorage.getItem("units"));
  fetch(url)
    .then((response) => {
      if (response.status === 401) {
        throw new Error(
          "Invalid/expired API key, please contact Administrator"
        );
      } else if (response.status !== 200) {
        throw new Error(`Unexpected network response: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      dataCityName = data.city.name;
      renderWeatherData(data.list[0], dataCityName);
      const forecastData = getForecastData(data);
      forecastCardsDiv.innerHTML = "";
      forecastData.forEach((forecast) => {
        renderForecastData(forecast);
      });
      const cityHistory = updateHistory(dataCityName);
      updateSessionLastResult(dataCityName, data);
      renderHistoryPanel(cityHistory);
      hideLandingPage();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getWeatherTemp(weatherObj) {
  return weatherObj.main.temp;
}

function getWeatherHumidity(weatherObj) {
  return weatherObj.main.humidity;
}

function getWindSpeed(weatherObj) {
  return weatherObj.wind.speed;
}

function getWeatherIcon(weatherObj) {
    return weatherObj.weather[0].icon;
}

function getForecastData(weatherObj) {
  const forecastData = weatherObj.list.filter((item) => {
    return item.dt_txt.includes("12:00:00");
  });
  console.log(forecastData);
  return forecastData;
}

function createHistoryButton(city, historyPanel) {
  const buttonDiv = document.createElement("button");
  buttonDiv.setAttribute(
    "class",
    "w-10/12 bg-yellow-500 text-black border border-gray py-2 px-4 rounded-md mb-2 focus:outline-none hover:bg-yellow-600 hover:shadow-md transition duration-200 ease-in-out"
  );
  buttonDiv.dataset.city = city;
  buttonDiv.textContent = city;
  historyPanel.appendChild(buttonDiv);
}

function renderHistoryPanel(cities) {
  const historyDiv = document.querySelector("#history");
  historyDiv.innerHTML = "";
  console.log(cities);
  for (const index in cities) {
    createHistoryButton(cities[index], historyDiv);
  }
}

function getHistory() {
    return JSON.parse(localStorage.getItem("history")) || [];

}

function renderLandingPage() {
  const landingPage = document.getElementById("landing-page");
  const weatherDiv = document.getElementById("weather");
  landingPage.classList.remove("hidden");
  weatherDiv.classList.add("hidden");

}

function hideLandingPage() {
  const landingPage = document.getElementById("landing-page");
  const weatherDiv = document.getElementById("weather");
  landingPage.classList.add("hidden");
  weatherDiv.classList.remove("hidden");

}

function updateHistory(city) {
    const cityHistory = getHistory();
    
    if (!cityHistory.includes(city)) {
        cityHistory.unshift(city);
      } else {
        const index = cityHistory.indexOf(city);
        cityHistory.splice(index, 1);
        cityHistory.unshift(city);
      }

    localStorage.setItem("history", JSON.stringify(cityHistory));
    return cityHistory;

}


function getSessionLastResult() {
    return JSON.parse(sessionStorage.getItem("lastSearched")) || {city: "", data: {}};
    
}

function updateSessionLastResult(city, data) {
    const lastResult = {
        city,
        data 
    }
    sessionStorage.setItem("lastSearched", JSON.stringify(lastResult));
}

function renderWeatherData(weatherObj, cityName) {
  // render weather data to the page
  const heading = document.getElementById("current-weather-heading");
  const tempP = document.getElementById("temperature");
  const humidityP = document.getElementById("humidity");
  const windP = document.getElementById("wind-speed");
  const weatherIconId = getWeatherIcon(weatherObj);
  const weatherIcon = document.getElementById("weather-icon");
  weatherIcon.src = `http://openweathermap.org/img/wn/${weatherIconId}.png`;
  console.log(weatherObj);
  heading.textContent = `${cityName} (${dayjs().format(strDateFormat)})`;
  heading.appendChild(weatherIcon);
  if (localStorage.getItem("units") === "metric") {
    tempP.textContent = `Temperature: ${getWeatherTemp(weatherObj)}°C`;
    windP.textContent = `Wind Speed: ${getWindSpeed(
      weatherObj
    )} meters per seconds`;
  } else {
    tempP.textContent = `Temperature: ${getWeatherTemp(weatherObj)}°F`;
    windP.textContent = `Wind Speed: ${getWindSpeed(
      weatherObj
    )} miles per hour`;
  }
  humidityP.textContent = `Humidity: ${getWeatherHumidity(weatherObj)}%`;
}

function renderForecastData(forecastData) {
  // render forecast data to the page
  const forecastDiv = document.createElement("div");
  const forecastHeading = document.createElement("h3");
  const forecastIcon = document.createElement("img");
  const forecastTemp = document.createElement("p");
  const forecastHumidity = document.createElement("p");
  const forecastWindSpeed = document.createElement("p");
  forecastIcon.src = `http://openweathermap.org/img/wn/${forecastData.weather[0].icon}.png`;
  forecastTemp.classList.add("mb-3");
  forecastHumidity.classList.add("mb-3");
  forecastWindSpeed.classList.add("mb-3");
  forecastDiv.setAttribute("class", "forecast-card w-full lg:w-1/6 mx-3 mb-4 bg-gray-800 text-white p-2 rounded-md");
  forecastHeading.setAttribute("class", "forecast-heading text-2xl text-bold mb-2");
  forecastHeading.textContent = dayjs(forecastData.dt_txt).format(strDateFormat);
  if (localStorage.getItem("units") === "metric") {
    forecastTemp.textContent = `Temp: ${forecastData.main.temp}°C`;
    forecastWindSpeed.textContent = `Wind Speed: ${forecastData.wind.speed} m/s`;
  } else {
    forecastTemp.textContent = `Temp: ${forecastData.main.temp}°F`;
    forecastWindSpeed.textContent = `Wind Speed: ${forecastData.wind.speed} mph`;
  }
  forecastHumidity.textContent = `Humidity: ${forecastData.main.humidity}%`;
  forecastDiv.appendChild(forecastHeading);
  forecastDiv.appendChild(forecastIcon);
  forecastDiv.appendChild(forecastTemp);
  forecastDiv.appendChild(forecastHumidity);
  forecastDiv.appendChild(forecastWindSpeed);
  forecastCardsDiv.appendChild(forecastDiv);
}


function isRepeated(city) {
  const lastSearched = getSessionLastResult().city;
  if (lastSearched.toLowerCase() === city.toLowerCase()) {
    return true;
  }
}

/*
Init functions
*/

/*
Event listeners
*/

window.addEventListener("load", (e) => {
  e.preventDefault();
  let units = localStorage.getItem("units") || "metric";
  if (units) {
    const selectedLabel = document.getElementById(`${units}`);
    const selectedRadio = document.querySelector(
      `input[name="units"][value="${units}"]`
    );
    console.log(selectedRadio);
    selectedRadio.checked = true;
    selectedLabel.classList.add("bg-orange-500", "text-white");

  }
  const lastSearched = getSessionLastResult().city;
  getWeather(lastSearched);
});

searchCityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = searchCityInput.value;
  searchCityInput.value = "";
  if (!isRepeated(city)){
    getWeather(city);
  }

});

document.querySelectorAll('input[name="units"]').forEach((input) => {
  input.addEventListener("change", (e) => {
    e.preventDefault();
    document
      .querySelectorAll('label[for="celcius"], label[for="farenheit"]')
      .forEach((label) => {
        if (label.htmlFor === e.target.id) {
          label.classList.add("bg-orange-500", "text-white");
          localStorage.setItem("units", label.dataset.units);
          const lastSearched = getSessionLastResult().city;
          getWeather(lastSearched);
        } else {
          label.classList.remove("bg-orange-500", "text-white");
        }
      });
  });
});

document.querySelector("#history").addEventListener("click", (e) => {
  e.preventDefault();
  const city = e.target.dataset.city;
  if (!isRepeated(city)){
    getWeather(city);
  }
});