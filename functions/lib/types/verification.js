"use strict";
// Backend Verification System Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewError = exports.SubmissionError = exports.XAccountError = exports.VerificationError = void 0;
// Error Types
class VerificationError extends Error {
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'VerificationError';
    }
}
exports.VerificationError = VerificationError;
class XAccountError extends VerificationError {
    constructor(message, statusCode = 400) {
        super(message, 'X_ACCOUNT_ERROR', statusCode);
    }
}
exports.XAccountError = XAccountError;
class SubmissionError extends VerificationError {
    constructor(message, statusCode = 400) {
        super(message, 'SUBMISSION_ERROR', statusCode);
    }
}
exports.SubmissionError = SubmissionError;
class ReviewError extends VerificationError {
    constructor(message, statusCode = 400) {
        super(message, 'REVIEW_ERROR', statusCode);
    }
}
exports.ReviewError = ReviewError;
//# sourceMappingURL=verification.js.map