import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CATALOG, OCCASION_IDS, STYLE_VALUES } from "../src/catalog.js";
import { fallbackRecommendations, rankGarments } from "../src/stylist/fallback.js";
import { readOpenAIConfig } from "../src/stylist/openai.js";
import { buildRetryMessage, buildUserMessage, SYSTEM_PROMPT } from "../src/stylist/prompt.js";
import { MAX_REASON_CHARS, validateStylistOutput } from "../src/stylist/validate.js";

const rec = (garmentId: string, reason = "Fits the occasion.", pairWith = "Plain trousers") => ({ garmentId, reason, pairWith });

describe("validateStylistOutput", () => {
  it("accepts a valid reply (string or object) and trims text", () => {
    const r = validateStylistOutput(JSON.stringify({ recommendations: [rec("G01", "  ok  "), rec("G02")] }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.recommendations[0].reason).toBe("ok");
    expect(validateStylistOutput({ recommendations: [rec("G03"), rec("G06")] }).ok).toBe(true);
  });

  const bad: Array<[string, unknown]> = [
    ["non-JSON string", "```json {}```"],
    ["null", null],
    ["array root", []],
    ["missing recommendations", {}],
    ["one item", { recommendations: [rec("G01")] }],
    ["three items", { recommendations: [rec("G01"), rec("G02"), rec("G03")] }],
    ["unknown id", { recommendations: [rec("G01"), rec("G99")] }],
    ["lowercase id", { recommendations: [rec("g01"), rec("G02")] }],
    ["duplicate ids", { recommendations: [rec("G01"), rec("G01")] }],
    ["empty reason", { recommendations: [rec("G01", "   "), rec("G02")] }],
    ["empty pairWith", { recommendations: [rec("G01"), rec("G02", "ok", "")] }],
    ["reason too long", { recommendations: [rec("G01", "x".repeat(MAX_REASON_CHARS + 1)), rec("G02")] }],
    ["non-string reason", { recommendations: [{ garmentId: "G01", reason: 1, pairWith: "x" }, rec("G02")] }],
  ];
  it.each(bad)("rejects %s with an error message", (_n, input) => {
    const r = validateStylistOutput(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.length).toBeGreaterThan(0);
  });

  it("allows a reason of exactly 200 characters", () => {
    expect(validateStylistOutput({ recommendations: [rec("G01", "x".repeat(200)), rec("G02")] }).ok).toBe(true);
  });
});

describe("fallback", () => {
  it("every occasion x style x locale passes the server validator", () => {
    for (const o of OCCASION_IDS)
      for (const s of STYLE_VALUES)
        for (const l of ["vi", "en"] as const) {
          const recs = fallbackRecommendations(o, s, l);
          const r = validateStylistOutput({ recommendations: recs });
          expect(r.ok, `${o}/${s}/${l}`).toBe(true);
        }
  });

  it("vi reasons use Vietnamese descriptors, en reasons stay English", () => {
    for (const o of OCCASION_IDS) {
      for (const r of fallbackRecommendations(o, "none", "vi")) {
        expect(r.reason).toMatch(/ cho .+, màu .+, dáng /);
        // Catalog colors are English; the vi template must not paste them raw.
        expect(r.reason).not.toMatch(/màu (white|navy|cream|black|beige|blue denim)\b/);
      }
      for (const r of fallbackRecommendations(o, "none", "en")) expect(r.reason).toMatch(/ for /);
    }
  });

  it("is deterministic and prefers style on equal formality", () => {
    expect(rankGarments("job_interview", "minimal").slice(0, 2).map((g) => g.id)).toEqual(["G02", "G01"]);
    expect(rankGarments("job_interview", "none").slice(0, 2).map((g) => g.id)).toEqual(["G01", "G02"]);
    expect(fallbackRecommendations("campus_day", "casual", "en")).toEqual(fallbackRecommendations("campus_day", "casual", "en"));
  });

  it("dress code outranks style: street preference still gives formal picks for an interview", () => {
    const ids = rankGarments("job_interview", "street").slice(0, 2).map((g) => g.id);
    expect(ids).toEqual(["G01", "G02"]);
  });
});

describe("prompt", () => {
  const planPath = fileURLToPath(new URL("../../docs/plan.md", import.meta.url));
  // Shows as "skipped" (not a silent pass) when the plan is not present.
  it.skipIf(!existsSync(planPath))("system prompt is verbatim from docs/plan.md", () => {
    const plan = readFileSync(planPath, "utf8").replace(/\r\n/g, "\n");
    const start = plan.indexOf("**1. System prompt**");
    const open = plan.indexOf("```text\n", start) + "```text\n".length;
    expect(SYSTEM_PROMPT).toBe(plan.slice(open, plan.indexOf("\n```", open)));
  });

  it("user message follows the plan's 4-line format with one-line JSON", () => {
    const lines = buildUserMessage({ occasionId: "job_interview", style: "minimal", locale: "vi" }).split("\n");
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe("LOCALE: vi");
    expect(lines[1]).toBe("STYLE_PREFERENCE: minimal");
    expect(lines[2]).toBe(
      'OCCASION: {"id":"job_interview","label":"Job Interview","dressCode":"Smart and formal. Clean, tailored, neutral colors. No street or very casual pieces.","targetFormality":4}',
    );
    expect(lines[3]).toBe(`CATALOG: ${JSON.stringify(CATALOG)}`);
    expect(lines[3]).toContain('{"id":"G01","name":"Navy Blazer","type":"outerwear","color":"navy","formality":4,"styles":["formal","smart"],"cut":"tailored, structured"}');
  });

  it("retry message matches the plan", () => {
    expect(buildRetryMessage("bad ids")).toBe("Your previous reply was invalid: bad ids. Reply again with valid JSON only.");
  });
});

describe("readOpenAIConfig", () => {
  it("needs both key and model; no default model", () => {
    expect(readOpenAIConfig({})).toBeNull();
    expect(readOpenAIConfig({ OPENAI_API_KEY: "k" })).toBeNull();
    expect(readOpenAIConfig({ OPENAI_MODEL: "m" })).toBeNull();
    expect(readOpenAIConfig({ OPENAI_API_KEY: "k", OPENAI_MODEL: "m" })).toEqual({ apiKey: "k", model: "m", temperature: 0.3 });
  });

  it("OPENAI_TEMPERATURE=off omits temperature", () => {
    expect(readOpenAIConfig({ OPENAI_API_KEY: "k", OPENAI_MODEL: "m", OPENAI_TEMPERATURE: "off" })?.temperature).toBeUndefined();
  });

  it("OPENAI_REASONING_EFFORT: valid values pass through, anything else is omitted", () => {
    const base = { OPENAI_API_KEY: "k", OPENAI_MODEL: "gpt-5.6-luna" };
    expect(readOpenAIConfig(base)).not.toHaveProperty("reasoningEffort");
    expect(readOpenAIConfig({ ...base, OPENAI_REASONING_EFFORT: " None " })?.reasoningEffort).toBe("none");
    expect(readOpenAIConfig({ ...base, OPENAI_REASONING_EFFORT: "low" })?.reasoningEffort).toBe("low");
    expect(readOpenAIConfig({ ...base, OPENAI_REASONING_EFFORT: "turbo" })).not.toHaveProperty("reasoningEffort");
    expect(readOpenAIConfig({ ...base, OPENAI_REASONING_EFFORT: "" })).not.toHaveProperty("reasoningEffort");
  });
});
