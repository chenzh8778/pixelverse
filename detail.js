(async function() {
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function populateSection(sectionId, content) {
    const sectionElement = document.getElementById(sectionId + '-section');
    const contentElement = document.getElementById(sectionId + '-content');
    
    if (content && sectionElement && contentElement) {
      contentElement.innerHTML = marked.parse(content);
      sectionElement.classList.remove('hidden');
    }
  }

  // New function to display recommended games
  function displayRecommendations(allGames, currentGameId) {
    const container = document.getElementById('recommendations-container');
    if (!container) return;

    // Filter out the current game
    const otherGames = allGames.filter(g => g.game_id !== currentGameId);

    // Shuffle the array of other games
    for (let i = otherGames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherGames[i], otherGames[j]] = [otherGames[j], otherGames[i]];
    }

    // Select the first 3 games to recommend
    const recommendedGames = otherGames.slice(0, 3);

    let htmlContent = '';
    recommendedGames.forEach(game => {
      htmlContent += `
        <div class="game-card bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
          <img src="${game.thumb}" alt="${game.title}" class="rounded-lg mb-3 aspect-video object-cover"/>
          <h4 class="text-lg font-semibold mb-1">${game.title}</h4>
          <p class="text-gray-500 text-sm flex-1">${game.description.substring(0, 75)}...</p>
          <a href="detail.html?game=${game.game_id}" class="mt-3 bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600">Play Game</a>
        </div>
      `;
    });
    
    container.innerHTML = htmlContent;
  }

  const gameId = getQueryParam('game');
  if (!gameId) {
    document.getElementById('game-title').textContent = 'Game Not Found';
    return;
  }

  const response = await fetch('games.json');
  const games = await response.json();
  const game = games.find(g => g.game_id === gameId);

  if (!game) {
    document.getElementById('game-title').textContent = 'Game Not Found';
    return;
  }

  // Populate main game info
  document.getElementById('game-title').textContent = game.title;
  document.getElementById('game-subtitle').textContent = game.subtitle || '';
  document.getElementById('game-iframe').src = game.iframe_url;
  document.getElementById('page-title').textContent = `${game.title} - Free Online Unblocked Game | H5 Game Park`;
  document.getElementById('meta-description').content = game.description;
  document.getElementById('meta-keywords').content = `${game.title}, free online, unblocked, H5 game`;
  
  // Populate content sections
  if (game.sections) {
    populateSection('overview', game.sections.overview);
    populateSection('how-to-play', game.sections.how_to_play);
    populateSection('features', game.sections.features);
    populateSection('pro-tips', game.sections.pro_tips);
    populateSection('similar-games', game.sections.similar_games);
    populateSection('faq', game.sections.faq);
  }

  // Display recommendations
  displayRecommendations(games, gameId);

  // JSON-LD Schema for SEO
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.title,
    "image": game.thumb,
    "description": game.description,
    "genre": "HTML5 Game",
    "operatingSystem": "Browser",
    "applicationCategory": "Game",
    "url": window.location.href
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);

})();