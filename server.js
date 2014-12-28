
// ECMA 5 Strict mode
'use strict';

/*
 * Module Dependencies
 */

var express = require('express'),
    path = require('path'),
    winston = require('winston'),
    expressWinston = require('express-winston'),
    lessMiddleware = require('less-middleware'),
    livereload = require('connect-livereload'),
    compressor = require('compression');

// Configure express
var app = module.exports = express();
var router = express.Router();
var publicFolder = path.join(__dirname, 'public');

// Jade
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Less-Middleware
if ('development' === app.get('env')) {
  app.use(lessMiddleware(path.join(__dirname, 'less'),
      {
        dest: publicFolder,
        preprocess: {
          path: function(pathname, req) {
            return pathname.replace(/\/css\//, '/');
          }
        },
        force: true
      }
  ));
  app.use(livereload({ port: 3001 }));
}

if ('production' === app.get('env')) {
  app.use(lessMiddleware(path.join(__dirname, 'less'),
      {
        dest: publicFolder,
        preprocess: {
          path: function(pathname, req) {
            return pathname.replace(/\/css\//, '/');
          }
        },
        once: true
      }
  ));
}

app.use(express.static(publicFolder));
app.use('/vendor', express.static(path.join(__dirname, 'vendor')));
app.use(compressor());

// Winston normal logging
app.use(expressWinston.logger({
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, 'log', 'server.log')
    })
  ]
}));

if ('development' === app.get('env')) {
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true
      })
    ]
  }));
}

// Router
router.get('/chat', function(req, res) {
  var designId = req.param('postsearch_design', 'default');
  res.render(path.join('chat', designId), function(err, html) {
    if (err) {
      return res.render(path.join('chat', 'default'));
    } else {
      res.send(html);
    }
  });
});

// Mount router to the app root
app.use('/', router);

// Winston error logging
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, 'log', 'errors.log')
    })
  ]
}));

if ('development' === app.get('env')) {
  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true
      })
    ]
  }));
}

// Run the app
if (!module.parent) {
  var port = 3000;
  app.listen(port);
  console.log('Server started in %s mode on port %d', app.get('env'), port);
}
