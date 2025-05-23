'use strict';

module.exports = (req, res, next) => {
  // Disable the serverless function by not implementing any logic here
  res.status(404).send('Not Found');
};