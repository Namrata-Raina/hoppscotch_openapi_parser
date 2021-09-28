import { Components } from "./Components";
import { Schema } from "./Schema";
import { isExampleObjectType, isReferenceObjectType, isOperationType, isRequestBodyObjectType, isParamlocations, isMediaTypeObject } from "./Validators";
export class OpenAPIParser {
    source;
    componentsHolder;
    schemaRef;
    constructor(contents) {
        this.source = contents;
        this.componentsHolder = new Components(this.source.components || {});
        this.schemaRef = new Schema(this.componentsHolder);
    }
    parsePathItem(path, pathItem) {
        const parsed = [];
        for (const [operationType, operation] of Object.entries(pathItem)) {
            if (!isOperationType(operation))
                continue;
            const temp = this.parseOperation(path, operationType, operation);
            parsed.push(temp);
        }
        return parsed;
    }
    parseOperation(path, operationType, operation) {
        const body = this.parseBody(operation.requestBody || undefined);
        const requestObject = {
            name: this.parseName(operation, path, operationType),
            method: this.parseMethod(operationType),
            path: this.parsePath(path),
            params: this.parseParams(operation.parameters),
            headers: this.parseHeaders(operation.parameters),
            auth: undefined,
            body: undefined,
            summary: this.parseSummary(operation.summary)
        };
        if (typeof (body) != "boolean")
            requestObject.body = body;
        return requestObject;
    }
    parseBody(requestBody) {
        if (requestBody === undefined)
            return false;
        if (isReferenceObjectType(requestBody)) {
            requestBody = this.componentsHolder.fetchComponent("requestBodies", requestBody.$ref?.split("/").pop() ?? "");
        }
        if (!isRequestBodyObjectType(requestBody))
            return false;
        let cType = "application/json";
        let def = requestBody.content["application/json"];
        if (!isMediaTypeObject(def)) {
            const meds = Object.entries(requestBody.content);
            if (meds.length === 0)
                return false;
            def = meds[0][1];
            cType = meds[0][0];
        }
        let schema = {};
        const examples = [];
        if (typeof (def.schema) !== 'undefined') {
            let tempSchema = {};
            if (isReferenceObjectType(def.schema)) {
                tempSchema = this.componentsHolder.fetchComponent("schemas", def.schema.$ref?.split("/").pop() ?? "");
            }
            else {
                tempSchema = this.componentsHolder.resolveNested(def.schema);
            }
            schema = this.schemaRef.getJSONSchema(tempSchema);
            const exampleObj = {
                contentType: cType,
                summary: "Generated",
                value: JSON.stringify(this.schemaRef.getJSONExample(schema))
            };
            examples.push(exampleObj);
        }
        if (typeof (def.example) !== "undefined") {
            let tempExample = {};
            if (isReferenceObjectType(def.example)) {
                tempExample = this.componentsHolder.fetchComponent("examples", def.example.$ref?.split("/").pop() ?? "");
            }
            else {
                tempExample = this.componentsHolder.resolveNested(def.example);
            }
            const exampleObj = {
                contentType: cType,
                summary: tempExample.summary || "Imported",
                value: JSON.stringify(tempExample.value || {})
            };
            examples.unshift(exampleObj);
        }
        else if (typeof (def.examples) !== "undefined") {
            Object.values(def.examples).forEach(example => {
                let tempExample = {};
                if (isReferenceObjectType(example)) {
                    tempExample = this.componentsHolder.fetchComponent("examples", example.$ref?.split("/").pop() ?? "");
                }
                else {
                    tempExample = this.componentsHolder.resolveNested(example);
                }
                const exampleObj = {
                    contentType: cType,
                    summary: tempExample.summary || "Imported",
                    value: JSON.stringify(tempExample.value || {})
                };
                examples.unshift(exampleObj);
            });
        }
        return {
            contentType: cType,
            schema,
            examples
        };
    }
    parsePath(path) {
        const pathValue = path.replace(/{([^}]+)}/g, "<<$1>>");
        return pathValue;
    }
    parseMethod(operationType) {
        return operationType.toUpperCase();
    }
    parseSummary(summary) {
        if (typeof summary !== "string")
            return "";
        return summary;
    }
    parseName(operation, path, operationType) {
        let namer = "";
        if (operation.operationId) {
            namer = operation.operationId;
        }
        else {
            namer = `${path} - ${operationType}`;
        }
        return namer;
    }
    parseParams(parameters) {
        if (typeof parameters === "undefined")
            return [];
        parameters = parameters.map((p) => {
            if (isReferenceObjectType(p)) {
                p = this.componentsHolder.fetchComponent("parameters", p.$ref?.split("/").pop() ?? "");
            }
            return p;
        });
        const result = parameters
            .filter((p) => true)
            .filter((p) => isParamlocations(p.in))
            .map((p) => {
            const temp = {
                key: p.name,
                in: isParamlocations(p.in) ? p.in : "query",
                value: "",
                type: "",
                description: p.description
            };
            if (p.in === "path") {
                temp.type = "path";
            }
            if (p.example) {
                temp.value = p.example;
            }
            if (p.examples) {
                const f = Object.values(p.examples);
                if (f.length) {
                    let temp1 = f[0];
                    if (isReferenceObjectType(temp1)) {
                        temp1 = this.componentsHolder.fetchComponent("examples", temp1.$ref?.split("/").pop() ?? "");
                    }
                    temp.value = isExampleObjectType(temp1) ? temp1.value : "";
                }
            }
            return temp;
        });
        return result;
    }
    parseHeaders(parameters) {
        if (typeof parameters === "undefined")
            return [];
        parameters = parameters.map((p) => {
            if (isReferenceObjectType(p)) {
                p = this.componentsHolder.fetchComponent("parameters", p.$ref?.split("/").pop() ?? "");
            }
            return p;
        });
        const result = parameters
            .filter((p) => true)
            .filter((p) => p.in === "header")
            .map((p) => {
            const temp = {
                key: p.name,
                value: "",
                description: p.description // TODO: Assign this properly
            };
            return temp;
        });
        return result;
    }
    parse() {
        const paths = this.source.paths;
        const requests = [];
        for (const [path, pathItem] of Object.entries(paths)) {
            const temp = this.parsePathItem(path, pathItem ?? {});
            requests.push(...temp);
        }
        console.log({ requests });
        return {
            name: this.source.info.title,
            requests,
            version: this.source.info.version,
        };
    }
}
//# sourceMappingURL=Parser.js.map