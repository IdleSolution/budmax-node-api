import { CoalType, CoalTypePolish } from "../database/enums/coal.enum";

export interface ICoal {
    name: string,
    type: CoalTypePolish,
    mine: string,
    calorificValue: number,
    granulation: number,
    price: number,
    imageUrl: string;
}

export interface ICoalListQueryParams {
    type: CoalType;
}