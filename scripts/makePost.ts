import { BskyAgent, RichText } from "@atproto/api";
import * as dotenv from 'dotenv';
import { CronJob } from 'cron';
import * as process from 'process';
import chosenMachine from "../src/_data/randomPost.json" with { type: "json" };
import fs  from 'fs';
import { imageSizeFromFile } from 'image-size/fromFile';
import path from 'path';
import { createRestAPIClient } from "masto";

dotenv.config();

async function postMachineToBluesky() {
    const agent = new BskyAgent({ service: "https://bsky.social" });
    await agent.login({
        identifier: process.env.BSKY_USERNAME!,
        password: process.env.BSKY_PASSWORD!
    });
    console.log("[Bluesky] Logged in")

    // define data from the imported json
    const machineModel = `${chosenMachine.data.year} ${chosenMachine.data.manufacturer} ${chosenMachine.data.model}`;
    const machinePicture = `src/${chosenMachine.data.picture}`;
    const machineCredit = `picture: ${chosenMachine.data.pictureCredit}`;

    console.log(`Posting: ${machineModel}`);
    console.log("[Bluesky] Uploading picture")

    // define the picture
    const dimensions = await imageSizeFromFile(machinePicture);
    const imageBytes = await fs.promises.readFile(machinePicture);
    const fileExtension = path.extname(machinePicture).toLowerCase();
    const encoding = fileExtension === ".jpg" ? "image/jpeg" : "image/webp";
    const testUpload = await agent.uploadBlob(imageBytes, { encoding });

    console.log("[Bluesky] Picture uploaded")

    // create the text

    // shorten the machine name if too close to the character limit
    function padString(str: string) {
        return str.length > 150 ? `${str.slice(0, 149)}…` : str;
    }

    function getStatusText() {
        const baseStatus = `${machineModel}`;
        if (baseStatus.length >= 450) {
            return baseStatus;
        }

        return `${padString(machineModel)}`;
    }

    // add rich text and pass to rich text parser
    const rt = new RichText({
        text: getStatusText() + ((`\n\n${machineCredit} ${chosenMachine.data.pictureCreditUrl} under ${chosenMachine.data.pictureLicense}`) || "")
    });
    await rt.detectFacets(agent);

    console.log("[Bluesky] Posting")

    await agent.post({
        $type: "app.bsky.feed.post",
        text: rt.text,
        facets: rt.facets,
        embed: {
          images: [
            {
              image: testUpload.data.blob,
              alt: chosenMachine.data.alt,
              aspectRatio: {
                    width: dimensions.width,
                    height: dimensions.height
                }
            },
          ],
          $type: "app.bsky.embed.images",
        },
      });
}

async function postMachineToMastodon() {
    try {
    const masto = await createRestAPIClient({
      url: process.env.MASTODON_API,
      accessToken: process.env.MASTODON_TOKEN
    });

    console.log("[Mastodon] Logged in");

    // define data from the imported json
    const machinePicture = `src/${chosenMachine.data.picture}`;
    const machineCredit = `picture: ${chosenMachine.data.pictureCredit}`;
    const machineModel = `${chosenMachine.data.year} ${chosenMachine.data.manufacturer} ${chosenMachine.data.model}`;

    console.log(`Uploading ${machineModel}`);
    console.log("[Mastodon] Processing picture");

    const processedPic = fs.readFileSync(machinePicture);
    const attachment = await masto.v2.media.create({
            file: new Blob([processedPic]),
            description: chosenMachine.data.alt,
        });

    console.log("[Mastodon] Picture processed");

    function getStatusText() {
      return `${machineModel}\n\n${machineCredit} ${chosenMachine.data.pictureCreditUrl} under ${chosenMachine.data.pictureLicense}`;
    }

    console.log(`[Mastodon] Posting`);
    const status = await masto.v1.statuses.create({
      status: getStatusText(),
      visibility: "public",
      mediaIds: [attachment.id]
    });

    console.log(status);
    return status;
    } catch (e) {
    if (String(e).includes("Timeout")) {
      console.log("[Mastodon] Timed out, trying again");
      return postMachineToMastodon();
    }

    console.error(e);
    return undefined;
    }
}

postMachineToBluesky();
postMachineToMastodon();
