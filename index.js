const some = require('lodash.some');
const isArray = require('lodash.isarray');
const isObject = require('lodash.isobject');

module.exports = function(options = {}) {
    const middleware = function expressTrailingSlashMiddleware(req, res, next) {
        const method = req.method.toLowerCase();

        // Skip when the req method is neither a GET nor a HEAD
        if (!['get', 'head'].includes(method)) {
            next();
            return;
        }

        // Skip paths
        const skipPathList = isObject(options) && options.skip;
        if (skipPathList && isArray(skipPathList)) {
            const matchFound = some(skipPathList, (item) => {
                const { path, rule } = item;

                switch (rule) {
                    case 'includes': {
                        if (req.path.includes(path))
                            return true;
                        break;
                    }

                    case 'startsWith': {
                        if (req.path.startsWith(path))
                            return true;
                        break;
                    }

                    case 'exact':
                    default: {
                        if (req.path === path)
                            return true;
                        break;
                    }
                }

                return false;
            });

            if (matchFound) {
                next();
                return;
            }
        }

        if (req.path.split('/').pop().includes('.')) {
            // Path has an extension. Do not add slash.
            next();
            return;
        }

        if (req.path.length > 1 && req.path.substr(-1) !== '/') {
            const query = req.url.slice(req.path.length);
            res.redirect(301, `${req.path}/${query}`);
            return;
        }

        next();
    };

    return middleware;
};