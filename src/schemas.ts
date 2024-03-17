import Joi, { ObjectSchema } from "joi";
import { CoalType } from "./database/enums/coal.enum";
import { StoneDeliveryFormEnum } from "./database/enums/stone.enum";

export const BUS_CREATION_SCHEMA = 'busCreationSchema';
export const COAL_CREATION_SCHEMA = 'coalCreationSchema';
export const COAL_UPDATE_SCHEMA = 'coalUpdateSchema';
export const PELLET_CREATION_SCHEMA = 'pelletCreationSchema';
export const STONE_CREATION_SCHEMA = 'stoneCreationSchema';

const busCreation = Joi.object().keys({
  model: Joi.string().required(),
  engineCapacity: Joi.number().required(),
  pricePerDay: Joi.number().required(),
  power: Joi.number().required()
});

const coalCreation = Joi.object().keys({
  type: Joi.string().valid(...Object.values(CoalType)),
  mine: Joi.string(),
  calorificValue: Joi.string(),
  granulation: Joi.string(),
  price: Joi.string(),
  image: Joi.any()
});

const coalUpdate = Joi.object().keys({
  type: Joi.string().valid(...Object.values(CoalType)).optional(),
  mine: Joi.string().optional(),
  calorificValue: Joi.string().optional(),
  granulation: Joi.string().optional(),
  price: Joi.string().optional(),
  image: Joi.any(),
});

const pelletCreation = Joi.object().keys({
  certificates: Joi.array().items(Joi.string()),
  producent: Joi.string(),
  price: Joi.number(),
});

const stoneCreation = Joi.object().keys({
  name: Joi.string(),
  price: Joi.number(),
  granulation: Joi.number(),
  deliveryForm: Joi.string().valid(...Object.values(StoneDeliveryFormEnum)),

});

export default {
    [BUS_CREATION_SCHEMA]: busCreation,
    [COAL_CREATION_SCHEMA]: coalCreation,
    [PELLET_CREATION_SCHEMA]: pelletCreation,
    [STONE_CREATION_SCHEMA]: stoneCreation,
    [COAL_UPDATE_SCHEMA]: coalUpdate,
} as { [key: string]: ObjectSchema };
