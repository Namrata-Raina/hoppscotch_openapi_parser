import { JSONSchema4 } from "json-schema"

export type ParamLocations = "query" | "path"
export type ParamTypes = string | number | Object
export type ValidContentTypes = string // TODO: Define Content Types properly

export interface ParsedParameter {
    in: ParamLocations
    key: string
    value: any // Example value, if present. Defaults to "zero" value for type if absent
    type: string
    description?: string
}

export interface ParsedHeader {
    key: string
    value: any // Example value, if present. Defaults to "zero" value for type if absent
    description?: String
}

export interface BodyExample {
    contentType: ValidContentTypes
    summary: string
    value: string // Raw response body
}

export interface RequestBody {
    contentType: ValidContentTypes
    schema?: SchemaObject
    examples?: BodyExample[]
}

export interface ResponseDetails {
    contentType: ValidContentTypes
    schema?: SchemaObject
    examples?: BodyExample[]
}

export interface OpenAPIParsedRequest {
    name: string
    method: string
    path: string // endpoint = hosturl + path
    params: ParsedParameter[]
    headers: ParsedHeader[]
    auth: any // Details are available. Figuring out appropriate structure for representation

    body?: RequestBody
    summary: string
    responses?: BodyExample[] // examples if present
}

export interface OpenAPIParsedSpec {
    name: string
    version: string
    description?: string
    requests: OpenAPIParsedRequest[]
}

/*
    The OpenAPI Schemas follow the JSON Schema Definition [ https://datatracker.ietf.org/doc/html/draft-wright-json-schema-00 ] very closely and extends it
    As such, it is not being parsed into a different format, apart from resolving the references, keeping in mind the standardization. The Schema being used is given below:
*/
export interface SchemaObject extends JSONSchema4 {}
