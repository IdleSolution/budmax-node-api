import Joi, { ObjectSchema } from "joi";
import { CoalType, CoalTypePolish } from "./database/enums/coal.enum";

export const BUS_CREATION_SCHEMA = 'busCreationSchema';
export const BUS_UPDATE_SCHEMA = 'busUpdateSchema';
export const COAL_CREATION_SCHEMA = 'coalCreationSchema';
export const COAL_UPDATE_SCHEMA = 'coalUpdateSchema';
export const PELLET_CREATION_SCHEMA = 'pelletCreationSchema';
export const PELLET_UPDATE_SCHEMA = 'pelletUpdateSchema';
export const STONE_CREATION_SCHEMA = 'stoneCreationSchema';
export const STONE_UPDATE_SCHEMA = 'stoneUpdateSchema';

const busCreation = Joi.object().keys({
  model: Joi.string().required(),
  engineCapacity: Joi.number().required(),
  pricePerDay: Joi.number().required(),
  power: Joi.number().required(),
  image: Joi.any()
});

const busUpdate = Joi.object().keys({
  model: Joi.string().required().optional(),
  engineCapacity: Joi.number().required().optional(),
  pricePerDay: Joi.number().required().optional(),
  power: Joi.number().required().optional(),
  image: Joi.any()
});

const coalCreation = Joi.object().keys({
  name: Joi.string(),
  type: Joi.string().valid(...Object.values(CoalType)),
  mine: Joi.string(),
  calorificValue: Joi.string(),
  granulation: Joi.string(),
  price: Joi.string(),
  image: Joi.any()
});

const coalUpdate = Joi.object().keys({
  name: Joi.string(),
  type: Joi.string().valid(...Object.values(CoalTypePolish)).optional(),
  mine: Joi.string().optional(),
  calorificValue: Joi.string().optional(),
  granulation: Joi.string().optional(),
  price: Joi.string().optional(),
  image: Joi.any(),
});

const pelletCreation = Joi.object().keys({
  name: Joi.string(),
  certificates: Joi.string(),
  producent: Joi.string(),
  price: Joi.number(),
  image: Joi.any()
});

const pelletUpdate = Joi.object().keys({
  name: Joi.string(),
  certificates: Joi.string().optional(),
  producent: Joi.string().optional(),
  price: Joi.number().optional(),
  image: Joi.any()
});

const stoneCreation = Joi.object().keys({
  name: Joi.string(),
  price: Joi.number(),
  granulation: Joi.number(),
  deliveryForm: Joi.string(),
  image: Joi.any()
});

const stoneUpdate = Joi.object().keys({
  name: Joi.string().optional(),
  price: Joi.number().optional(),
  granulation: Joi.number().optional(),
  deliveryForm: Joi.string(),
  image: Joi.any(),
});

export default {
    [BUS_CREATION_SCHEMA]: busCreation,
    [COAL_CREATION_SCHEMA]: coalCreation,
    [PELLET_CREATION_SCHEMA]: pelletCreation,
    [PELLET_UPDATE_SCHEMA]: pelletUpdate,
    [STONE_CREATION_SCHEMA]: stoneCreation,
    [COAL_UPDATE_SCHEMA]: coalUpdate,
    [STONE_UPDATE_SCHEMA]: stoneUpdate,
    [BUS_UPDATE_SCHEMA]: busUpdate,
} as { [key: string]: ObjectSchema };
