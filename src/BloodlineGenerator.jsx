import { useState, useMemo, useCallback } from "react";

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
  { id: "18", name: "レフィル",        code: "R1", gender: "F",    father: "A1", mother: "D1", outsider: false, pairId: "09", pairRole: "F", deceased: false },
  { id: "19", name: "ナハル",          code: "H1", gender: "M",    father: "V1", mother: "R1", outsider: false, pairId: "",   pairRole: "",  deceased: false },
  { id: "20", name: "アシェラ",        code: "H2", gender: "F",    father: "V1", mother: "R1", outsider: false, pairId: "10", pairRole: "F", deceased: false },
  { id: "21", name: "リリー",          code: "X1", gender: "F",    father: "",   mother: "",   outsider: true,  pairId: "98", pairRole: "F", deceased: false },
  { id: "22", name: "ライラ",          code: "Z1", gender: "F",    father: "",   mother: "",   outsider: true,  pairId: "99", pairRole: "F", deceased: true },
];

function findChar(code, characters) {
  return characters.find((c) => c.code === code);
}

function buildParentPart(parentCode, characters, visited) {
  if (!parentCode || parentCode.trim() === "") return { raw: "", hasBloodline: false };
  const parent = findChar(parentCode, characters);
  if (!parent) return { raw: parentCode, hasBloodline: false };
  const bl = buildBloodline(parent.code, characters, new Set(visited));
  if (bl) return { raw: `${parent.code}(${bl})`, hasBloodline: true };
  return { raw: parent.code, hasBloodline: false };
}

function buildBloodline(charCode, characters, visited = new Set()) {
  if (!charCode || charCode.trim() === "") return "";
  if (visited.has(charCode)) return "(!循環)";
  visited.add(charCode);

  const char = findChar(charCode, characters);
  if (!char) return "";

  const hasMother = char.mother && char.mother.trim() !== "";
  const hasFather = char.father && char.father.trim() !== "";
  if (!hasMother && !hasFather) return "";

  const motherChar = hasMother ? findChar(char.mother, characters) : null;
  const fatherChar = hasFather ? findChar(char.father, characters) : null;
  const motherPart = hasMother ? buildParentPart(char.mother, characters, visited) : null;
  const fatherPart = hasFather ? buildParentPart(char.father, characters, visited) : null;

  let result = "";
  if (motherPart) {
    const prefix = motherChar && motherChar.outsider ? "+" : "";
    result += prefix + motherPart.raw;
  }
  if (fatherPart) {
    const prefix = fatherChar && fatherChar.outsider ? "+" : "";
    result += prefix + fatherPart.raw;
  }
  return result;
}

function generateFullCode(char, characters) {
  const bl = buildBloodline(char.code, characters);
  const base = `${char.code}_${char.gender}`;
  if (bl) return `${base}(${bl})`;
  return base;
}

const C = {
  bg:         "#FFFDF9",
  bgCard:     "#FFFDF9",
  bgCardEdit: "#F5F2EC",
  bgCardSel:  "#FFF0F0",
  bgInput:    "#FFFFFF",
  bgHelp:     "#F7F5F0",
  bgPreview:  "#F7F5F0",
  bgBtn:      "#F0EDE8",
  bgSelBar:   "#FFF5F5",
  text:       "#01302C",
  textSub:    "#4A6A66",
  textMuted:  "#8A9E9B",
  textLight:  "#B0C0BD",
  border:     "#D8D2C8",
  borderLight:"#E8E4DC",
  borderEdit: "#2A8A7A",
  borderSel:  "#DDAAAA",
  borderErr:  "#CC3333",
  accent:     "#0A6B5C",
  accentCode: "#0A6B5C",
  accentLight:"#2A8A7A",
  outsider:   "#C07020",
  outsiderBg: "#FFF5EB",
  genderF:    "#C05588",
  genderFBg:  "#FFF0F6",
  genderM:    "#3366AA",
  genderMBg:  "#F0F4FF",
  genderN:    "#448844",
  genderNBg:  "#F0FFF0",
  danger:     "#CC3333",
  dangerText: "#BB4444",
  dangerBg:   "#FFF0F0",
  dangerBorder:"#DDAAAA",
  success:    "#2A7A2A",
  successBg:  "#F0FFF0",
  btnPrimary: "#0A6B5C",
  btnPrimaryText: "#FFFFFF",
  pairBg:       "#F5F0FF",
  pairText:     "#7755AA",
  deceasedBg:   "#F5F0F0",
  deceasedText: "#AA5555",
};

export default function BloodlineGenerator() {
  const [characters, setCharacters] = useState(initialCharacters);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [outputMode, setOutputMode] = useState("nest");

  const results = useMemo(() => {
    return characters.map((char) => ({
      ...char,
      fullCode: generateFullCode(char, characters),
    }));
  }, [characters]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return results;
    const q = searchQuery.toLowerCase();
    return results.filter(
      (r) =>
        r.id === editingId ||
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.fullCode.toLowerCase().includes(q) ||
        (r.pairId || "").includes(q)
    );
  }, [results, searchQuery, editingId]);

  // FIX 1: コード変更時に子キャラの father/mother も自動更新（カスケード更新）
  const updateChar = useCallback((id, field, value) => {
    setCharacters((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;

      // --- 既存: code カスケード更新 ---
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
          let autoRole = "";
          if (target.gender === "F" || target.gender === "N→F") autoRole = "F";
          else if (target.gender === "M" || target.gender === "N→M") autoRole = "M";
          return prev.map((c) =>
            c.id === id ? { ...c, pairId: value, pairRole: autoRole || currentRole } : c
          );
        }
      }

      // --- デフォルト: 単純更新 ---
      return prev.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    });
  }, []);

  // FIX 2: crypto.randomUUID() でユニークID生成
  const addCharacter = useCallback(() => {
    const newId = crypto.randomUUID();
    setCharacters((prev) => [
      ...prev,
      { id: newId, name: "", code: "", gender: "M", father: "", mother: "", outsider: false, pairId: "", pairRole: "", deceased: false },
    ]);
    setEditingId(newId);
    setSearchQuery("");
  }, []);

  // FIX 3: 削除時に selected からもIDを除去 + 子キャラの孤立参照をクリア
  const removeCharacter = useCallback((id) => {
    setCharacters((prev) => {
      const target = prev.find((c) => c.id === id);
      const removedCode = target?.code;
      return prev
        .filter((c) => c.id !== id)
        .map((c) => {
          if (!removedCode || !removedCode.trim()) return c;
          let changes = {};
          if (c.father === removedCode) changes.father = "";
          if (c.mother === removedCode) changes.mother = "";
          return Object.keys(changes).length > 0 ? { ...c, ...changes } : c;
        });
    });
    setSelected((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const duplicateCharacter = useCallback((id) => {
    const newId = crypto.randomUUID();
    setCharacters((prev) => {
      const src = prev.find((c) => c.id === id);
      if (!src) return prev;
      const idx = prev.findIndex((c) => c.id === id);
      const dup = { ...src, id: newId, name: src.name + "(複)", code: "", pairId: "", pairRole: "", deceased: false };
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
    setEditingId(newId);
  }, []);

  const moveChar = useCallback((id, direction) => {
    setCharacters((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);

  // ‡ペアID関連の算出値
  const pairList = useMemo(() => {
    const pairMap = {};
    characters.forEach((c) => {
      if (!c.pairId || c.pairId.trim() === "") return;
      const symbol = c.deceased ? "†" : "‡";
      const key = `${symbol}${c.pairId}`;
      if (!pairMap[key]) pairMap[key] = { symbol, pairId: c.pairId, members: [] };
      pairMap[key].members.push(c);
    });
    const result = Object.values(pairMap).map((group) => ({
      ...group,
      f: group.members.find((m) => m.pairRole === "F") || null,
      m: group.members.find((m) => m.pairRole === "M") || null,
    }));
    result.sort((a, b) => {
      if (a.symbol !== b.symbol) return a.symbol === "‡" ? -1 : 1;
      return a.pairId.localeCompare(b.pairId);
    });
    return result;
  }, [characters]);

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
      if (members.length > 2) {
        errors.push({ pairKey: key, message: `${members.length}人が同じペアIDを持っています` });
      }
      if (members.length === 2 && members[0].pairRole === members[1].pairRole) {
        errors.push({ pairKey: key, message: `pairRoleが同じです（${members[0].pairRole}同士）` });
      }
      const emptyRole = members.filter((m) => !m.pairRole);
      if (emptyRole.length > 0) {
        errors.push({ pairKey: key, message: `pairRoleが未設定のメンバーがいます` });
      }
      if (members.some((m) => m.pairId === "00")) {
        errors.push({ pairKey: key, message: `"00"は使用できません` });
      }
    });
    return errors;
  }, [characters]);

  const pairCount = useMemo(() => {
    const ids = new Set();
    characters.forEach((c) => {
      if (c.pairId && c.pairId.trim() !== "" && !c.deceased) {
        ids.add(c.pairId);
      }
    });
    return ids.size;
  }, [characters]);

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

    // ブロック2: キャラ一覧（全キャラ出力）
    let block2 = "\n";
    results.forEach((r) => {
      const base = `${r.name}：${r.code}_${r.gender}`;
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

  const copyAll = useCallback(() => {
    const text = outputMode === "pair"
      ? pairOutputText
      : results.map((r) => `${r.name}：${r.fullCode}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [results, outputMode, pairOutputText]);

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

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const ids = filteredResults.map((r) => r.id);
    setSelected(new Set(ids));
  }, [filteredResults]);

  const selectNone = useCallback(() => {
    setSelected(new Set());
  }, []);

  const deleteSelected = useCallback(() => {
    if (selected.size === 0) return;
    // フィルタ表示中は表示されているキャラのみ削除（非表示キャラを巻き込まない）
    const visibleIds = new Set(filteredResults.map((r) => r.id));
    const toDelete = new Set([...selected].filter((id) => visibleIds.has(id)));
    if (toDelete.size === 0) return;
    setCharacters((prev) => {
      const removedCodes = new Set(
        prev.filter((c) => toDelete.has(c.id) && c.code.trim()).map((c) => c.code)
      );
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

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelected(new Set());
  }, []);

  const importNames = useCallback(() => {
    const names = importText.split("\n").map((s) => s.trim()).filter((s) => s.length > 0);
    if (names.length === 0) return;
    const newChars = names.map((name) => ({
      id: crypto.randomUUID(),
      name,
      code: "",
      gender: "M",
      father: "",
      mother: "",
      outsider: false,
      pairId: "",
      pairRole: "",
      deceased: false,
    }));
    setCharacters((prev) => [...prev, ...newChars]);
    setImportText("");
    setShowImport(false);
  }, [importText]);

  const parentOptions = useMemo(() => {
    return characters.map((c) => ({ id: c.id, code: c.code, name: c.name, outsider: c.outsider }));
  }, [characters]);

  // 構造破壊・JSON/ファイル名事故を起こす文字だけ除去（ブラックリスト方式）
  const stripInvalidCodeChars = useCallback(
    (v) => v.replace(/[!@#_\-()+=\[\]{}<>"'`\s\\/\$%\^&\*]/g, ""),
    []
  );

  const normalizePairId = useCallback((value) => {
    const digits = value.replace(/\D/g, "").slice(0, 2);
    if (!digits) return "";
    return digits.padStart(2, "0");
  }, []);

  const codeIsDuplicate = useCallback(
    (code, currentId) => {
      if (!code) return false;
      return characters.some((c) => c.id !== currentId && c.code === code);
    },
    [characters]
  );

  const stats = useMemo(() => {
    const outsiders = characters.filter((c) => c.outsider).length;
    const blooded = characters.filter((c) => !c.outsider).length;
    return { total: characters.length, outsiders, blooded };
  }, [characters]);

  return (
    <div style={{ fontFamily: "'Segoe UI', 'Hiragino Sans', sans-serif", background: C.bg, color: C.text, minHeight: "100vh", padding: "16px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, color: C.accent, letterSpacing: 1 }}>
                血統コード・ジェネレーター <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 400 }}>2026-04-11 07:35</span>
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textMuted }}>
                ID変更で全血統コード自動再計算 ｜ 外部者は＋表記
              </p>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>
                {stats.total}名（血族{stats.blooded} / 外部{stats.outsiders}）/ ‡{pairCount}組
              </span>
              <button onClick={() => setShowHelp(!showHelp)}
                style={{ background: C.bgBtn, border: `1px solid ${C.border}`, color: C.textSub, padding: "4px 10px", borderRadius: 5, cursor: "pointer", fontSize: 12 }}>
                ?
              </button>
              {!selectMode ? (
                <button onClick={() => { setSelectMode(true); setEditingId(null); }}
                  style={{ background: C.bgBtn, border: `1px solid ${C.border}`, color: C.dangerText, padding: "5px 12px", borderRadius: 5, cursor: "pointer", fontSize: 12 }}>
                  選択
                </button>
              ) : (
                <button onClick={exitSelectMode}
                  style={{ background: C.bgBtn, border: `1px solid ${C.border}`, color: C.textSub, padding: "5px 12px", borderRadius: 5, cursor: "pointer", fontSize: 12 }}>
                  キャンセル
                </button>
              )}
              <button onClick={() => setShowImport(!showImport)}
                style={{ background: showImport ? C.accentLight : C.bgBtn, border: `1px solid ${showImport ? C.accentLight : C.border}`, color: showImport ? "#fff" : C.accent, padding: "5px 12px", borderRadius: 5, cursor: "pointer", fontSize: 12, transition: "all 0.2s" }}>
                一括読込
              </button>
              <button onClick={addCharacter}
                style={{ background: C.bgBtn, border: `1px solid ${C.border}`, color: C.accent, padding: "5px 12px", borderRadius: 5, cursor: "pointer", fontSize: 12 }}>
                ＋追加
              </button>
              <button onClick={copyAll}
                style={{ background: copied ? C.successBg : C.bgBtn, border: `1px solid ${copied ? C.success : C.border}`, color: copied ? C.success : C.text, padding: "5px 12px", borderRadius: 5, cursor: "pointer", fontSize: 12, transition: "all 0.2s" }}>
                {copied ? "✓ コピー済" : "全コピー"}
              </button>
            </div>
          </div>

          {showHelp && (
            <div style={{ marginTop: 10, background: C.bgHelp, border: `1px solid ${C.borderLight}`, borderRadius: 6, padding: 12, fontSize: 12, color: C.textSub, lineHeight: 1.7 }}>
              <strong style={{ color: C.accent }}>表記ルール</strong><br />
              ・母コードが先、父コードが後<br />
              ・<span style={{ color: C.outsider }}>外部者</span>（婿・嫁入りなど）のコードには <code style={{ color: C.outsider }}>+</code> が前置される<br />
              ・血族同士はそのまま連結（+なし）<br />
              ・各親の血統は再帰的に括弧内に展開<br />
              <strong style={{ color: C.accent, marginTop: 6, display: "inline-block" }}>例</strong><br />
              <code style={{ color: C.accentCode }}>I1_F(H1(C1D1(A1B1))+J1)</code><br />
              → I1の母H1は血族、父J1は外部者なので+J1
            </div>
          )}

          {showImport && (
            <div style={{ marginTop: 10, background: C.bgHelp, border: `1px solid ${C.accent}`, borderRadius: 6, padding: 12 }}>
              <div style={{ fontSize: 12, color: C.textSub, marginBottom: 6 }}>
                キャラ名を1行ずつ入力（まとめて貼り付けOK）
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={"カロン\nルクロ\nエイル\nアシュリー"}
                rows={6}
                style={{ width: "100%", padding: "8px 10px", background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13, fontFamily: "'Segoe UI', 'Hiragino Sans', sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: C.textMuted }}>
                  {importText.split("\n").filter((s) => s.trim()).length}名
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setShowImport(false); setImportText(""); }}
                    style={{ background: C.bgBtn, border: `1px solid ${C.border}`, color: C.textSub, padding: "5px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                    閉じる
                  </button>
                  <button onClick={importNames}
                    disabled={importText.split("\n").filter((s) => s.trim()).length === 0}
                    style={{ background: C.btnPrimary, border: "none", color: C.btnPrimaryText, padding: "5px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12, opacity: importText.split("\n").filter((s) => s.trim()).length === 0 ? 0.5 : 1 }}>
                    読み込み
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="検索（名前・ID・コード・ペアID）..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", maxWidth: 280, padding: "5px 10px", background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, fontSize: 12, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {selectMode && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, padding: "8px 12px", background: C.bgSelBar, border: `1px solid ${C.dangerBorder}`, borderRadius: 6, flexWrap: "wrap" }}>
            {selected.size === 0 ? (
              <span style={{ fontSize: 12, color: C.textMuted }}>
                タップで個別選択
              </span>
            ) : (
              <span style={{ fontSize: 12, color: C.dangerText, fontWeight: 600 }}>
                {selected.size}件選択中
              </span>
            )}
            <button onClick={selectAll}
              style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textSub, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>
              全選択
            </button>
            <button onClick={selectNone}
              disabled={selected.size === 0}
              style={{ background: "transparent", border: `1px solid ${C.border}`, color: selected.size > 0 ? C.textSub : C.textLight, padding: "3px 10px", borderRadius: 4, cursor: selected.size > 0 ? "pointer" : "default", fontSize: 11 }}>
              全解除
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={deleteSelected}
              disabled={selected.size === 0}
              style={{
                background: selected.size > 0 ? C.dangerBg : C.bgBtn,
                border: `1px solid ${selected.size > 0 ? C.danger : C.border}`,
                color: selected.size > 0 ? C.danger : C.textLight,
                padding: "4px 14px", borderRadius: 4, cursor: selected.size > 0 ? "pointer" : "default", fontSize: 12,
              }}>
              {selected.size > 0 ? `${selected.size}件削除` : "削除"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {filteredResults.map((char) => {
            const isEditing = editingId === char.id;
            const dupCode = codeIsDuplicate(char.code, char.id);
            return (
              <div key={char.id}
                style={{
                  background: isEditing ? C.bgCardEdit : selected.has(char.id) ? C.bgCardSel : C.bgCard,
                  border: `1px solid ${dupCode ? C.borderErr : isEditing ? C.borderEdit : selected.has(char.id) ? C.borderSel : C.borderLight}`,
                  borderRadius: 6,
                  padding: isEditing ? "10px 12px" : "7px 12px",
                  transition: "all 0.12s",
                }}>
                {isEditing ? (
                  <div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 6 }}>
                      <input placeholder="名前" value={char.name}
                        onChange={(e) => updateChar(char.id, "name", e.target.value)}
                        style={{ flex: "1 1 100px", minWidth: 70, padding: "4px 7px", background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 13, outline: "none" }} />
                      <input placeholder="ID" value={char.code}
                        onChange={(e) => updateChar(char.id, "code", stripInvalidCodeChars(e.target.value))}
                        style={{ width: 60, padding: "4px 7px", background: C.bgInput, border: `1px solid ${dupCode ? C.borderErr : C.border}`, borderRadius: 4, color: dupCode ? C.danger : C.accent, fontSize: 13, fontFamily: '"Consolas", "Menlo", "Monaco", monospace', outline: "none" }} />
                      <select value={char.gender}
                        onChange={(e) => updateChar(char.id, "gender", e.target.value)}
                        style={{ width: 64, padding: "4px 3px", background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 12, outline: "none" }}>
                        <option value="M">M</option>
                        <option value="F">F</option>
                        <option value="N">N</option>
                        <option value="N→F">N→F</option>
                        <option value="N→M">N→M</option>
                      </select>
                      <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11, color: char.outsider ? C.outsider : C.textMuted, padding: "3px 8px", background: char.outsider ? C.outsiderBg : "transparent", border: `1px solid ${char.outsider ? C.outsider : C.border}`, borderRadius: 4 }}>
                        <input type="checkbox" checked={char.outsider}
                          onChange={(e) => updateChar(char.id, "outsider", e.target.checked)}
                          style={{ accentColor: C.outsider, width: 12, height: 12 }} />
                        外部
                      </label>
                      <span style={{ fontSize: 11, color: C.pairText, marginLeft: 2 }}>‡/†</span>
                      <input placeholder="‡" value={char.pairId}
                        onChange={(e) => updateChar(char.id, "pairId", e.target.value.replace(/\D/g, "").slice(0, 2))}
                        onBlur={(e) => updateChar(char.id, "pairId", normalizePairId(e.target.value))}
                        style={{ width: 44, padding: "4px 5px", background: C.bgInput, border: `1px solid ${char.pairId === "00" ? C.borderErr : C.border}`, borderRadius: 4, color: char.pairId === "00" ? C.danger : C.pairText, fontSize: 12, fontFamily: '"Consolas", "Menlo", "Monaco", monospace', outline: "none", textAlign: "center" }} />
                      <select value={char.pairRole}
                        onChange={(e) => updateChar(char.id, "pairRole", e.target.value)}
                        disabled={!char.pairId}
                        style={{ width: 50, padding: "4px 3px", background: C.bgInput, border: `1px solid ${char.pairId && !char.pairRole ? C.borderErr : C.border}`, borderRadius: 4, color: C.text, fontSize: 12, outline: "none", opacity: char.pairId ? 1 : 0.5 }}>
                        <option value="">-</option>
                        <option value="F">F</option>
                        <option value="M">M</option>
                      </select>
                      <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11, color: char.deceased ? C.deceasedText : C.textMuted, padding: "3px 8px", background: char.deceased ? C.deceasedBg : "transparent", border: `1px solid ${char.deceased ? C.deceasedText : C.border}`, borderRadius: 4 }}>
                        <input type="checkbox" checked={char.deceased}
                          onChange={(e) => updateChar(char.id, "deceased", e.target.checked)}
                          style={{ accentColor: C.deceasedText, width: 12, height: 12 }} />
                        †
                      </label>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <label style={{ fontSize: 11, color: C.textSub, minWidth: 20 }}>母</label>
                      <select value={char.mother}
                        onChange={(e) => updateChar(char.id, "mother", e.target.value)}
                        style={{ flex: "1 1 90px", minWidth: 70, padding: "4px 3px", background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 12, outline: "none" }}>
                        <option value="">なし</option>
                        {parentOptions.filter((p) => p.code !== char.code && p.code).map((p) => (
                          <option key={p.id} value={p.code}>
                            {p.name} ({p.code}){p.outsider ? " ⊕" : ""}
                          </option>
                        ))}
                      </select>
                      <label style={{ fontSize: 11, color: C.textSub, minWidth: 20 }}>父</label>
                      <select value={char.father}
                        onChange={(e) => updateChar(char.id, "father", e.target.value)}
                        style={{ flex: "1 1 90px", minWidth: 70, padding: "4px 3px", background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 12, outline: "none" }}>
                        <option value="">なし</option>
                        {parentOptions.filter((p) => p.code !== char.code && p.code).map((p) => (
                          <option key={p.id} value={p.code}>
                            {p.name} ({p.code}){p.outsider ? " ⊕" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 6 }}>
                      <code style={{ fontSize: 12, color: C.accentCode, wordBreak: "break-all", lineHeight: 1.4, flex: 1 }}>
                        → {char.fullCode}
                      </code>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => moveChar(char.id, -1)} disabled={!!searchQuery.trim()}
                          style={{ padding: "3px 8px", background: C.bgBtn, border: `1px solid ${C.border}`, borderRadius: 3, color: searchQuery.trim() ? C.textLight : C.textSub, fontSize: 11, cursor: searchQuery.trim() ? "default" : "pointer" }}>↑</button>
                        <button onClick={() => moveChar(char.id, 1)} disabled={!!searchQuery.trim()}
                          style={{ padding: "3px 8px", background: C.bgBtn, border: `1px solid ${C.border}`, borderRadius: 3, color: searchQuery.trim() ? C.textLight : C.textSub, fontSize: 11, cursor: searchQuery.trim() ? "default" : "pointer" }}>↓</button>
                        <button onClick={() => duplicateCharacter(char.id)}
                          style={{ padding: "3px 8px", background: C.bgBtn, border: `1px solid ${C.border}`, borderRadius: 3, color: C.textSub, fontSize: 11, cursor: "pointer" }}>複製</button>
                        <button onClick={() => setEditingId(null)}
                          style={{ padding: "3px 10px", background: C.btnPrimary, border: "none", borderRadius: 3, color: C.btnPrimaryText, fontSize: 11, cursor: "pointer" }}>完了</button>
                        <button onClick={() => removeCharacter(char.id)}
                          style={{ padding: "3px 8px", background: "transparent", border: `1px solid ${C.dangerBorder}`, borderRadius: 3, color: C.dangerText, fontSize: 11, cursor: "pointer" }}>削除</button>
                      </div>
                    </div>
                    {dupCode && (
                      <div style={{ fontSize: 11, color: C.danger, marginTop: 4 }}>⚠ ID重複</div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => selectMode ? toggleSelect(char.id) : setEditingId(char.id)}
                    style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexShrink: 0 }}>
                      {selectMode && (
                        <input type="checkbox" checked={selected.has(char.id)}
                          onChange={() => toggleSelect(char.id)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: C.danger, width: 14, height: 14, cursor: "pointer", flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>
                        {char.name || "(未入力)"}
                      </span>
                      <span style={{
                        fontSize: 10, padding: "1px 5px", borderRadius: 3, whiteSpace: "nowrap",
                        background: char.gender === "F" ? C.genderFBg : char.gender === "M" ? C.genderMBg : C.genderNBg,
                        color: char.gender === "F" ? C.genderF : char.gender === "M" ? C.genderM : C.genderN,
                      }}>
                        {char.gender}
                      </span>
                      {char.outsider && (
                        <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, background: C.outsiderBg, color: C.outsider, whiteSpace: "nowrap" }}>
                          外部
                        </span>
                      )}
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
                    </div>
                    <div
                      onClick={(e) => { e.stopPropagation(); copySingle(char); }}
                      title="クリックでコピー"
                      style={{
                        fontFamily: '"Consolas", "Menlo", "Monaco", monospace', fontSize: 11, color: C.accentCode,
                        textAlign: "right", wordBreak: "break-all", lineHeight: 1.3,
                        cursor: "copy", padding: "2px 4px", borderRadius: 3,
                      }}>
                      {char.fullCode}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, background: C.bgPreview, border: `1px solid ${C.borderLight}`, borderRadius: 6, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <h3 style={{ margin: 0, fontSize: 13, color: C.textMuted }}>出力プレビュー</h3>
              <button onClick={() => setOutputMode("nest")}
                style={{
                  padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                  background: outputMode === "nest" ? C.btnPrimary : C.bgBtn,
                  color: outputMode === "nest" ? C.btnPrimaryText : C.textSub,
                  border: `1px solid ${outputMode === "nest" ? C.btnPrimary : C.border}`,
                }}>
                ネスト形式
              </button>
              <button onClick={() => setOutputMode("pair")}
                style={{
                  padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                  background: outputMode === "pair" ? C.btnPrimary : C.bgBtn,
                  color: outputMode === "pair" ? C.btnPrimaryText : C.textSub,
                  border: `1px solid ${outputMode === "pair" ? C.btnPrimary : C.border}`,
                }}>
                ‡ペアID形式
              </button>
            </div>
            <button onClick={copyAll}
              style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textSub, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>
              コピー
            </button>
          </div>
          {outputMode === "pair" && pairErrors.length > 0 && (
            <div style={{
              marginBottom: 8, padding: "6px 10px", background: C.dangerBg,
              border: `1px solid ${C.dangerBorder}`, borderRadius: 4, fontSize: 11, color: C.dangerText,
            }}>
              <div style={{ marginBottom: 2 }}>⚠ ペア整合性エラー（‡出力の正確性は保証されません）</div>
              {pairErrors.map((err, i) => <div key={i}>・{err.pairKey}：{err.message}</div>)}
            </div>
          )}
          <pre style={{
            margin: 0, fontFamily: '"Consolas", "Menlo", "Monaco", monospace', fontSize: 11,
            lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap", wordBreak: "break-all",
          }}>
            {outputMode === "pair" ? pairOutputText : results.map((r) => `${r.name}：${r.fullCode}`).join("\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}
