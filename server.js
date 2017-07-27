const app = require('./app');
const config = require('./config');

const port = normalizePort(config.port);

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

// 404 fallthrough handler
app.use(function (req, res, next) {
  let err = new Error('Not found!');
  err.status = 404;
  next(err);
});

// error handler for all next(err)
app.use(function (err, req, res, next) {  // eslint-disable-line
  res.status(err.status || 500);
  res.render('error', {
    user: req.user,
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});

app.listen(port, (error) => {
  if (error) {
    console.error(`Got server error: ${error}`);
  } else {
    console.info(`==> Listening on port ${port}. Open up http://localhost:${port}/ in your browser`);
  }
});
