"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructGallery = exports.Gallery = void 0;
class Gallery {
    constructor(data) {
        this.realpath = data.realpath;
        this.relativepath = data.relativepath;
        this.description = data.description;
        this.date = data.date;
    }
}
exports.Gallery = Gallery;
class StructGallery {
    constructor(structGallery) {
        this.direction = structGallery.direction;
        this.description = structGallery.description;
    }
}
exports.StructGallery = StructGallery;
exports.default = Gallery;
