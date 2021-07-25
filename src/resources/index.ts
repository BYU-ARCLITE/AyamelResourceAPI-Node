import { Express } from 'express';
import mongoose from 'mongoose';
import { authorizeRequest } from '../auth';
import { resourceSchema } from './schema';
import { relationSchema } from '../relations/schema';
import { fixId } from '../utils';

const Resource = mongoose.model('resources', resourceSchema);
const Relation = mongoose.model('relations', relationSchema);

// TODO: streamline APIs when we can update Ayamel (specifically returning strings instead of JSON, and adding the http status into the response data)

export default async function(app: Express) {

  app.get('/api/v1/resources', async (_, res) => {
    try {
      const ids: string[] = await Resource.find().distinct('_id').exec();
      res.status(200).send(JSON.stringify({ status: 200, ids }));
    } catch (error) {
      res.status(500).send(JSON.stringify({ status: 500, error }));
    }
  });

  // TODO: build this
  app.get('/api/v1/resources/search', (_, res) => {
    res.status(501);
    res.end(JSON.stringify({'status': 501}));
  });

  // TODO: build this
  app.get('/api/v1/resources/scan', (_, res) => {
    res.status(501);
    res.end(JSON.stringify({'status': 501}));
  });

  /* Resource Life Cycle Routes */

  /*
   * Endpoint for setting remote file metadata
   */
  app.post('/api/v1/resources/:id/content/:token', authorizeRequest, async (req, res) => {
    let files = req.body.remoteFiles || [];
    files = files.map((file: any) => {
      if (!file.mime && file.mimeType) {
        // copy mimetype
        // The ayamel player requires mime to be set but
        // the backend does not set a mime field.
        file.mime = file.mimeType;
      }
      return file;
    });

    try {
      const resource = await Resource.findByIdAndUpdate(
        req.params.id,
        { $set: { 'content.files': files } },
        { new: true },
      ).exec();

      fixId(resource);
      res.status(200).send({ status: 200, resource });
    } catch (error) {
      res.status(500).send(JSON.stringify({ status: 500, error }));
    }
  });

  /**
   * POST takes a resource object (see schema), and returns a object with status,
   * id, and a contentUploadUrl string used by the GUI to update file lists.
   * (see post '/api/v1/resources/:id/content/:token')
   */

  app.post('/api/v1/resources', authorizeRequest, async (req, res) => {
    try {
      const resource = await Resource.create(req.body);
      res.status(200).send(JSON.stringify({
        status: 200,
        resource: { id: resource._id },
        contentUploadUrl: `/api/v1/resources/${resource._id}/content/dummytoken-${resource._id}`,
      }));
    } catch (error) {
      res.status(500).send(JSON.stringify({ status: 500, error }));
    }
  });

  /**
   * Update a resource
   */
  app.put('/api/v1/resources/:id', authorizeRequest, async (req, res) => {
    const id = req.params.id;    
    const { body: resource } = req;
    const newdoc = { ...resource };
    delete newdoc.id;
    newdoc._id = id;

    try {
      const doc = await Resource.findById(id).exec();
      if (!doc) {
        await Resource.create(newdoc);
        res.status(200).send(JSON.stringify({ status: 200, resource }));
      } else {
        doc.overwrite(newdoc);
        await doc.save();
      }

      res.status(200).send(JSON.stringify({ status: 200, resource }));
    } catch (error) {
      res.status(500).send(JSON.stringify({ status: 500, error }));
    }
  });

  app.get('/api/v1/resources/:id', async (req, res) => {
    const id = req.params.id;
    const docp = Resource.findById(id).exec();
    // Get all the relations for which this resource
    // is an argument (subject or object).
    const relp = Relation
      .find({ $or: [ { subjectId: id }, { objectId: id } ] })
      .exec();
    let doc, rels;

    try {
      [doc, rels] = await Promise.all([docp, relp]);
    } catch (error) {
      res.status(500).send(JSON.stringify({ status: 500, error }));
      return;
    }

    if (doc) {
      // internal database _id needs to be
      // translated to external unprefixed id
      for (const rel of rels) {
        fixId(rel);
      }
      fixId(doc);

      // merge relations into returned resource document
      doc.relations = rels;
      res.status(200).send(JSON.stringify({ status: 200, resource: doc }));
    } else {
      res.status(404).send(JSON.stringify({ status: 404 }));
    }
  });

  app.delete('/api/v1/resources/:id', authorizeRequest, async (req, res) => {
    const id = req.params.id;
    try {
      const count: number = await Resource.countDocuments({ _id: id }).exec();
      if (count === 0) {
        res.status(404).send(JSON.stringify({status: 404}));
        return;
      }

      // Get the ids of all relations for which this
      // resource is an argument (subject or object).
      const relIds: { _id: string }[] = await Relation
        .find({ $or: [ { subjectId: id }, { objectId: id } ] })
        .select('_id')
        .exec();

      // delete all associated relations
      await Promise.all(relIds.map(({ _id }) => Relation.findByIdAndDelete(_id).exec()));

      // delete the actual resource
      await Resource.findByIdAndDelete(id).exec();

      res.status(200);
      res.send(JSON.stringify({status: 200}));
    } catch (err) {
        res.status(500).send(JSON.stringify({status: 500, error: err}));
    }
  });
};
