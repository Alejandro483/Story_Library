const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Recipes = require('../models/Recipes')

// @desc Show add page
// @route GET/recipes/add
router.get('/add', ensureAuth, (req, res) => {
        res.render('recipes/add')
})

// @desc Process add form
// @route  POST / recipes
router.post('/', ensureAuth, async (req, res) => {
   try {
       req.body.user = req.user.id
       await Recipes.create(req.body)
       res.redirect('/dashboard')
   } catch  (err) {
       console.error(err)
       res.render('error/500')
   }
})

// @desc Show all recipes
// @route GET /recipes
router.get('/', ensureAuth, async (req, res) => {
    try {
        const recipes = await Recipes.find({ status:'public'})
        .populate('user')
        .sort({ createdAt: 'desc'})
        .lean()

        res. render('recipes/index', {
            recipes,
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
  
})

// @desc Show edit page
// @route GET/recipes/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    const recipe = await Recipes.findOne({
        _id: req.params.id
    }).lean

    if (!recipe) {
        return res.render('error/404')
    }

    if (recipe.user != req.user.id) {
        res.redirect('/recipes')
    } else {
        res.render('recipes/edit', {
            recipe,
        })
    }
})

// @desc Update recipe
// @route PUT/recipes/:id
router.put('/:id', ensureAuth, async (req, res) => {
    let recipe = await Recipes.findById(req.params.id).lean()

    if (!recipe) {
        return res.render('error/404')
    }

    if (recipe.user != req.user.id) {
        res.redirect('/recipes')
    } else {
        recipe = await Recipes.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true,
            runValidators: true
        })
        res.redirect('/dashboard')
    
    }
})

module.exports = router