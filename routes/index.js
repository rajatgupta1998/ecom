var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var Cart = require('../models/cart');

var Product = require('../models/product');

var csrfProtection = csrf();
router.use(csrfProtection);

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function (err,docs){
    var productChunks = [];
    var chunkSize = 3;
    for(var i = 0; i< docs.length; i += chunkSize)
    {
      productChunks.push(docs.slice(i,i + chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg});
  });
});

router.get('/add-to-cart/:id',function(req,res,next){
  var productId =  req.params.id;

  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function(err, product){
    if(err){
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart; /// auto save each response
    console.log(req.session.cart);
    res.redirect('/');
  })
});

router.get('/shopping-cart',function(req, res, next){
  if(!req.session.cart){
    return res.render('shop/shopping-cart',{products:null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
})

router.get('/checkout', function(req, res, next){
  if(!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout',{total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout',function(req,res,next){
  if(!req.session.cart){
    console.log('back to cart')
    return res.redirect('/shopping-cart');
  }
  console.log('errored out')
  var cart = new Cart(req.session.cart);
  var stripe = require("stripe")(
    "sk_test_PyeKgxriZsNsRcZRRY8CSzIg00VURIjaOe"
    );
  stripe.charges.create({
    amount: 100,
    currency: "usd",
    source: req.body.stripeToken,
    description: "Charged for ecom"
  }, function(err, charge){
    if(err){
      // console.log('errored out')
       req.flash('error', err.message);
       return res.redirect('/checkout');
    }
    req.flash('success', 'successfully bought!');
    req.session.cart = null;
    res.redirect('/');
  });
});

module.exports = router;
