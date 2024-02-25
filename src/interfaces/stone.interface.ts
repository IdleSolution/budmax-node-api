import { StoneDeliveryFormEnum } from "../database/enums/stone.enum";

export interface IStone {
    name: string;
    price: number;
    granulation: number;
    deliveryForm: StoneDeliveryFormEnum;
}