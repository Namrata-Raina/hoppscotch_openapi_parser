# testing_bed

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration

## Conversion Schema

| *hoppscotch* | *openapi* |
| --- | --- | 
| collectionName | info.title | 
| description | info.description + info.contact | 
| request.path | paths.path | 
| request.name | operationItem(method).operationId | 
| request.method | path.method | 
| request.contentType | operationItem(method).requestBody | 
| request.url | (custom input for user) | 
| request.headers | parameter (`in = header`) | 
| request.params | parameter (`in = path` or `in = query`) | 
| request.bearerToken | components.securitySchemes.api_key | 
| request.openapi_summary | operationItem(method).summary | 

