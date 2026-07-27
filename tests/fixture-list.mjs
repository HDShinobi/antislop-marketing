// Discovery for the tier 2 judged fixtures, in its own module so a tier 1 test
// can check the fixture set without running the agent.
//
// One level of subdirectory is supported, and it exists for one reason:
// `.antislop-claims.txt` is looked up beside the document, so the approved
// claim case needs a directory of its own or every other fixture in the folder
// would see the claims file too.

import { readFileSync, readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"

const DIR = new URL("./fixtures/judged/", import.meta.url)

/**
 * @returns {Array<{name:string, path:string, expectPath:string, exp:object}>}
 *   `name` is relative to fixtures/judged/, `path` is absolute.
 */
export function listFixtures() {
  const out = []

  const collect = (dirUrl, prefix) => {
    for (const e of readdirSync(dirUrl, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.isDirectory()) {
        collect(new URL(`${e.name}/`, dirUrl), `${prefix}${e.name}/`)
      } else if (e.name.endsWith(".md")) {
        const expectUrl = new URL(e.name.replace(/\.md$/, ".expect.json"), dirUrl)
        out.push({
          name: `${prefix}${e.name}`,
          path: fileURLToPath(new URL(e.name, dirUrl)),
          expectPath: fileURLToPath(expectUrl),
          exp: JSON.parse(readFileSync(expectUrl, "utf8")),
        })
      }
    }
  }

  collect(DIR, "")
  return out
}
