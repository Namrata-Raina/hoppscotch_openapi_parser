import { OpenAPIV3 } from "openapi-types"
import { ParsedHeader, ParsedParameter, OpenAPIParsedRequest, OpenAPIParsedSpec, BodyExample, RequestBody, SchemaObject } from "./openAPIParser"
import { Components } from "./Components"
import { Schema } from "./Schema";
import {isExampleObjectType, isReferenceObjectType, isOperationType, isRequestBodyObjectType, isParamlocations, isMediaTypeObject} from "./Validators"

export class OpenAPIParser {
  source : OpenAPIV3.Document
  componentsHolder : Components
  schemaRef : Schema

  constructor(contents : OpenAPIV3.Document) {
    this.source = contents
    this.componentsHolder = new Components(this.source.components || {})
    this.schemaRef = new Schema(this.componentsHolder)
  }

  parsePathItem (
    path: string,
    pathItem: OpenAPIV3.PathItemObject
  ) : OpenAPIParsedRequest[] {
    const parsed: OpenAPIParsedRequest[] = []

    for (const [operationType, operation] of Object.entries(pathItem)) {
      if (!isOperationType(operation)) continue
      const temp = this.parseOperation(path, operationType, operation)
      parsed.push(temp)
    }

    return parsed
  }

  parseOperation (
    path: string,
    operationType: string,
    operation: OpenAPIV3.OperationObject
  ): OpenAPIParsedRequest {

    const body = this.parseBody(operation.requestBody || undefined)

    const requestObject: OpenAPIParsedRequest = {
      name: this.parseName(operation, path, operationType),
      method: this.parseMethod(operationType),
      path: this.parsePath(path),
      params: this.parseParams(operation.parameters),
      headers: this.parseHeaders(operation.parameters),
      auth: undefined,
      body: undefined,
      summary: this.parseSummary(operation.summary)
    }

    if (typeof(body) != "boolean")
      requestObject.body = body

    return requestObject
  }

  parseBody (
    requestBody:
      | OpenAPIV3.RequestBodyObject
      | OpenAPIV3.ReferenceObject
      | undefined
  ) : RequestBody | boolean {
    if (requestBody === undefined) return false
    if (isReferenceObjectType(requestBody)) {
      requestBody = this.componentsHolder.fetchComponent(
        "requestBodies",
        requestBody.$ref?.split("/").pop() ?? ""
      )
    }
    if (!isRequestBodyObjectType(requestBody))
      return false

    let cType = "application/json"
    let def = requestBody.content["application/json"]
    if(!isMediaTypeObject(def)) {
      const meds = Object.entries(requestBody.content)
      if (meds.length === 0)
        return false
      def = meds[0][1]
      cType = meds[0][0]
    }

    let schema : SchemaObject = {}
    const examples : BodyExample[] = []

    if (typeof(def.schema) !== 'undefined') {
      let tempSchema : OpenAPIV3.SchemaObject = {}
      if (isReferenceObjectType(def.schema)) {
        tempSchema = this.componentsHolder.fetchComponent("schemas", def.schema.$ref?.split("/").pop() ?? "")
      } else {
        tempSchema = this.componentsHolder.resolveNested(def.schema)
      }
      schema = this.schemaRef.getJSONSchema(tempSchema)
      const exampleObj : BodyExample = {
        contentType: cType,
        summary: "Generated",
        value: JSON.stringify(this.schemaRef.getJSONExample(schema))
      }
      examples.push(exampleObj)
    }

    if (typeof(def.example) !== "undefined") {
      let tempExample : OpenAPIV3.ExampleObject = {}
      if (isReferenceObjectType(def.example)) {
        tempExample = this.componentsHolder.fetchComponent("examples", def.example.$ref?.split("/").pop() ?? "")
      } else {
        tempExample = this.componentsHolder.resolveNested(def.example)
      }
      const exampleObj : BodyExample = {
        contentType: cType,
        summary: tempExample.summary || "Imported",
        value: JSON.stringify(tempExample.value || {})
      }
      examples.unshift(exampleObj)
    } else if (typeof(def.examples) !== "undefined") {
      Object.values(def.examples).forEach( example => {
        let tempExample : OpenAPIV3.ExampleObject = {}
        if (isReferenceObjectType(example)) {
          tempExample = this.componentsHolder.fetchComponent("examples", example.$ref?.split("/").pop() ?? "")
        } else {
          tempExample = this.componentsHolder.resolveNested(example)
        }
        const exampleObj : BodyExample = {
          contentType: cType,
          summary: tempExample.summary || "Imported",
          value: JSON.stringify(tempExample.value || {})
        }
        examples.unshift(exampleObj)
      })
    }
    
    return {
      contentType: cType,
      schema,
      examples
    }
  }

  parsePath (path: string) : string {
    const pathValue = path.replace(/{([^}]+)}/g, "<<$1>>")
    return pathValue
  }

  parseMethod (operationType: string) : string {
    return operationType.toUpperCase()
  }

  parseSummary (summary: String | undefined) : string {
    if (typeof summary !== "string") return ""
    return summary
  }

  parseName (
    operation: OpenAPIV3.OperationObject,
    path: String,
    operationType: String
  ) : string {
    let namer = ""
    if (operation.operationId) {
      namer = operation.operationId
    } else {
      namer = `${path} - ${operationType}`
    }
    return namer
  }

  parseParams (
    parameters:
      | (OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject)[]
      | undefined
  ) : ParsedParameter[] {
    if (typeof parameters === "undefined") return []
    parameters = parameters.map((p) => {
      if (isReferenceObjectType(p)) {
        p = this.componentsHolder.fetchComponent("parameters", p.$ref?.split("/").pop() ?? "")
      }
      return p
    })

    const result = parameters
      .filter((p): p is OpenAPIV3.ParameterObject => true)
      .filter((p) => isParamlocations(p.in))
      .map((p) => {
        const temp: ParsedParameter = {
          key: p.name,
          in: isParamlocations(p.in) ? p.in : "query",
          value: "",
          type: "", // TODO: Assign this properly
          description: p.description
        }

        if (p.in === "path") {
          temp.type = "path"
        }

        if (p.example) {
          temp.value = p.example
        }

        if (p.examples) {
          const f = Object.values(p.examples)
          if (f.length) {
            let temp1 = f[0]
            if (isReferenceObjectType(temp1)) {
              temp1 = this.componentsHolder.fetchComponent(
                "examples",
                temp1.$ref?.split("/").pop() ?? ""
              )
            }
            temp.value = isExampleObjectType(temp1) ? temp1.value : ""
          }
        }
        return temp
      })
    return result
  }

  parseHeaders (
    parameters:
      | (OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject)[]
      | undefined
  ) : ParsedHeader[] {
    if (typeof parameters === "undefined") return []
    parameters = parameters.map((p) => {
      if (isReferenceObjectType(p)) {
        p = this.componentsHolder.fetchComponent("parameters", p.$ref?.split("/").pop() ?? "")
      }
      return p
    })

    const result = parameters
      .filter((p): p is OpenAPIV3.ParameterObject => true)
      .filter((p) => p.in === "header")
      .map((p) => {
        const temp: ParsedHeader = {
          key: p.name,
          value: "",
          description: p.description // TODO: Assign this properly
        }
        return temp
      })
    return result
  }

  parse () : OpenAPIParsedSpec {
    const paths = this.source.paths
    const requests = []
    for (const [path, pathItem] of Object.entries(paths)) {
      const temp = this.parsePathItem(path, pathItem ?? {})
      requests.push(...temp)
    }
    console.log({ requests })
    return {
      name: this.source.info.title,
      requests,
      version: this.source.info.version,
    }
  }
}