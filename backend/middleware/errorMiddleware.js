const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    // eslint-disable-next-line no-console
    console.error(err);

    res.status(statusCode).json({
        message: err.message || 'Server error',
    });
};

module.exports = {
    errorHandler,
};

