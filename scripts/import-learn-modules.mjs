import { copyFile, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputRoot = path.join(root, "temp");
const outputRoot = path.join(root, "source", "modules");
const temporaryThumbnail = path.join(root, "source", "modules", "custom-module", "thumbnail.png");

const levelValues = {
  beginner: 100,
  intermediate: 200,
  advanced: 300,
  expert: 400,
};

const displayValues = {
  "ai-engineer": "AI Engineer",
  "data-analyst": "Data Analyst",
  "data-engineer": "Data Engineer",
  "artificial-intelligence": "Artificial Intelligence",
  "azure-databricks": "Azure Databricks",
  "data-analytics": "Data Analytics",
  fabric: "Microsoft Fabric",
  "microsoft-foundry": "Microsoft Foundry",
};

const displayValue = (value) => displayValues[value] ?? value
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const readYaml = async (file) => yaml.load(await readFile(file, "utf8"));

function listItems(value) {
  if (!value) return [];
  const bullets = String(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").trim());
  if (bullets.length) return bullets;
  const text = String(value).replace(/\s+/g, " ").trim();
  return text ? [text] : [];
}

function imageDirectives(markdown) {
  return markdown.replace(
    /:::image\s+[^\n]*?source="([^"]+)"[^\n]*?alt-text="([^"]*)"[^\n]*?:::/gi,
    "![$2]($1)",
  );
}

function normalizeLearnMarkdown(markdown) {
  const lines = imageDirectives(markdown)
    .replaceAll("../media/", "media/")
    .split(/\r?\n/);
  const output = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const alert = line.match(/^>\s*\[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION)\]\s*$/i);
    if (alert) {
      const content = [];
      while (index + 1 < lines.length && /^>/.test(lines[index + 1])) {
        content.push(lines[index + 1].replace(/^>\s?/, ""));
        index += 1;
      }
      const firstContent = content.findIndex((item) => item.trim());
      const label = alert[1].toUpperCase();
      if (firstContent === -1) {
        output.push(`> **${label}**:`);
        continue;
      }
      if (/^[-*]\s+/.test(content[firstContent])) {
        output.push(`> **${label}**:`, ">", ...content.slice(firstContent).map((item) => item ? `> ${item}` : ">"));
        continue;
      }
      output.push(...content.slice(0, firstContent).map(() => ">"));
      output.push(`> **${label}**: ${content[firstContent]}`);
      output.push(...content.slice(firstContent + 1).map((item) => item ? `> ${item}` : ">"));
      continue;
    }

    output.push(line
      .replace(/^>\s*(\[!VIDEO\b)/i, "$1")
      .replace(/^(::: zone pivot=["'])(video|text)(["'])$/i,
        (match, prefix, pivot, suffix) => `${prefix}${displayValue(pivot)}${suffix}`));
  }

  return output.join("\n");
}

function quizMarkdown(unit) {
  const questions = unit.quiz?.questions ?? [];
  const items = questions.map((question) => {
    const choices = question.choices ?? [];
    const answerIndex = choices.findIndex((choice) => choice.isCorrect);
    const choiceLines = choices.map((choice, index) =>
      `    ${String.fromCharCode(97 + index)}: ${JSON.stringify(String(choice.content))}`);
    const feedback = choices[answerIndex]?.explanation ?? "Review the module content and try again.";
    return [
      "- item:",
      `  - question: ${JSON.stringify(String(question.content))}`,
      ...choiceLines,
      `    answer: ${String.fromCharCode(97 + answerIndex)}`,
      `    feedback: ${JSON.stringify(String(feedback))}`,
    ].join("\n");
  });
  return [
    "Test your knowledge.",
    "",
    '::: knowledge-check type="chat" show-answers="true" allow-retry="false"',
    "",
    items.join("\n"),
    "",
    "::: end-knowledge-check",
  ].join("\n");
}

async function pageMarkdown(unit, unitFile, moduleDirectory) {
  if (unit.quiz?.questions?.length) return quizMarkdown(unit);
  const include = String(unit.content ?? "").match(/\[!include\[\]\(([^)]+)\)\]/i);
  if (!include) return String(unit.content ?? "").trim();
  const includeFile = path.resolve(moduleDirectory, include[1]);
  return readFile(includeFile, "utf8");
}

async function importModule(entry) {
  const inputDirectory = path.join(inputRoot, entry.name);
  const outputDirectory = path.join(outputRoot, entry.name);
  const module = await readYaml(path.join(inputDirectory, "index.yml"));
  const entries = await readdir(inputDirectory, { withFileTypes: true });
  const unitFiles = entries.filter((item) => item.isFile() && item.name.endsWith(".yml") && item.name !== "index.yml");
  const units = await Promise.all(unitFiles.map(async (item) => ({
    file: item.name,
    data: await readYaml(path.join(inputDirectory, item.name)),
  })));
  const unitsByUid = new Map(units.map((unit) => [unit.data.uid, unit]));
  const orderedUnits = (module.units ?? []).map((uid) => {
    const unit = unitsByUid.get(uid);
    if (!unit) throw new Error(`${entry.name}: no unit file has uid ${uid}`);
    return unit;
  });

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  const pages = [];
  for (const unit of orderedUnits) {
    const pageFile = unit.file.replace(/\.yml$/i, ".md");
    const source = await pageMarkdown(unit.data, unit.file, inputDirectory);
    const body = normalizeLearnMarkdown(source).trim();
    const page = `---\ntitle: ${yaml.dump(unit.data.title, { lineWidth: -1 }).trim()}\n---\n\n${body}\n`;
    await writeFile(path.join(outputDirectory, pageFile), page, "utf8");
    pages.push(pageFile);
  }

  const mediaDirectory = path.join(inputDirectory, "media");
  if (entries.some((item) => item.isDirectory() && item.name === "media")) {
    await cp(mediaDirectory, path.join(outputDirectory, "media"), { recursive: true });
  }
  await copyFile(temporaryThumbnail, path.join(outputDirectory, "thumbnail.png"));

  const topics = [...new Set([...(module.products ?? []), ...(module.subjects ?? [])].map(displayValue))];
  const metadata = {
    title: module.title ?? module.metadata?.title,
    description: module.summary ?? module.metadata?.description,
    level: levelValues[module.levels?.[0]] ?? 200,
    duration: `${orderedUnits.reduce((total, unit) => total + (unit.data.durationInMinutes ?? 0), 0)} minutes`,
    experience_type: "Training module",
    topics,
    role: (module.roles ?? []).map(displayValue),
    prerequisites: listItems(module.prerequisites),
    learning_outcomes: listItems(module.abstract),
    pages,
  };
  await writeFile(path.join(outputDirectory, "module.yml"), yaml.dump(metadata, { lineWidth: 120, noRefs: true }), "utf8");
  console.log(`Imported ${entry.name}: ${pages.length} pages`);
}

const entries = (await readdir(inputRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory());
for (const entry of entries) await importModule(entry);