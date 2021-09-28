import { isArray, isObject } from "lodash";
import { isComponentsType, isReferenceObjectType } from "./Validators";
export class Components {
    components;
    constructor(comp) {
        this.components = comp;
    }
    fetchComponent(child, name) {
        const temp = this.components[child];
        if (typeof temp === "undefined")
            return null;
        let component = temp[name];
        while (isReferenceObjectType(component)) {
            component = this.fetchComponent(child, component.$ref?.split("/").pop() ?? "");
        }
        return this.resolveNested(component);
    }
    resolveNested(data) {
        if (isArray(data)) {
            return data.map(data => this.resolveNested(data));
        }
        if (["string", "number", "bigint", "boolean", "undefined", "symbol", "null"].includes(typeof data)) {
            return data;
        }
        if (isReferenceObjectType(data)) {
            const parts = data["$ref"].split("/");
            if (parts[1] == "components" && isComponentsType(parts[2])) {
                const ret = this.resolveNested(this.fetchComponent(parts[2], parts.pop() ?? ""));
                return parts[2] == "examples" ? ret.value : ret;
            }
        }
        if (isObject(data)) {
            return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, this.resolveNested(value)]));
        }
        return data;
    }
}
//# sourceMappingURL=Components.js.map