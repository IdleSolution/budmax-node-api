import { CoalType } from "../database/enums/coal.enum";

export interface ICoal {
    name: string,
    type: CoalType,
    mine: string,
    calorificValue: number,
    granulation: number,
    price: number,
    imageUrl: string;
}

export interface ICoalListQueryParams {
    type: CoalType;
}