const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Polls = require('../models/poll');

const pollRouter = express.Router();

pollRouter.use(bodyParser.json());