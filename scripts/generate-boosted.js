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
          reject("Failed to parse JSON: " + err);
        }
      });
    }).on("error", reject);
  });
}

async function main() {
  const url = "https://www.tibidler.com/data/dailyBoosts.json";
  console.log("Fetching:", url);

  const data = await fetchJson(url);

  if (!data || !data.monster || !data.boss) {
    throw new Error("dailyBoosts.json did not contain expected fields");
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    source: url,
    monster: data.monster.name,
    boss: data.boss.name,
    monsterBonus: `${data.monster.expMultiplier}x EXP · ${data.monster.lootRolls}x loot`,
    bossBonus: `${data.boss.expMultiplier}x EXP · ${data.boss.lootRolls}x loot`,
    nextResetAt: data.nextResetAt
  };

  const outPath = path.join(process.cwd(), "boosted.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log("Written:", outPath);
}

main().catch(err => {
  console.error("Script failed with error:");
  console.error(err);
  process.exit(1);
});
