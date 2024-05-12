import axios from "axios";
import { Bus } from "../database/models/bus.model";
import { BusReservationCreationInterface, PayuOrderCreateResponse, PayuPaymentNotification, ReservationPayuOrderInterface } from "../interfaces/payments.interface";
import { Request, Response, Router } from 'express';
import { formatDate } from "../utilities/format-date";
import { countDays } from "../utilities/count-days";
import { checkDateIntersection } from "../utilities/date-intersection";
import { GMAIL_STP_PASSWORD, MERCHANT_POS_ID, PAYU_CLIENT_ID, PAYU_CLIENT_SECRET, PAYU_MD5_KEY } from "../utilities/secrets";
import schemaValidator from "../middlewares/schema-validator.middleware";
import { RESERVATION_CREATION_SCHEMA } from "../schemas";
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import nodemailer from 'nodemailer';

const router: Router = Router();

const PAYU_URL = 'https://secure.snd.payu.com';
export const ADVANCE_PAYMENT_PERCENTAGE = 0.15;

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
            notifyUrl: 'https://budmax-node-api-production.up.railway.app/api/payment/notification',
            continueUrl: `https://budmax-zwolen.pl/platnosc?paymentId=${orderInfo.orderId}`,
            currencyCode: 'PLN',
            totalAmount: String(Number(orderInfo.totalAmount) * 100),
            extOrderId: orderInfo.orderId,
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
    schemaValidator(RESERVATION_CREATION_SCHEMA),
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
    
                if((rent.payment.paid || (differenceMs < oneHourMs && !rent.payment.paid)) && intersection) {
                    return res.status(404).json({ error: 'The given dates are not available for reservation!' });
                }
             })
    
    
            const totalAmount = bus.pricePerDay * ADVANCE_PAYMENT_PERCENTAGE * countDays(startRentDate, endRentDate);

            const orderId = uuidv4();
    
            const order = await createPayuOrder({
                ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
                totalAmount: String(totalAmount),
                startDate: startRentDate,
                endDate: endRentDate,
                orderId,
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
                        confirmationEmailSent: false,
                        payment: {
                            orderId,
                            payuOrderId: order.orderId,
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
    
            return res.json({ url: order.redirectUri, payuOrderId: order.orderId });
        } catch(e) {
            return res.status(500).json(e);
        }
    }
)

router.get('/check/:id', async (req: Request<{ id: string }>, res: Response) => {
    const orderId = req.params.id;

    const result = await Bus.findOne(
        { "rents.payment.orderId": orderId },
        { "rents.$": 1 },
    )

    return res.json({ processed: result?.rents[0].payment.paid ?? false });
})

router.post('/notification', async (req: Request<{}, {}, PayuPaymentNotification>, res: Response) => {
    const { status, extOrderId } = req.body.order;
    if(status === 'COMPLETED') {
        const signatureString = req.headers['openpayu-signature'] as string;
        if(!signatureString) {
            console.log('Missing signature!');
            return res.status(400).json({ success: false });
        }

        const signature = signatureString.split(';')[1]?.split('=')[1];
        if(!signature) {
            console.log('Missing signature!');
            return res.status(400).json({ success: false });
        }

        const concatenated = JSON.stringify(req.body) + PAYU_MD5_KEY;

        const expectedSignature = md5(concatenated);

        if(expectedSignature !== signature) {
            console.log('Wrong signature!');
            return res.status(400).json({ success: false });
        }

        const bus = await Bus.findOneAndUpdate(
            { 'rents.payment.orderId': extOrderId },
            { $set: { 'rents.$.payment.paid': true } },
        );

        const rent = bus?.rents.find(x => x.payment.orderId === extOrderId);

        const days = countDays(rent!.startDate, rent!.endDate);


        if(!rent!.confirmationEmailSent) {
            console.log('Sending email...')
            sendEmail(rent!.customer.email, bus!.model, rent!.payment.totalAmount, bus!.pricePerDay * days)
            await Bus.findOneAndUpdate(
                { 'rents.payment.orderId': extOrderId },
                { $set: { 'rents.$.confirmationEmailSent': true } },
            );
        }

        console.log('Payment processed correctly!');
    }

    return res.status(200).json({ success: true });
})

const sendEmail = async (email: string, modelName: string, paidAdvance: number, totalAmountToPay: number) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'stranweb@gmail.com',
                pass: GMAIL_STP_PASSWORD,
            }
        });

    
        await transporter.sendMail({
            to: email,
            subject: 'Potwierdzenie rezerwacji w Budmax',
            html: `
                <h1>Dziękujemy za rezerwacje na stronie budmax-zwolen.pl!</h1><br>
                <p><b>Model:</b> ${modelName}</p>
                <p><b>Zapłacona zaliczka:</b> ${paidAdvance} PLN</p>
                <p><b>Całość do zapłaty:</b> ${totalAmountToPay} PLN</p><br>
                <h2>Pozdrawiamy!</h2>
            `
        });

    } catch(e) {
        console.log(e);
    }

}

export const PaymentRoutes: Router = router;
