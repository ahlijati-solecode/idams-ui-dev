const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use('/api', createProxyMiddleware({ target: 'http://localhost:8000/' }));
  app.use(createProxyMiddleware('/hub', { target: 'http://localhost:8000/', ws: true }));
};
