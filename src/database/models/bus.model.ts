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
        createdAt: Date,
        customer: {
            ip: String,
            email: String,
            firstName: String,
            lastName: String,
            phoneNumber: String,
        },
        payment: {
            orderId: String,
            totalAmount: Number,
            paid: Boolean,
            currencyCode: String,
            posId: Number,
        }
    }]
})

BusSchema.methods.toJsonFor = function () {
    return {
        id: this._id,
        model: this.model,
        engineCapacity: this.engineCapacity,
        pricePerDay: this.pricePerDay,
        power: this.power,
        imageUrl: this.imageUrl,
    }
}

export const Bus: Model<IBusModel> = model<IBusModel>('Bus', BusSchema);