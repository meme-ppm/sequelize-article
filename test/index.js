var assert = require('chai').assert;
var should = require('chai').should();
var Sequelize = require('sequelize');
var slug = require('slug');

var ArticleModel = require('../index.js');

  var db = new Sequelize('postgresql://test1:test1@localhost/test1');
var Article = ArticleModel.define(db, {model: ArticleModel.model, methods: ArticleModel.methods, tableName:"article"});

describe("Test article creation >>", function(){
   it('initialize the DB', function () {
      return db.drop().then(function(){
        return db.sync();
      })
   })
   it('Create Article', function () {
      return Article.create({title:"beautifull title for an article"}).then(function(article){
        should.exist(article);
        article.should.be.an('object');
        assert.equal(article.title, 'beautifull title for an article');
        should.exist(article.permalink);
        assert.equal(article.permalink, slug('beautifull title for an article'));
        assert.equal(article.permalinks.length, 1);
      });
   })
   it("drop to clean", function(){
       return db.drop();
   })
})
