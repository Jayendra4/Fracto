import type { loginFormConfig, signupFormConfig } from '@/config/form.config';
import type { RegisterOptions } from 'react-hook-form';

type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'mobile'
  | 'number'
  | 'date'
  | 'file'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'datepicker'
  | 'otp'
  | 'contact'
  | 'image'
  | 'video'
  | 'geo'
  | 'whyInvested'; // ✅ NEW
export interface IConditionalEnable {
  dependsOn: string;
  value: string;
}

interface IBaseField<T> {
  name: string;
  label: string;
  type: FieldType;

  placeholder?: string;
  defaultValue?: T;

  validation?: RegisterOptions;
  required?: boolean;

  disabledByDefault?: boolean;
  conditionalEnable?: IConditionalEnable;

  extraText?: string;
  fullWidth?: boolean;

  tooltip?: boolean;
  toolTipContent?: string;
  helpDesk?: boolean;
  conditionalRequired?: {
    dependsOn: string;
    value: any;
    message: string;
  };

  conditionalShow?: {
    dependsOn: string;
    value: any;
  };

  externalConditionalShow?: {
    key: string;
    value: any;
  };

  externalConditionalRequired?: {
    key: string;
    value: any;
    message: string;
  };
}

export interface IWhyInvestedItem {
  icon: string;
  title: string;
  description: string;
}

export interface IFormWhyInvestedConfig extends IBaseField<IWhyInvestedItem[]> {
  type: 'whyInvested';
}

export interface IFormInputConfig extends IBaseField<string | number | File> {
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'file'
    | 'contact'
    | 'image'
    | 'video'
    | 'mobile';
  showToggle?: boolean;
  isCurrency?: boolean;
  tooltip?: boolean;
  helpDesk?: boolean;
}

export interface IFormTextareaConfig extends IBaseField<string> {
  type: 'textarea';
  rows?: number;
}

export interface IFormSelectConfig extends IBaseField<string> {
  type: 'select';
  options: { label: string; value: string | number }[];
  multiple?: boolean;
  searchable?: boolean;
}

export interface IFormCheckboxConfig extends IBaseField<boolean> {
  type: 'checkbox';
}

export interface IFormRadioConfig extends IBaseField<string> {
  type: 'radio';
  options: { label: string; value: string }[];
}

export interface IFormDatepickerConfig extends IBaseField<string> {
  type: 'datepicker';
  minDate?: Date;
  maxDate?: Date;
}

export interface IFormOTPConfig extends IBaseField<string[]> {
  type: 'otp';
  length?: number;
  inputType?: string;
  autoFocus?: boolean;
}

export interface IFormMobileConfig extends IBaseField<{
  code: string;
  number: string;
}> {
  type: 'mobile';
  placeholder?: string;
}

export interface IFormImageConfig extends IBaseField<any[]> {
  type: 'image';
  maxFiles?: number;
}

export interface IFormVideoConfig extends IBaseField<any[]> {
  type: 'video';
  maxFiles?: number;
}

export interface IFormGeoConfig extends IBaseField<string> {
  type: 'geo';
}

export type IFieldConfig =
  | IFormInputConfig
  | IFormTextareaConfig
  | IFormSelectConfig
  | IFormCheckboxConfig
  | IFormRadioConfig
  | IFormDatepickerConfig
  | IFormMobileConfig
  | IFormOTPConfig
  | IFormImageConfig
  | IFormVideoConfig
  | IFormGeoConfig
  | IFormWhyInvestedConfig; // ✅ ADD THIS

type FormDataFromConfig<T extends { name: string; type: FieldType }[]> = {
  [K in T[number] as K['name']]: K['type'] extends 'mobile'
    ? { code: string; number: string }
    : K['type'] extends 'otp'
      ? string[]
      : K['type'] extends 'image'
        ? any[]
        : K['type'] extends 'video'
          ? any[]
          : K['type'] extends 'geo'
            ? string
            : K['type'] extends 'whyInvested' // ✅ ADD THIS
              ? IWhyInvestedItem[]
              : string;
};

export type ISignupFormSubmitData = FormDataFromConfig<typeof signupFormConfig>;
export type ILoginFormSubmitData = FormDataFromConfig<typeof loginFormConfig>;
