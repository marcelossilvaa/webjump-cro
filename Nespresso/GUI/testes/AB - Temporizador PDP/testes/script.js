if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
    enableHighAccuracy: true,
  });
} else {
  alert("Geolocalização não é suportada pelo seu navegador.");
}

function successCallback(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  reverseGeocode(latitude, longitude);
}

function errorCallback(error) {
  console.error("Erro ao obter localização:", error);
  // Opcionalmente, você pode usar geolocalização por IP aqui
  // getCityByIP();
}

function reverseGeocode(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const city =
        data.address.city || data.address.town || data.address.village;
      if (city) {
        console.log(`Cidade: ${city}`);
        // Aqui você pode utilizar o nome da cidade como quiser
      } else {
        console.log("Não foi possível determinar a cidade.");
      }
    })
    .catch((error) => {
      console.error("Erro ao obter o nome da cidade:", error);
    });
}

// Função opcional para obter cidade via IP
function getCityByIP() {
  fetch("http://ip-api.com/json/?fields=city")
    .then((response) => response.json())
    .then((data) => {
      const city = data.city;
      console.log(`Cidade (via IP): ${city}`);
    })
    .catch((error) => {
      console.error("Erro ao obter o nome da cidade via IP:", error);
    });
}
