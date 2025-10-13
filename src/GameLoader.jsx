const createGameHtml = (game, downloadedUrl = null) => {
  if (!game) return '';

  const title = game.title;
  let content = '';

  switch (game.type) {
    case 'HTML':
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe src="/cached-game/${encodeURIComponent(game.link)}" sandbox="allow-scripts allow-same-origin"></iframe>
        </body>
        </html>`;
      break;
    case 'PROXY':
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${game.link}"></iframe>
        </body>
        </html>`;
      break;

    case 'FLASH':
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <base href="/">
          <title>${title}</title>
          <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            #ruffle-player { width: 100%; height: 100%; }
          </style>
          <script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
        </head>
        <body>
          <div id="ruffle-player"></div>
          <script>
            window.RufflePlayer = window.RufflePlayer || {};
            window.RufflePlayer.config = {
                "scale": "exactfit",
            };
            var ruffle = window.RufflePlayer.newest();
            var player = ruffle.createPlayer();
            player.id = "player";
            player.style.width = "100%";
            player.style.height = "100%";
            document.getElementById("ruffle-player").appendChild(player);
             player.load("${downloadedUrl || (game.link.startsWith('public/') ? game.link.substring('public'.length) : game.link)}");
          </script>
        </body>
        </html>`;
      break;

    case 'EMULATOR':
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            #game { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="game"></div>
          <script>
            window.EJS_pathtodata = "https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/";
            window.EJS_core = "${game.core}";
            window.EJS_gameUrl = "${game.link}";
            window.EJS_player = "#game";
          </script>
          <script src="https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js"></script>
        </body>
        </html>`;
      break;

    default:
      content = `Unsupported game type: ${game.type}`;
  }

  return content;
};

export default createGameHtml;