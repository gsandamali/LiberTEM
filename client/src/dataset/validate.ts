import Ajv, { ErrorObject } from 'ajv';
import { FormikErrors, FormikValues } from 'formik';
import { JsonSchema } from '../messages';

export const convertErrors = (errors: ErrorObject[]): FormikErrors<FormikValues> => {
    const res: FormikErrors<FormikValues> = {};
    errors.forEach(err => {
        // flatten field names, convert from array to object
        // FIXME: doesn't support multiple errors per field yet (formik limitation?)
        const expr = /^\.([^[]+)(\[[^]+\])?$/
        const fieldName = err.instancePath.replace(expr, (match, plainName) => plainName as string);
        res[fieldName] = err.message;
    });
    return res;
}

export const throwErrors = (validateErrors : ErrorObject[] | null = [], customValidateErrors: FormikErrors<FormikValues> = {}): never => {
    if (validateErrors || customValidateErrors) {
        const converted = validateErrors ? { ...convertErrors(validateErrors), customValidateErrors } : customValidateErrors;
        throw converted;
    } else {
        throw new Error("unspecified error while validating fields");
    }
}

export const validateOpen = <T>(schema: JsonSchema, data: T, customValidateErrors?: FormikErrors<FormikValues>): void => {
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid || customValidateErrors) {
        throwErrors(validate.errors, customValidateErrors);
    }
}
