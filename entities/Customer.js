"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendAddress = exports.Customer = void 0;
const RegularExpresionValidator_1 = require("../utils/RegularExpresionValidator");
class Customer {
    constructor(information) {
        this.firstname = information.firstname;
        this.lastname = information.lastname;
        this.password = information.password;
        this.email = information.email;
        this.phone = information.phone;
        this.country = information.country;
        this.state = information.state;
        this.profilePhoto = information.profilePhoto;
        this.realpathPhoto = information.realpathPhoto;
        this.date = information.date;
        this.points = information.points;
        this.seller = information.seller;
        this.roles = information.roles;
        this.forgot_account = information.forgot_account;
        this.sessionConnections = information.sessionConnections;
    }
    checkfirstName() {
        var msn = {
            status: false,
            typeError: "",
            value: this.firstname
        };
        if (this.firstname != null) {
            var regularexpresion = RegularExpresionValidator_1.CustomerRegularExpresion.firstnameRegularExpresion.regx;
            var check = this.firstname.match(regularexpresion);
            if (check == null) {
                msn.status = true;
                msn.typeError = RegularExpresionValidator_1.CustomerRegularExpresion.firstnameRegularExpresion.errorMessage;
                return msn;
            }
        }
        return msn;
    }
    checkLastname() {
        var msn = {
            status: false,
            typeError: "",
            value: this.lastname
        };
        if (this.lastname != null) {
            if (this.lastname.match(RegularExpresionValidator_1.CustomerRegularExpresion.lastNameRegularExpresion.regx) == null) {
                msn.status = true;
                msn.typeError = RegularExpresionValidator_1.CustomerRegularExpresion.lastNameRegularExpresion.errorMessage;
                return msn;
            }
        }
        return msn;
    }
    checkPassword() {
        var msn = {
            status: false,
            typeError: "",
            value: this.password
        };
        if (this.password != null) {
            if (this.password.match(RegularExpresionValidator_1.CustomerRegularExpresion.passwordRegularExpresion.regx) == null) {
                msn.status = true;
                msn.typeError = RegularExpresionValidator_1.CustomerRegularExpresion.passwordRegularExpresion.errorMessage;
                return msn;
            }
        }
        return msn;
    }
    checkPhone() {
        var msn = {
            status: false,
            typeError: "",
            value: this.password
        };
        if (this.phone != null) {
            if (this.phone.match(RegularExpresionValidator_1.CustomerRegularExpresion.phoneRegularExpresion.regx) == null) {
                msn.status = true;
                msn.typeError = RegularExpresionValidator_1.CustomerRegularExpresion.phoneRegularExpresion.errorMessage;
                return msn;
            }
        }
        return msn;
    }
    checkProfile() {
        var msn = {
            status: false,
            typeError: "",
            value: this.profilePhoto
        };
        if (this.profilePhoto != null) {
            if (this.profilePhoto.match(RegularExpresionValidator_1.CustomerRegularExpresion.urlValidator.regx) == null) {
                msn.status = true;
                msn.typeError = RegularExpresionValidator_1.CustomerRegularExpresion.urlValidator.errorMessage;
                return msn;
            }
        }
        return msn;
    }
    checkEmail() {
        var msn = {
            status: false,
            typeError: "",
            value: this.profilePhoto
        };
        if (this.email != null) {
            if (this.email.match(RegularExpresionValidator_1.CustomerRegularExpresion.emailRegularExpresion.regx) == null) {
                msn.status = true;
                msn.typeError = RegularExpresionValidator_1.CustomerRegularExpresion.emailRegularExpresion.errorMessage;
                return msn;
            }
        }
        return msn;
    }
    validate() {
        let errors = [];
        let evalFirstname = this.checkfirstName();
        let evalSecondname = this.checkLastname();
        let evalPassword = this.checkPassword();
        let evalPhone = this.checkPhone();
        let evalProfile = this.checkProfile();
        let evalEmail = this.checkEmail();
        if (evalFirstname.status) {
            errors.push(evalFirstname);
        }
        if (evalSecondname.status) {
            errors.push(evalSecondname);
        }
        if (evalPassword.status) {
            errors.push(evalPassword);
        }
        if (evalPhone.status) {
            errors.push(evalPhone);
        }
        if (evalProfile.status) {
            errors.push(evalProfile);
        }
        if (evalEmail.status) {
            errors.push(evalEmail);
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
exports.Customer = Customer;
class SendAddress {
    constructor(data) {
        this.lat = data.lat;
        this.lng = data.lng;
        this.addressname = data.addressname;
        this.type = data.type;
        this.numberphone = data.numberphone;
        this.piso = data.piso;
        this.default = data.default;
    }
    checkLat() {
        var msn = {
            status: false,
            typeError: "",
            value: this.lat.toString()
        };
        if (this.lat == NaN) {
            var msn = {
                status: true,
                typeError: "No es un número, tipo de error variable NAN",
                value: this.lat.toString()
            };
        }
        return msn;
    }
    checkLng() {
        var msn = {
            status: false,
            typeError: "",
            value: this.lat.toString()
        };
        if (this.lng == NaN) {
            var msn = {
                status: true,
                typeError: "No es un número, tipo de error variable NAN",
                value: this.lng.toString()
            };
        }
        return msn;
    }
    checkAddressName() {
        var msn = {
            status: false,
            typeError: "",
            value: this.addressname
        };
        if (this.addressname.match(RegularExpresionValidator_1.CustomerRegularExpresion.addressRegularExpresion.regx) != null) {
            var msn = {
                status: true,
                typeError: RegularExpresionValidator_1.CustomerRegularExpresion.addressRegularExpresion.errorMessage,
                value: this.addressname
            };
        }
        return msn;
    }
    checkPhoneNumber() {
        var msn = {
            status: false,
            typeError: "",
            value: this.numberphone
        };
        if (this.numberphone.match(RegularExpresionValidator_1.CustomerRegularExpresion.phoneRegularExpresion.regx) != null) {
            var msn = {
                status: true,
                typeError: RegularExpresionValidator_1.CustomerRegularExpresion.phoneRegularExpresion.errorMessage,
                value: this.addressname
            };
        }
        return msn;
    }
    validate() {
        let errors = [];
        let evalLat = this.checkLat();
        let evalLng = this.checkLng();
        let evalAddressName = this.checkAddressName();
        let evalPhoneNumber = this.checkPhoneNumber();
        if (evalLat.status) {
            errors.push(evalLat);
        }
        if (evalLng.status) {
            errors.push(evalLng);
        }
        if (evalAddressName.status) {
            errors.push(evalAddressName);
        }
        if (evalPhoneNumber.status) {
            errors.push(evalPhoneNumber);
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
exports.SendAddress = SendAddress;
