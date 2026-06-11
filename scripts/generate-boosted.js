const https = require("https");
const fs = require("fs");
const path = require("path");

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

async function main() {
  const url = "https://www.tibidler.com";
  console.log("Fetching:", url);
  const html = await fetchHtml(url);

  // Normalize whitespace
  const clean = html.replace(/\s+/g, " ");

  // Extract monster
  const monsterMatch = clean.match(/Monster<\/[^>]+>\s*<[^>]+>\s*([^<]+)/i);
  const bossMatch = clean.match(/Boss<\/[^>]+>\s*<[^>]+>\s*([^<]+)/i);

  // Extract bonuses
  const bonusMatches = [...clean.matchAll(/(\dx EXP\s*·\s*\dx loot)/g)].map(m => m[1]);

  const data = {
    fetchedAt: new Date().toISOString(),
    source: url,
    monster: monsterMatch ? monsterMatch[1].trim() : null,
    boss: bossMatch ? bossMatch[1].trim() : null,
    monsterBonus: bonusMatches[0] || null,
    bossBonus: bonusMatches[1] || null
  };

  const outPath = path.join(__dirname, "boosted.json");
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log("Written:", outPath);
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
