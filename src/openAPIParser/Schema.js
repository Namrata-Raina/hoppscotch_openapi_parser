import toJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';
import jsf from 'json-schema-faker';
export class Schema {
    components;
    constructor(componentsRef) {
        this.components = componentsRef;
    }
    getJSONSchema(inputSchema) {
        const refParsed = this.components.resolveNested(inputSchema);
        const result = toJsonSchema(refParsed);
        return result;
    }
    getJSONExample(inputSchema) {
        const example = jsf.generate(inputSchema);
        return example;
    }
}
//# sourceMappingURL=Schema.js.map