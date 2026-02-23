import { useState, useMemo, useCallback } from "react";

const initialCharacters = [
  { id: "1", name: "カロン", code: "A1", gender: "F", father: "", mother: "", outsider: false },
  { id: "2", name: "ルクロ", code: "B1", gender: "M", father: "", mother: "", outsider: false },
  { id: "3", name: "エイル", code: "C1", gender: "F", father: "", mother: "", outsider: true },
  { id: "4", name: "アシュリー", code: "D1", gender: "M", father: "B1", mother: "A1", outsider: false },
  { id: "5", name: "イーリス", code: "D2", gender: "F", father: "B1", mother: "A1", outsider: false },
  { id: "6", name: "ノルン", code: "D3", gender: "N→F", father: "B1", mother: "A1", outsider: false },
  { id: "7", name: "セレスティーヌ", code: "H1", gender: "F", father: "D1", mother: "C1", outsider: false },
  { id: "8", name: "ディアン", code: "H2", gender: "M", father: "D1", mother: "C1", outsider: false },
  { id: "9", name: "アルグレーン", code: "J1", gender: "M", father: "", mother: "", outsider: true },
  { id: "10", name: "ミュリエル", code: "I1", gender: "F", father: "J1", mother: "H1", outsider: false },
  { id: "11", name: "オスカー", code: "I2", gender: "M", father: "J1", mother: "H1", outsider: false },
  { id: "12", name: "スルト", code: "G1", gender: "M", father: "", mother: "", outsider: true },
  { id: "13", name: "アステリア", code: "K1", gender: "F", father: "G1", mother: "D2", outsider: false },
  { id: "14", name: "クロム", code: "K2", gender: "M", father: "G1", mother: "D2", outsider: false },
  { id: "15", name: "リリー", code: "Y1", gender: "F", father: "", mother: "", outsider: true },
  { id: "16", name: "ライラ", code: "Z1", gender: "F", father: "", mother: "", outsider: true },
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
  if (visited.has(charCode)) return charCode + "(!循環)";
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
};

export default function BloodlineGenerator() {
  const [characters, setCharacters] = useState(initialCharacters);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

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
        r.fullCode.toLowerCase().includes(q)
    );
  }, [results, searchQuery, editingId]);

  // FIX 1: コード変更時に子キャラの father/mother も自動更新（カスケード更新）
  const updateChar = useCallback((id, field, value) => {
    setCharacters((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;

      const oldCode = target.code;

      // code以外の変更、またはコードが変わっていない場合は単純更新
      if (field !== "code" || oldCode === value) {
        return prev.map((c) => (c.id === id ? { ...c, [field]: value } : c));
      }

      // codeが変更された場合、子キャラの father/mother も新コードに書き換え
      return prev.map((c) => {
        if (c.id === id) {
          return { ...c, [field]: value };
        }
        let needsUpdate = false;
        const changes = {};
        if (c.father === oldCode) { changes.father = value; needsUpdate = true; }
        if (c.mother === oldCode) { changes.mother = value; needsUpdate = true; }
        return needsUpdate ? { ...c, ...changes } : c;
      });
    });
  }, []);

  // FIX 2: crypto.randomUUID() でユニークID生成
  const addCharacter = useCallback(() => {
    const newId = crypto.randomUUID();
    setCharacters((prev) => [
      ...prev,
      { id: newId, name: "", code: "", gender: "M", father: "", mother: "", outsider: false },
    ]);
    setEditingId(newId);
    setSearchQuery("");
  }, []);

  // FIX 3: 削除時に selected からもIDを除去
  const removeCharacter = useCallback((id) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
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
      const dup = { ...src, id: newId, name: src.name + "(複)", code: "" };
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

  const copyAll = useCallback(() => {
    const text = results.map((r) => `${r.name}：${r.fullCode}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [results]);

  const copySingle = useCallback((text) => {
    navigator.clipboard.writeText(text);
  }, []);

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
    setCharacters((prev) => prev.filter((c) => !selected.has(c.id)));
    setSelected(new Set());
    setSelectMode(false);
    setEditingId(null);
  }, [selected]);

  const exitSelectMode = useCallback(() => {
    setSelectMode(false);
    setSelected(new Set());
  }, []);

  const parentOptions = useMemo(() => {
    return characters.map((c) => ({ code: c.code, name: c.name, outsider: c.outsider }));
  }, [characters]);

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
                血統コード・ジェネレーター
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textMuted }}>
                ID変更で全血統コード自動再計算 ｜ 外部者は＋表記
              </p>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: C.textMuted }}>
                {stats.total}名（血族{stats.blooded} / 外部{stats.outsiders}）
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
        </div>

        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="検索（名前・ID・コード）..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", maxWidth: 280, padding: "5px 10px", background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, fontSize: 12, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {selectMode && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, padding: "8px 12px", background: C.bgSelBar, border: `1px solid ${C.dangerBorder}`, borderRadius: 6 }}>
            <span style={{ fontSize: 12, color: C.dangerText }}>
              {selected.size}件選択中
            </span>
            <button onClick={selectAll}
              style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textSub, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>
              全選択
            </button>
            <button onClick={selectNone}
              style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textSub, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>
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
              {selected.size}件削除
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
                        onChange={(e) => updateChar(char.id, "code", e.target.value.toUpperCase())}
                        style={{ width: 60, padding: "4px 7px", background: C.bgInput, border: `1px solid ${dupCode ? C.borderErr : C.border}`, borderRadius: 4, color: dupCode ? C.danger : C.accent, fontSize: 13, fontFamily: "monospace", outline: "none" }} />
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
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <label style={{ fontSize: 11, color: C.textSub, minWidth: 20 }}>母</label>
                      <select value={char.mother}
                        onChange={(e) => updateChar(char.id, "mother", e.target.value)}
                        style={{ flex: "1 1 90px", minWidth: 70, padding: "4px 3px", background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, fontSize: 12, outline: "none" }}>
                        <option value="">なし</option>
                        {parentOptions.filter((p) => p.code !== char.code && p.code).map((p) => (
                          <option key={p.code} value={p.code}>
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
                          <option key={p.code} value={p.code}>
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
                        <button onClick={() => moveChar(char.id, -1)}
                          style={{ padding: "3px 8px", background: C.bgBtn, border: `1px solid ${C.border}`, borderRadius: 3, color: C.textSub, fontSize: 11, cursor: "pointer" }}>↑</button>
                        <button onClick={() => moveChar(char.id, 1)}
                          style={{ padding: "3px 8px", background: C.bgBtn, border: `1px solid ${C.border}`, borderRadius: 3, color: C.textSub, fontSize: 11, cursor: "pointer" }}>↓</button>
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
                    </div>
                    <div
                      onClick={(e) => { e.stopPropagation(); copySingle(`${char.name}：${char.fullCode}`); }}
                      title="クリックでコピー"
                      style={{
                        fontFamily: "monospace", fontSize: 11, color: C.accentCode,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: 13, color: C.textMuted }}>出力プレビュー</h3>
            <button onClick={copyAll}
              style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textSub, padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>
              コピー
            </button>
          </div>
          <pre style={{
            margin: 0, fontFamily: "monospace", fontSize: 11,
            lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap", wordBreak: "break-all",
          }}>
            {results.map((r) => `${r.name}：${r.fullCode}`).join("\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}
