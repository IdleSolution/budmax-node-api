import { Model, Schema, model } from "mongoose";
import { IPellet } from "../../interfaces/pellet.interface";

export default interface IPelletModel extends IPellet, Document {
    toJsonFor(): any;
}

const PelletSchema = new Schema({
    name: String,
    producent: String,
    certificates: String,
    price: Number,
    imageUrl: String,
});

PelletSchema.methods.toJsonFor = function () {
    return {
        id: this._id,
        name: this.name,
        producent: this.producent,
        certificates: this.certificates,
        price: this.price,
        imageUrl: this.imageUrl,
    }
}


export const Pellet: Model<IPelletModel> = model<IPelletModel>('Pellet', PelletSchema);