# 実装指示書：夫婦ID（‡ペアID）出力モードの追加 v3

## 概要
既存の `BloodlineGenerator.jsx` に、夫婦ペアID（‡形式）による出力モードを追加する。
現行のネスト括弧形式に加えて、LLM・人間の双方に読みやすいフラット参照形式の出力を可能にする。

---

## 現行の出力形式（変更なし・維持する）

```
ミュリエル：I1_F(H1(C1D1(A1B1))+J1)
```

## 追加する出力形式（‡ペアID参照形式）

### ブロック1：夫婦ID定義
```
=== 夫婦ID定義 ===
‡01: カロン(C1_F) + ルクロ(L1_M)
‡02: エイル(E1_F) + アシュリー(I1_M)
‡03: イーリス(I2_F) + スルト(S1_M)
‡04: セレスティーヌ(D1_F) + アルグレーン(A1_M)
‡05: アステリア(K1_F) + ディアン(D2_M)
‡06: ミュリエル(O1_F) + クロム(K2_M)
‡07: ノルン(I3_N→F) + オスカー(O2_M)
‡08: シンシア(J2_F) + (未定)
‡09: レフィル(R1_F) + ナール(V1_M)
‡10: アシェラ(H2_F) + (未定)
‡98: リリー(X1_F) + (未定)
†99: ライラ(Z1_F) + (未定)
```

### ブロック2：キャラ一覧（‡参照）
**全キャラを出力する。** 以下はサンプル（`...` は省略表記）。

```
カロン：C1_F
ルクロ：L1_M
エイル：E1_F
アシュリー：I1_M (‡01)
イーリス：I2_F (‡01)
ノルン：I3_N→F (‡01)
セレスティーヌ：D1_F (‡02)
ディアン：D2_M (‡02)
アルグレーン：A1_M
ミュリエル：O1_F (‡04)
オスカー：O2_M (‡04)
スルト：S1_M
アステリア：K1_F (‡03)
クロム：K2_M (‡03)
ルーグ：J1_M (‡06)
シンシア：J2_F (‡06)
ナール：V1_M
レフィル：R1_F (‡07)
ナハル：H1_M (‡09)
アシェラ：H2_F (‡09)
リリー：X1_F
ライラ：Z1_F
```

※ 親が未登録・pairId未設定のキャラは `(‡XX)` なしで出力される。
※ `results.forEach` で全キャラを走査して出力する（フィルタしない）。

---

## データ構造の変更

### キャラクターオブジェクトに追加するフィールド

```js
{
  // 既存フィールド（変更なし）
  id: "1",
  name: "カロン",
  code: "C1",
  gender: "F",
  father: "",
  mother: "",
  outsider: false,

  // 追加フィールド
  pairId: "01",      // ‡番号（2桁ゼロパディング）。空文字 "" = 未割当
  pairRole: "F",     // "F" or "M" or ""（ペアの中での役割）
  deceased: false,   // true = 死亡キャラ（表示時に ‡ → † に差替え）
}
```

### 設計ポイント：夫婦の双方にpairId + pairRoleを持たせる

同じ `pairId` を夫婦双方が持ち、`pairRole` で F/M を区別する。
これにより配偶者照合が双方向で可能になる。

```js
// カロン側
{ code: "C1", pairId: "01", pairRole: "F", deceased: false }
// ルクロ側
{ code: "L1", pairId: "01", pairRole: "M", deceased: false }

// 配偶者の検索（どちらからでも引ける）
const spouse = characters.find(c =>
  c.pairId === myChar.pairId &&
  c.pairId !== "" &&
  c.id !== myChar.id &&
  c.deceased === myChar.deceased  // ‡/†の名前空間を分離
);
```

### pairId の仕様
- **対象**: 全キャラ（F側・M側の両方に持たせる）
- **値**: 2桁ゼロパディングの数字文字列（"01"〜"99"）
- **"00" は禁止**（入力時にバリデーションで弾く）
- **空文字 `""`**: 未割当（独身 or 未設定）
- **‡記号はデータに含めない**: 表示・出力時に deceased フラグで `‡` / `†` を切り替えて付与
- **手動指定**: ユーザーが自由に番号を振れるようにする
- **正規化**: 入力欄の onBlur で1桁入力 → 2桁ゼロ埋めに自動変換（例: `"1"` → `"01"`）
- **ペア整合性チェック**: 同じpairId（同じdeceased状態）を持つキャラが3人以上いたら警告。同じpairIdでpairRoleが同じ（F同士、M同士）なら警告

### pairRole の仕様
- **値**: `"F"` / `"M"` / `""`
- pairIdが設定されているときのみ意味を持つ
- **pairIdが空なら pairRole も必ず空にする**（updateChar で自動保証。後述）
- キャラのgenderと一致するのが通常だが、強制はしない（N→F等のケースがあるため）

### deceased の仕様
- **値**: `true` / `false`
- デフォルト: `false`
- `true` のとき、表示上の記号が `‡` → `†` に変わる
- **現時点では†は単独運用のみを想定**（同一ペア内で片方だけ deceased のケースは将来対応）
- †側の番号は‡側と被らないよう運用する（ライラ=†99、リリー=‡98 等）

---

## 確定キャラデータ（initialCharacters）

```js
const initialCharacters = [
  { id: "1",  name: "カロン",          code: "C1", gender: "F",    father: "",   mother: "",   outsider: false, pairId: "01", pairRole: "F", deceased: false },
  { id: "2",  name: "ルクロ",          code: "L1", gender: "M",    father: "",   mother: "",   outsider: false, pairId: "01", pairRole: "M", deceased: false },
  { id: "3",  name: "エイル",          code: "E1", gender: "F",    father: "",   mother: "",   outsider: true,  pairId: "02", pairRole: "F", deceased: false },
  { id: "4",  name: "アシュリー",      code: "I1", gender: "M",    father: "L1", mother: "C1", outsider: false, pairId: "02", pairRole: "M", deceased: false },
  { id: "5",  name: "イーリス",        code: "I2", gender: "F",    father: "L1", mother: "C1", outsider: false, pairId: "03", pairRole: "F", deceased: false },
  { id: "6",  name: "ノルン",          code: "I3", gender: "N→F",  father: "L1", mother: "C1", outsider: false, pairId: "07", pairRole: "F", deceased: false },
  { id: "7",  name: "セレスティーヌ",  code: "D1", gender: "F",    father: "I1", mother: "E1", outsider: false, pairId: "04", pairRole: "F", deceased: false },
  { id: "8",  name: "ディアン",        code: "D2", gender: "M",    father: "I1", mother: "E1", outsider: false, pairId: "05", pairRole: "M", deceased: false },
  { id: "9",  name: "アルグレーン",    code: "A1", gender: "M",    father: "",   mother: "",   outsider: true,  pairId: "04", pairRole: "M", deceased: false },
  { id: "10", name: "ミュリエル",      code: "O1", gender: "F",    father: "A1", mother: "D1", outsider: false, pairId: "06", pairRole: "F", deceased: false },
  { id: "11", name: "オスカー",        code: "O2", gender: "M",    father: "A1", mother: "D1", outsider: false, pairId: "07", pairRole: "M", deceased: false },
  { id: "12", name: "スルト",          code: "S1", gender: "M",    father: "",   mother: "",   outsider: true,  pairId: "03", pairRole: "M", deceased: false },
  { id: "13", name: "アステリア",      code: "K1", gender: "F",    father: "S1", mother: "I2", outsider: false, pairId: "05", pairRole: "F", deceased: false },
  { id: "14", name: "クロム",          code: "K2", gender: "M",    father: "S1", mother: "I2", outsider: false, pairId: "06", pairRole: "M", deceased: false },
  { id: "15", name: "ルーグ",          code: "J1", gender: "M",    father: "K2", mother: "O1", outsider: false, pairId: "",   pairRole: "",  deceased: false },
  { id: "16", name: "シンシア",        code: "J2", gender: "F",    father: "K2", mother: "O1", outsider: false, pairId: "08", pairRole: "F", deceased: false },
  { id: "17", name: "ナール",          code: "V1", gender: "M",    father: "",   mother: "",   outsider: true,  pairId: "09", pairRole: "M", deceased: false },
  { id: "18", name: "レフィル",        code: "R1", gender: "F",    father: "O2", mother: "I3", outsider: false, pairId: "09", pairRole: "F", deceased: false },
  { id: "19", name: "ナハル",          code: "H1", gender: "M",    father: "V1", mother: "R1", outsider: false, pairId: "",   pairRole: "",  deceased: false },
  { id: "20", name: "アシェラ",        code: "H2", gender: "F",    father: "V1", mother: "R1", outsider: false, pairId: "10", pairRole: "F", deceased: false },
  { id: "21", name: "リリー",          code: "X1", gender: "F",    father: "",   mother: "",   outsider: true,  pairId: "98", pairRole: "F", deceased: false },
  { id: "22", name: "ライラ",          code: "Z1", gender: "F",    father: "",   mother: "",   outsider: true,  pairId: "99", pairRole: "F", deceased: true },
];
```

※ 全キャラに `pairId`, `pairRole`, `deceased` を明示的に持たせる（`undefined` を避ける）。
※ ライラは `deceased: true` なので表示時のみ `†99` と表記する。

---

## UI変更

### 1. 編集モードにpairId・pairRole・deceasedフィールドを追加

母・父セレクトの行と同じ段、もしくはその下に：

```
‡/† [ 01 ]  [F ▼]  □ 死亡
```

- pairId入力: `width: 44px`、数字のみ許可（0-9）、2文字まで
- **"00" はバリデーションエラー**（borderを `C.borderErr` に）
- **onBlur で正規化**: 1桁入力 `"1"` → `"01"` に自動ゼロ埋め。空文字はそのまま
- pairRoleセレクト: `width: 50px`、選択肢 = `""`, `"F"`, `"M"`
- **pairRole自動補助**: pairIdを入力した際にpairRoleが空なら、genderから自動セット：
  - `"F"` → pairRole `"F"`
  - `"N→F"` → pairRole `"F"`
  - `"M"` → pairRole `"M"`
  - `"N→M"` → pairRole `"M"`
  - `"N"` → **自動セットしない**（手動選択を促す。pairRoleが空のままだと警告表示）
- **pairIdを空にしたらpairRoleも自動で空にする**（updateChar内で連動）
- deceasedチェックボックス: チェックすると表示記号が `†` になる
- ペア整合性エラー時は入力欄のborderを `C.borderErr` に
- pairIdが入力済みでpairRoleが空の場合、pairRole欄のborderを `C.borderErr` で警告

### 2. 一覧表示（非編集モード）での‡/†表示

性別バッジ・外部バッジと同じ行に、pairIdが設定されている場合のみ表示：

```jsx
{char.pairId && (
  <span style={{
    fontSize: 10, padding: "1px 5px", borderRadius: 3,
    background: char.deceased ? C.deceasedBg : C.pairBg,
    color: char.deceased ? C.deceasedText : C.pairText,
    whiteSpace: "nowrap",
    fontFamily: '"Consolas", "Menlo", monospace',
  }}>
    {char.deceased ? "†" : "‡"}{char.pairId}{char.pairRole}
  </span>
)}
```

表示例: `‡01F`  `‡01M`  `†99F`  `‡98F`

### 3. 出力プレビューの切り替え

出力プレビューセクションのヘッダに切り替えボタンを追加：

```
[ネスト形式] [‡ペアID形式]    ← トグルボタン（state: outputMode）
```

- `outputMode` state: `"nest"` | `"pair"` （デフォルト: `"nest"`）
- `"nest"`: 現行のネスト括弧出力（変更なし）
- `"pair"`: ‡ペアID出力（下記の生成ロジック）

---

## ‡ペアID出力の生成ロジック

### state追加

```js
const [outputMode, setOutputMode] = useState("nest");
```

### 夫婦ペア一覧の生成（useMemo）

```js
const pairList = useMemo(() => {
  // pairIdが設定されているキャラをグルーピング
  // deceased でキーを分ける（‡01 と †01 は別ペア扱い）
  const pairMap = {};
  characters.forEach((c) => {
    if (!c.pairId || c.pairId.trim() === "") return;
    const symbol = c.deceased ? "†" : "‡";
    const key = `${symbol}${c.pairId}`;
    if (!pairMap[key]) pairMap[key] = { symbol, pairId: c.pairId, members: [] };
    pairMap[key].members.push(c);
  });

  // members から F/M を抽出（上書きではなく配列で保持し、先頭を使用）
  const result = Object.values(pairMap).map((group) => ({
    ...group,
    f: group.members.find((m) => m.pairRole === "F") || null,
    m: group.members.find((m) => m.pairRole === "M") || null,
  }));

  // ソート: ‡が先、†が後。同じ記号内は番号順
  result.sort((a, b) => {
    if (a.symbol !== b.symbol) return a.symbol === "‡" ? -1 : 1;
    return a.pairId.localeCompare(b.pairId);
  });

  return result;
}, [characters]);
```

### ‡形式テキスト出力

```js
const pairOutputText = useMemo(() => {
  if (outputMode !== "pair") return "";

  // ブロック1: 夫婦ID定義
  let block1 = "=== 夫婦ID定義 ===\n";
  pairList.forEach((p) => {
    const fPart = p.f
      ? `${p.f.name}(${p.f.code}_${p.f.gender})`
      : "(未定)";
    const mPart = p.m
      ? `${p.m.name}(${p.m.code}_${p.m.gender})`
      : "(未定)";
    block1 += `${p.symbol}${p.pairId}: ${fPart} + ${mPart}\n`;
  });

  // ブロック2: キャラ一覧（全キャラ出力、フィルタしない）
  let block2 = "\n";
  results.forEach((r) => {
    const base = `${r.name}：${r.code}_${r.gender}`;
    // このキャラの親ペアIDを探す（母親優先、なければ父親からフォールバック）
    const mother = r.mother ? characters.find((c) => c.code === r.mother) : null;
    const father = r.father ? characters.find((c) => c.code === r.father) : null;
    const parentChar = (mother && mother.pairId) ? mother : (father && father.pairId) ? father : null;
    let parentRef = "";
    if (parentChar && parentChar.pairId) {
      const sym = parentChar.deceased ? "†" : "‡";
      parentRef = ` (${sym}${parentChar.pairId})`;
    }
    block2 += `${base}${parentRef}\n`;
  });

  return block1 + block2;
}, [outputMode, pairList, results, characters]);
```

---

## コピー機能

- 全コピーボタン: `outputMode` に応じて出力テキストを切り替える
  - `"nest"` → 既存のネスト形式
  - `"pair"` → `pairOutputText`
- 個別コピー（行クリック）: `outputMode` に応じて形式を変える
  - `"nest"` → `キャラ名：fullCode`（現行）
  - `"pair"` → `キャラ名：code_gender (‡XX)` （pairIdがない場合は `キャラ名：code_gender`）

---

## ペア整合性チェック（useMemo）

```js
const pairErrors = useMemo(() => {
  const errors = [];
  const pairGroups = {};

  characters.forEach((c) => {
    if (!c.pairId || c.pairId.trim() === "") return;
    const sym = c.deceased ? "†" : "‡";
    const key = `${sym}${c.pairId}`;
    if (!pairGroups[key]) pairGroups[key] = [];
    pairGroups[key].push(c);
  });

  Object.entries(pairGroups).forEach(([key, members]) => {
    // 3人以上が同じペアIDを持っている
    if (members.length > 2) {
      errors.push({ type: "tooMany", key, members });
    }
    // 2人いるがpairRoleが同じ（F同士、M同士）
    if (members.length === 2 && members[0].pairRole === members[1].pairRole) {
      errors.push({ type: "sameRole", key, members });
    }
    // pairIdがあるのにpairRoleが空のメンバーがいる
    const emptyRole = members.filter((m) => !m.pairRole);
    if (emptyRole.length > 0) {
      errors.push({ type: "missingRole", key, members: emptyRole });
    }
  });

  return errors;
}, [characters]);
```

エラーがある場合、出力プレビューの上に警告を表示。

**重要：ペア整合性エラーが存在する状態では、‡ペアID形式の出力の正確性は保証しない。
ユーザーにはエラーを先に解消するよう促すメッセージを表示する。**

---

## 統計表示の拡張

ヘッダの統計エリアに夫婦ペア数を追加：

```
22名（血族16 / 外部6）/ ‡11組
```

### ペア数の数え方
- **‡のみカウントする（†は除外）**
- pairIdを持つキャラのうち `deceased === false` のものをグルーピングし、ユニークなpairId数をカウント
- 単独未定ペア（‡98のリリーのように相手がいないもの）も1組としてカウントする

```js
const pairCount = useMemo(() => {
  const ids = new Set();
  characters.forEach((c) => {
    if (c.pairId && c.pairId.trim() !== "" && !c.deceased) {
      ids.add(c.pairId);
    }
  });
  return ids.size;
}, [characters]);
```

---

## 新規キャラ追加時のデフォルト値

```js
{
  id: crypto.randomUUID(),
  name: "",
  code: "",
  gender: "M",
  father: "",
  mother: "",
  outsider: false,
  pairId: "",
  pairRole: "",
  deceased: false,
}
```

---

## 既存コードへの変更が必要な箇所

以下は指示書v2では「変更しない」としていたが、**実際には変更が必要な箇所**。

### 1. `updateChar` の拡張（変更必須）

既存の code カスケード更新に加えて、pair系の整合性維持ロジックを追加：

```js
const updateChar = useCallback((id, field, value) => {
  setCharacters((prev) => {
    const target = prev.find((c) => c.id === id);
    if (!target) return prev;

    // --- 既存: code カスケード更新（変更なし） ---
    const oldCode = target.code;
    if (field === "code" && oldCode !== value && oldCode.trim()) {
      return prev.map((c) => {
        if (c.id === id) return { ...c, [field]: value };
        let needsUpdate = false;
        const changes = {};
        if (c.father === oldCode) { changes.father = value; needsUpdate = true; }
        if (c.mother === oldCode) { changes.mother = value; needsUpdate = true; }
        return needsUpdate ? { ...c, ...changes } : c;
      });
    }

    // --- 追加: pairId を空にしたら pairRole も連動クリア ---
    if (field === "pairId" && (!value || value.trim() === "")) {
      return prev.map((c) =>
        c.id === id ? { ...c, pairId: "", pairRole: "" } : c
      );
    }

    // --- 追加: pairId 入力時に pairRole 自動補助 ---
    if (field === "pairId" && value && value.trim() !== "") {
      const currentRole = target.pairRole;
      if (!currentRole) {
        // gender から自動セット（"N" のときは空のまま）
        let autoRole = "";
        if (target.gender === "F" || target.gender === "N→F") autoRole = "F";
        else if (target.gender === "M" || target.gender === "N→M") autoRole = "M";
        // autoRole が空（gender="N"）のときは手動入力を促す
        return prev.map((c) =>
          c.id === id ? { ...c, pairId: value, pairRole: autoRole || currentRole } : c
        );
      }
    }

    // --- デフォルト: 単純更新 ---
    return prev.map((c) => (c.id === id ? { ...c, [field]: value } : c));
  });
}, []);
```

### 2. `duplicateCharacter` の変更（変更必須）

複製時に pairId / pairRole / deceased をリセットする。
そのまま引き継ぐと即座にペア整合性エラーが発生するため。

```js
const duplicateCharacter = useCallback((id) => {
  const newId = crypto.randomUUID();
  setCharacters((prev) => {
    const src = prev.find((c) => c.id === id);
    if (!src) return prev;
    const idx = prev.findIndex((c) => c.id === id);
    const dup = {
      ...src,
      id: newId,
      name: src.name + "(複)",
      code: "",
      // pair系はリセット（複製元のペアと衝突させない）
      pairId: "",
      pairRole: "",
      deceased: false,
    };
    const next = [...prev];
    next.splice(idx + 1, 0, dup);
    return next;
  });
  setEditingId(newId);
}, []);
```

### 3. `deleteSelected` の変更（変更必須）

一括削除でも、削除されたキャラのcodeを子キャラの father/mother からクリアする。
現行の `removeCharacter`（単体削除）と同等の孤立参照クリア処理を入れる。

```js
const deleteSelected = useCallback(() => {
  if (selected.size === 0) return;
  const visibleIds = new Set(filteredResults.map((r) => r.id));
  const toDelete = new Set([...selected].filter((id) => visibleIds.has(id)));
  if (toDelete.size === 0) return;

  setCharacters((prev) => {
    // 削除対象のcodeを収集
    const removedCodes = new Set(
      prev.filter((c) => toDelete.has(c.id) && c.code.trim()).map((c) => c.code)
    );
    // フィルタ後、残ったキャラの孤立参照をクリア
    return prev
      .filter((c) => !toDelete.has(c.id))
      .map((c) => {
        let changes = {};
        if (removedCodes.has(c.father)) changes.father = "";
        if (removedCodes.has(c.mother)) changes.mother = "";
        return Object.keys(changes).length > 0 ? { ...c, ...changes } : c;
      });
  });
  setSelected(new Set());
  setSelectMode(false);
  setEditingId(null);
}, [selected, filteredResults]);
```

### 4. `copySingle` の変更（軽微）

outputMode に応じて個別コピーのフォーマットを切り替える：

```js
const copySingle = useCallback((char) => {
  let text;
  if (outputMode === "pair") {
    const mother = char.mother ? characters.find((c) => c.code === char.mother) : null;
    const father = char.father ? characters.find((c) => c.code === char.father) : null;
    const parentChar = (mother && mother.pairId) ? mother : (father && father.pairId) ? father : null;
    const parentRef = parentChar && parentChar.pairId
      ? ` (${parentChar.deceased ? "†" : "‡"}${parentChar.pairId})`
      : "";
    text = `${char.name}：${char.code}_${char.gender}${parentRef}`;
  } else {
    text = `${char.name}：${char.fullCode}`;
  }
  navigator.clipboard.writeText(text);
}, [outputMode, characters]);
```

※ 呼び出し側も `copySingle(text)` → `copySingle(char)` にシグネチャ変更が必要。
一覧表示の onClick を修正：

```jsx
// 変更前
onClick={(e) => { e.stopPropagation(); copySingle(`${char.name}：${char.fullCode}`); }}

// 変更後
onClick={(e) => { e.stopPropagation(); copySingle(char); }}
```

### 5. `pairId` の onBlur 正規化ヘルパー

```js
const normalizePairId = useCallback((value) => {
  const digits = value.replace(/\D/g, "").slice(0, 2);
  if (!digits) return "";
  if (digits === "00") return "00"; // UIでエラー表示する（保存はされるがバリデーション警告）
  return digits.padStart(2, "0");
}, []);
```

UI側での使用：

```jsx
<input
  value={char.pairId}
  onChange={(e) => updateChar(char.id, "pairId", e.target.value.replace(/\D/g, "").slice(0, 2))}
  onBlur={(e) => updateChar(char.id, "pairId", normalizePairId(e.target.value))}
  ...
/>
```

---

## 変更しないもの

- ネスト括弧形式の生成ロジック（buildBloodline, generateFullCode 等）
- カスケード更新の基本ロジック（code変更時のfather/mother自動書き換え。ただし updateChar 自体には pair 系ロジックを追加）
- 検索・選択モード（ただし deleteSelected は孤立参照クリアを追加）
- 一括読込（importNames）→ 新規キャラの pairId, pairRole, deceased は `""`, `""`, `false` で初期化
- カラー定数 `C` の既存値（下記を追加するのみ）

### カラー定数に追加

```js
// C オブジェクトに追加
pairBg:       "#F5F0FF",   // ‡バッジ背景
pairText:     "#7755AA",   // ‡バッジ文字色
deceasedBg:   "#F5F0F0",   // †バッジ背景
deceasedText: "#AA5555",   // †バッジ文字色
```

---

## 現時点で許容するエッジケース（将来対応）

以下は認識済みだが、v1実装では対応しない。指示書に明記して将来の改修対象とする。

1. **両親のpairIdが不一致な場合**: mother優先のフォールバック仕様として許容。両親pairId不一致の検証・警告は将来対応
2. **同一ペア内で片方だけ deceased**: 現状†は単独運用のみ想定（ライラ†99のようなケース）。夫婦の一方だけ死亡した場合のペア表示は将来対応
3. **重複code状態でのpair出力**: 既存のcode重複問題がpairモードにも継承される。code重複時の出力正確性は保証しない

---

## 注意事項

- ‡記号（U+2021 DOUBLE DAGGER）、†記号（U+2020 DAGGER）はUTF-8で3バイト。表示・コピーともに問題なし
- pairIdのデータには‡/†記号を含めない。表示時にdeceasedフラグで切り替える
- †側の番号は‡側と番号が被らないよう運用する（ライラ=†99、リリー=‡98 等）
- 出力プレビューの切り替えは state だけで制御し、データ構造は共通
- 親ペア参照はmother優先、motherにpairIdがなければfatherからフォールバック
- pairId入力時にgenderからpairRoleを自動セットするが、ユーザーが上書き可能
- gender="N" のときは pairRole を自動セットしない（手動選択を促す）
- **ペア整合性エラーが存在する状態では‡形式出力の正確性を保証しない**
- 検索機能は pairId でもヒットするように拡張してもよい（任意）
