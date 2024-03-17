import { CoalType } from "../database/enums/coal.enum";

export interface ICoal {
    type: CoalType,
    mine: string,
    calorificValue: number,
    granulation: number,
    price: number,
    image_url: string;
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
    image_url: string;
}
