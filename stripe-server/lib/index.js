"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
const dotenv_1 = require("dotenv");
process.env.NODE_ENV != 'production' ? dotenv_1.config() : null;
const stripe_1 = __importDefault(require("stripe"));
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET, {
    apiVersion: '2020-08-27'
});
const api_1 = require("./api");
const port = process.env.PORT || 5000;
api_1.app.listen(port, () => console.log(`Api available on ${port}`));
//# sourceMappingURL=index.js.map