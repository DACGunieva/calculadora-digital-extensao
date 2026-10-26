import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import {
  cffPredictedPfe, gestationalWeeklyAssessment,
  bestPef, pefRatio, personalBestZone, waistAssessment,
} from "../calculations.js";

const swCode = readFileSync(new URL("../sw.js", import.meta.url), "utf8");

function fakeWorker({ offline = false } = {}) {
  const handlers = {};
  const cached = [];
  let fallbackReads = 0;
  const response = { ok: true, clone() { return this; }, marker: "online" };
  const offlineIndex = { ok: true, marker: "offline-index" };
  const context = {
    URL,
    self: {
      registration: { scope: "https://calc.test/" },
      location: { origin: "https://calc.test" },
      addEventListener(kind, fn) { handlers[kind] = fn; },
      skipWaiting() {},
      clients: { claim() {} },
    },
    caches: {
      open: async () => ({
        addAll: async () => {},
        put: async request => { cached.push(request.url); },
      }),
      keys: async () => [],
      delete: async () => true,
      match: async request => {
        if (request === "./index.html") {
          fallbackReads++;
          return offlineIndex;
        }
        return undefined;
      },
    },
    fetch: async () => {
      if (offline) throw new Error("sem rede");
      return response;
    },
    Response: { error: () => ({ ok: false, marker: "offline-error" }) },
  };
  runInNewContext(swCode, context, { timeout: 1000 });
  async function request(url, method = "GET", mode = "cors") {
    let pending, waits = [];
    handlers.fetch({
      request: { url, method, mode },
      respondWith(promise) { pending = promise; },
      waitUntil(promise) { waits.push(promise); },
    });
    if (!pending) return { handled: false };
    const result = await pending;
    await Promise.all(waits);
    return result;
  }
  return { request, cached, get fallbackReads() { return fallbackReads; } };
}

test("PWA cacheia somente URLs EXATAS da lista de assets", async () => {
  const sw = fakeWorker();
  await sw.request("https://calc.test/app.js?v=2.8.3");
  assert.deepEqual(sw.cached, ["https://calc.test/app.js?v=2.8.3"]);
  await sw.request("https://calc.test/app.js?v=2.8.3&peso=65");
  await sw.request("https://calc.test/?pfe=420");
  await sw.request("https://calc.test/resultado?altura=165");
  assert.equal(sw.cached.length, 1, "URL com dados ou parâmetros não pode ser armazenada");
  assert.deepEqual(await sw.request("https://outro.test/?peso=70"), { handled: false });
  assert.deepEqual(await sw.request("https://calc.test/atendimento", "POST"), { handled: false });
});

test("PWA mantém navegação offline sem salvar dados do usuário", async () => {
  const sw = fakeWorker({ offline: true });
  const result = await sw.request("https://calc.test/?peso=70", "GET", "navigate");
  assert.equal(result.marker, "offline-index");
  assert.equal(sw.fallbackReads, 1);
  assert.deepEqual(sw.cached, []);
});

test("nenhum motor clínico envia dados pessoais ou clínicos pela rede", () => {
  for (const name of ["app.js", "calculations.js", "bmi-who-data.js"]) {
    const source = readFileSync(new URL("../" + name, import.meta.url), "utf8");
    assert.doesNotMatch(source, /\\bfetch\\s*\\(|XMLHttpRequest|sendBeacon\\s*\\(|new\\s+WebSocket\\s*\\(|new\\s+EventSource\\s*\\(/);
  }
});

// Oráculos independentes: valores manuais da fonte original, não calculados
// a partir do próprio vetor que é testado.
// CFF (2020), Pico de Fluxo Expiratório, tabelas 2 e 3, p.12.
// https://www.cff.org.br/userfiles/pico_versao7.pdf
test("CFF 2020: casos de referência e limites não extrapolados", () => {
  assert.equal(cffPredictedPfe(20, 155, "male").predicted, 564);
  assert.equal(cffPredictedPfe(70, 180, "male").predicted, 521);
  assert.equal(cffPredictedPfe(30, 160, "female").predicted, 434);
  assert.equal(cffPredictedPfe(32, 162, "female").predicted, 434);
  assert.equal(cffPredictedPfe(40, 180, "male"), null,
    "célula impressa inconsistente permanece bloqueada por segurança");
  assert.equal(cffPredictedPfe(70, 175, "male"),  null);
  assert.equal(cffPredictedPfe(71, 160, "female"), null);
});

test("PFE medido/previsto é distinto da zona baseada no melhor pessoal", () => {
  assert.equal(bestPef([350, 380, 370]), 380);
  assert.equal(pefRatio(380, 400), 95);
  assert.equal(personalBestZone(49.999).level, "danger");
  assert.equal(personalBestZone(50).level, "warning");
  assert.equal(personalBestZone(79.999).level, "warning");
  assert.equal(personalBestZone(80).level, "normal");
});

test("ganho gestacional semanal: limites do MS em 22 semanas", () => {
  const low = gestationalWeeklyAssessment(23, 22, 1.2);
  const high = gestationalWeeklyAssessment(23, 22, 4.1);
  assert.equal(low.available, true);
  assert.equal(low.lower, 1.2);
  assert.equal(low.upper, 4.1);
  assert.equal(low.level, "within");
  assert.equal(high.level, "within");
  assert.equal(gestationalWeeklyAssessment(23, 22, 4.1001).level, "above");
  assert.equal(gestationalWeeklyAssessment(23, 22, 1.1999).level, "below");
  assert.equal(gestationalWeeklyAssessment(23, 9, 0).available, false);
});

test("cintura evita classificações de gestantes e menores", () => {
  assert.throws(() => waistAssessment(88, 160, 17, "female"), RangeError);
  assert.throws(() => waistAssessment(88, 160, 30, "female", true), RangeError);
});
