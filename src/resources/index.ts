import { Express } from 'express';
import { Db, ObjectID } from 'mongodb';

export default async function(app: Express, db: Db) {

  app.get('/api/v1/resources', async (_, res) => {
      res.send(JSON.stringify({
        status: 200,
        ids: await db.collection('resources').distinct('_id'),
      }));
  });
  
  app.get('/api/v1/resources/search', async (_, res) => {
      res.status(501);
      res.end(JSON.stringify('{"status":501}'));
  });
  
  app.get('/api/v1/resources/scan', async (_, res) => {
      res.status(501);
      res.end(JSON.stringify('{"status":501}'));
  });
  
  /* Resource Life Cycle Routes */
  app.post('/api/v1/resources', async (req, res) => {
      const { insertedId } = await db.collection('resources').
        insertOne(req.body);
      res.status(201);
      res.send(JSON.stringify({ status: 201, id: insertedId }));
  });
  
  app.put('/api/v1/resources/:id', async (_, res) => {
      res.status(501);
      res.end(JSON.stringify('{"status":501}'));
  });
  
  app.get('/api/v1/resources/:id', async (req, res) => {
      const id = new ObjectID(req.params.id)
      const docp = db.collection('resources')
        .findOne({ "_id": id });
      const relp = db.collection('relations')
        .find({ $or: [ { subjectId: id }, { objectId: id } ] })
        .toArray();
      const [doc, rels] = await Promise.all([docp, relp]);
      if (doc) {
        doc.relations = rels;
        res.status(200);
        res.send(JSON.stringify({ status: 200, resource: doc }));
      } else {
        res.status(404);
        res.send('{"status":404}');
      }
  });
  
  app.delete('/api/v1/resources/:id', async (req, res) => {
      await db.collection('resources')
        .deleteOne({"_id": new ObjectID(req.params.id)});
      res.status(204);
      res.send('{"status":204}');
  });
};