import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import relations from './relations';
import resources from './resources';

/* Process command-line arguments */
const port_arg = process.argv.findIndex(s => s === '--port') + 1;
const server_port = +process.argv[port_arg];
const uri_arg = process.argv.findIndex(s => s === '--uri') + 1;
const db_uri = process.argv[uri_arg];
const name_arg = process.argv.findIndex(s => s === '--db') + 1;
const db_name = process.argv[name_arg];

const dbp = MongoClient.connect(
  db_uri,
  { useUnifiedTopology: true },
).then(client => client.db(db_name));

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/v1/docs', (_, res) => {
  res.send('Hello World');
});

dbp.then(db => {
  resources(app, db);
  relations(app, db);
  app.listen(server_port, () =>
    console.log(`Resource Library listening on port ${server_port}`)
  );
});