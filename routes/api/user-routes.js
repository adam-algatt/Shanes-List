const router = require('express').Router();
const {
  User,
  Posts,
  Comment
} = require('../../models');


// get all users
router.get('/', (req, res) => {
  User.findAll({
      attributes: [
        'user_id',
        'username',
        'email'],
        exclude: ['password']
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// get single user by user_id
router.get('/:user_id', (req, res) => {
  User.findOne({
      where: {
        user_id: req.params.user_id
      },
      attributes: [
        'user_id',
        'username',
        'email',
      ],
      exclude: ['password'],
    
      include: [{
          model: Posts,
          attributes: ['post_user_id', 'title', 'product_category', 'created_at'],
        },
        // {
        //   model: Post,
        //   attributes: ['title'],
        //   //through: Comment,
        // }
      ]
    })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({
          message: 'No user found with this id'
        });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

// create user
router.post('/', (req, res) => {
  User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    .then(dbUserData => {
    req.session.save(() => {
      req.session.user_id = dbUserData.user_id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.json(dbUserData);
    });
  });
});

// existing user login
router.post('/login', (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
      }
    }).then(dbUserData => {
      if (!dbUserData) {
        res.status(400).json({ message: 'No user with that email address!' });
      return;
      }

    // Verify user with password
    const validPassword = dbUserData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({
        message: 'Incorrect password!'
      });
      return;
    }

    req.session.save(() => {
      // declare session variables
      req.session.user_id = dbUserData.user_id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

    res.json({
      user: dbUserData,
      message: 'You are now logged in!' });
      console.log('You are now logged in!');
    });
  });
});

router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
      req.session.destroy(() => {
          res.status(204).end();
      });
  }
  else {
      res.status(404).end();
  }
});

// change existing user
router.put('/:user_id', (req, res) => {

  // pass in req.body instead to only update what's passed through
  User.update(req.body, {
      individualHooks: true,
      where: {
        user_id: req.params.user_id
      }
    })
    .then(dbUserData => {
      if (!dbUserData[0]) {
        res.status(404).json({
          message: 'No user found with this id'
        });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

//delete user
router.delete('/:user_id', (req, res) => {
  User.destroy({
      where: {
        user_id: req.params.user_id
      }
    })
    .then(dbUserData => {
      if (!dbUserData) {
        res.status(404).json({
          message: 'No user found with this id'
        });
        return;
      }
      res.json(dbUserData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;