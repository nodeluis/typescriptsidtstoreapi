"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
mongoose_1.default.connect("mongodb+srv://luis:luis@cluster0.ubdpt.mongodb.net/test", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose_1.default.set('useNewUrlParser', true);
mongoose_1.default.set('useFindAndModify', false);
mongoose_1.default.set('useCreateIndex', true);
exports.default = mongoose_1.default;
