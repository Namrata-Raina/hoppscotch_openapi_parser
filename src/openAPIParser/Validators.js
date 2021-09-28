export const isOperationType = (object) => {
    return !!object.responses;
};
export const isExampleObjectType = (object) => !!object.value;
export const isRequestBodyObjectType = (object) => !!object.content;
export const isReferenceObjectType = (object) => !!object.$ref;
export const isMediaTypeObject = (object) => object.example || object.examples || object.schema;
export function isComponentsType(str) {
    return ["schemas", "responses", "parameters", "examples", "requestBodies", "headers", "securitySchemes", "links", "callbacks"].includes(str);
}
export const isParamlocations = (str) => {
    return ["query", "path"].includes(str);
};
//# sourceMappingURL=Validators.js.map