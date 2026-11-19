# Frontend (chưa dựng)

Các màn hình theo đề cương §11 sẽ gắn vào foundation này:

- `MainMenu` / `Lobby`
- `LoadoutScreen` — đọc `PlayerProfile.loadoutDefinitionIds` + `personalStash`
- `ShelterScreen` — `Shelter`, roster, upkeep
- `HUD` / Inventory / Medical UI — `RaidState`, `ActiveStatusEffect`

Logic dữ liệu nằm ở `shared/`, `persistent/`, `raid/` — UI chỉ bind và gọi service.
