const Food = require('../Models/Food')
const jwt = require('jsonwebtoken')
const Favourite = require('../Models/Favourite')
const Comment = require('../Models/Comment')
exports.all = (req, res, next) => {
    const { token } = req.cookies;
    jwt.verify(token, "ILOVEANNA", {}, async (err, userData) => {
        const {id} = userData
        
        if(err || !userData) {
            res.clearCookie('token').json(true);
        }

        res.json( await Food.find({owner:id}))
    });
}

exports.edit = async(req, res, next) => {
    const {id} = req.params
    res.json( await Food.findById(id) )
}

exports.editFood = async(req, res, next) => {
    
    const { token } = req.cookies;
    const {
     id, title,ingredients,addedPhotos,instructions,time,category
      
    } = req.body;
    jwt.verify(token, "ILOVEANNA", {}, async (err, userData) => {
        const placeDoc = await Food.findById(id) 
       if(userData.id === placeDoc.owner.toString()) {
        placeDoc.set({
          
            title,ingredients,instructions,time,photos:addedPhotos,category
          })
       await placeDoc.save()
        res.json('ok')
       }
      });
}



exports.deleteFood = async (req, res, next) => {
    try {
        await Food.findByIdAndDelete(req.params.id);
        res.status(200).json("deleted");
    } catch (err) {
        console.error('Error deleting food:', err);
        res.status(500).json(err);
    }
};

exports.allFood = async(req, res, next) => {
    
    try {
   
        const foods = await Food.find().populate('owner');
        res.json(foods);
    } catch (error) {
        next(error);
    }
}

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
      jwt.verify(req.cookies.token, "ILOVEANNA", {}, async (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    });
  }

 exports.addToFavourite = async (req, res, next) => {
  const userData = await getUserDataFromReq(req);
  const {
    name, foodId, photos
  } = req.body;
  const existingFavorite = await Favourite.findOne({ user: userData.id, food: foodId, photos:photos });

  if (existingFavorite) {
    return res.status(400).json({ error: "Item already exists in favorites." });
  }
  Favourite.create({
    name,
    user:userData.id,
    food: foodId,
    photos:photos
  }).then((doc) => {
    res.json(doc);
  }).catch((err) => {
    throw err;
  });
  
};

  

  exports.removeFromFavourite = async(req, res,next) => {
    try {
      await Favourite.findByIdAndDelete(req.params.favouriteId);
      res.status(200).json("deleted");
  } catch (err) {
      console.error('Error deleting food:', err);
      res.status(500).json(err);
  }
  }
  

exports.singleFood = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id)
       
        res.status(200).json(food)
    } catch (err) {
            res.status(500).json(err)
    }
}



exports.allFavourite = async (req, res, next) => {

const userData = await getUserDataFromReq(req);
res.json( await Favourite.find({user:userData.id}).populate('food') );
}


exports.addComments = async (req, res, next) => {
  const userData = await getUserDataFromReq(req);
  const { content } = req.body; 

  try {
    const comment = new Comment({
      content,
      user: userData.id,
      food: req.params.foodId,
    });

    const savedComment = await comment.save();

 
    await savedComment.populate('user');

    console.log("user", savedComment);
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error adding item to comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// exports.deleteComment = async (req, res, next) => {
//   try {
//     const commentId = req.params.commentId; 
//     await Comment.findByIdAndDelete(commentId);
//     res.status(200).json("Comment deleted successfully");
//   } catch (err) {
//     console.error('Error deleting comment:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


exports.deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const userData = await getUserDataFromReq(req);
    const userId = userData.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (userData.isAdmin == true) {
      await Comment.findByIdAndDelete(commentId);
      console.log('Deleted by admin');
      return res.status(200).json({ message: 'Comment deleted successfully' });
    }
    
    if (userData.isAdmin !== "true" && comment.user.toString() !== userId) {
     console.log('Cannot delete - not admin and not comment owner');
     return res.status(403).json({ error: 'Unauthorized - You can only delete your own comments' });
    }

    if ( comment.user.toString() === userId) {
      await Comment.findByIdAndDelete(commentId);
      console.log('Deleted by comment owner');
      return res.status(200).json({ message: 'Comment deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




exports.allComments = async(req, res, next) => {
    
  try {
    const foodId = req.params.foodId;
      const comment = await Comment.find({ food: foodId }).populate('user');
      res.json(comment);
  } catch (error) {
      next(error);
  }
}