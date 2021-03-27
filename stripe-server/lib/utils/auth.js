"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = exports.decodeJWT = void 0;
const firebaseApp_1 = require("firebaseApp");
async function decodeJWT(req, _, next) {
    var _a, _b;
    if ((_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodedToken = await firebaseApp_1.auth.verifyIdToken(idToken);
            req['currentUser'] = decodedToken;
        }
        catch (err) {
            console.log(err);
        }
    }
    next();
}
exports.decodeJWT = decodeJWT;
function validateUser(req) {
    const user = req['currentUser'];
    if (!user) {
        throw new Error('You must be logged in to make this request. i.e Authorization: Bearer <token>');
    }
    return user;
}
exports.validateUser = validateUser;
//# sourceMappingURL=auth.js.map