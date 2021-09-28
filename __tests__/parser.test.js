import { OpenAPIParser }  from "../src/openAPIParser/Parser"

import * as apiWithExamples from "./data/api-with-examples.json"
import * as callbackExample from "./data/callback-example.json"
import * as linkExample from "./data/link-example.json"
import * as petstore from "./data/petstore.json"
import * as petstoreExpanded from "./data/petstore-expanded.json"

it("api-with-examples", () => {
    expect(new OpenAPIParser(apiWithExamples).parse()).toMatchSnapshot();
});

it("callback-example", () => {
    expect(new OpenAPIParser(callbackExample).parse()).toMatchSnapshot();
});

it("link-example", () => {
    expect(new OpenAPIParser(linkExample).parse()).toMatchSnapshot();
});

it("petstore", () => {
    expect(new OpenAPIParser(petstore).parse()).toMatchSnapshot();
});
