import { Express } from 'express';
import mongoose from 'mongoose';
import { authorizeRequest } from '../auth';
import { resourceSchema } from './schema';
import { relationSchema } from '../relations/schema';

const Resource = mongoose.model('resources', resourceSchema);
const Relation = mongoose.model('relations', relationSchema);

// TODO: streamline APIs when we can update Ayamel (specifically returning strings instead of JSON, and adding the http status into the response data)

export default async function(app: Express) {

  app.get('/api/v1/resources', async (_, res) => {
    Resource.find().distinct('_id', function (err: Error, resources: string[]) {
      if(err) {res.status(500).send(JSON.stringify({status: 500, ...err}));}
      else {
        res.status(200).send(JSON.stringify({status: 200, ids: resources}));
      }
    });
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

  /**
   * POST takes a resource object (see schema), and returns a object with status, id, and a contentUploadUrl string used by the GUI
   */
  app.post('/api/v1/resources', authorizeRequest, async (req, res) => {
      Resource.create(req.body, function (err, resource) {
        if (err) { res.status(500).send(JSON.stringify({status: 500, err})); }
        else {
          res.status(200);
          res.send(JSON.stringify({status: 200, id: resource._id, contentUploadUrl: `resource-${resource._id}`}));
        }
      });
  });
  
  app.put('/api/v1/resources/:id', authorizeRequest, async (req, res) => {
      const id = req.params.id;
      Resource.findByIdAndUpdate(id, req.body, {runValidators: true}, function (err) {
        if (err) {
          res.status(500).send(JSON.stringify({status: 500, error: err}));
        }
        else {
          res.status(204).send(JSON.stringify({status: 204}));
        }
      });
  });
  
  app.get('/api/v1/resources/:id', async (req, res) => {
      const id = req.params.id;
      const docp = Resource.findById(id);
      // Get all the relations for which this resource
      // is an argument (subject or object). 
      const relp = Relation
        .find({ $or: [ { subjectId: id }, { objectId: id } ] });
      let doc, rels;

      try {
        [doc, rels] = await Promise.all([docp, relp]);
      } catch(err) {
        res.status(500).send(JSON.stringify({status: 500, error: err}));
        return;
      }

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
        res.send(JSON.stringify({status:404}));
      }
  });
  
  app.delete('/api/v1/resources/:id', authorizeRequest, async (req, res) => {
      Resource.findByIdAndDelete(req.params.id, null, function (err) {
        if(err) {
          res.status(500).send(JSON.stringify({status: 500, error: err}));
        }
        else {
          res.status(204);
          res.send(JSON.stringify({status:204}));
        }
      });
  });
};
