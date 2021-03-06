import { OpenAPIV3 } from "openapi-types"

let components : OpenAPIV3.ComponentsObject = {}

function isOperationType(object: any): object is OpenAPIV3.OperationObject {
  return object["responses"] ? true : false
}

function isRequestBodyType(object: any): object is OpenAPIV3.RequestBodyObject {
  return true
}

function isParameterType(object: any): object is OpenAPIV3.ParameterObject {
  return true
}

const isSchemaObjectType = (object: any) : object is OpenAPIV3.SchemaObject => true
const isResponseObjectType = (object: any) : object is OpenAPIV3.ResponseObject => true
const isExampleObjectType = (object: any) : object is OpenAPIV3.ExampleObject => object['value'] ? true : false
const isParameterObjectType = (object: any) : object is OpenAPIV3.ParameterObject => true
const isRequestBodyObjectType = (object: any) : object is OpenAPIV3.RequestBodyObject => object["content"] ? true : false
const isHeaderObjectType = (object: any) : object is OpenAPIV3.HeaderObject => true
const isSecuritySchemeObjectType = (object: any) : object is OpenAPIV3.SecuritySchemeObject => true
const isLinkObjectType = (object: any) : object is OpenAPIV3.LinkObject => true
const isCallbackObjectType = (object: any) : object is OpenAPIV3.CallbackObject => true


const isReferenceObjectType = (object: any) : object is OpenAPIV3.ReferenceObject => object["$ref"] ? true : false

function fetchComponent(
  child : "schemas" | "responses" | "parameters" | "examples" | "requestBodies" | "headers" | "securitySchemes" | "links" | "callbacks",
  name : string
) {
  const temp: {[key: string] : any} | undefined = components[child];

  if (typeof temp === "undefined") return null;

  let component : any = temp[name];

  if(isReferenceObjectType(component)) {
    component = fetchComponent(child, component["$ref"]?.split('/').pop() ?? "")
  }

  return component;
}

// fetchComponent("securitySchemes", "petstore_auth");

const parsePathItem = function (
  path: String,
  pathItem: OpenAPIV3.PathItemObject
) {
  const parsed: Array<any> = []

  for (const [operationType, operation] of Object.entries(pathItem)) { // for ( const value in Object.values(pathItem) )
    // "/allUsers": { get: {} }
    if (!isOperationType(operation)) continue
    const temp = parseOperation(path, operationType, operation)
    parsed.push(temp)
  }

  return parsed
}

const parseOperation = function (
  path: String,
  operationType: String,
  operation: OpenAPIV3.OperationObject
) : any {
  let requestObject : any = {};
  const values : Array<Object> = [
    parsePath(path),
    parseContentType(operation.requestBody),
    parseMethod(operationType),
    parseSummary(operation.summary),
    parseParams(operation.parameters),
    parseHeaders(operation.parameters)
  ];

  let delta : Object = {}
  for( delta of values )
  requestObject = { ...requestObject, ...delta }
	return requestObject;
} 

const parseContentType = function (
  requestBody : OpenAPIV3.RequestBodyObject | OpenAPIV3.ReferenceObject | undefined
) {
  if (typeof requestBody === "undefined") return { "contentType" : "" };
  if (isReferenceObjectType(requestBody)) {
    requestBody = fetchComponent("requestBodies" , requestBody["$ref"]?.split('/').pop() ?? "")
  }
  if (isRequestBodyObjectType(requestBody))
    return { "contentType" : Object.keys(requestBody.content)[0] };

  return { "contentType" : "" };
}

const parsePath = function (
  path: String
) {
  return { "path" : path }
}

const parseMethod = function (
  operationType: String
) {
  const pathValue = operationType.replaceAll(/{([^}]+)}/g, '<<$1>>');
  return { "method" : pathValue.toUpperCase() }
}

const parseSummary = function (
  summary: String | undefined
) {
  if(typeof summary !== 'string') return {}
  return { "openapi_summary" : summary }
}

const parseParams = function (
  parameters: (OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject)[] | undefined
) {
  if (typeof parameters === 'undefined') return {}
  parameters = parameters.map((p) => {
    if(isReferenceObjectType(p)){
      p = fetchComponent("parameters" , p["$ref"]?.split('/').pop() ?? "")
    }
    return p
  })

  const result = parameters
    .filter((p) : p is OpenAPIV3.ParameterObject => true)
    .filter(p => ( p.in === 'query' || p.in === 'path'))
    .map(p => {
      const temp : any = {
        key : p.name,
        active : true,
        value: ""
      }

      if (p.in === 'path') {
        temp.type = 'path'
      }
      
      if (p.example) {
        temp.value = p.example
      }
      
      if (p.examples) {
        const f = Object.values(p.examples)
        if (f.length) {
          let temp1 = f[0];
          if(isReferenceObjectType(temp1)){
            temp1 = fetchComponent("examples", temp1["$ref"]?.split('/').pop() ?? "")
          }
          temp.value = isExampleObjectType(temp1) ? temp1.value : ""
        }
      }
      return temp
    });
  return { params : result }
}

const parseHeaders = function (
  parameters: (OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject)[] | undefined
) {
  if (typeof parameters === 'undefined') return {}
  parameters = parameters.map((p) => {
    if(isReferenceObjectType(p)){
      p = fetchComponent("parameters" , p["$ref"]?.split('/').pop() ?? "")
    }
    return p
  })

  const result = parameters
    .filter((p) : p is OpenAPIV3.ParameterObject => true)
    .filter(p => p.in === 'header')
    .map(p => {
      const temp : any = {
        key : p.name,
        active : true,
        value: ""
      }

      if (p.example) {
        temp.value = p.example
      }
      
      if (p.examples) {
        const f = Object.values(p.examples)
        if (f.length) {
          let temp1 = f[0];
          if(isReferenceObjectType(temp1)){
            temp1 = fetchComponent("examples", temp1["$ref"]?.split('/').pop() ?? "")
          }
          temp.value = isExampleObjectType(temp1) ? temp1.value : ""
        }
      }
      return temp
    });
  return { headers : result }
}




// [ {/* Reference  Object */}, {/* Example  Object */}]

// parameterObject.examples = {
//  [key: string] : ExampleObject | ReferenceObject
//}

// f(x) =  x > 10    : x - 10
//         otherwise : x

// g(x) = x * 2

// g(f(10))  = 20
// g(f(-10)) = -20



// let obj : Array<any> = [
//   1,
//   2,
//   3,
//   11
// ]

// obj = obj.map(
//   (p) => {

//     if( p > 10 )
//     {
//       return p - 10;
//     }

//     return p;

//   }
// );

// obj = obj.map( 
//   function (val) {
//     if (val <= 10)
//     return "Too small";

//     return "a" + val;
//   }
// )
// => [ "Too small", "Too small", "Too small", "a11" ]



/*
**
    {
      securitySchemes: {
        "blabla" : {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        },
        "nonblabla": {
          "type": "http",
          "scheme": "oauth",
          ""
        }
      }
    }
    {
      security: [
        {
          "blabla": [],
        },
        {
          "nonblabla" : ["blablablablabla"]
        }
      ]
    }
**
*/


/*
** const res = { name : "Namrata" }
** res.name == 'Namrata'
*/

export default function (filecontent: OpenAPIV3.Document) {
  const paths = filecontent.paths
  components = filecontent.components ?? {}
  const requests = []
  for (const [path, pathItem] of Object.entries(paths)) {    
    const temp = parsePathItem(path, pathItem ?? {})
    requests.push(...temp)
    // temp = [1, 2, 3]
    // request.push(1, 2, 3) <---> request.push([ 1, 2, 3 ])
  }
  console.log({ requests })
  return requests
}

// let k = {
//     a: {},
//     b: "two"
// }

// Object.keys(k) => ["a", "b"]
// Object.values(k) => [{}, "two"]
// Object.entries(k) => [["a", "one"], ["b", "two"]]

// [
//   {
//     "folders": [
//       {
//         "requests": [],
//         "name": null,
//         "folders": []
//       }
//     ],
//     "name": "My Collection",
//     "requests": [
//       {
//         "url": "https://mail.google.com",
//         "path": "/getAllUsers",
//         "method": "POST",
//         "auth": "None",
//         "httpUser": "",
//         "httpPassword": "",
//         "passwordFieldType": "password",
//         "bearerToken": "required",
//         "bearerRequired": true,
//         "headers": [],
//         "params": [
//           {
//             "key": "user",
//             "value": "",
//             "active": true
//           },
//           {
//             "key": "user",
//             "value": "",
//             "type": "path",
//             "active": true
//           }
//         ],
//         "bodyParams": [
//           {
//             "active": true,
//             "key": "person",
//             "value": ""
//           },
//           {
//             "key": "",
//             "value": "",
//             "active": true
//           }
//         ],
//         "rawParams": "{\n  \"person\": \"\"\n}",
//         "rawInput": false,
//         "contentType": "application/x-www-form-urlencoded",
//         "requestType": "curl",
//         "preRequestScript": "// pw.env.set('variable', 'value');",
//         "testScript": "// pw.expect('variable').toBe('value');",
//         "name": "blah blah"
//       }
//     ]
//   }
// ]



// [
//   {
//     "path":"/pets",
//     "contentType":"",
//     "method":"GET",
//     "params":
//     [
//       {
//         "key":"tags",
//         "active":true,
//         "value":""
//       },
//       {
//         "key":"limit",
//         "active":true,
//         "value":""
//       }
//     ]
//   },
//   {
//     "path":"/pets",
//     "contentType":"application/json",
//     "method":"POST"
//   },
//   {
//     "path":"/pets/{id}",
//     "contentType":"",
//     "method":"GET",
//     "params":[]
//   },
//   {
//     "path":"/pets/{id}",
//     "contentType":"",
//     "method":"DELETE",
//     "params":[]
//   }
// ]