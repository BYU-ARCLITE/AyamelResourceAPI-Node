import express from 'express';
import { MongoClient, ObjectID } from 'mongodb';

const port_arg = process.argv.findIndex(s => s === '--port') + 1;
const server_port = +process.argv[port_arg];
const uri_arg = process.argv.findIndex(s => s === '--uri') + 1;
const db_uri = process.argv[uri_arg];
const name_arg = process.argv.findIndex(s => s === '--db') + 1;
const db_name = process.argv[name_arg];

const DBPromise = MongoClient.connect(db_uri)
  .then(client => client.db(db_name));

const app = express();

app.use(express.json());

app.get('/api/v1/docs', (_, res) => {
  res.send('Hello World');
});

/* RESOURCE ROUTES */

app.get('/api/v1/resources', async (_, res) => {
  const db = await DBPromise;;
  res.send(JSON.stringify({
    status: 200,
    ids: await db.collection('resources').distinct('_id'),
  }));
});

app.get('/api/v1/resources/search', async (_, res) => {
  //const db = await DBPromise;
  res.status(501);
  res.end(JSON.stringify('{"status":501}'));
});

app.get('/api/v1/resources/scan', async (_, res) => {
  //const db = await DBPromise;
  res.status(501);
  res.end(JSON.stringify('{"status":501}'));
});

/* Resource Life Cycle Routes */
app.post('/api/v1/resources', async (req, res) => {
  const db = await DBPromise;
  const { insertedId } = await db.collection('resources').
    insertOne(req.body);
  res.status(201);
  res.send(JSON.stringify({ status: 201, id: insertedId }));
});

app.put('/api/v1/resources/:id', async (_, res) => {
  //const db = await DBPromise;
  res.status(501);
  res.end(JSON.stringify('{"status":501}'));
});

app.get('/api/v1/resources/:id', async (req, res) => {
  // TODO: retrieve relations
  // TODO: handle invalid IDs
  const db = await DBPromise;
  const doc = await db.collection('resources')
    .findOne({"_id": new ObjectID(req.params.id)});
  res.status(200);
  res.send(JSON.stringify({ status: 200, resource: doc }));
});

app.delete('/api/v1/resources/:id', async (req, res) => {
  const db = await DBPromise;
  await db.collection('resources')
    .deleteOne({"_id": new ObjectID(req.params.id)});
  res.status(204);
  res.send('{"status":204}');
});

/* RELATION ROUTES */

app.get('/api/v1/relations', async (_, res) => {
  const db = await DBPromise;;
  res.send(JSON.stringify({
    status: 200,
    ids: await db.collection('relations').distinct('_id'),
  }));
});

/* Relation Life Cycle Routes */

app.post('/api/v1/relations', async (req, res) => {
  // TODO: Validate relation fields
  const db = await DBPromise;
  const { insertedId } = await db.collection('relations').
    insertOne(req.body);
  res.status(201);
  res.send(JSON.stringify({ status: 201, id: insertedId }));
});

app.get('/api/v1/relations/:id', async (req, res) => {
  // TODO: handle invalid IDs
  const db = await DBPromise;
  const doc = await db.collection('relations')
    .findOne({"_id": new ObjectID(req.params.id)});
  res.status(200);
  res.send(JSON.stringify({ status: 200, relation: doc }));
});

app.delete('/api/v1/relations/:id', async (req, res) => {
  const db = await DBPromise;
  await db.collection('relations')
    .deleteOne({"_id": new ObjectID(req.params.id)});
  res.status(204);
  res.send('{"status":204}');
});

app.listen(server_port);