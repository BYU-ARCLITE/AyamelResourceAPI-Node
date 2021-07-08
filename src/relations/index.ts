import { Express } from 'express';
import mongoose, { CallbackError } from 'mongoose';
import { authorizeRequest } from '../auth';
import { relationSchema } from './schema';

const Relation = mongoose.model('relations', relationSchema);

export default async function(app: Express) {

  app.get('/api/v1/relations', (_, res) => {
    Relation.find().distinct('_id', function (err: Error, relations: string[]) {
      if(err) {res.status(400).send(JSON.stringify({status: 400, error: err}));}
      else {
        res.status(200).send(JSON.stringify({status: 200, ids: relations}));
      }
    });
  });
  
  /* Relation Life Cycle Routes */
  
  app.post('/api/v1/relations', authorizeRequest, (req, res) => {
    // TODO: Validate relation fields
    Relation.create(req.body, function(err, relation) {
      if (err) {
        res.status(400).send(JSON.stringify({status: 400, error: err}));
      }
      else {
        res.status(201);
        res.send(JSON.stringify({ status: 201, id: relation._id }));
      }
    });
  });

  app.put('/api/v1/relations/:id', authorizeRequest, (req, res) => {
    const id = req.params.id;
    Relation.findByIdAndUpdate(id, req.body, {runValidators: true}, function (err) {
      if (err) {
        res.status(500).send(JSON.stringify({status: 500, error: err}));
      }
      else {
        res.status(204).send(JSON.stringify({status: 204}));
      }
    });
  });

  
  app.get('/api/v1/relations/:id', (req, res) => {
    Relation.findById(req.params.id, function (err: CallbackError, doc: any) {
      if (err) {
        res.status(500);
        res.send(JSON.stringify({status:500, error: err}));
        return
      }
      if (doc) {
        // internal database _id needs to be
        // translated to external unprefixed id
        doc.id = doc._id;
        delete doc._id;
        res.status(200);
        res.send(JSON.stringify({ status: 200, relation: doc }));
      }
      else {
        res.status(404);
        res.send('{"status":404}');
      }
    });
  });
  
  app.delete('/api/v1/relations/:id', authorizeRequest, async (req, res) => {
    const id = req.params.id;
    try {
      const count: number = await Relation.countDocuments({ _id: id });
      if (count === 0) {
        res.status(404);
        res.send(JSON.stringify({status: 404}));
        return;
      }

      await Relation.findByIdAndDelete(id);

      res.status(200);
      res.send(JSON.stringify({status:200}));
    } catch (err) {
      res.status(500).send(JSON.stringify({status: 500, error: err}));
    }
  });
};
