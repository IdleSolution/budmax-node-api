export interface IBus {
    model: string,
    engineCapacity: number,
    pricePerDay: number,
    power: number,
    imageUrl: string,
    rents: [{
        startDate: Date,
        endDate: Date,
        createdAt: Date,
        confirmationEmailSent: boolean,
        customer: {
            ip: string,
            email: string,
            firstName: string,
            lastName: string,
            phoneNumber: string,
        }
        payment: {
            orderId: string,
            payuOrderId: string,
            totalAmount: number,
            paid: boolean,
            currencyCode: string,
            posId: number,
            description: string,
        }
    }]
}

export interface BusCreationInterface {
    model: string,
    engineCapacity: number,
    pricePerDay: number,
    power: number,
}

export interface IBusSearchQueryParams {
    start: string;
    end: string;
}