import t from "typy";

export function isBoolean(v: any): v is boolean {
    return t(v).isBoolean;
}