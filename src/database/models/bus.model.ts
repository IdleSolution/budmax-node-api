import mongoose, { Model, model } from 'mongoose';
import { IBus } from '../../interfaces/bus.interface';
const { Schema } = mongoose;

export default interface IBusModel extends IBus, Document {
    toJsonFor(): any;
}

const BusSchema = new Schema({
    model: String,
    engineCapacity: Number,
    imageUrl: String,
    pricePerDay: Number,
    power: Number,
    rents: [{
        startDate: Date,
        endDate: Date,
        payment: {
            orderId: String,
            fullCost: Number,
            fullyPaid: Boolean,
        }
    }]
})

BusSchema.methods.toJsonFor = function () {
    return {
        model: this.model,
        engineCapacity: this.engineCapacity,
        pricePerDay: this.pricePerDay,
        power: this.power,
        imageUrl: this.imageUrl,
    }
}

export const Bus: Model<IBusModel> = model<IBusModel>('Bus', BusSchema);