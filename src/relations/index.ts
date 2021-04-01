import { Express } from 'express';
import { Db, ObjectID } from 'mongodb';

export default async function(app: Express, db: Db) {

  app.get('/api/v1/relations', async (_, res) => {
    res.send(JSON.stringify({
      status: 200,
      ids: await db.collection('relations').distinct('_id'),
    }));
  });
  
  /* Relation Life Cycle Routes */
  
  app.post('/api/v1/relations', async (req, res) => {
    // TODO: Validate relation fields
    const { insertedId } = await db.collection('relations').
      insertOne(req.body);
    res.status(201);
    res.send(JSON.stringify({ status: 201, id: insertedId }));
  });
  
  app.get('/api/v1/relations/:id', async (req, res) => {
    const doc = await db.collection('relations')
      .findOne({"_id": new ObjectID(req.params.id)});
    if (doc) {
      doc.id = doc._id;
      delete doc._id;
      res.status(200);
      res.send(JSON.stringify({ status: 200, relation: doc }));
    } else {
      res.status(404);
      res.send('{"status":404}');
    }
  });
  
  app.delete('/api/v1/relations/:id', async (req, res) => {
    await db.collection('relations')
      .deleteOne({"_id": new ObjectID(req.params.id)});
    res.status(204);
    res.send('{"status":204}');
  });
};