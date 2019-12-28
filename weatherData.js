
export {renderWeatherDataToday, renderTemperatureForFollowingDays};

const temperatureTodayElement = document.getElementById('temperatureToday');
const fillLikeTemperatureElement = document.getElementById('fillLikeTemperature');
const nameCityElement = document.getElementById('nameCity');
const weatherDescriptionElement = document.getElementById('weatherDescription');
const windSpeedElement = document.getElementById('windSpeed');
const humidityPercentElement = document.getElementById('humidityPercent');

function convertTemperatureToCelsius(temperatureInFahrenheit) {
  const result = Math.round((5 / 9) * (temperatureInFahrenheit - 32));

  return result;
}

function setIconSkycans(IconName, id) {
  const skycons = new Skycons({ color: '#ffffff' });
  skycons.add(id, Skycons[IconName]);
  skycons.play();
}

function renderWeatherDataToday(data, nameCurrentCity) {
  const dailyData = data.daily.data[0];

  const temperatureInCelsius = convertTemperatureToCelsius(dailyData.temperatureHigh);
  const temperatureInFahrenheit = Math.round(dailyData.temperatureHigh);
  const fillLikeInCelsius = convertTemperatureToCelsius(dailyData.apparentTemperatureLow);
  const fillLikeInFahrenheit = Math.round(dailyData.apparentTemperatureLow);
  const weatherDescription = dailyData.summary;
  const { windSpeed } = dailyData;
  const humidity = dailyData.humidity * 100;
  const weatherIconName = dailyData.icon.toUpperCase().split('-').join('_');

  if ( window.activeTemperature === 'celsius') {
    temperatureTodayElement.innerHTML = `${temperatureInCelsius}&deg;`;
    fillLikeTemperatureElement.innerHTML = ` ${fillLikeInCelsius}&deg;`;
  } else if ( window.activeTemperature === 'fahrenheit') {
    temperatureTodayElement.innerHTML = `${temperatureInFahrenheit}&deg;`;
    fillLikeTemperatureElement.innerHTML = ` ${fillLikeInFahrenheit}&deg;`;
  }

  nameCityElement.textContent = nameCurrentCity;

  weatherDescriptionElement.textContent = weatherDescription;
  windSpeedElement.textContent = ` ${windSpeed} `;
  humidityPercentElement.textContent = ` ${humidity} %`;

  setIconSkycans(weatherIconName, 'skyconsToday');
}

function renderTemperatureForFollowingDays(data, numberDay, daytimeTemperature, skyconsDay) {
  const dailyDataDay = data.daily.data[numberDay];
  const weatherIconNameDay = dailyDataDay.icon.toUpperCase().split('-').join('_');
  const tempInCelsiusDay = convertTemperatureToCelsius(dailyDataDay.temperatureHigh);
  const tempInFahrenheitDay = Math.round(dailyDataDay.temperatureHigh);

  if ( window.activeTemperature === 'celsius') {
    daytimeTemperature.innerHTML = `${tempInCelsiusDay}&deg;`;
  } else if ( window.activeTemperature === 'fahrenheit') {
    daytimeTemperature.innerHTML = `${tempInFahrenheitDay}&deg;`;
  }

  setIconSkycans(weatherIconNameDay, skyconsDay);
}
