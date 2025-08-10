const fs = require('fs');
const glob = require('glob');
const matter = require('gray-matter');

const markdownFiles = glob.sync("./src/posts/*.md");  // an array of files in the 'posts' directory
let finalArray = [];

function buildJSONfile() {

  let contents;

  markdownFiles.forEach((nextFile) => {

        contents = fs.readFileSync(nextFile, "UTF8");

        let JSONobject = matter([contents].join('\n'));

        finalArray.push(JSONobject);
    });

    // write to a file
    fs.writeFileSync("./src/posts.json", JSON.stringify(finalArray, null, '\t'), "UTF8");
    console.log("Wrote posts array!");
}

buildJSONfile();

// pull a random entry from the array
let randomPost = finalArray[Math.floor(Math.random()*finalArray.length)];

console.log("Selected a post:");
console.log(randomPost);

// write to a file
fs.writeFileSync("./src/_data/randomPost.json", JSON.stringify(randomPost, null, '\t'), "UTF8");
