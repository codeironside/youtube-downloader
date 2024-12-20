const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const youtubedl = require("youtube-dl-exec");

const app = express();
const PORT = 3000;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.post("/formats", async (req, res) => {
    const { url } = req.body;
    // console.log(url);

    if (!url) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    try {
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificate: true,
        });

        const formats = info.formats
            .filter(format => format.ext && format.format_note) // Ensure only formats with ext and format_note are included
            .map(format => ({
                format_id: format.format_id,
                quality: format.format_note,
                ext: format.ext,
            }));

        res.json({ formats });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch video formats" });
        console.error(error);
    }
});

// Route to download the video/audio
app.post("/download", async (req, res) => {
    const { url, format_id } = req.body;
    console.log(format_id

    )

    if (!url || !format_id) {
        return res.status(400).send("Invalid request. Please provide a valid YouTube URL and format.");
    }

    try {
        const video = youtubedl(url, {
            format: format_id,
            output: '-',
            noCheckCertificate: true,

        });
        // if (typeof video.pipe !== 'function') {
        //     throw new Error('Video is not a stream');
        // }


        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        console.log(video)
        video.stdout.pipe(res);
    } catch (error) {
        res.status(500).json({ error: "Failed to download video" });
        console.error(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});