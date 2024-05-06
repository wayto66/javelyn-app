import {
  FieldValues,
  UseFormGetValues,
  UseFormRegister,
  UseFormReset,
  UseFormResetField,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

export type UseForm<T extends FieldValues> = {
  watch: UseFormWatch<T>;
  getValues: UseFormGetValues<T>;
  setValue: UseFormSetValue<T>;
  register: UseFormRegister<T>;
  reset: UseFormReset<T>;
  resetField: UseFormResetField<T>;
};
