import { OpenAPIParser }  from "../src/openAPIParser/Parser"

import * as apiWithExamples from "./data/api-with-examples.json"
import * as callbackExample from "./data/callback-example.json"
import * as linkExample from "./data/link-example.json"
import * as petstore from "./data/petstore.json"
import * as petstoreExpanded from "./data/petstore-expanded.json"
import * as uspto from "./data/uspto.json"

function determiner(pp) {
    var parsedOb = new OpenAPIParser(pp).parse()
    parsedOb.requests = parsedOb.requests.map(r => ({
        ...r,
        body: r.body && {
            ...r.body,
            examples: undefined
        },
        responses: r.responses && r.responses.map(resp => undefined)
    }))
}

it("api-with-examples", () => {
    expect(determiner(apiWithExamples)).toMatchSnapshot()
});

it("callback-example", () => {
    expect(determiner(callbackExample)).toMatchSnapshot()
});

it("link-example", () => {
    expect(determiner(linkExample)).toMatchSnapshot()
});

it("petstore", () => {
    expect(determiner(petstore)).toMatchSnapshot()
});

it("petstore expanded", () => {
    const parsedPE = determiner(petstoreExpanded)
    expect(parsedPE).toMatchSnapshot()
});

it("upsto", () => {
    var usptoParsed = determiner(uspto)
    expect(usptoParsed).toMatchSnapshot()
});