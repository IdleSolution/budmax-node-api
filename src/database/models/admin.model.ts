import { Model, Schema, model } from "mongoose";
import { IAdmin } from "../../interfaces/admin.interface";

export default interface IAdminModel extends IAdmin, Document {}

const AdminSchema = new Schema({
    username: String,
    password: String,
});


export const Admin: Model<IAdminModel> = model<IAdminModel>('Admin', AdminSchema);