"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRegularExpresion = void 0;
class CustomerRegularExpresion {
}
exports.CustomerRegularExpresion = CustomerRegularExpresion;
CustomerRegularExpresion.firstnameRegularExpresion = {
    regx: /[\w\s]{3,150}/g,
    errorMessage: "El parámetro no coincide con nuestros criterios minimamente 3 caracteres máximo 150"
};
CustomerRegularExpresion.lastNameRegularExpresion = {
    regx: /[\w\s]{3,150}/g,
    errorMessage: "El parámetro no coincide con nuestros criterios minimamente 3 caracteres máximo 150"
};
CustomerRegularExpresion.passwordRegularExpresion = {
    regx: /.{8,450}/g,
    errorMessage: "El password debe tener por lo menos 8 caracteres para ser aceptado"
};
CustomerRegularExpresion.phoneRegularExpresion = {
    regx: /^\d{3,3}\s\d{8,10}$/g,
    errorMessage: "Número de telefono debe ser escrito de la siguiente forma 591 7654321"
};
CustomerRegularExpresion.urlValidator = {
    regx: /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/g,
    errorMessage: "No es una URL válida no cumple con el estandar RFC 3987"
};
CustomerRegularExpresion.emailRegularExpresion = {
    regx: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/g,
    errorMessage: "No es un correo válido"
};
CustomerRegularExpresion.addressRegularExpresion = {
    regx: /[\w\-\.\/]{4, 250}/g,
    errorMessage: "No es una dirección válida"
};
CustomerRegularExpresion.nitRegularExpresion = {
    regx: /[\d]{10,14}/g,
    errorMessage: "No es una NIT válido"
};
