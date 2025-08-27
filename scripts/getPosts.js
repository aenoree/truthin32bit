const fs = require('fs');
const glob = require('glob');
const matter = require('gray-matter');

const markdownFiles = glob.sync("./src/posts/*.md");  // files in the 'posts' directory

function buildJSONfile() {

    // imports posts.json which needs to exist, even if as an empty array
    // not ideal, but it's Fine for this
    var entries = JSON.parse(fs.readFileSync('./src/_data/posts.json', 'utf-8'));
    // empty array in case posts.json is empty
    let newArray = [];

    if (!Array.isArray(entries) || !entries.length) {
        // array does not exist, is not an array, or is empty
        // ⇒ do not attempt to process array
        console.log('No entries left! Regenerating posts array...');

        let contents;

        markdownFiles.forEach((nextFile) => {

            contents = fs.readFileSync(nextFile, "UTF8");
            // use gray-matter to get the front matter and content of each entry
            let JSONobject = matter([contents].join('\n'));
            // write it into an array
            newArray.push(JSONobject);

        });

        // write to a file
        fs.writeFileSync("./src/_data/posts.json", JSON.stringify(newArray, null, '\t'), "UTF8");
        console.log("Wrote posts array!");
    }

}

buildJSONfile();

// imports posts.json which this time exists no matter what
var arrayOfEntries = JSON.parse(fs.readFileSync('./src/_data/posts.json', 'utf-8'));

// pull a random entry from the posts array
let randomPost = arrayOfEntries[Math.floor(Math.random()*arrayOfEntries.length)];

console.log("Selected a post:", randomPost);
// write to a file
fs.writeFileSync("./src/_data/randomPost.json", JSON.stringify(randomPost, null, '\t'), "UTF8");

// remove randomly selected post from posts array
let splicedArray = arrayOfEntries.filter(machine => machine!== randomPost);
// write to a file
fs.writeFileSync("./src/_data/posts.json", JSON.stringify(splicedArray, null, '\t'), "UTF8");
console.log('Removed selected post from posts array.');
