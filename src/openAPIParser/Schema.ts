import toJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema'
import jsf from 'json-schema-faker';
import { OpenAPIV3 } from "openapi-types"
import { JSONSchema4 } from "json-schema"
import { Components } from './Components';

export class Schema {
    components : Components

    constructor(componentsRef : Components) {
        this.components = componentsRef
    }

    getJSONSchema(inputSchema : OpenAPIV3.SchemaObject) : JSONSchema4 {
        const refParsed = this.components.resolveNested(inputSchema)
        const result = toJsonSchema(refParsed)
        return result
    }

    getJSONExample(inputSchema : JSONSchema4) : any {
        const example = jsf.generate(inputSchema)
        return example
    }
}