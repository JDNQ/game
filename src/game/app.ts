import { settleRaidResult } from "../raid/result.js";
import type { RaidResult } from "../raid/types.js";
import { PROTOTYPE_MAP } from "../shared/maps.js";
import { getItemDefinition } from "../shared/items.js";
import { BALANCE } from "../shared/balance.js";
import {
  getOrg,
  getPlayer,
  getShelter,
  IDS,
  loadWorld,
  resetWorld,
  runShelterUpkeep,
  saveWorld,
} from "./browserSave.js";
import type { PersistentWorldState } from "../persistent/save.js";
import {
  plannedWeight,
  stashSummary,
  withdrawLoadout,
} from "./loadout.js";
import { bindInput, createInput, endFrameInput } from "./input.js";
import { createPlayableRaid, type PlayableRaid } from "./playable.js";
import { updatePlayableRaid } from "./raidSim.js";
import { renderRaid } from "./render.js";

type Screen = "menu" | "shelter" | "loadout" | "raid" | "result";

export class GameApp {
  private world: PersistentWorldState;
  private screen: Screen = "menu";
  private root: HTMLElement;
  private canvas: HTMLCanvasElement | null = null;
  private unbindInput: (() => void) | null = null;
  private input = createInput();
  private play: PlayableRaid | null = null;
  private lastResult: RaidResult | null = null;
  private loadoutCounts: Record<string, number> = {};
  private entrySpawnId = "entry_alley_north";
  private raf = 0;
  private lastTs = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.world = loadWorld() ?? resetWorld("Người sống sót");
    this.render();
  }

  private player() {
    return getPlayer(this.world);
  }

  private org() {
    return getOrg(this.world);
  }

  private shelter() {
    return getShelter(this.world);
  }

  private setScreen(screen: Screen): void {
    this.stopRaidLoop();
    this.screen = screen;
    this.render();
  }

  private stopRaidLoop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.unbindInput?.();
    this.unbindInput = null;
    this.canvas = null;
  }

  private render(): void {
    switch (this.screen) {
      case "menu":
        this.renderMenu();
        break;
      case "shelter":
        this.renderShelter();
        break;
      case "loadout":
        this.renderLoadout();
        break;
      case "raid":
        this.renderRaidScreen();
        break;
      case "result":
        this.renderResult();
        break;
    }
  }

  private renderMenu(): void {
    const p = this.player();
    this.root.innerHTML = `
      <div class="panel hero">
        <p class="eyebrow">Prototype · Extraction PvE</p>
        <h1>Ven Kênh</h1>
        <p class="lead">Rời nơi trú ẩn, tìm vật tư và người sống sót, rồi rút về qua bến phà. Đồ mang theo có thể mất.</p>
        <div class="row">
          <button id="btn-continue" class="primary">Vào nơi trú ẩn</button>
          <button id="btn-new">Chơi mới</button>
        </div>
        <p class="meta">${p.displayName} · Raid ${p.stats.raidsExtracted}/${p.stats.raidsAttempted} · Đã cứu ${p.stats.survivorsRescued}</p>
      </div>
    `;
    this.root.querySelector("#btn-continue")?.addEventListener("click", () => {
      this.setScreen("shelter");
    });
    this.root.querySelector("#btn-new")?.addEventListener("click", () => {
      const name = prompt("Tên nhân vật", p.displayName) ?? p.displayName;
      this.world = resetWorld(name.trim() || "Người sống sót");
      this.setScreen("shelter");
    });
  }

  private renderShelter(): void {
    const p = this.player();
    const org = this.org();
    const shelter = this.shelter();
    const roster = org.roster.members
      .map((m) => `<li>${m.displayName}</li>`)
      .join("") || "<li class='muted'>Chưa cứu được ai</li>";
    const stash = stashSummary(p)
      .map((s) => `<li>${s.name} ×${s.qty}</li>`)
      .join("") || "<li class='muted'>Kho trống</li>";

    this.root.innerHTML = `
      <div class="layout">
        <header class="top">
          <div>
            <h2>Nơi trú ẩn</h2>
            <p class="muted">${shelter.name} · ${org.name}</p>
          </div>
          <button id="btn-menu">Menu</button>
        </header>
        <div class="grid-2">
          <section class="panel">
            <h3>Cộng đồng</h3>
            <p>Nước dự trữ: <strong>${shelter.waterReserve}</strong> · Thực phẩm: <strong>${shelter.foodReserve}</strong></p>
            <p>An toàn tổ chức: ${org.safety}/100</p>
            <h4>Người được cứu</h4>
            <ul>${roster}</ul>
            <button id="btn-upkeep">Tiêu hao ngày</button>
            <p id="upkeep-msg" class="muted"></p>
          </section>
          <section class="panel">
            <h3>Kho cá nhân</h3>
            <ul>${stash}</ul>
            <p class="muted">Thất bại có thể mất đồ mang theo (giữ tối đa 1 súng).</p>
            <button id="btn-prep" class="primary">Chuẩn bị chuyến đi</button>
          </section>
        </div>
        <section class="panel">
          <h3>Bản đồ: ${PROTOTYPE_MAP.name}</h3>
          <p>${PROTOTYPE_MAP.description}</p>
        </section>
      </div>
    `;
    this.root.querySelector("#btn-menu")?.addEventListener("click", () => this.setScreen("menu"));
    this.root.querySelector("#btn-prep")?.addEventListener("click", () => {
      this.initLoadoutDefaults();
      this.setScreen("loadout");
    });
    this.root.querySelector("#btn-upkeep")?.addEventListener("click", () => {
      const msg = runShelterUpkeep(this.world);
      const el = this.root.querySelector("#upkeep-msg");
      if (el) el.textContent = msg;
      this.renderShelter();
      const el2 = this.root.querySelector("#upkeep-msg");
      if (el2) el2.textContent = msg;
    });
  }

  private initLoadoutDefaults(): void {
    const summary = stashSummary(this.player());
    const counts: Record<string, number> = {};
    for (const s of summary) {
      if (s.id === "makeshift_pistol") counts[s.id] = Math.min(1, s.qty);
      else if (s.id === "pistol_ammo") counts[s.id] = Math.min(15, s.qty);
      else if (s.id === "bandage") counts[s.id] = Math.min(3, s.qty);
      else if (s.id === "bottled_water") counts[s.id] = Math.min(2, s.qty);
      else if (s.id === "medkit") counts[s.id] = Math.min(1, s.qty);
      else counts[s.id] = 0;
    }
    this.loadoutCounts = counts;
  }

  private renderLoadout(): void {
    const p = this.player();
    const summary = stashSummary(p);
    const weight = plannedWeight(this.loadoutCounts);
    const over = weight > BALANCE.player.baseCarryWeightKg;

    const rows = summary
      .map((s) => {
        const selected = this.loadoutCounts[s.id] ?? 0;
        return `
          <tr>
            <td>${s.name}</td>
            <td>${s.qty}</td>
            <td>
              <button data-dec="${s.id}">−</button>
              <span class="qty">${selected}</span>
              <button data-inc="${s.id}">+</button>
            </td>
          </tr>`;
      })
      .join("");

    this.root.innerHTML = `
      <div class="layout">
        <header class="top">
          <div>
            <h2>Chuẩn bị chuyến đi</h2>
            <p class="muted">Giới hạn tải ${BALANCE.player.baseCarryWeightKg}kg · hiện ${weight.toFixed(1)}kg
              ${over ? " · <span class='bad'>QUÁ TẢI</span>" : ""}</p>
          </div>
          <button id="btn-back">Quay lại</button>
        </header>
        <section class="panel">
          <table class="table">
            <thead><tr><th>Vật phẩm</th><th>Trong kho</th><th>Mang theo</th></tr></thead>
            <tbody>${rows || "<tr><td colspan='3'>Kho trống — chơi mới để nhận đồ khởi đầu.</td></tr>"}</tbody>
          </table>
        </section>
        <section class="panel row wrap">
          <label>Điểm vào
            <select id="spawn">
              <option value="entry_alley_north">Hẻm phía Bắc (an toàn hơn)</option>
              <option value="entry_road_east">Đường lớn Đông (gần loot)</option>
            </select>
          </label>
          <button id="btn-deploy" class="primary" ${over ? "disabled" : ""}>Xuất phát</button>
        </section>
        <p class="muted">Mục tiêu: nhặt loot, cứu NPC ở nhà ống, rút qua bến phà. Tiếng súng kéo zombie.</p>
      </div>
    `;

    const spawn = this.root.querySelector("#spawn") as HTMLSelectElement;
    spawn.value = this.entrySpawnId;
    spawn.addEventListener("change", () => {
      this.entrySpawnId = spawn.value;
    });

    this.root.querySelector("#btn-back")?.addEventListener("click", () => this.setScreen("shelter"));
    this.root.querySelectorAll("[data-inc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.inc!;
        const max = summary.find((s) => s.id === id)?.qty ?? 0;
        this.loadoutCounts[id] = Math.min(max, (this.loadoutCounts[id] ?? 0) + 1);
        this.renderLoadout();
      });
    });
    this.root.querySelectorAll("[data-dec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.dec!;
        this.loadoutCounts[id] = Math.max(0, (this.loadoutCounts[id] ?? 0) - 1);
        this.renderLoadout();
      });
    });
    this.root.querySelector("#btn-deploy")?.addEventListener("click", () => {
      try {
        const carried = withdrawLoadout(p, this.loadoutCounts);
        saveWorld(this.world);
        this.play = createPlayableRaid({
          raidId: crypto.randomUUID(),
          mapId: PROTOTYPE_MAP.id,
          partyMode: "solo",
          playerId: p.id,
          entrySpawnId: this.entrySpawnId,
          carried,
        });
        this.setScreen("raid");
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err));
        this.renderLoadout();
      }
    });
  }

  private renderRaidScreen(): void {
    this.root.innerHTML = `
      <div class="raid-wrap">
        <canvas id="game" width="960" height="640" tabindex="0"></canvas>
      </div>
    `;
    this.canvas = this.root.querySelector("#game");
    if (!this.canvas || !this.play) return;
    this.canvas.focus();
    this.input = createInput();
    this.unbindInput = bindInput(this.canvas, this.input);
    this.lastTs = performance.now();
    const loop = (ts: number): void => {
      if (!this.play || !this.canvas) return;
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      const ctx = this.canvas.getContext("2d");
      if (!ctx) return;
      updatePlayableRaid(
        this.play,
        this.input,
        dt,
        this.canvas.width,
        this.canvas.height,
      );
      renderRaid(ctx, this.play);
      endFrameInput(this.input);

      if (this.play.ended && this.play.result) {
        this.finishRaid(this.play.result);
        return;
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private finishRaid(result: RaidResult): void {
    if (!this.play) return;
    this.stopRaidLoop();
    const { result: settled } = settleRaidResult(this.world, this.play.raid, {
      organizationId: IDS.org,
      shelterId: IDS.shelter,
    });
    this.lastResult = settled ?? result;
    saveWorld(this.world);
    this.play = null;
    this.setScreen("result");
  }

  private renderResult(): void {
    const result = this.lastResult;
    if (!result) {
      this.setScreen("shelter");
      return;
    }
    const p = this.player();
    const loot = result.extractedLootByPlayer[p.id] ?? [];
    const lootLines =
      loot.map((i) => `<li>${getItemDefinition(i.definitionId).name} ×${i.quantity}</li>`).join("") ||
      "<li class='muted'>Không giữ được loot</li>";
    const title =
      result.outcome === "success"
        ? "Rút quân thành công"
        : result.outcome === "partial"
          ? "Rút một phần"
          : "Thất bại";

    this.root.innerHTML = `
      <div class="panel hero">
        <h1>${title}</h1>
        <p>NPC cứu thành công: ${result.rescuedNpcIds.length} · Thất bại cứu hộ: ${result.failedNpcIds.length}</p>
        <h3>Loot mang về kho</h3>
        <ul>${lootLines}</ul>
        <ul class="muted">${result.notes.map((n) => `<li>${n}</li>`).join("")}</ul>
        <p class="meta">Thống kê: ${p.stats.raidsExtracted}/${p.stats.raidsAttempted} extract · ${p.stats.survivorsRescued} người cứu</p>
        <button id="btn-shelter" class="primary">Về nơi trú ẩn</button>
      </div>
    `;
    this.root.querySelector("#btn-shelter")?.addEventListener("click", () => {
      this.setScreen("shelter");
    });
  }
}
