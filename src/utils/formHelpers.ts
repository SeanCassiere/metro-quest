export function normalizeJqueryFormValues(values: JQuery.NameValuePair[]) {
  let returnObject: { [name: string]: string } = {};

  for (let item of values) {
    returnObject[item.name] = item.value;
  }

  return returnObject;
}

type SchemaKeyAndValue = { [field: keyof SchemaType]: string };

export interface SchemaType {
  [field: string]: (value: any, inputObject: SchemaKeyAndValue) => { valid: boolean; message: string };
}

export interface ErrorType {
  property: string;
  message: string;
}

export function validateValues(object: { [key: string]: any }, schema: SchemaType) {
  const returnErrors: ErrorType[] = [];
  const validKeys: string[] = [];
  let messages: { [key: string]: string } = {};

  const errors = Array.from(Object.keys(schema)).filter((key) => {
    const result = schema[key](object[key], object);
    if (result.valid) {
      validKeys.push(key);
    }
    messages = { ...messages, [key]: result.message };
    return !result.valid;
  });

  const formatErrors = errors.map((key) => {
    return { property: key, message: messages[key] };
  });

  if (formatErrors.length > 0) {
    formatErrors.forEach((error) => {
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

export function showPasswordHandler(formNameSelector: string, showPasswordId: string) {
  $(`form[name='${formNameSelector}'] #${showPasswordId}`).on("click", () => {
    const dataParent = $(`form[name='${formNameSelector}'] #${showPasswordId}`).data("parent");
    const passwordInput = $(`form[name='${formNameSelector}'] input[name='${dataParent}']`);
    const passwordInputType = passwordInput.attr("type");
    passwordInput.attr("type", passwordInputType === "password" ? "text" : "password");

    const selectCurrentButton = $(`form[name='${formNameSelector}'] #${showPasswordId}[data-parent='${dataParent}']`);
    selectCurrentButton.html(
      passwordInputType === "password"
        ? "<i class='fa fa-eye' aria-hidden='true'>"
        : "<i class='fa fa-eye-slash' aria-hidden='true'>"
    );
  });
}

export const emailCredentialsSchema: SchemaType = {
  email: (value) => {
    if (value.length === 0) return { valid: false, message: "Email is required" };

    const isEmailValid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
    return { valid: isEmailValid, message: "Email is invalid" };
  },
};

export const baseCredentialsSchema: SchemaType = {
  ...emailCredentialsSchema,
  password: (value) => {
    if (value.length === 0) return { valid: false, message: "Password is required" };

    const isPasswordValid = /^.{3,}$/.test(value);
    return { valid: isPasswordValid, message: "Password must be at least 3 characters long" };
  },
};

export const baseUserInfoSchema: SchemaType = {
  firstName: (value) => {
    if (value.length === 0) return { valid: false, message: "First name is required" };

    const isFirstNameValid = /^.{1,}$/.test(value);
    return { valid: isFirstNameValid, message: "First name is not valid" };
  },
  lastName: (value) => {
    if (value.length === 0) return { valid: false, message: "Last name is required" };
    const isLastNameValid = /^.{1,}$/.test(value);
    return { valid: isLastNameValid, message: "Last name is not valid" };
  },
};
