const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/podsphere-ai');
  const db = mongoose.connection.db;
  const contents = await db.collection('contents').find().toArray();
  for (let c of contents) {
    const likesCount = c.likedBy ? c.likedBy.length : 0;
    const dislikesCount = c.dislikedBy ? c.dislikedBy.length : 0;
    await db.collection('contents').updateOne(
      { _id: c._id },
      { $set: { likes: likesCount, dislikes: dislikesCount } }
    );
  }
  console.log('Fixed all content likes!');
  process.exit(0);
}

fix();
