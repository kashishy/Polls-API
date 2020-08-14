const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Polls = require('../models/poll');

const pollRouter = express.Router();

pollRouter.use(bodyParser.json());

pollRouter.route('/')
.get((req,res,next) => {

    Polls.find({})
    .populate('user')
    .populate('voted')
    .then((polls) => {
        res.statusCode = 200; 
        res.setHeader('Content-Type','application/json');
        res.json(polls);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser, (req, res, next) => {

    req.body.user = req.user._id;
    Polls.create(req.body)
    .then((poll) => {
        
        console.log('Poll Created',poll);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(poll);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /polls');
})
.delete(authenticate.verifyUser, (req, res, next) => {

    Polls.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


//endpoint for a particular poll
pollRouter.route('/:pollId')
.get((req, res, next) => {

    Polls.findById(req.params.pollId)
    .populate('user')
    .populate('voted')
    .then((poll) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(poll);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /poll/'+ req.params.pollId);
})
.put(authenticate.verifyUser, (req, res, next) => {

    Polls.findByIdAndUpdate(req.params.pollId, {
        $set: req.body
    }, {new: true})
    .then((poll) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(poll);
    }, (err) => next(err))
    .catch((err) => next(err));
})  
.delete(authenticate.verifyUser, (req, res, next) => {

    Polls.findByIdAndRemove(req.params.pollId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


//endpoint for handling options of a particular poll
pollRouter.route('/:pollId/options')
.get((req,res,next) => {
    Polls.findById(req.params.pollId)
    .then((poll) => {
        if (poll != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(poll.options);
        }
        else {
            err = new Error('Poll ' + req.params.pollId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {

    Polls.findById(req.params.pollId)
    .then((poll) => {
        if (poll != null) {
            poll.options.push(req.body);
            poll.save()
            .then((poll) => {
                Polls.findById(poll._id)
                .populate('user')
                .populate('voted')
                .then((poll) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(poll);   
                })             
            }, (err) => next(err));
        }
        else {
            err = new Error('Poll ' + req.params.pollId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /polls/'+req.params.pollId+'/options');
})
.delete(authenticate.verifyUser,  (req, res, next) => {
    Polls.findById(req.params.pollId)
    .populate('user')
    .populate('voted')
    .then((poll) => {
        if (poll != null) {
            for (var i = poll.options.length -1; i>=0; i--) {
                poll.options.id(poll.options[i]._id).remove();
            }
            poll.save()
            .then((poll) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(poll);
            }, (err) => next(err));

        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(poll);
    }, (err) => next(err))
    .catch((err) => next(err));
});


//endpoint for handling single option of a poll 
pollRouter.route('/:pollId/options/:optionId')
.get((req, res, next) => {
    Polls.findById(req.params.pollId)
    .then((poll) => {
        if (poll != null && poll.options.id(req.params.optionId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(poll.options.id(req.params.optionId));
        }
        else if (poll == null) {
            err = new Error('Poll '+req.params.pollId+' not found');
            err.status = 404;
            return next(err);
        }
        else {
        err = new Error('Option '+req.params.pollId+' not found');
        err.status = 404;
        return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /polls/'+ req.params.pollId +'/options/' + req.params.optionId);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Polls.findById(req.params.pollId)
    .then((poll) => {
        if (poll != null && poll.options.id(req.params.optionId) != null) {
            if (req.body.option) {
                poll.options.id(req.params.optionId).option = req.body.option;
            }
            if (req.body.votes) {
                poll.options.id(req.params.optionId).votes = poll.options.id(req.params.optionId).votes+1;
                poll.voted.push(req.user._id);
            }
            poll.save()
            .then((poll) => {
                Polls.findById(poll._id)
                .populate('user')
                .populate('voted')
                .then((poll) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(poll);
                })
            }, (err) => next(err));
        }
        else if (poll == null) {
            err = new Error('Poll '+req.params.pollId+' not found');
            err.status = 404;
            return next(err);
        }
        else if(poll.options.id(req.params.optionId) == null) {
            err = new Error('Option '+req.params.optionId+' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('You are not authorized to update this option!');
            err.status = 403;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})  
.delete(authenticate.verifyUser, (req, res, next) => {
    Polls.findById(req.params.pollId)
    .populate('user')
    .populate('voted')
    .then((poll) => {
        if (poll != null && poll.options.id(req.params.optionId) != null) {

            for (var i = poll.options.length -1; i>=0; i--) {
                if(poll.options[i]._id == req.params.optionId)
                {
                    poll.options.id(poll.options[i]._id).remove();
                }
            }
            poll.save()
            .then((poll) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(poll);
            }, (err) => next(err));
        }
        else if (poll == null) {
            err = new Error('Poll '+req.params.pollId+' not found');
            err.status = 404;
            return next(err);
        }
        else if(poll.options.id(req.params.optionId) != null) {
            err = new Error('Option '+req.params.optionId+' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('You are not authorised to delete this option!');
            res.statusCode = 403;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = pollRouter;