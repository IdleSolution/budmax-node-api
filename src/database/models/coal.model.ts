import { Model, Schema, model } from "mongoose";
import { ICoal } from "../../interfaces/coal.interface";
import { CoalType } from "../enums/coal.enum";

export default interface ICoalModel extends ICoal, Document {
    toJsonFor(): any;
}

const CoalSchema = new Schema({
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
        type: this.type,
        mine: this.mine,
        calorificValue: this.calorificValue,
        granulation: this.granulation,
        price: this.price,
        imageUrl: this.imageUrl,
    }
}


export const Coal: Model<ICoalModel> = model<ICoalModel>('Coal', CoalSchema);