// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
	mount: {
		/* ... */
	},
	plugins: [
		/* ... */
		"@snowpack/plugin-sass",
	],
	packageOptions: {
		/* ... */
	},
	devOptions: {
		/* ... */
		port: 3033,
	},
	buildOptions: {
		/* ... */
		baseUrl: "./public",
		out: "docs",
	},
	optimize: {
		minify: true,
		bundle: true,
		splitting: true,
		treeshake: true,
		target: "es2018",
	},
};
