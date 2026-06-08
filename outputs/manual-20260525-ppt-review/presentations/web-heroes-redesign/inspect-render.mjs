import fs from "node:fs/promises";
import path from "node:path";

const sourcePptx = "C:/Users/USER/Downloads/مغامرة بناء عالم الويب للأبطال الصغار.pptx.pptx";
const workspace = "C:/Users/USER/Desktop/Code7aga/outputs/manual-20260525-ppt-review/presentations/web-heroes-redesign";
const outDir = path.join(workspace, "custom-inspect");
const slidesDir = path.join(outDir, "source-slides");
const layoutsDir = path.join(outDir, "layouts");
await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(slidesDir, { recursive: true });
await fs.mkdir(layoutsDir, { recursive: true });

const artifactUrl = "file:///C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";
const { FileBlob, PresentationFile } = await import(artifactUrl);
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePptx));
function slidesFromPresentation(presentation) {
  if (Array.isArray(presentation.slides?.items)) return presentation.slides.items;
  if (Number.isInteger(presentation.slides?.count) && typeof presentation.slides.getItem === "function") {
    return Array.from({ length: presentation.slides.count }, (_, index) => presentation.slides.getItem(index));
  }
  throw new Error("Could not enumerate imported presentation slides.");
}
const slides = slidesFromPresentation(presentation);
const artifacts = [];
for (let index = 0; index < slides.length; index += 1) {
  const slide = slides[index];
  const num = String(index + 1).padStart(2, "0");
  const pngPath = path.join(slidesDir, `slide-${num}.png`);
  const layoutPath = path.join(layoutsDir, `slide-${num}.layout.json`);
  const preview = await presentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(pngPath, Buffer.from(await preview.arrayBuffer()));
  const layout = await presentation.export({ slide, format: "layout" });
  await fs.writeFile(layoutPath, Buffer.from(await layout.arrayBuffer()));
  artifacts.push({ slide: index + 1, pngPath, layoutPath });
}
const inspect = await presentation.inspect({ kind: "slide,textbox,shape,image,table,chart", max_chars: 300000 });
await fs.writeFile(path.join(outDir, "inspect.ndjson"), inspect.ndjson || "", "utf8");
await fs.writeFile(path.join(outDir, "inspect-meta.json"), JSON.stringify({ slideCount: slides.length, inspectMetadata: inspect.metadata || {}, inspectTruncated: Boolean(inspect.truncated), artifacts }, null, 2), "utf8");
console.log(JSON.stringify({ outDir, slidesDir, slideCount: slides.length }, null, 2));
