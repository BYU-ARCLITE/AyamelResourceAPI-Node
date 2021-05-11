import { Request, Response, NextFunction } from 'express';

const url = require('url');
const apiKey = require('../resource.config.json').apiKey;

/**
 * Function to validate that requests come with a valid apiKey (matching the one in resource.config.json).
 * Pass a reference to this functions in routes before the routehandler function if the route requires authorization.
 * 
 * @param req Express request
 * @param res Express Response
 * @param next Express NextFunction
 */
export function authorizeRequest(req: Request, res: Response, next: NextFunction) {
    const queryObj = url.parse(req.url, true).query;

    if(queryObj._apiKey !== apiKey) {
        res.status(401);
        res.send(JSON.stringify({ status: 401, err: "Request did not contain a valid API key" }));
    }
    else {
        next();
    }
}