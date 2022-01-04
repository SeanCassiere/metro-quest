export function normalizeJqueryFormValues(values: JQuery.NameValuePair[]) {
  let returnObject: { [name: string]: string } = {};

  for (let item of values) {
    returnObject[item.name] = item.value;
  }

  return returnObject;
}
