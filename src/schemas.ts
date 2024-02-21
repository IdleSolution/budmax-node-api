import Joi, { ObjectSchema } from "joi";

export const BUS_CREATION_SCHEMA = 'busCreationSchema';

const busCreation = Joi.object().keys({
  model: Joi.string().required(),
  engineCapacity: Joi.number().required(),
  pricePerDay: Joi.number().required(),
  power: Joi.number().required()
});

export default {
    [BUS_CREATION_SCHEMA]: busCreation,
} as { [key: string]: ObjectSchema };
