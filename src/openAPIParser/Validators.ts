import { OpenAPIV3 } from "openapi-types"
import { ParamLocations } from "./openAPIParser"


export const isOperationType = (object: any): object is OpenAPIV3.OperationObject => {
  return !!object.responses
}

export const isExampleObjectType = (object: any): object is OpenAPIV3.ExampleObject =>
  !!object.value

export const isRequestBodyObjectType = (
  object: any
): object is OpenAPIV3.RequestBodyObject => !!object.content

export const isReferenceObjectType = (
  object: any
): object is OpenAPIV3.ReferenceObject => !!object.$ref

export const isMediaTypeObject = (
  object: any
): object is OpenAPIV3.MediaTypeObject => object.example || object.examples || object.schema

export type ComponentTypes = "schemas"
| "responses"
| "parameters"
| "examples"
| "requestBodies"
| "headers"
| "securitySchemes"
| "links"
| "callbacks"

export function isComponentsType(str: string) : str is ComponentTypes {
    return ["schemas", "responses", "parameters", "examples", "requestBodies", "headers", "securitySchemes", "links", "callbacks"].includes(str)
}

export const isParamlocations = (str : string) : str is ParamLocations => {
  return ["query", "path"].includes(str)
}