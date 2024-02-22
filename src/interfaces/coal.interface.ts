export enum CoalType {
    CUBE = 'cube',
    WALNUT = 'walnut',
    ECO_PEA = 'eco pea',
}

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