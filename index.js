const path = require("path");
const fg = require("fast-glob");

const graph = () => ({
  directed: true,
  nodes: [],
  edges: [],
});

const addNode = (graph, key) => {
  graph.nodes.push({ id: key, label: key });
};

const addEdge = (graph, edge) => {
  graph.edges.push({ ...edge, directed: true });
};

const toName = (pkgName, pkgVersion) => `${pkgName}#${pkgVersion}`;

const buildGraph = async ({ cwd = ".", ignored = [] }) => {
  const entries = await fg([`**/package.json`, ...ignored.map(i => `!${i}`)], { cwd });

  const g = graph();

  entries.forEach(file => {
    const pkgJson = require(path.join(cwd, file));

    if (pkgJson.name && pkgJson.version) {
      const pkgName = toName(pkgJson.name, pkgJson.version);
      addNode(g, pkgName);

      const depNames = Object.entries(pkgJson.dependencies || {}).map(e => toName(...e));

      depNames.forEach(depName => {
        addNode(g, depName);
        addEdge(g, { source: pkgName, target: depName });
      });
    }
  });

  return g;
};

module.exports = buildGraph;
