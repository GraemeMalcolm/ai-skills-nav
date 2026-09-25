import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputRoot = path.join(root, "temp");
const outputRoot = path.join(root, "source", "modules");
const avatar = process.env.IMPORT_MODULE_AVATAR ?? "anton";

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

const roleValues = (roles = []) => [...new Set(roles.map((role) =>
  role === "ai-engineer" ? "Developer" : displayValue(role)))];

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

const directiveNames = {
  include: "INCLUDE",
  lab_steps: "LAB_STEPS",
  lab_host: "LAB_HOST",
  simulation: "SIMULATION",
  pdf: "PDF",
  video: "VIDEO",
};

const conceptsExerciseRoot = "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-concepts/refs/heads/main/Instructions/exercises";
const fundamentalsExerciseRoot = "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-fundamentals/refs/heads/main/Instructions/Exercises";
const agentsExerciseRoot = "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-agents/refs/heads/main/Instructions/Exercises";
const exerciseSources = {
  "2339547": `${conceptsExerciseRoot}/02-generative-ai.md`,
  "2339548": `${conceptsExerciseRoot}/03-language.md`,
  "2339573": `${conceptsExerciseRoot}/04-speech.md`,
  "2339549": `${conceptsExerciseRoot}/05-vision.md`,
  "2339457": `${conceptsExerciseRoot}/06-info-extraction.md`,
  "2373030": `${conceptsExerciseRoot}/07-explore-rag.md`,
  "2345150": `${fundamentalsExerciseRoot}/00-explore-foundry.md`,
  "2373039": `${fundamentalsExerciseRoot}/07-foundry-iq.md`,
  "2347367": `${fundamentalsExerciseRoot}/02a-generative-ai.md`,
  "2347369": `${fundamentalsExerciseRoot}/06a-content-understanding.md`,
  "2347368": `${fundamentalsExerciseRoot}/04a-speech.md`,
  "2359156": `${fundamentalsExerciseRoot}/03b-text-analysis.md`,
  "2347912": `${fundamentalsExerciseRoot}/05a-image-analysis.md`,
  "2259608": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-fabric/refs/heads/main/Instructions/Labs/06-data-warehouse.md",
  "2260722": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-fabric/refs/heads/main/Instructions/Labs/07-real-time-Intelligence.md",
  "2352592": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-fabric/refs/heads/main/Instructions/Labs/25-discover-onelake.md",
  "2352753": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-fabric/refs/heads/main/Instructions/Labs/01-lakehouse.md",
  "2356046": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-fabric/refs/heads/main/Instructions/Labs/26-design-dimensional-models.md",
  "2360808": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-fabric/refs/heads/main/Instructions/Labs/26c-transform-data-notebooks.md",
  "2361021": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-fabric/refs/heads/main/Instructions/Labs/26b-transform-data-dataflows.md",
  "2361022": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-fabric/refs/heads/main/Instructions/Labs/26d-transform-data-tsql.md",
  "2353440": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-studio/refs/heads/main/Instructions/Exercises/06-Explore-content-filters.md",
  "2353647": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-studio/refs/heads/main/Instructions/Exercises/01-Explore-ai-studio.md",
  "2354118": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-studio/refs/heads/main/Instructions/Exercises/02-model-catalog-evaluation.md",
  "2354220": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-studio/refs/heads/main/Instructions/Exercises/04b-finetune-model.md",
  "2354411": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-studio/refs/heads/main/Instructions/Exercises/03-foundry-sdk.md",
  "2356945": "https://raw.githubusercontent.com/MicrosoftLearning/mslearn-ai-studio/refs/heads/main/Instructions/Exercises/04a-use-own-data.md",
  "2347700": `${agentsExerciseRoot}/04-integrate-agent-with-foundry-iq.md`,
  "2352591": `${agentsExerciseRoot}/05b-work-iq-integration.md`,
  "2352649": `${agentsExerciseRoot}/01-build-agent-portal-and-vscode.md`,
  "2352775": `${agentsExerciseRoot}/05a-m365-teams-integration.md`,
  "2353400": `${agentsExerciseRoot}/03-mcp-integration.md`,
  "2353408": `${agentsExerciseRoot}/06-build-workflow-ms-foundry.md`,
  "2353425": `${agentsExerciseRoot}/09-multi-remote-agents-with-a2a.md`,
  "2353605": `${agentsExerciseRoot}/07-agent-framework.md`,
  "2353606": `${agentsExerciseRoot}/08-agent-framework-multi-agents.md`,
  "2353623": `${agentsExerciseRoot}/02-agent-custom-tools.md`,
};

function githubPagesExerciseSource(launchUrl) {
  const url = new URL(launchUrl);
  if (url.hostname.toLowerCase() !== "microsoftlearning.github.io") return;
  const [repository, ...contentPath] = url.pathname.split("/").filter(Boolean);
  if (!repository || !contentPath.length || !contentPath.at(-1).toLowerCase().endsWith(".html")) return;
  contentPath[contentPath.length - 1] = contentPath.at(-1).replace(/\.html$/i, ".md");
  return `https://raw.githubusercontent.com/MicrosoftLearning/${repository}/refs/heads/main/${contentPath.join("/")}`;
}

function exerciseDirectives(markdown) {
  return markdown
    .replace(
      /\[!\[[^\]]*launch (?:the )?exercise[^\]]*\]\([^)]+\)\]\((https?:\/\/go\.microsoft\.com\/fwlink\/\?[^)]+)\)/gi,
      (match, launchUrl) => {
        const linkId = [...new URL(launchUrl.replaceAll("&amp;", "&")).searchParams]
          .find(([name]) => name.toLowerCase() === "linkid")?.[1];
        const exerciseSource = exerciseSources[linkId];
        if (!exerciseSource) return match;
        return `[!LAB_STEPS[](${exerciseSource})]`;
      },
    )
    .replace(
      /\[!\[[^\]]*\]\([^)]+\)\]\((https?:\/\/microsoftlearning\.github\.io\/[^)\s]+)\)/gi,
      (match, launchUrl) => {
        const exerciseSource = githubPagesExerciseSource(launchUrl);
        return exerciseSource ? `[!LAB_STEPS[](${exerciseSource})]` : match;
      },
    )
    .replace(
      /\[[^\]]+\]\((https?:\/\/microsoftlearning\.github\.io\/[^)\s]+)\)/gi,
      (match, launchUrl) => {
        const exerciseSource = githubPagesExerciseSource(launchUrl);
        return exerciseSource ? `[!LAB_STEPS[](${exerciseSource})]` : match;
      },
    )
    .replace(/^!\[Screenshot[^\]]*\]\([^)]+\)\s*\n+/gim, "")
    .replace(/^!\[[^\]]*\]\([^)\n]*launch-exercise\.png\)\s*\n+/gim, "")
    .replace(/^\[!INCLUDE\s+\[Lab note\]\(\.\.\/\.\.\/\.\.\/includes\/wwl\/launch-exercise-note\.md\)\]\s*\n+/gim, "")
    .replace(/\*Use the following button to start the exercise\*\s*\n\s*(?=\[!LAB_STEPS)/gi, "")
    .replace(/^Launch the exercise and follow the instructions\.\s*\n\s*(?=\[!LAB_STEPS)/gim, "");
}

function normalizeDirectives(markdown) {
  return markdown
    .replace(/\[!(include|lab_steps|lab_host|simulation|pdf)(\[[^\]]*\])?\(([^)]+)\)\]/gi,
      (match, directive, option = "[]", reference) =>
        `[!${directiveNames[directive.toLowerCase()]}${option}(${reference})]`)
    .replace(/\[!(include|lab_steps|lab_host|simulation)\s+([^\]]+)\]/gi,
      (match, directive, reference) =>
        `[!${directiveNames[directive.toLowerCase()]} ${reference.trim()}]`)
    .replace(/\[!(video)\s*:?\s*(https?:\/\/[^\]\s]+)\]/gi,
      (match, directive, reference) => `[!${directiveNames[directive.toLowerCase()]} ${reference}]`);
}

function normalizeLearnTabs(markdown) {
  const output = [];
  let tabOpen = false;

  for (const line of markdown.split(/\r?\n/)) {
    const tab = line.match(/^#\s+\[([^\]]+)\]\(#tab\/[^)]+\)\s*$/i);
    if (tab) {
      if (tabOpen) output.push("::: zone-end", "");
      output.push(`::: zone pivot="${tab[1].replaceAll('"', "'")}"`);
      tabOpen = true;
      continue;
    }
    if (tabOpen && /^---\s*$/.test(line)) {
      output.push("::: zone-end", "", line);
      tabOpen = false;
      continue;
    }
    output.push(line);
  }

  if (tabOpen) output.push("::: zone-end");
  return output.join("\n");
}

function normalizeLearnMarkdown(markdown) {
  const lines = normalizeLearnTabs(normalizeDirectives(imageDirectives(exerciseDirectives(markdown))))
    .replaceAll("../media/", "media/")
    .replaceAll("See the **Text and images** tab for more details!", "See the **Text** tab for more details!")
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
  const items = questions.map((question, questionIndex) => {
    const choices = question.choices ?? [];
    const answerIndex = choices.findIndex((choice) => choice.isCorrect);
    if (answerIndex < 0) {
      throw new Error(`${unit.uid ?? unit.title}: question ${questionIndex + 1} has no correct answer`);
    }
    if (answerIndex > 25) {
      throw new Error(`${unit.uid ?? unit.title}: question ${questionIndex + 1} has more than 26 choices`);
    }
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

async function expandLocalIncludes(markdown, sourceFile, moduleDirectory, stack = []) {
  const includePattern = /\[!INCLUDE(?:\[[^\]]*\])?\(([^)]+)\)\]/gi;
  let output = "";
  let cursor = 0;
  for (const match of markdown.matchAll(includePattern)) {
    output += markdown.slice(cursor, match.index);
    const includeFile = path.resolve(path.dirname(sourceFile), match[1]);
    const relative = path.relative(moduleDirectory, includeFile);
    if (relative.startsWith("..") || path.isAbsolute(relative) || stack.includes(includeFile)) {
      throw new Error(`Invalid or recursive include ${match[1]} in ${sourceFile}`);
    }
    const included = await readFile(includeFile, "utf8");
    output += await expandLocalIncludes(included, includeFile, moduleDirectory, [...stack, includeFile]);
    cursor = match.index + match[0].length;
  }
  return output + markdown.slice(cursor);
}

async function pageMarkdown(unit, unitFile, moduleDirectory) {
  if (unit.quiz?.questions?.length) return quizMarkdown(unit);
  const source = normalizeDirectives(String(unit.content ?? ""));
  return expandLocalIncludes(source, path.join(moduleDirectory, unitFile), moduleDirectory);
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
    const pageMetadata = {
      title: unit.data.title ?? unit.data.metadata?.title,
      description: unit.data.metadata?.description,
    };
    if (!pageMetadata.description) delete pageMetadata.description;
    const page = `---\n${yaml.dump(pageMetadata, { lineWidth: 120, noRefs: true }).trim()}\n---\n\n${body}\n`;
    await writeFile(path.join(outputDirectory, pageFile), page, "utf8");
    pages.push(pageFile);
  }

  const mediaDirectory = path.join(inputDirectory, "media");
  if (entries.some((item) => item.isDirectory() && item.name === "media")) {
    await cp(mediaDirectory, path.join(outputDirectory, "media"), { recursive: true });
  }

  const metadata = {
    title: module.title ?? module.metadata?.title,
    description: module.summary ?? module.metadata?.description,
    level: levelValues[module.levels?.[0]] ?? 200,
    duration: `${orderedUnits.reduce((total, unit) => total + (unit.data.durationInMinutes ?? 0), 0)} minutes`,
    experience_type: "Training module",
    avatar,
    role: roleValues(module.roles),
    prerequisites: listItems(module.prerequisites),
    learning_outcomes: listItems(module.abstract),
    pages,
  };
  await writeFile(path.join(outputDirectory, "module.yml"), yaml.dump(metadata, { lineWidth: 120, noRefs: true }), "utf8");
  console.log(`Imported ${entry.name}: ${pages.length} pages`);
}

const entries = (await readdir(inputRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name !== "icons");
for (const entry of entries) await importModule(entry);
