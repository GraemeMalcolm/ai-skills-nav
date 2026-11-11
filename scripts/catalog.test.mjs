import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import yaml from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(path.join(root, "dist", "catalog.json"), "utf8"));
const readMetadata = async (collection, slug, file) =>
  yaml.load(await readFile(path.join(root, "source", collection, slug, file), "utf8"));
const sortedUnique = (values) => [...new Set(values)].sort();
const decodeAttribute = (value) => value
  .replaceAll("&quot;", '"').replaceAll("&#039;", "'")
  .replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");

test("only modules author experience_type and credentials keep their credential_type", async () => {
  for (const [collection, file] of [["courses", "course.yml"], ["playlists", "playlist.yml"], ["credentials", "credential.yml"]]) {
    const entries = await readdir(path.join(root, "source", collection), { withFileTypes: true });
    for (const entry of entries.filter((entry) => entry.isDirectory())) {
      const metadata = await readMetadata(collection, entry.name, file);
      assert.equal(Object.hasOwn(metadata, "experience_type"), false, `${collection}/${entry.name}`);
    }
    for (const item of catalog[collection]) {
      assert.equal(Object.hasOwn(item, "experience_type"), false, item.slug);
      if (collection === "credentials") {
        const metadata = await readMetadata(collection, item.slug, file);
        assert.equal(item.credential_type, metadata.credential_type, item.slug);
      }
    }
  }
});

test("content types use authored module values and propagate to playlists only", async () => {
  for (const module of catalog.modules) {
    assert.deepEqual(module.search.filters.experience_type, module.experience_type ? [module.experience_type] : [], module.slug);
  }
  for (const playlist of catalog.playlists) {
    const modules = await Promise.all(playlist.modules.map((slug) => readMetadata("modules", slug, "module.yml")));
    const expected = sortedUnique(modules.map((module) => module.experience_type).filter(Boolean));
    assert.deepEqual(sortedUnique(playlist.search.filters.experience_type), expected, playlist.slug);
  }
  for (const item of [...catalog.courses, ...catalog.credentials]) {
    assert.deepEqual(item.search.filters.experience_type, [], item.slug);
  }
});

test("Home and Catalog offer module content types while Courses lists every course without that filter", async () => {
  const expected = sortedUnique([...catalog.modules, ...catalog.playlists].flatMap((item) => item.search.filters.experience_type));
  for (const segments of [["index.html"], ["catalog", "index.html"]]) {
    const html = await readFile(path.join(root, "dist", ...segments), "utf8");
    const choices = [...html.matchAll(/<input type="checkbox" name="experience_type" value="([^"]+)">/g)]
      .map((match) => decodeAttribute(match[1]));
    assert.deepEqual(sortedUnique(choices), expected, segments.join("/"));
    assert.match(html, /<legend>Content type<\/legend>/);
    assert.doesNotMatch(html, /<legend>Experience type<\/legend>|Any other module|Any other playlists|Any other courses/);
  }
  const courses = await readFile(path.join(root, "dist", "official-curriculum", "index.html"), "utf8");
  assert.doesNotMatch(courses, /name="experience_type"/);
  const fields = courses.match(/data-filter-fields="([^"]+)"/)[1].split(",");
  assert.equal(fields.includes("experience_type"), false);
  const courseLinks = [...courses.matchAll(/<a\b[^>]*data-catalog-type="courses"[^>]*href="\.\.\/courses\/([^/]+)\/index.html"/g)]
    .map((match) => match[1]);
  assert.deepEqual(sortedUnique(courseLinks), sortedUnique(catalog.courses.map((course) => course.slug)));
});
