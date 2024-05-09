import axios from "axios";
import { Bus } from "../database/models/bus.model";
import { BusReservationCreationInterface, PayuOrderCreateResponse, ReservationPayuOrderInterface } from "../interfaces/payments.interface";
import { Request, Response, Router } from 'express';
import { formatDate } from "../utilities/format-date";
import { countDays } from "../utilities/count-days";
import { checkDateIntersection } from "../utilities/date-intersection";
import { MERCHANT_POS_ID, PAYU_CLIENT_ID, PAYU_CLIENT_SECRET } from "../utilities/secrets";

const router: Router = Router();

const PAYU_URL = 'https://secure.snd.payu.com';
const ADVANCE_PAYMENT_PERCENTAGE = 0.15;

const getPayuBearerToken = async (): Promise<string> => {
    try {
        const res = await axios.post(`${PAYU_URL}/pl/standard/user/oauth/authorize`, {
            grant_type: "client_credentials",
            client_id: PAYU_CLIENT_ID,
            client_secret: PAYU_CLIENT_SECRET
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    
        return res.data.access_token;
    } catch(e) {
        throw e;
    }

}

const createPayuOrder = async (orderInfo: ReservationPayuOrderInterface): Promise<PayuOrderCreateResponse> => {
    try {
        const token = await getPayuBearerToken();

        const order = await axios.post<PayuOrderCreateResponse>(`${PAYU_URL}/api/v2_1/orders`, {
            customerIp: orderInfo.ip,
            merchantPosId: MERCHANT_POS_ID,
            description: `Rezerwacja auta w czasie: ${formatDate(orderInfo.startDate)} - ${formatDate(orderInfo.endDate)}`,
            currencyCode: 'PLN',
            totalAmount: orderInfo.totalAmount,
            buyer: {
                email: orderInfo.customer.email,
                phone: orderInfo.customer.phone,
                firstName: orderInfo.customer.firstName,
                lastName: orderInfo.customer.lastName,
            },
            products: [
                {
                    name: orderInfo.product.name,
                    quantity: orderInfo.product.quantity,
                    unitPrice: orderInfo.product.unitPrice,
                }
            ],
            additionalDescription: `Model: ${orderInfo.product.name}`
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": 'application/json'
            },
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status <= 302
              }
        });

        return order.data;
    } catch(e) {
        console.log(e);
        throw e;
    }

}


router.post(
    '/reservation/:id',
    async (req: Request<{ id: string }, {}, BusReservationCreationInterface>, res: Response) => {
        try {
            const newOrder = req.body;

            const busId = req.params.id;
    
            const bus = await Bus.findById(busId);
    
            const startRentDate = typeof newOrder.startDate === 'string' ? new Date(newOrder.startDate) : newOrder.startDate;
            const endRentDate = typeof newOrder.startDate === 'string' ? new Date(newOrder.endDate) : newOrder.endDate;
    
            if(!bus) {
                return res.status(404).json({ error: 'Bus with given id does not exist.' });
            }
    
            if(startRentDate > endRentDate) {
                return res.status(404).json({ error: 'Wrong reservation days!' });
            }
    
             bus.rents.forEach(rent => {
                const differenceMs = Date.now() - rent.createdAt.getTime();
    
                const oneHourMs = 60 * 60 * 1000;
    
                const intersection = checkDateIntersection({ startDate: startRentDate, endDate: endRentDate }, 
                    { startDate: rent.startDate, endDate: rent.endDate }
                );
    
                if((differenceMs < oneHourMs && !rent.payment.paid) && intersection) {
                    return res.status(404).json({ error: 'The given dates are not available for reservation!' });
                }
             })
    
    
            const totalAmount = bus.pricePerDay * ADVANCE_PAYMENT_PERCENTAGE * countDays(startRentDate, endRentDate);
    
            const order = await createPayuOrder({
                ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
                totalAmount: String(totalAmount),
                startDate: startRentDate,
                endDate: endRentDate,
                product: {
                    name: bus.model,
                    unitPrice: String(totalAmount),
                    quantity: '1',
                },
                customer: {
                    firstName: newOrder.customer.firstName,
                    lastName: newOrder.customer.lastName,
                    phone: newOrder.customer.phoneNumber,
                    email: newOrder.customer.email,
                }
            });
    
            await Bus.updateOne({ _id: busId }, {
                $push: {
                    rents: {
                        startDate: startRentDate,
                        endDate: endRentDate,
                        createdAt: new Date(),
                        payment: {
                            orderId: order.orderId,
                            totalAmount,
                            paid: false,
                            currencyCode: 'PLN',
                            posId: MERCHANT_POS_ID,
                        },
                        customer: {
                            ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
                            email: newOrder.customer.email,
                            firstName: newOrder.customer.firstName,
                            lastName: newOrder.customer.lastName,
                            phoneNumber: newOrder.customer.phoneNumber,
                        }
                    }
                }
            });
    
            return res.json({ url: order.redirectUri });
        } catch(e) {
            return res.status(500).json(e);
        }
    }
)

export const PaymentRoutes: Router = router;
