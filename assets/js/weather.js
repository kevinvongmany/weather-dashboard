const baseUrl = "https://api.openweathermap.org/data/2.5/forecast";
const apiKey = "9f56d69ab450c02cd489d786e4be2876";
const searchCityForm = document.getElementById("search-city");
const searchCityInput = document.getElementById("search-city-input");
const searchCityButton = document.getElementById("search-city-button");



function buildUrl(city, apiKey, units) {
  console.log(`${baseUrl}?q=${city}&appid=${apiKey}&units=${units}`);
  return `${baseUrl}?q=${city}&appid=${apiKey}&units=${units}`;
}

function getWeather(city) {
  // check if the city is the same as the last searched city so we're not spamming the API
  const lastResult = getSessionLastResult();
  console.log(lastResult);
  if (lastResult.city.toLowerCase() === city.toLowerCase()) {
    renderWeatherData(lastResult.data.list[0], lastResult.city);
    const cityHistory = updateHistory(lastResult.city);
    renderHistoryPanel(cityHistory);
    return
  }
  // make a fetch request to the API
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
      const cityHistory = updateHistory(dataCityName);
      updateSessionLastResult(dataCityName, data);
      renderHistoryPanel(cityHistory);
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
function createHistoryButton(city, historyPanel) {
  const buttonDiv = document.createElement("button");
  buttonDiv.setAttribute(
    "class",
    "w-10/12 bg-yellow-500 text-black border border-gray py-2 px-4 rounded-md mb-2 focus:outline-none hover:bg-yellow-600 hover:shadow-md transition duration-200 ease-in-out"
  );
  // add data attributes for future API calls
  buttonDiv.dataset.city = city; // useful for later if we want to make another API call
  buttonDiv.textContent = city;
  historyPanel.appendChild(buttonDiv);
}

function renderHistoryPanel(cities) {
  const historyDiv = document.querySelector("#history");
  historyDiv.innerHTML = "";
  console.log(cities);
  for (const index in cities) {
    // console.log(cities[index])
    createHistoryButton(cities[index], historyDiv);
  }
}

function getHistory() {
    return JSON.parse(localStorage.getItem("history")) || [];

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
    return JSON.parse(sessionStorage.getItem("lastSearched")) || [];
    
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
  heading.textContent = `${cityName} (${dayjs().format("MMMM D, YYYY")})`;
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

/*
Init functions
*/

/*
Event listeners
*/

window.addEventListener("load", (e) => {
  e.preventDefault();
  let units = localStorage.getItem("units");
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
  getWeather(city);

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
  getWeather(city);
});