const mongoose = require("mongoose");
const Content = require("./src/models/Content").default;

mongoose.connect("mongodb://127.0.0.1:27017/podsphere-ai", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const contents = await Content.find().sort({ createdAt: -1 }).limit(1);
    if (contents.length > 0) {
      console.log("Latest Content:");
      console.log("Title:", contents[0].title);
      console.log("Video URL:", contents[0].originalVideo);
      console.log("Podcast URL:", contents[0].podcastAudio);
    } else {
      console.log("No content found");
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
