import { CoalType } from "../database/enums/coal.enum";

export interface ICoal {
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


export interface ICoalUpdate {
    type: CoalType,
    mine: string,
    calorificValue: number,
    granulation: number,
    price: number,
    imageUrl: string;
}
