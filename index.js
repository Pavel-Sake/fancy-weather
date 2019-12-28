import {getImageBackgroundUrl, getWeatherData, initializeMap, getGeocoding, getCurrentNameCity} from './api.js';

import {GLOSSARY} from './glossary.js';

import {renderWeatherDataToday, renderTemperatureForFollowingDays} from './weatherData.js'


const fancyWeatherContentElement = document.getElementById('fancyWeather__content');
const fancyWeatherElement = document.getElementById('fancyWeather');

const backgroundButton = document.getElementById('buttonBackground');
const languageSelect = document.getElementById('menu__controlsSelect');

const dayOfWeekElement = document.getElementById('dayOfWeek');
const numberDayElement = document.getElementById('numberDay');
const monthElement = document.getElementById('month');
const timeElement = document.getElementById('time');

const searchCityInput = document.getElementById('searchCity');
const searchButton = document.getElementById('searchButton');
const formElement = document.getElementById('form');

const degreesElement = document.getElementById('degrees');

const fillLikeElement = document.getElementById('fillLike');
const windElement = document.getElementById('wind');
const windMsNameElement = document.getElementById('windMsName');
const humidityElement = document.getElementById('humidity');


const temperatureFirstDayElement = document.getElementById('temperatureFirstDay');
const temperatureSecondDayElement = document.getElementById('temperatureSecondDay');
const temperatureThirdDayElement = document.getElementById('temperatureThirdDay');

const latitudeElement = document.getElementById('latitude');
const longitudeElement = document.getElementById('longitude');

const loadIconElement = document.getElementById('loadIcon');


 let language = languageSelect.value;
 let latitude = null;
 let longitude = null;

 window.activeTemperature = 'celsius';

let currentLocationDate = new Date();

const OPTIONS = {hour: '2-digit', minute: '2-digit'};
let currentTime = currentLocationDate.toLocaleTimeString('ru', OPTIONS);

function updateDateTimeElements() {
  dayOfWeekElement.textContent = GLOSSARY[language].days[currentLocationDate.getDay()];
  numberDayElement.textContent = `${currentLocationDate.getDate()}`;
  monthElement.textContent = GLOSSARY[language].month[currentLocationDate.getMonth()];
  timeElement.textContent = currentTime;
}

setInterval(updateDateTimeElements,  60 * 1000);

function setNextNameDays() {
  if ((currentLocationDate.getDay() + 1) > 6) {
    document.getElementById('nameFirstDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() - 6];
  } else {
    document.getElementById('nameFirstDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 1];
  }

  if ((currentLocationDate.getDay() + 2) > 6) {
    document.getElementById('nameSecondDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 1 - 6];
  } else {
    document.getElementById('nameSecondDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 2];
  }

  if ((currentLocationDate.getDay() + 3) > 6) {
    document.getElementById('nameThirdDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 2 - 6];
  } else {
    document.getElementById('nameThirdDay').textContent = GLOSSARY[language].days[currentLocationDate.getDay() + 3];
  }
}

setNextNameDays();

function updateTranslationMessages() {
  fillLikeElement.textContent = GLOSSARY[language].fillLike;
  windElement.textContent = GLOSSARY[language].wind;
  windMsNameElement.textContent = GLOSSARY[language].mS;
  humidityElement.textContent = GLOSSARY[language].humidity;

  searchCityInput.placeholder = GLOSSARY[language].searchCity;
  searchButton.textContent = GLOSSARY[language].search;

  latitudeElement.textContent = GLOSSARY[language].latitude;
  longitudeElement.textContent = GLOSSARY[language].longitude;
}

async function handleChangeLanguage() {
  language = languageSelect.value;
  updateDateTimeElements();
  updateTranslationMessages();
  await requestWeatherDataAndRender();
  setNextNameDays();
}

async function handleClickChangeBackground() {
  await showBootIcon();
  const imageUrl = await getImageBackgroundUrl(latitude, longitude, language);

  fancyWeatherElement.style.background = `url(${imageUrl})`;
  fancyWeatherElement.style.backgroundSize = 'cover';

  await showBootIcon();
}

async function handleClickDegreesButton(event) {
  const fahrenheitButton = document.getElementById('fahrenheit');
  const celsiusButton = document.getElementById('celsius');
  const { target } = event;

  if (target === fahrenheitButton) {
    celsiusButton.classList.remove('menu__controlsTemperature--active');
    fahrenheitButton.classList.add('menu__controlsTemperature--active');

    window.activeTemperature = 'fahrenheit';

    await requestWeatherDataAndRender();
  } else if (target === celsiusButton) {
    fahrenheitButton.classList.remove('menu__controlsTemperature--active');
    celsiusButton.classList.add('menu__controlsTemperature--active');

    window.activeTemperature = 'celsius';

    await requestWeatherDataAndRender();
  }
}

async function requestWeatherDataAndRender() {
  const data = await getWeatherData(latitude, longitude, language);
  const nameCurrentCity = await getCurrentNameCity(latitude, longitude, language);

  renderWeatherDataToday(data, nameCurrentCity);

  const nextDayNumber = 1;
  const SecondDayNumber = 2;
  const ThirdDayNumber = 3;
  const setTemperatureFirstDay = renderTemperatureForFollowingDays(data, nextDayNumber, temperatureFirstDayElement, 'skyconsFirstDay');
  const setTemperatureSecondDay = renderTemperatureForFollowingDays(data, SecondDayNumber, temperatureSecondDayElement, 'skyconsSecondDay');
  const setTemperatureThirdDay = renderTemperatureForFollowingDays(data, ThirdDayNumber, temperatureThirdDayElement, 'skyconsThirdDay');
}

const geolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function showCoordinates() {
  document.getElementById('latitudeDegrees').textContent = latitude.toFixed(6);
  document.getElementById('longitudeDegrees').textContent = longitude.toFixed(6);
}

async function geolocationSuccess(position) {
  const { coords } = position;

  let latitude = coords.latitude;
  let longitude = coords.longitude;

  setCoordinates(latitude, longitude);

  showCoordinates();

  await loadAndInitializeSettings();
}

async function loadAndInitializeSettings() {
  initializeMap(longitude, latitude);
  await requestWeatherDataAndRender();
  await handleClickChangeBackground();
}

function geolocationError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function initializeCurrentPositionAndSettings() {
  navigator.geolocation.getCurrentPosition(
    geolocationSuccess, geolocationError, geolocationOptions,
  );
}

async function handleSubmitForm(event) {
  await showBootIcon();

  event.preventDefault();
  const nameCity = searchCityInput.value;

  const dataGeocoding = await getGeocoding(nameCity);

  if (dataGeocoding === undefined) {
    await showBootIcon();
    alert('Запрос не обработался');
  }

  let latitude = dataGeocoding.geometry.lat;
  let longitude = dataGeocoding.geometry.lng;
  setCoordinates(latitude, longitude);

  showCoordinates();

  currentLocationDate = getCityDate(dataGeocoding.annotations.timezone.offset_sec);
  currentTime = currentLocationDate.toLocaleTimeString('ru', OPTIONS);

  updateDateTimeElements();

  await loadAndInitializeSettings();

  await showBootIcon();
}

function setCoordinates(latitudeNumber, longitudeNumber) {
  latitude = latitudeNumber;
  longitude = longitudeNumber
}

function getCityDate(cityTimeZoneOffsetSeconds) {
  const currentDate = new Date();
  const currentTime = currentDate.getTime();
  const timezoneOffsetInMS = currentDate.getTimezoneOffset() * 60000; // MS - milliseconds
  const cityTimeZoneOffsetInMS = cityTimeZoneOffsetSeconds * 1000;

  const cityDate = new Date(currentTime + timezoneOffsetInMS + cityTimeZoneOffsetInMS);

  return cityDate;
}

function showBootIcon() {
  loadIconElement.classList.toggle('loadIconHidden');
  fancyWeatherContentElement.classList.toggle('fancyWeather__contentOpacity');
}

initializeCurrentPositionAndSettings();
updateDateTimeElements();
updateTranslationMessages();

languageSelect.addEventListener('change', handleChangeLanguage);
formElement.addEventListener('submit', handleSubmitForm);
degreesElement.addEventListener('click', handleClickDegreesButton);
backgroundButton.addEventListener('click', handleClickChangeBackground);
