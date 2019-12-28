
export {getImageBackgroundUrl, getWeatherData, initializeMap, getGeocoding, getCurrentNameCity};


const GOOGLE_MAP_TOKEN = 'pk.eyJ1Ijoic2FrZTIxMTAiLCJhIjoiY2szbjRhMmJiMDdzYzNkcWUwamZiNGswdCJ9.eF2G_hlyhZPfZ0XSGMZuKQ';
const IMAGE_API_KEY = '8226d696e33281b8ad77329f899972e326239bbb631c172df2093a250b2b1371';

const GEOCODING_KEY = 'd37c0dbff3f843eeb3445e13d02fd1a8';

const WEATHER_API_KEY = '9317f348a91e26e03fbeb67473c96ff4';

async function getImageBackgroundUrl(latitude, longitude, language) {
  const data = await getWeatherData(latitude, longitude, language);
  const currentWeather = data.daily.data[0].precipType;
  const { timezone } = data;
  const url = `https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=${currentWeather},${timezone}&client_id=${IMAGE_API_KEY}`;

  const response = await fetch(url);
  const imageData = await response.json();
  const { regular: imageUrl } = imageData.urls;

  return imageUrl;
}

function initializeMap(longitude, latitude) {
  mapboxgl.accessToken = GOOGLE_MAP_TOKEN;

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [longitude, latitude],
    zoom: 9,
  });

  new mapboxgl.Marker()
    .setLngLat([longitude, latitude])
    .addTo(map);
}

async function getWeatherData(latitude, longitude, language) {
  const url = `https://api.darksky.net/forecast/${WEATHER_API_KEY}/${latitude},${longitude}?lang=${language}`;
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

  const response = await fetch(proxyUrl + url);
  const data = await response.json();
  return data;
}

async function getGeocoding(city) {

  try {
    const urlGeocoding = `https://api.opencagedata.com/geocode/v1/json?q=${city}&language=be&key=${GEOCODING_KEY}`;

    const response = await fetch(urlGeocoding);
    const data = await response.json();

    const closestData = data.results[0];

    return closestData;
  }
  catch (e) {
    alert('Запрос не обработался');
  }
}

async function getCurrentNameCity(latitude, longitude, language) {
  try {
    const urlGeocoding = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&language=${language}&key=${GEOCODING_KEY}`;

    const response = await fetch(urlGeocoding);
    const data = await response.json();

    const closestData = data.results[0];

    const nameCurrentCity = `${closestData.components.country} / ${closestData.components.city}`;
    return nameCurrentCity;
  }
  catch (e) {
    alert('Запрос не обработался');
  }
}