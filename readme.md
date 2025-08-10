# Truth in 32bit source code
![](/src/media/icon.png)

The source code for Truth in 32bit, a website displaying a random racing machine every hour along with its companion Bluesky and Mastodon bot scripts; built with [Eleventy](https://www.11ty.dev/).

[![GPLv3 logo](https://www.gnu.org/graphics/gplv3-88x31.png)](https://www.gnu.org/licenses/gpl-3.0.html)

## Build and run

You will need [Node.js](https://nodejs.org/).

Download the repo and run the following commands in a terminal open in the folder:

```
npm install
npm start
```

Navigate to `http://localhost:8080/` in your web browser.

## Personal changes to `generate-build-info`

My computer is set in French with the fr locale. So by default `generate-build-info` inputs a fr locale date, which Eleventy then interprets wrong. (I assume due to ISO not liking D/M/Y dates?)

In `generate-build-info.js` at line 86, I changed `buildDateStr: buildDate.toLocaleString()` into `buildDateStr: buildDate.toLocaleString('en')` to force a different locale. The date format can also be customised with the usual options but for my purposes I didn't need to do that.
