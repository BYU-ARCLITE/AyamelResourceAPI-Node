import { Express } from 'express';
import mongoose, { CallbackError } from 'mongoose';
import { authorizeRequest } from '../auth';
import { relationSchema } from './schema';
import { fixId } from '../utils';

const Relation = mongoose.model('relations', relationSchema);

export default async function(app: Express) {

  /**
   * Get relations for a resource, or resources
   *
   * Query params:
   * subjectId : search for the resource id in the subjectId field
   * objectId : search for the resource id in the objectId field
   * id : search for the resource id in the subjectId or objectId fields
   * 
   * Any combination of the above may be provided.
   *
   * If subjectId and objectId are both provided, both
   * fields must match for a relation to be returned.
   */

  function normalizeParam(field: string, queryParams: any): string[] {
    const val = queryParams[field];
    if (typeof val === "string") return [val];
    if (Array.isArray(val)) return val;
    return [];
  }

  function constructQuery(queryParams: any) {
    const idParam = normalizeParam("id", queryParams);
    const subjectParam = normalizeParam("subjectId", queryParams)
    const objectParam = normalizeParam("objectId", queryParams);
    
    /* maximal possible query:
    {
      $or: [
        { subjectId: { $in: idParam } },
        { objectId:  { $in: idParam } },
        { 
          subjectId: { $in: subjectParam },
          objectId: { $in: objectParam },
        }
      ],
    }
    */
  
    type IdSearchValue = { $in: string[] };
    type MongoRelationsSearch = {
      subjectId?: IdSearchValue;
      objectId?: IdSearchValue;
    };

    const $and: MongoRelationsSearch | undefined =
      (subjectParam.length || objectParam.length) ? {
        subjectId: subjectParam.length ? { $in: subjectParam } : void 0,
        objectId:  objectParam.length  ? { $in: objectParam  } : void 0,
      } : void 0;

    if (idParam.length) {
      const $or: MongoRelationsSearch[] = [
        { subjectId: { $in: idParam } },
        { objectId:  { $in: idParam } },
      ];

      $and && $or.push($and);

      return { $or };
    }

    return $and;
  }

  app.get('/api/v1/relations', (req, res) => {
    const query = constructQuery(req.query);
    
    if (!query) {
      res.status(400).send(JSON.stringify({
        status: 400, error: "Missing resource id keys",
      }));
      return;
    }

    Relation.find(query, (err: Error, relations: any[]) => {
      if(err) {
        res.status(400).send(JSON.stringify({ status: 400, error: err }));
      } else {
        res.status(200).send(JSON.stringify({
          status: 200,
          relations: relations.map(fixId),
        }));
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
