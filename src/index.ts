import express from 'express';
import cors from 'cors';
import relations from './relations';
import resources from './resources';
import mongoose from 'mongoose';

/* Process command-line arguments */
const port_arg = process.argv.findIndex(s => s === '--port') + 1;
const server_port = +process.argv[port_arg];
const uri_arg = process.argv.findIndex(s => s === '--uri') + 1;
let db_uri = process.argv[uri_arg];
const name_arg = process.argv.findIndex(s => s === '--db') + 1;
const db_name = process.argv[name_arg];

// ensure the slash at the end of connection string so the db name can be appended
if (db_uri.charAt(db_uri.length-1) !== '/') {
  db_uri += '/'
}

mongoose.connect(`${db_uri}${db_name}`, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
const db = mongoose.connection;


const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/v1/docs', (_, res) => {
  res.send('Hello World');
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  resources(app);
  relations(app);
  app.listen(server_port, () =>
    console.log(`Resource Library listening on port ${server_port}`)
  );
});