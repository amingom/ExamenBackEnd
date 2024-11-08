import { MongoClient } from 'mongodb';
import { PersonModel } from "./types.ts";
import { fromModelToPerson } from "./resolvers.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL){
  console.log("No se ha establecido MONGO_URL");
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.log('Connected to MongoDB');
const db = client.db("ExamenBackEnd");

const PersonCollection = db.collection<PersonModel>('personas');

const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;
  
  if(method === "POST"){
    if(path === "/personas"){
      const person = await req.json();
      if(!person.name || !person.email || !person.telefono) {
        return new Response ("Bad Request", {status: 400});
      }
      const personDB = await PersonCollection.findOne({
        email: person.email,
        telefono: person.telefono,
      });
      if(personDB) return new Response("Bad Request", {status: 400});

      const {insertedId} = await PersonCollection.insertOne({
        name: person.name,
        email: person.email,
        telefono: person.telefono,
        friends: [],
      });

      return new Response (
        JSON.stringify({
          name: person.name,
          email: person.email,
          telefono: person.telefono,
          friends: [],
          id: insertedId,
        }), {status: 201}
      );
    }
  } else if (method === "GET"){
      if(path === "/personas"){
        const name = url.searchParams.get("name");
        if(name){
          const personDB = await PersonCollection.find({name}).toArray();
          const people = await Promise.all(
            personDB.map((p) => fromModelToPerson(p, PersonCollection))
          );
          return new Response(JSON.stringify(people), {status:200});
        }else{
          const personDB = await PersonCollection.find().toArray();
          const people = await Promise.all(
            personDB.map((p) => fromModelToPerson(p, PersonCollection))
          );
          return new Response(JSON.stringify(people), {status:200});
        }
      }else if(path === "/persona"){
        const email = url.searchParams.get("email");
        if(email){
          const personDB = await PersonCollection.find({email}).toArray();
          const people = await Promise.all(
            personDB.map((p) => fromModelToPerson(p, PersonCollection))
          );
          return new Response(JSON.stringify(people), {status:200});
        }
      }
  } else if(method === "PUT"){
      if(path === "/persona"){
        const person = await req.json();
        if(!person.name || !person.email || !person.telefono || !person.friends) {
          return new Response ("Bad Request", {status: 400});
        }

        const {modifiedCount} = await PersonCollection .updateOne(
          {email: person.email},
          { $set: { name: person.name, email: person.email, telefono: person.telefono, friends: person.friends }}
        );

        if(modifiedCount === 0){
          return new Response ("Usuario no encontrado.", {status: 404});
        }

        return new Response("OK", {status: 200});
      }
  } else if(method === "DELETE"){
      if(path === "/persona"){
        const email = url.searchParams.get("email");
        if(!email) return new Response("Falta email.", {status: 400});
        const {deletedCount} = await PersonCollection.deleteOne({email});

        if(deletedCount === 0){
          return new Response("Usuario no encontrado.", {status: 404});
        }
        return new Response("OK", {status: 200});
      }
  }
  return new Response("endpoint not found", {status: 404});
}
Deno.serve({port: 3000}, handler);
