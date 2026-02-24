// Generic error handler to normalize API error responses
// Should be registered after all routes.
const errorHandler = (err, req, res, next) => {
    // If a status has already been set, use it. Otherwise default to 500.
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    // Log server-side for debugging / monitoring (Vercel logs, etc.)
    // Avoid logging extremely large objects.
    // eslint-disable-next-line no-console
    console.error(err);

    res.status(statusCode).json({
        message: err.message || 'Server error',
    });
};

module.exports = {
    errorHandler,
};

