import { Express } from 'express';
import { Db, ObjectID } from 'mongodb';
import { authorizeRequest } from '../auth';

// TODO: return errors when there are errors
// TODO: create schemas for documentation and validation
// TODO: create an function to require authentication

export default async function(app: Express, db: Db) {

  app.get('/api/v1/resources', async (_, res) => {
      res.send(JSON.stringify({
        status: 200,
        ids: await db.collection('resources').distinct('_id'),
      }));
  });
  

  // TODO: build this
  app.get('/api/v1/resources/search', async (_, res) => {
      res.status(501);
      res.end(JSON.stringify('{"status":501}'));
  });
  
  // TODO: build this
  app.get('/api/v1/resources/scan', async (_, res) => {
      res.status(501);
      res.end(JSON.stringify('{"status":501}'));
  });
  
  /* Resource Life Cycle Routes */
  app.post('/api/v1/resources', authorizeRequest, async (req, res) => {
      const { insertedId } = await db.collection('resources').
        insertOne(req.body);
      res.status(201);
      res.send(JSON.stringify({ status: 201, id: insertedId }));
  });
  
  app.put('/api/v1/resources/:id', authorizeRequest, async (req, res) => {
      const id = req.params.id;

      // create an update doc for MongoDB
      const updateDoc = {
        $set: {...req.body}
      }

      const response = await db.collection('resources').
        updateOne({"_id": new ObjectID(id)}, updateDoc);

      res.status(201);
      res.send(JSON.stringify({ matches: response.matchedCount, mondified: response.modifiedCount}));
  });
  
  app.get('/api/v1/resources/:id', async (req, res) => {
      const id = req.params.id;
      const docp = db.collection('resources')
        .findOne({ "_id": new ObjectID(id) });
      // Get all the relations for which this resource
      // is an argument (subject or object). 
      const relp = db.collection('relations')
        .find({ $or: [ { subjectId: id }, { objectId: id } ] })
        .toArray();
      const [doc, rels] = await Promise.all([docp, relp]);
      if (doc) {    
        // internal database _id needs to be
        // translated to external unprefixed id
        for (const rel of rels) {
          rel.id = rel._id;
          delete rel._id;
        }
        doc.id = doc._id;
        delete doc._id;

        // merge relations into returned resource document
        doc.relations = rels;
        res.status(200);
        res.send(JSON.stringify({ status: 200, resource: doc }));
      } else {
        res.status(404);
        res.send('{"status":404}');
      }
  });
  
  app.delete('/api/v1/resources/:id', authorizeRequest, async (req, res) => {
      await db.collection('resources')
        .deleteOne({"_id": new ObjectID(req.params.id)});
      res.status(204);
      res.send('{"status":204}');
  });
};
