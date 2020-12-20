"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const RegularExpresionValidator_1 = require("../utils/RegularExpresionValidator");
class Store {
    constructor(data) {
        this.storename = data.storename;
        this.nit = data.nit;
        this.description = data.description;
    }
    checkName() {
        var msn = {
            status: false,
            typeError: "",
            value: this.storename
        };
        if (this.storename != null && this.storename.match(RegularExpresionValidator_1.CustomerRegularExpresion.firstnameRegularExpresion.regx) == null) {
            var msn = {
                status: true,
                typeError: RegularExpresionValidator_1.CustomerRegularExpresion.firstnameRegularExpresion.errorMessage,
                value: this.storename
            };
        }
        return msn;
    }
    checkNit() {
        var msn = {
            status: false,
            typeError: "",
            value: this.nit
        };
        if (this.nit != null && this.nit.match(RegularExpresionValidator_1.CustomerRegularExpresion.nitRegularExpresion.regx) == null) {
            var msn = {
                status: true,
                typeError: RegularExpresionValidator_1.CustomerRegularExpresion.nitRegularExpresion.errorMessage,
                value: this.nit
            };
        }
        return msn;
    }
    validate() {
        let errors = [];
        let erroName = this.checkName();
        let errorNit = this.checkNit();
        if (erroName.status) {
            errors.push(erroName);
        }
        if (errorNit.status) {
            errors.push(errorNit);
        }
        return errors;
    }
    getAllDataDistincToNull() {
        let auxiliardata = this;
        let keys = Object.keys(auxiliardata);
        let newMinimunCustomerObject = {};
        for (let i = 0; i < keys.length; i++) {
            if (auxiliardata[keys[i]] != null) {
                newMinimunCustomerObject[keys[i]] = auxiliardata[keys[i]];
            }
        }
        return newMinimunCustomerObject;
    }
}
exports.Store = Store;
exports.default = Store;
