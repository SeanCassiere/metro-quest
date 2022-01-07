export function normalizeJqueryFormValues(values: JQuery.NameValuePair[]) {
  let returnObject: { [name: string]: string } = {};

  for (let item of values) {
    returnObject[item.name] = item.value;
  }

  return returnObject;
}

export interface SchemaType {
  [field: string]: {
    message: string;
    test: (value: any) => boolean;
  };
}

export interface ErrorType {
  property: string;
  message: string;
}

export function validateValues(object: { [key: string]: any }, schema: SchemaType) {
  const returnErrors: ErrorType[] = [];
  const validKeys: string[] = [];
  const errors = Object.keys(schema)
    .filter(function (key) {
      const result = !schema[key].test(object[key]);
      if (!result) {
        validKeys.push(key);
      }
      return result;
    })
    .map(function (key) {
      return { property: key, message: schema[key].message };
    });

  if (errors.length > 0) {
    errors.forEach(function (error) {
      returnErrors.push(error);
    });
    return { success: false, errors: returnErrors, values: object, validKeys };
  } else {
    return { success: true, errors: [], values: object, validKeys };
  }
}

export function showFormErrors(formNameSelector: string, errors: ErrorType[], validFields?: string[]) {
  errors.forEach((e) => {
    $(`form[name='${formNameSelector}'] input[name='${e.property}']`).removeClass("is-valid").addClass("is-invalid");
    $(`form[name='${formNameSelector}'] div[id='${e.property}Feedback']`).text(e.message);
  });

  if (validFields) {
    validFields.forEach((field) => {
      $(`form[name='${formNameSelector}'] input[name='${field}']`).removeClass("is-invalid").addClass("is-valid");
    });
  }
}

export function clearFormErrors(formNameSelector: string) {
  $(`form[name='${formNameSelector}'] input.is-invalid`).removeClass("is-invalid");
  $(`form[name='${formNameSelector}'] input.is-valid`).removeClass("is-valid");
}
