# River Club｜德州撲克

繁體中文的單機德州撲克練習遊戲，一位玩家對戰三位電腦。全程使用虛擬籌碼。

## 啟動

需要 Node.js 22 或更新版本，無第三方依賴。

```sh
npm install
npm start
```

開啟 http://localhost:3000 。可直接執行 `node server.js`。測試：`node --test`。

## 遊戲

- 每位玩家初始 2,000 籌碼，固定小盲 10、大盲 20。
- 支援棄牌、過牌、跟注、加注、全下、邊池、平手分池、A2345 順子。
- 自動輪替莊家及盲注，輸光的電腦跳過；剩兩人改用 heads-up 盲注位置。
- 電腦只根據自己的底牌、公共牌與下注情況決策。
- 每手結束在 localStorage 保存籌碼；重新整理會從上一個已結算的進度開始新的一手。
- 這是本機練習版，沒有線上多人、帳號、真實金流或伺服器持久資料庫。

## BellD staging

此資料夾為 service root。啟動命令 `npm start`；Node 22；監聽 `PORT` 和 `0.0.0.0`；健康檢查 `/health`。沒有建置步驟、外部素材、密鑰或 outbound 需求。請將本資料夾的檔案提交到自己的 GitHub repository；不要提交工作區提供的 BellD beta 套件。

依上層 AGENTS.md 使用 BellD Console 匯入 repository，再檢查實際偵測的 descriptor、qualification 與 Surface。官方 Getting Started 亦支援 CLI `init --archive ZIP --json`，可使用工作區內的 river-club-source.zip，無需 GitHub repository。CLI 操作仍需登入，並在每個 API 命令指定 staging API URL。未完成平台驗證前不能視為部署完成。
