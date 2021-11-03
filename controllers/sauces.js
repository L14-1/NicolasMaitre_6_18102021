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
            let i = 0;
            let tabLikes = [];
            let tabDislikes = [];
            let alreadyLiked = 0;
            let alreadyDisliked = 0;
            let userLike = req.body.like;
            let user_id = req.body.userId;

            if(sauce.usersLiked) {
                tabLikes = JSON.parse(sauce.usersLiked);
                while(i < tabLikes.length) {
                    if(tabLikes[i] == user_id) { 
                        if(userLike == 0 || userLike == -1) 
                        { 
                            tabLikes.splice(i, 1); 
                            sauce.likes --;
                        }
                        alreadyLiked = 1;
                    }
                    i ++;
                }
            }
            if(sauce.usersDisliked) {
                tabDislikes = JSON.parse(sauce.usersDisliked); i = 0;
                while(i < tabDislikes.length) {
                    if(tabDislikes[i] == user_id) { 
                        if(userLike == 0 || userLike == 1) 
                        { 
                            tabDislikes.splice(i, 1); 
                            sauce.dislikes --;
                        }
                        alreadyDisliked = 1;
                    }
                    i ++;
                }
            }

            if(userLike == 1 && alreadyLiked == 0) 
            {
                tabLikes.push(user_id);
                sauce.likes ++; 
            }
            if(userLike == -1 && alreadyDisliked == 0) 
            {
                tabDislikes.push(user_id);
                sauce.dislikes ++; 
            }

            Sauce.updateOne({ _id: req.params.id }, 
                { 
                    likes: sauce.likes, 
                    dislikes: sauce.dislikes, 
                    usersLiked: JSON.stringify(tabLikes), 
                    usersDisliked: JSON.stringify(tabDislikes)
                })
                .then(() => res.status(200).json({ message: 'Updated ! '}))
                .catch(error => res.status(400).json({ error }));

        })
        .catch(error => res.status(500).json({ error }));
}; 