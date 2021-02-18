# AyamelResourceAPI-Node
 Node/TypeScript re-implementation of the Ayamel Resource Library API.

# Build & Run

1. Clone the repository.
2. Run `npm i`
3. Create a `config.json` file.
3. Run `npm start`

# Config File Structure

```json
{
    "server_port": 80, // or whatever port you want
    "db_uri": "mongodb://localhost:27017", // or wherever MongoDB is running
    "db_name": "resource_library" // or whatever the database name is
}
```

# API


GET `/api/v1/docs`
Should return documentation, actually just returns 'Hello World'.

All other API reponses are wrapped in a top-level JSON object containing a `status` field which mirrors the HTTP response status.

GET `/api/v1/resources`
Returns an array of valid resource IDs under the key `ids`.

GET `/api/v1/resources/search`
Not Implemented

GET `/api/v1/resources/scan`
Not Implemented

POST `/api/v1/resources`
Creates a new resource with the JSON document sent in the POST body.
Returns the id of the new resource under the key `id`.

PUT `/api/v1/resources/:id`
Not Implemented

GET `/api/v1/resources/:id`
Returns the resource with the given ID under the key `resource`.

DELETE `/api/v1/resources/:id`
Removes the resource with the given ID if it exists.

GET `/api/v1/relations`
Returns an array of valid relation IDs under the key `ids`.

POST `/api/v1/relations`
Creates a new relation with the JSON document sent in the POST body.
Returns the id of the new relation under the key `id`.

GET `/api/v1/relations/:id`
Returns the relation with the given ID under the key `relation`.

DELETE `/api/v1/relations/:id`
Removes the relation with the given ID if it exists.