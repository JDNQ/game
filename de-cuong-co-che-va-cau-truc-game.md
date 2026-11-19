# Đề cương cơ chế và cấu trúc game

> **Phiên bản:** 0.1 — tài liệu khởi đầu để dựng prototype  
> **Thể loại:** Sinh tồn zombie, extraction, PvE/PvPvE, quản lý cộng đồng  
> **Bối cảnh:** Việt Nam trong giai đoạn xã hội sụp đổ vì dịch zombie

## 1. Tầm nhìn

Người chơi là một người sống sót bình thường, không phải đặc vụ có bộ kỹ năng định sẵn. Họ rời nơi trú ẩn để tìm vật tư và người sống sót, rồi phải trở về qua điểm rút quân. Đồ mang vào có thể mất. Người được giải cứu chỉ gia nhập cộng đồng khi được đưa tới điểm rút quân và rời bản đồ thành công.

Các nhóm người sống sót tổ chức thành tổ chức và liên minh. Họ có thể hợp tác trong một chuyến đi hoặc tranh giành nguồn lực. Zombie luôn là mối đe dọa chính của thế giới và khiến mọi cuộc giao tranh phải trả giá bằng thời gian, đạn dược và tiếng ồn.

**Lời hứa trải nghiệm:** mỗi chuyến đi buộc người chơi cân nhắc cần gì, có thể mang gì, nên tránh ai và lúc nào phải rút.

## 2. Trụ cột thiết kế

1. **Sinh tồn bằng quyết định:** tài nguyên, sức khỏe, sức bền, tải trọng và thời gian đều hữu hạn.
2. **Extraction có giá trị:** rời bản đồ an toàn mới giữ được chiến lợi phẩm và hoàn thành cứu hộ.
3. **Nguy cơ có thể đọc hiểu:** zombie phản ứng theo quy tắc; thương tích và môi trường có nguyên nhân rõ ràng.
4. **Cộng đồng là tiến trình dài hạn:** vật tư và người được cứu giúp duy trì, mở rộng nơi trú ẩn.
5. **Bối cảnh Việt Nam tác động lối chơi:** hẻm, nhà ống, chợ, mưa lớn, ngập và khu dân cư tạo lựa chọn chiến thuật.

## 3. Vòng chơi

### Vòng dài hạn

Nơi trú ẩn → chuẩn bị chuyến đi → vào khu vực → tìm vật tư / cứu người → quyết định tiếp tục hay rút → extraction → phân phối vật tư / tiếp nhận người → chuẩn bị chuyến tiếp theo

### Vòng trong một chuyến đi

1. **Chuẩn bị:** chọn bản đồ, mục tiêu, ba lô, vũ khí, đạn, đồ y tế, nước và vật phẩm hỗ trợ.
2. **Xâm nhập:** xuất hiện tại một trong các điểm vào; đánh giá tiếng động, thời tiết, tuyến đường và dấu hiệu nguy hiểm.
3. **Thăm dò:** tìm vật tư, manh mối, mục tiêu nhiệm vụ hoặc người sống sót; quản lý tải trọng và tình trạng nhân vật.
4. **Ứng biến:** né tránh, đánh lạc hướng, chiến đấu, chữa trị, chia vật tư hoặc đổi tuyến khi tình hình thay đổi.
5. **Rút lui:** tới điểm rút khả dụng và hoàn tất điều kiện rời bản đồ.
6. **Kết quả:** nếu rút thành công, nhân vật, vật tư và người được hộ tống được lưu vào tổ chức; nếu thất bại, áp dụng mất mát theo quy tắc chuyến đi.

## 4. Chế độ tổ đội và nhân vật

### Chơi đơn và tổ đội

- **Chơi đơn:** một người chơi tự chuẩn bị, mang vật tư và xử lý mọi tình huống.
- **Tổ đội bạn bè:** mời người chơi khác tham gia cùng chuyến đi.
- **Tổ đội liên minh:** có thể mời tối đa một thành viên thuộc tổ chức khác trong cùng liên minh vào chuyến đi (quy mô tổ đội tối đa cần chốt trong prototype).
- Thành viên tổ đội là người chơi điều khiển nhân vật của mình; không phải operator có lớp/khả năng cố định.

### Người sống sót được giải cứu

- Là NPC gặp trong bản đồ, không phải nhân vật được chọn sẵn trước khi chuyến đi bắt đầu.
- Có thể cần hộ tống, chữa trị, dẫn ra khỏi nơi nguy hiểm hoặc tìm vật dụng hỗ trợ.
- Được tính là **cứu thành công** khi NPC còn sống và đã rời bản đồ qua điểm rút quân cùng tổ đội.
- Nếu NPC bị bỏ lại, chết hoặc tổ đội thất bại trước khi rút, nhiệm vụ cứu hộ không thành công.
- Sau khi về nơi trú ẩn, NPC được tiếp nhận vào tổ chức. Có thể mở rộng hệ thống sau này để họ đảm nhận công việc, có kỹ năng, nhu cầu và tình trạng riêng.

### Luật cần thể hiện rõ cho prototype

- Ai có quyền nhận một NPC nếu nhiều nhóm cùng tương tác?
- Khi tổ đội liên minh cùng rút, ai nhận chiến lợi phẩm và ai chịu trách nhiệm cho NPC?
- Nếu người chơi rời tổ đội giữa chuyến đi, NPC và vật phẩm đang mang xử lý thế nào?

Khuyến nghị prototype: nhóm tương tác đầu tiên nhận quyền hộ tống; cả nhóm phải rút thành công để tính cứu hộ; vật phẩm mang theo được phân chia sau chuyến đi bằng kho cá nhân hoặc quy tắc chia đã công bố trước khi vào trận.

## 5. Tài nguyên, trang bị và chiến lợi phẩm

### Tài nguyên chính

- **Nước sạch, thực phẩm:** duy trì cộng đồng và chuyến đi.
- **Thuốc, băng gạc, dụng cụ y tế:** xử lý chảy máu, đau, nhiễm trùng và thương tích.
- **Đạn, vũ khí, phụ kiện:** tự vệ; tiếng súng có thể kéo zombie.
- **Nhiên liệu, pin, linh kiện:** hỗ trợ máy phát, radio, đèn và sửa chữa nơi trú ẩn.
- **Vật liệu xây dựng:** gia cố, sửa chữa, mở rộng cơ sở.
- **Vật phẩm nhiệm vụ:** chìa khóa, hồ sơ, thiết bị liên lạc hoặc nguồn cung đặc biệt.

### Quy tắc thiết kế loot

- Mỗi vật phẩm có trọng lượng, kích thước hoặc giới hạn ngăn chứa để tải trọng trở thành quyết định.
- Vật phẩm được giữ lại khi extraction thành công; thất bại gây mất mát theo luật trận đã báo trước.
- Giá trị chiến lợi phẩm nên đi cùng chi phí rủi ro: đồ quý ở nơi nguy hiểm hơn, hoặc cần thời gian/tiếng động để lấy.
- Tránh buộc người chơi phải cày một loại vật phẩm phổ biến quá lâu để duy trì cộng đồng.

## 6. Hệ thống sức khỏe và debuff

Mỗi hiệu ứng có **nguyên nhân → ảnh hưởng → cách xử lý**. Prototype nên bắt đầu với số hiệu ứng nhỏ, dễ đọc, không cộng dồn vô hạn.

| Hiệu ứng | Nguyên nhân trong thế giới | Tác động gợi ý | Xử lý gợi ý |
|---|---|---|---|
| Chảy máu | Đạn, zombie cào/cắn, kính vỡ, dây thép gai, tôn sắc | Mất máu theo thời gian; vết nặng có thể làm nhân vật ngã quỵ | Băng gạc / bộ cầm máu |
| Gãy xương | Ngã từ mái hoặc cầu thang, vật nặng đè, va chạm mạnh | Không chạy hoặc leo bình thường; di chuyển chậm | Nẹp và điều trị tại nơi trú ẩn |
| Bong gân | Trượt nền ướt, hụt chân xuống mương, chạy trên gạch vỡ, quá tải | Giảm tốc độ và sức bền khi di chuyển | Nghỉ, băng ép hoặc thuốc giảm đau |
| Đau | Va đập, trúng đạn sượt, vết thương chưa xử lý | Rung/khó ngắm hoặc chậm thao tác trong thời gian ngắn | Thuốc giảm đau; điều trị nguyên nhân nếu cần |
| Kiệt sức | Chạy nhiều, leo trèo, bơi, mang nặng, đi xa dưới trời nóng | Giảm sức bền tối đa và hồi phục chậm | Nghỉ, giảm tải, uống nước |
| Mất nước | Thiếu nước trong chuyến đi, nóng ẩm, vận động lâu, sốt | Giảm sức bền và khả năng hồi phục | Uống nước sạch |
| Đói | Chuyến đi kéo dài không ăn, lao động nặng | Giảm hồi phục và sức bền khi kéo dài | Thực phẩm phù hợp |
| Nhiễm trùng | Vết cắn/cào không làm sạch, băng bẩn, vết thương tiếp xúc nước ngập ô nhiễm | Sốt, giảm thể lực; nặng lên nếu không chữa | Làm sạch, thuốc phù hợp, điều trị tại nơi trú ẩn |
| Choáng | Va đập đầu, ngã cao, vụ nổ gần, sự cố gây sốc | Tầm nhìn hoặc điều khiển suy giảm tạm thời | Tránh nguy hiểm, chờ hồi phục; khám nếu kéo dài |
| Nghe kém tạm thời | Súng/lựu đạn phát nổ sát bên, nhất là trong nhà kín | Khó định hướng âm thanh trong thời gian ngắn | Chờ hồi phục; nút tai có thể giảm nguy cơ |
| Ảnh hưởng mưa/ngập | Quần áo ướt lâu, lội nước, tầm nhìn kém, vết thương ngâm nước bẩn | Di chuyển chậm, lạnh/kiệt sức hoặc tăng nguy cơ nhiễm trùng | Thay/làm khô đồ, sơ cứu vết thương, chọn tuyến cao |
| Ảnh hưởng nóng ẩm | Vận động ngoài trời, mặc/mang trang bị nặng trong thời gian dài | Mất nước và kiệt sức nhanh hơn | Nghỉ nơi râm mát, giảm tải, uống nước |

**Nguyên tắc công bằng:** hiệu ứng nguy hiểm cần có tín hiệu hình ảnh/âm thanh/giao diện; người chơi phải hiểu nguyên nhân và biết cách xử lý trước khi nó gây hậu quả nặng.

## 7. Zombie và tiếng ồn

### Hành vi nền

- Zombie phát hiện người bằng khoảng cách nhìn, âm thanh và một số dấu hiệu môi trường.
- Có trạng thái tối thiểu: lang thang → nghi ngờ → truy đuổi → mất dấu/tìm kiếm → quay về.
- Tiếng súng, còi, phá cửa, máy phát và vật rơi tạo nguồn âm có cường độ và bán kính ảnh hưởng.
- Mật độ zombie tăng theo khu vực và sự kiện; không nên sinh zombie ngay sau lưng người chơi nếu không có báo hiệu.

### Tác động của giao tranh

Bắn có thể giải quyết mối đe dọa trước mắt nhưng tăng nguy cơ bị phát hiện, hao đạn và làm chậm đường rút. Zombie và người chơi khác tạo áp lực đồng thời; người chơi phải quyết định giao chiến có đáng giá hay không.

## 8. Bản đồ và chất Việt Nam

Bản đồ nên có nhiều tuyến vào/ra và các điểm mốc dễ nhớ. Một bản đồ prototype có thể là khu dân cư ven kênh gồm hẻm nhỏ, nhà ống, chợ, trường học, trạm y tế, cửa hàng, bờ kênh và đường lớn.

- **Hẻm/nhà ống:** tầm nhìn ngắn, nhiều cửa và cầu thang; âm thanh vọng trong không gian kín.
- **Chợ:** loot đa dạng nhưng nhiều vật cản và nguồn tiếng động.
- **Trạm y tế:** xác suất có thuốc cao, nguy cơ và cạnh tranh cũng cao.
- **Mưa/ngập:** đổi tuyến, che một số âm thanh, làm chậm di chuyển và làm một số khu vực khó tiếp cận.
- **Mất điện:** tối, cần đèn; ánh sáng có thể giúp nhìn nhưng làm lộ vị trí.
- **Điểm rút:** phà, xe tải, cổng khu dân cư, bến hoặc lối thoát có điều kiện cụ thể.

Mỗi bản đồ cần có tuyến rủi ro thấp nhưng xa, tuyến nhanh nhưng nguy hiểm, cùng ít nhất một điều kiện thay đổi trong trận.

## 9. Nơi trú ẩn, tổ chức và liên minh

### Nơi trú ẩn

Là trung tâm giữa các chuyến đi. Tối thiểu gồm kho vật tư, khu điều trị, khu sinh hoạt và bảng chuẩn bị nhiệm vụ. Vật tư mang về được dùng để duy trì cộng đồng và chuẩn bị chuyến đi tiếp.

### Tổ chức

Nhóm cộng đồng của người chơi. Có kho chung hoặc kho cá nhân (cần chọn cho prototype), thành viên được cứu, nhu cầu cơ bản và mức an toàn. Thành viên NPC có thể bổ sung lao động/kỹ năng sau khi được tiếp nhận.

### Liên minh và chiến tranh

- Nhiều tổ chức có thể liên minh để hỗ trợ lẫn nhau và cho phép mời một thành viên tổ chức đồng minh vào chuyến đi.
- Các liên minh có thể tranh giành vật tư, tuyến tiếp tế hoặc địa điểm chiến lược.
- Chiến tranh cần mục tiêu, thời hạn và phần thưởng rõ; không nên cho phép nhóm mạnh liên tục cướp tài nguyên của nhóm yếu ngoài mọi giới hạn.
- PvP là một lớp xung đột bên cạnh zombie. Bản đồ, tiếng súng, thời gian và nguồn lực phải khiến giao tranh có chi phí.

## 10. Điều kiện kết quả chuyến đi

### Thành công

- Người chơi/nhóm tới extraction còn sống và hoàn tất điều kiện điểm rút.
- Chiến lợi phẩm hợp lệ được đưa về.
- NPC được hộ tống còn sống và rời bản đồ thì được đánh dấu cứu thành công.

### Thất bại hoặc rút một phần

- Bị hạ gục, hết thời gian rút, không tới được điểm rút hoặc bỏ lại người cần cứu.
- Quy định vật phẩm thất lạc, hồi phục nhân vật và cứu hộ thất bại phải hiển thị trước chuyến đi.
- Có thể hỗ trợ rút một phần theo tổ đội: người rời bản đồ giữ phần đã mang, NPC chỉ tính thành công nếu đi cùng người được chỉ định/nhóm theo quy tắc rõ ràng.

## 11. Cấu trúc hệ thống phần mềm

Tách hệ thống thành các mô-đun để có thể xây prototype theo thứ tự. Đây là cấu trúc logic, không phụ thuộc engine cụ thể.

    Game
    ├── Frontend
    │   ├── MainMenu / Lobby
    │   ├── LoadoutScreen
    │   ├── ShelterScreen
    │   └── HUD / Inventory / Medical UI
    ├── Session
    │   ├── PartyService (solo, bạn bè, thành viên liên minh)
    │   ├── Matchmaking / SessionHost
    │   └── RaidResultService
    ├── Raid (một chuyến đi)
    │   ├── PlayerController & Combat
    │   ├── Health / StatusEffectSystem
    │   ├── Inventory / LootSpawner
    │   ├── ZombieAI & SoundPerception
    │   ├── RescuedSurvivorAI / EscortObjective
    │   ├── Weather / WorldHazards
    │   ├── ExtractionPoint / ObjectiveSystem
    │   └── RaidState & Timer
    ├── Persistent World
    │   ├── PlayerProfile / Organization
    │   ├── Shelter / Storage / SurvivorRoster
    │   ├── Alliance / ConflictState
    │   └── Save / Backend API
    └── Shared Data
        ├── ItemDefinitions
        ├── StatusEffectDefinitions
        ├── Map / Spawn / Extraction Definitions
        └── Balance Configuration

### Ranh giới dữ liệu

- **Dữ liệu trận:** vị trí, máu, debuff, loot đã nhặt, NPC đang hộ tống, trạng thái extraction. Xóa hoặc kết toán khi trận kết thúc.
- **Dữ liệu bền vững:** hồ sơ người chơi, trang bị trong kho, tổ chức, người được cứu, nơi trú ẩn, liên minh và kết quả chuyến đi.
- **Nguồn dữ liệu có thẩm quyền:** nếu có multiplayer cạnh tranh, máy chủ xác thực sát thương, loot, trạng thái cứu hộ và extraction để tránh bất đồng giữa máy khách.
- **Lưu kết quả:** kết quả chuyến đi cần ghi nhận một lần duy nhất để tránh nhân đôi loot hoặc thành viên NPC khi mạng mất kết nối.

### Dữ liệu tối thiểu cho các đối tượng

- Player: ID, hồ sơ, tổ chức, kho, trạng thái trận.
- Item: ID định nghĩa, số lượng, vị trí/kho, trọng lượng, giá trị, loại.
- StatusEffect: loại, cường độ, thời gian, nguồn gây ra, cách điều trị.
- SurvivorNPC: ID, sức khỏe, trạng thái hộ tống, yêu cầu cứu hộ, tổ chức tiếp nhận.
- Raid: bản đồ, người tham gia, mục tiêu, thời tiết, trạng thái và thời hạn.
- ExtractionPoint: điều kiện mở, thời gian kích hoạt, người/NPC đã rút.
- Organization/Alliance: thành viên, quyền, quan hệ, mục tiêu tranh chấp.

## 12. Phạm vi prototype đề xuất

### Prototype đầu tiên

- Một bản đồ khu dân cư nhỏ.
- Một người chơi; cấu trúc điều khiển để mở rộng co-op sau.
- Một loại zombie với các trạng thái AI cơ bản.
- Loot ba nhóm: y tế, sinh tồn, đạn/vũ khí.
- Một NPC cần hộ tống và một điểm rút.
- Hai debuff để chứng minh vòng lặp: chảy máu và kiệt sức (sau đó bổ sung mất nước).
- Một chuyến đi ngắn với kết quả thành công/thất bại, đưa loot và người sống sót về nơi trú ẩn.

### Sau khi vòng lặp đơn hoạt động

1. Nhiều mục tiêu loot và nhiều điểm rút.
2. Nước sạch, đói/khát, thời tiết mưa/ngập.
3. Quản lý nơi trú ẩn và roster người được cứu.
4. Co-op bạn bè, kết toán đồng bộ và chống mất dữ liệu.
5. Mời thành viên liên minh.
6. PvPvE và tranh chấp liên minh.

Đưa chiến tranh liên minh xuống sau cùng vì nó đòi hỏi hạ tầng máy chủ, cân bằng kinh tế, quy tắc ghép trận và biện pháp chống áp đảo. Trước đó cần chứng minh chuyến đi PvE và cứu hộ đã vui, rõ ràng và có nhịp độ tốt.

## 13. Câu hỏi cần quyết định trong quá trình prototype

- Góc nhìn: góc nhìn thứ nhất hay thứ ba?
- PvP xuất hiện trong mọi chuyến đi, chỉ khu vực tranh chấp, hay theo sự kiện?
- Quy mô tổ đội tối đa và cách mời người từ tổ chức đồng minh?
- Thất bại làm mất toàn bộ trang bị mang theo hay có giới hạn bảo vệ?
- Kho vật tư cá nhân hay kho chung của tổ chức?
- Người được cứu có kỹ năng/nhu cầu gì và có thể chết sau khi đã gia nhập không?
- Chiến tranh liên minh diễn ra theo mùa, theo khu vực hay qua nhiệm vụ tranh chấp?

## 14. Tiêu chí hoàn thành prototype

Prototype đạt mục tiêu khi người chơi có thể:

- Chuẩn bị chuyến đi với giới hạn tải trọng và vật tư.
- Vào bản đồ, nhận biết zombie, tiếng ồn và ít nhất một nguy cơ môi trường.
- Nhặt đồ và gặp một NPC cần cứu.
- Chịu hoặc điều trị debuff có nguyên nhân dễ hiểu.
- Cân nhắc tiếp tục tìm đồ hay rút lui.
- Rút thành công để giữ loot và tiếp nhận NPC, hoặc thất bại để thấy kết quả mất mát đã được báo trước.
- Bắt đầu chuyến đi tiếp theo với trạng thái nơi trú ẩn được cập nhật.

