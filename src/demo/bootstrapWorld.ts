/**
 * Smoke demo: tạo world bền vững → mở raid → giả lập extract → settle 1 lần.
 * Chạy: npm run demo
 */
import path from "node:path";
import { createAlliance } from "../persistent/alliance.js";
import { createOrganization } from "../persistent/organization.js";
import { createPlayerProfile } from "../persistent/player.js";
import { createEmptyWorld } from "../persistent/save.js";
import { saveWorldToFile } from "../persistent/saveNode.js";
import { createShelter } from "../persistent/shelter.js";
import { createItemInstance } from "../shared/items.js";
import { PROTOTYPE_MAP } from "../shared/maps.js";
import { createRaidState } from "../raid/bootstrap.js";
import { settleRaidResult } from "../raid/result.js";
import { createSoloParty } from "../session/types.js";

async function main(): Promise<void> {
  const world = createEmptyWorld();
  const playerId = "player-demo";
  const orgId = "org-saigon-canal";
  const shelterId = "shelter-warehouse";

  const org = createOrganization(orgId, "Tổ tự vệ ven kênh", playerId);
  const player = createPlayerProfile(playerId, "Tai", orgId);
  const shelter = createShelter(shelterId, orgId, "Kho xưởng bỏ hoang");

  world.organizations.push(org);
  world.players.push(player);
  world.shelters.push(shelter);
  world.alliances.push(
    createAlliance("alliance-temp", "Liên minh tạm thời", [orgId]),
  );

  const party = createSoloParty(playerId, orgId);
  const carried = [
    createItemInstance("makeshift_pistol", 1),
    createItemInstance("bandage", 2),
    createItemInstance("bottled_water", 1),
  ];

  const raid = createRaidState({
    raidId: "raid-demo-001",
    mapId: PROTOTYPE_MAP.id,
    partyMode: party.mode,
    participants: [
      {
        playerId,
        entrySpawnId: "entry_alley_north",
        carried,
      },
    ],
  });

  // Simulate: claim NPC, pick clinic loot, extract at ferry.
  const npc = raid.survivors[0]!;
  npc.escortClaimPlayerId = playerId;
  npc.isEscorting = true;
  npc.hasExtracted = true;

  const playerState = raid.players[0]!;
  playerState.carried.push(createItemInstance("medkit", 1));
  playerState.hasExtracted = true;

  const extract = raid.extractions[0]!;
  extract.extractedPlayerIds.push(playerId);
  extract.extractedNpcIds.push(npc.id);
  raid.outcome = "success";

  const first = settleRaidResult(world, raid, {
    organizationId: orgId,
    shelterId,
  });
  const second = settleRaidResult(world, raid, {
    organizationId: orgId,
    shelterId,
  });

  const outPath = path.resolve("data", "world-demo.json");
  await saveWorldToFile(world, outPath);

  console.log(
    JSON.stringify(
      {
        partyMode: party.mode,
        map: PROTOTYPE_MAP.name,
        firstSettle: first.applied,
        secondSettleIgnored: !second.applied,
        outcome: first.result.outcome,
        rosterSize: org.roster.members.length,
        shelterItemCount: shelter.storage.items.length,
        playerStats: player.stats,
        notes: first.result.notes,
        savePath: outPath,
      },
      null,
      2,
    ),
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
