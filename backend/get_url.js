const { MongoClient } = require('mongodb');

async function checkDB() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  try {
    await client.connect();
    const db = client.db('podsphere-ai');
    const content = await db.collection('contents').find().sort({createdAt: -1}).limit(1).toArray();
    console.log("Latest Content URL:");
    if (content.length > 0) {
      console.log(content[0].originalVideo);
      console.log(content[0].podcastAudio);
    }
  } finally {
    await client.close();
  }
}
checkDB();
