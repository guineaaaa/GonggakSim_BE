import esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    format: "esm",
    outdir: "./dist",
    outExtension: { ".js": ".mjs" },
    platform: "node",
    target: "node20",
    minify: true,
    keepNames: true,
    external: [
        'swagger-ui-express',
        'yamljs'
    ]
});