# VN Zombie Extraction — phần đáy prototype

Foundation theo [đề cương cơ chế và cấu trúc game](./de-cuong-co-che-va-cau-truc-game.md) (§11–§12): **Shared Data**, **Persistent World**, khung **Raid/Session**. Chưa gắn engine/UI.

## Cấu trúc

```
src/
├── shared/       # Item, StatusEffect, Map, Balance definitions
├── persistent/   # Player, Organization, Shelter, Storage, Roster, Save
├── raid/         # RaidState bootstrap + kết toán kết quả (settle 1 lần)
├── session/      # Party solo (mở rộng co-op sau)
├── frontend/     # Placeholder màn hình
└── demo/         # Smoke test vòng prepare → raid → extract → shelter
```

## Chạy

```bash
npm install
npm run demo
```

Demo tạo `data/world-demo.json`, chứng minh: loot về kho trú ẩn, NPC vào roster, settle lần 2 bị bỏ qua.

## Quyết định prototype đã chốt trong code

| Chủ đề | Lựa chọn tạm |
|---|---|
| Kho | Cá nhân (`personalStash`) + kho shelter |
| Debuff | Chảy máu, kiệt sức (+ stub mất nước) |
| Bản đồ | `canal_neighborhood_v0` — khu dân cư ven kênh |
| Cứu hộ | Người tương tác đầu nhận escort; NPC chỉ thành công nếu extract cùng claimer |
| Thất bại | Mất loot mang theo; có thể giữ 1 vũ khí trang bị |

## Bước tiếp theo

1. Điều khiển nhân vật + combat/noise trên RaidState  
2. Zombie AI (wander → chase → search)  
3. HUD / loadout / shelter UI  
4. Co-op + đồng bộ kết toán  
