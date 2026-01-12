import { IBaseModuleConfig } from "../BaseModule.js";

export interface ISiweRestrictionConfig {
  limitCount?: number;
  limitAmount?: number;
  duration: number;
  message?: string;
}

export interface ISiweConfig extends IBaseModuleConfig {
  domain: string;
  uri: string;
  nonceExpiration: number;
  sessionExpiration: number;
  required: boolean;
  rewardFactor: number;
  restrictions: ISiweRestrictionConfig[];
}

export const defaultConfig: ISiweConfig = {
  enabled: false,
  domain: "",
  uri: "",
  nonceExpiration: 300,
  sessionExpiration: 86400,
  required: false,
  rewardFactor: 1,
  restrictions: [],
};
