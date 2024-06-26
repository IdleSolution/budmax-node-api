import { Model, Schema, model } from "mongoose";
import { ICoal } from "../../interfaces/coal.interface";
import { CoalType } from "../enums/coal.enum";

export default interface ICoalModel extends ICoal, Document {
    toJsonFor(): any;
}

const CoalSchema = new Schema({
    name: String,
    type: { type: String, enum: CoalType },
    mine: String,
    calorificValue: Number,
    granulation: Number,
    price: Number,
    imageUrl: String,
});

CoalSchema.methods.toJsonFor = function () {
    return {
        id: this._id,
        name: this.name,
        mine: this.mine,
        calorificValue: this.calorificValue,
        granulation: this.granulation,
        price: this.price,
        imageUrl: this.imageUrl,
        type: this.type,
    }
}


export const Coal: Model<ICoalModel> = model<ICoalModel>('Coal', CoalSchema);