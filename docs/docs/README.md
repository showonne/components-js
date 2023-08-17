# LiveKit Components-JS autogenerated docs content

This package is a bundle of purely auto-generated documentation content for all LiveKit Component JavaScript packages with no functionality.

## Generation Flow:

1. Extract the package API using the [API Extractor](https://api-extractor.com/) from [@livekit/components-core](../../packages/core/README.md) and [@livekit/components-react](../../packages/react/README.md).
2. Convert the resulting `*.api.json` files to Markdown files using our custom [API Documenter](../../tooling/api-documenter/README.md) package.
3. Save the generated Markdown files in this package under the `generated-docs` path.
4. Publish this [@livekit/components-js-docs](./README.md) package so we can import and use it within the [livekit-docs-v2 repo](https://github.com/livekit/livekit-docs-v2).