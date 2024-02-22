import Joi, { ObjectSchema } from "joi";
import { CoalType } from "./interfaces/coal.interface";

export const BUS_CREATION_SCHEMA = 'busCreationSchema';
export const COAL_CREATION_SCHEMA = 'coalCreationSchema';

const busCreation = Joi.object().keys({
  model: Joi.string().required(),
  engineCapacity: Joi.number().required(),
  pricePerDay: Joi.number().required(),
  power: Joi.number().required()
});

const coalCreation = Joi.object().keys({
  type: Joi.string().valid(...Object.values(CoalType)),
  mine: Joi.string(),
  calorificValue: Joi.number(),
  granulation: Joi.number(),
  price: Joi.number(),
})

export default {
    [BUS_CREATION_SCHEMA]: busCreation,
    [COAL_CREATION_SCHEMA]: coalCreation,
} as { [key: string]: ObjectSchema };
