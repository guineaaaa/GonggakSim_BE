import esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    format: "cjs",
    outdir: "./dist",
    outExtension: { ".js": ".cjs" },
    platform: "node",
    target: "node20",
    minify: true,
    keepNames: true,
    external: [
        'swagger-ui-express',
        'yamljs',
        'mock-aws-s3',
        'aws-sdk',
        'nock'
    ],
    loader: { '.html': 'text' }
}).catch(() => process.exit(1));