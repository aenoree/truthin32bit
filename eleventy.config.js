const pluginRss = require("@11ty/eleventy-plugin-rss");
const purgeCssPlugin = require("eleventy-plugin-purgecss");
const mila = require("markdown-it-link-attributes");
const markdownIt = require('markdown-it');
const markdownItFootnote = require('markdown-it-footnote');
const CleanCSS = require("clean-css");
const _get = require("lodash.get");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const path = require("path");

module.exports = async function (eleventyConfig) {
    // Output directory: _site
    // input directory: src
    eleventyConfig.setInputDirectory("src");

    eleventyConfig.addPassthroughCopy("src/css", {
        expand: true, // expand symbolic links
    });

    eleventyConfig.addPassthroughCopy("src/js", {
        expand: true, // expand symbolic links
    });

    eleventyConfig.addPassthroughCopy("src/media", {
        expand: true, // expand symbolic links
        filter: ["**/*.*", "!**/pictures/*.jpg", "!**/pictures/*.webp"]
    });

    eleventyConfig.addPassthroughCopy("src/robots.txt", {
        expand: true, // expand symbolic links
    });

    eleventyConfig.addPassthroughCopy("src/posts.json", {
        expand: true, // expand symbolic links
    });

    // render dates in English format
    eleventyConfig.addFilter("localizedDate", (date) => {
    return new Date(date).toLocaleString('en', {year: 'numeric', month: 'long', day: 'numeric'});
    });

    // render dates in numerical format in Japanese format which follows Y/M/D
    eleventyConfig.addFilter("numericalDate", (date) => {
    return new Date(date).toLocaleString('jpn', {year: 'numeric', month: '2-digit', day: '2-digit'});
    });

    // render dates in numerical format in Japanese format which follows Y/M/D
    eleventyConfig.addFilter("numericalDateShort", (date) => {
    return new Date(date).toLocaleString('jpn', {month: '2-digit', day: '2-digit'});
    });

    // render dates in numerical format in Japanese format which follows Y/M/D
    eleventyConfig.addFilter("dateNumericalToObject", (date) => {
    return new Date(date).toLocaleString('en', {year: 'numeric', month: 'long', day: 'numeric', hours: 'numeric', minutes: 'numeric'});
    });

    // rss plugin (duh)
    eleventyConfig.addPlugin(pluginRss);

    // select random item on generation
    eleventyConfig.addFilter("randomItem", (arr) => {
    arr.sort(() => {
    return 0.5 - Math.random();
    });
    return arr.slice(0, 1);
    });

    // cleans up unused css after generation
    eleventyConfig.addPlugin(purgeCssPlugin, {
    // Optional: Specify the location of your PurgeCSS config
    config: "./purgecss.config.js",

    // Optional: Set quiet: true to suppress terminal output
    quiet: false,
    });

    // automatically adds href attributes to open external post links in new tabs
    const milaOptions = {
    matcher(href) {
      return href.match(/^https?:\/\//);
    },
    attrs: {
      target: "_blank",
      rel: "noopener noreferrer",
    },
    };
    eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(mila, milaOptions));

    // creates the tags collection to make a list
    eleventyConfig.addCollection("tagList", collections => {
      const tags = collections
        .getAll()
        .reduce((tags, item) => tags.concat(item.data.tags), [])
        .filter(tag => !!tag && !["post", "like", "all"].includes(tag))
        .sort();
      return Array.from(new Set(tags)).map(tag => ({
        title: tag,
        count: collections.getFilteredByTag(tag).length,
      }));
    });

    // setting up markdown footnotes and removing the brackets from the links
    eleventyConfig.amendLibrary("md", mdLib => {
    // footnotes
    const md = markdownIt({
        html: true,
        linkify: true,
      })
    mdLib.use(require('markdown-it-footnote'));

    // hides brackets for footnotes
    mdLib.renderer.rules.footnote_caption = (tokens, idx) => {
        let n = Number(tokens[idx].meta.id + 1).toString();

        if (tokens[idx].meta.subId > 0) {
          n += ":" + tokens[idx].meta.subId;
        }
        return n;
      };
    });

    eleventyConfig.addFilter("cssmin", function (code) {
        return new CleanCSS({}).minify(code).styles;
    });

    eleventyConfig.setUseGitIgnore(false);

    eleventyConfig.addFilter("find", function find(collection = [], key = "", value) {
    return collection.find(post => _get(post, key) === value);
    });

    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        // output image formats
        formats: ["webp", "svg"],

        // output image widths
        widths: ["1150", "810", "450"],

        // optional, attributes assigned on <img> nodes override these values
        htmlOptions: {
            imgAttributes: {
                loading: "lazy",
                decoding: "async",
            },
            pictureAttributes: {}
        },
        outputDir: './_site/media/pictures/',
        urlPath: "/media/pictures/",
        svgAllowUpscale: false,
        svgShortCircuit: true,
        filenameFormat: (id, src, width, format) => {
           const { name } = path.parse(src);
           return `${name}-${width}.${format}`;
        },
    });

    return {
    htmlTemplateEngine: "njk"
    };
};
