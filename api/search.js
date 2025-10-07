
import fs from 'fs';
import path from 'path';

export default async function (req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Search query (q) is required' });
  }

  try {
    const gamesFilePath = path.join(process.cwd(), 'src', 'games.json');
    const gamesFileContent = fs.readFileSync(gamesFilePath, 'utf-8');
    const gamesData = JSON.parse(gamesFileContent);

    const filteredGames = gamesData.games.filter(game =>
      game.title.toLowerCase().includes(q.toLowerCase())
    );

    res.status(200).json(filteredGames);
  } catch (error) {
    console.error('Error in search API:', error);
    res.status(500).json({ message: 'Internal Server Error while searching for games.' });
  }
}
