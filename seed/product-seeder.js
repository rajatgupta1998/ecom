var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shopping');

var products = [new Product({
    imagePath: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Cover_Art_of_Need_for_Speed_Heat.png',
    title: 'NFS Heat',
    price: 100
}),
new Product({
    imagePath : 'https://upload.wikimedia.org/wikipedia/en/6/64/Need_for_Speed_Payback_standard_edition_cover_art.jpg',
    title: 'NFS Payback',
    price: 70
}),
new Product({
    imagePath : 'https://upload.wikimedia.org/wikipedia/en/a/a9/Need_for_Speed_2015.jpg',
    title: 'NFS 2015',
    price: 50
})
];

var done = 0;
for( var i =0 ; i< products.length; i++){
    products[i].save(function(err,result){
        done++;
        if(done === products.length){
            exit();
        }
    });
}

function exit(){
    mongoose.disconnect();
}