require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const registrationRouter = require('./registration/registration-router');
const authRouter = require('./auth/auth-router');
const classRouter = require('./class/class-router');
const subGoalRouter = require('./subGoals/subGoals-router');
const goalsRouter = require('./goals/goals-router');
const studentGoalRouter = require('./studentGoal/studentGoal-router');

const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());


app.use('/api/register', registrationRouter);
app.use('/api/auth', authRouter);
app.use('/api/class', classRouter);
app.use('/api/subgoals', subGoalRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/studentGoals', studentGoalRouter);


// eslint-disable-next-line no-unused-vars
app.use(function errorHandler(error, req, res, next){
  let response;
  if (NODE_ENV === 'production'){
    response = {error: {message: 'servor error'} };
  } else {
    console.error(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;



