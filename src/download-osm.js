const { loadAlmatyRoadNetwork } = require('./services/osm-loader');

// Запуск загрузки данных из OSM
async function downloadOsmData() {
  try {
    console.log('Начинаем загрузку дорожной сети Алматы...');
    // Используем true для принудительной загрузки данных с сервера OSM
    const roadNetwork = await loadAlmatyRoadNetwork(true);
    console.log('Загрузка завершена успешно!');
    console.log(`Загружено ${Object.keys(roadNetwork.nodes).length} узлов и ${roadNetwork.edges.length} дорог`);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
}

downloadOsmData(); 