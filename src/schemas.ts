import Joi, { ObjectSchema } from "joi";
import { CoalType } from "./interfaces/coal.interface";

export const BUS_CREATION_SCHEMA = 'busCreationSchema';
export const COAL_CREATION_SCHEMA = 'coalCreationSchema';
export const PELLET_CREATION_SCHEMA = 'pelletCreationSchema';

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

const pelletCreation = Joi.object().keys({
  certificates: Joi.array().items(Joi.string()),
  producent: Joi.string(),
  price: Joi.number(),
})

export default {
    [BUS_CREATION_SCHEMA]: busCreation,
    [COAL_CREATION_SCHEMA]: coalCreation,
    [PELLET_CREATION_SCHEMA]: pelletCreation,
} as { [key: string]: ObjectSchema };
