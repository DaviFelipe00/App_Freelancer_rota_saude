const mapa = L.map('mapa').setView([-14.2350, -51.9253], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contribuidores'
}).addTo(mapa);

// Ícone de posto
const iconeSaude = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

function buscarLocal() {
  const endereco = document.getElementById('location-input').value;
  if (!endereco) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        alert('Local não encontrado.');
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      mapa.setView([lat, lon], 15);

      L.marker([lat, lon])
        .addTo(mapa)
        .bindPopup("Você está aqui!")
        .openPopup();

      buscarPostosDeSaude(lat, lon);
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao buscar localização.');
    });
}

function buscarPostosDeSaude(lat, lon) {
  const overpassUrl = "https://overpass-api.de/api/interpreter";
  const query = `
    [out:json];
    (
      node["amenity"~"hospital|clinic|doctors"](around:2000,${lat},${lon});
      way["amenity"~"hospital|clinic|doctors"](around:2000,${lat},${lon});
      relation["amenity"~"hospital|clinic|doctors"](around:2000,${lat},${lon});
    );
    out center;
  `;

  fetch(overpassUrl, {
    method: "POST",
    body: query
  })
    .then(res => res.json())
    .then(data => {
      if (data.elements.length === 0) {
        alert('Nenhum posto de saúde encontrado próximo.');
        return;
      }

      data.elements.forEach(element => {
        const nome = element.tags.name || "Posto de Saúde";
        const latLng = element.lat
          ? [element.lat, element.lon]
          : [element.center.lat, element.center.lon];

        L.marker(latLng, { icon: iconeSaude })
          .addTo(mapa)
          .bindPopup(nome);
      });
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao buscar postos de saúde.');
    });
}
