const https = require("https");
const fs = require("fs");
const path = require("path");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", reject);
  });
}

async function main() {
  const url = "https://www.tibidler.com/data/dailyBoosts.json";
  console.log("Fetching:", url);

  const data = await fetchJson(url);

  const output = {
    fetchedAt: new Date().toISOString(),
    source: url,
    monster: data.monster?.name || null,
    boss: data.boss?.name || null,
    monsterBonus: `${data.monster?.expMultiplier || 2}x EXP · ${data.monster?.lootRolls || 2}x loot`,
    bossBonus: `${data.boss?.expMultiplier || 2}x EXP · ${data.boss?.lootRolls || 2}x loot`,
    nextResetAt: data.nextResetAt || null
  };

  const outPath = path.join(__dirname, "..", "boosted.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log("Written:", outPath);
}

main().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});
