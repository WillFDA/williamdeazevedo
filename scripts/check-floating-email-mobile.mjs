// Built previews: node scripts/check-floating-email-mobile.mjs [candidate] [pre-#83 baseline]
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const temp = mkdtempSync(path.join(tmpdir(), "bubble-qa-"));
const init = path.join(temp, "init.js");
writeFileSync(
  init,
  `window.__contactEvents=[];window.rybbit={event:(name,properties)=>window.__contactEvents.push({name,properties})};document.addEventListener('click',e=>{if(e.target.closest?.('a[href^="mailto:"],a[href^="tel:"]'))e.preventDefault()});`
);
const session = `bubble-regression-${process.pid}`;
const browser = (...args) => {
  const response = JSON.parse(
    execFileSync(
      "npx",
      ["--yes", "agent-browser", "--session", session, "--json", ...args],
      { encoding: "utf-8" }
    )
  );
  assert.equal(response.success, true, JSON.stringify(response));
  return response.data;
};
const evaluate = (code) => browser("eval", code).result;
const candidate = process.argv[2] || "http://127.0.0.1:4334/";
const baseline = process.argv[3] || "http://127.0.0.1:4335/";
const widths = `(async()=>{await document.fonts.ready;await new Promise(r=>setTimeout(r,600));return [...document.querySelectorAll('main, main section')].map(e=>({tag:e.tagName,id:e.id,width:e.getBoundingClientRect().width}));})()`;
const results = [];
try {
  browser("--args", "--no-sandbox", "--init-script", init, "open", baseline);
  for (const width of [320, 390, 1440]) {
    browser("set", "viewport", String(width), "844");
    browser("open", baseline);
    const original = evaluate(widths);
    browser("open", candidate);
    assert.deepEqual(
      evaluate(widths),
      original,
      `Content widths must equal pre-#83 baseline at ${width}px`
    );
    const samples = evaluate(`(async()=>{
      const output=[],bubble=document.querySelector('[data-floating-email]');
      const footer=document.querySelector('[data-site-footer]');
      for(let y=0;y<document.documentElement.scrollHeight;y+=300){
        scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,120));
        const rect=bubble.getBoundingClientRect(),style=getComputedStyle(bubble);
        output.push({y:scrollY,visible:style.visibility==='visible'&&style.display!=='none',width:rect.width,height:rect.height,footerVisible:footer.getBoundingClientRect().top<innerHeight});
      }
      scrollTo({top:0,behavior:'instant'});return output;
    })()`);
    if (width < 768)
      for (const sample of samples) {
        assert.equal(
          sample.visible,
          !sample.footerVisible,
          `Mobile visibility at ${width}px scrollY=${sample.y}`
        );
        assert.equal(
          sample.width,
          sample.height,
          "Mobile bubble remains circular"
        );
      }
    const overlays = evaluate(`(async()=>{
      const wait=()=>new Promise(r=>setTimeout(r,450));
      await wait();
      const bubble=document.querySelector('[data-floating-email]');
      const visible=()=>getComputedStyle(bubble).visibility==='visible'&&getComputedStyle(bubble).display!=='none';
      const output={};
      if(innerWidth<768){
        document.querySelector('[data-mobile-menu-button]').click();await wait();output.menuHidden=!visible();
        document.querySelector('[data-mobile-menu-button]').click();await wait();output.menuRestored=visible();
      }
      document.querySelector('[data-cal-drawer]').showModal();await wait();output.dialogHidden=!visible();
      document.querySelector('[data-cal-drawer]').close();await wait();output.dialogClosed=true;
      if(innerWidth<768)output.dialogRestored=visible();
      return output;
    })()`);
    for (const [state, passed] of Object.entries(overlays))
      assert.equal(passed, true, `${width}px ${state}`);
    results.push({ width, baselineWidths: original, samples, overlays });
  }
  console.log(JSON.stringify(results, null, 2));
  console.log(
    "PASS: original widths and stable mobile overlay; footer hides on entry"
  );
} finally {
  browser("close");
  rmSync(temp, { recursive: true, force: true });
}
