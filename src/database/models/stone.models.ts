import { Model, Schema, model } from "mongoose";
import { IStone } from "../../interfaces/stone.interface";

export default interface IStoneModel extends IStone, Document {
    toJsonFor(): any;
}

const StomeSchema = new Schema({
    name: String,
    price: Number,
    imageUrl: String,
    granulation: Number,
    deliveryForm: String,
});

StomeSchema.methods.toJsonFor = function () {
    return {
        id: this._id,
        name: this.name,
        price: this.price,
        imageUrl: this.imageUrl,
        granulation: this.granulation,
        deliveryForm: this.deliveryForm,
    }
}


export const Stone: Model<IStoneModel> = model<IStoneModel>('Stone', StomeSchema);