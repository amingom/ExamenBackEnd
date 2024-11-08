import { Collection } from "mongodb";
import {Person, PersonModel} from "./types.ts";

export const fromModelToPerson = async (
    personDB: PersonModel,
    PersonCollection: Collection<PersonModel>
): Promise<Person> => {
    const friends = await PersonCollection.find({ _id: {$in: personDB.friends}}).toArray();
    return{
        id: personDB._id!.toString(),
        name: personDB.name,
        email: personDB.email,
        telefono: personDB.telefono,
        friends: friends.map((f) => fromModelToPerson(f)),
    };
};