'use strict';

const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    console.log(req.body)
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: '',
        usersDisliked: ''
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    console.log(req.file);
    if(req.file) {
        Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => { });
        })
        .catch(error => res.status(500).json({ error }));
    }
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
    .catch(error => res.status(400).json({ error }));
    
    
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};



exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {

            if (req.body.like == 1) {
                if (!sauce.usersLiked.includes(req.body.userId)) {
                    sauce.likes = sauce.likes + 1;
                    sauce.usersLiked.push(req.body.userId);
                }
            }

            if (req.body.like == -1) {
                if (!sauce.usersDisliked.includes(req.body.userId)) {
                    sauce.dislikes = sauce.dislikes + 1;
                    sauce.usersDisliked.push(req.body.userId);
                }
            }
            
            if (req.body.like == 0) {
                if (sauce.usersLiked.includes(req.body.userId)) {
                    sauce.likes = sauce.likes - 1;
                    let index = sauce.usersLiked.indexOf(req.body.userId);
                    sauce.usersLiked.splice(index, 1);
                }
                if (sauce.usersDisliked.includes(req.body.userId)) {
                    sauce.dislikes = sauce.dislikes - 1;
                    let index = sauce.usersDisliked.indexOf(req.body.userId);
                    sauce.usersDisliked.splice(index, 1);
                }
            }

            sauce.save()

            res.status(200).json({ message: 'Updated ! ' })

        })
    
        .catch(error => res.status(500).json({ error }));
};