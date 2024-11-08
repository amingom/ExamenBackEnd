import {ObjectId, type OptionalId} from "mongodb";

export type PersonModel = OptionalId<{
    name: string;
    email: string;
    telefono: string;
    friends: ObjectId[];
}>

export type Person = {
    id: string;
    name: string;
    email: string;
    telefono: string;
    friends: Person[];
}
