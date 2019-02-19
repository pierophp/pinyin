const entries = require("./dict-revised.json");

let total = 0;
let structure = {};
let heteronymsStructure = {};
let definitionStructure = {};
let types = {};
let links = {};

for (const entry of entries) {
  total += 1;

  const entryStructure = Object.keys(entry);

  for (const entryStructureItem of entryStructure) {
    if (entryStructureItem === "heteronyms") {
      for (const heteronym of entry.heteronyms) {
        const heteronymsKeys = Object.keys(heteronym);
        for (const heteronymsKey of heteronymsKeys) {
          if (heteronymsKey === "definitions") {
            for (const definition of heteronym.definitions) {
              const definitionKeys = Object.keys(definition);
              if (definition.type) {
                if (!types[definition.type]) {
                  types[definition.type] = 0;
                }

                types[definition.type] += 1;
              }

              if (definition.link) {
                for (const link of definition.link) {
                  if (!link) {
                    continue;
                  }

                  const linkParts = link.split("「");
                  if (!links[linkParts[0]]) {
                    links[linkParts[0]] = 0;
                  }

                  links[linkParts[0]] += 1;
                }
              }

              for (const definitionKey of definitionKeys) {
                if (definitionStructure[definitionKey]) {
                  continue;
                }

                definitionStructure[definitionKey] = true;
              }
            }
          }

          if (heteronymsStructure[heteronymsKey]) {
            continue;
          }

          heteronymsStructure[heteronymsKey] = true;
        }
      }
    }

    if (structure[entryStructureItem]) {
      continue;
    }

    structure[entryStructureItem] = true;
  }
}

console.log("Entries: ", total);
console.log("Structure: ", structure);
console.log("Heteronyms Structure: ", heteronymsStructure);
console.log("Definition Structure: ", definitionStructure);
console.log("Types: ", types);
console.log("links: ", links);
