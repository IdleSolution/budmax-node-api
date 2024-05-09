export interface BusReservationCreationInterface {
    startDate: Date,
    endDate: Date,
    customer: {
        email: string,
        firstName: string,
        lastName: string,
        phoneNumber: string,
    }
}

export interface ReservationPayuOrderInterface {
    ip: string;
    totalAmount: string;
    startDate: Date;
    endDate: Date;
    orderId: string;
    product: {
        name: string;
        unitPrice: string;
        quantity: string;
    },
    customer: {
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
    }
}

export interface PayuOrderCreateResponse {
    status: {
        statusCode: string,
    },
    redirectUri: string,
    orderId: string,
}

export interface PayuPaymentNotification {
    order: {
        orderId: string;
        extOrderId: string;
        status: 'COMPLETED' | 'PENDING' | 'WAITING_FOR_CONFIRMATION' | 'CANCELED',
    },
}