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
      });
   })
   it('Find Article', function () {
      return Article.findArticle(slug('beautifull title for an article')).then(function(article){
        should.exist(article);
        article.should.be.an('object');
        assert.equal(article.title, 'beautifull title for an article');
        should.exist(article.permalink);
        assert.equal(article.permalink, slug('beautifull title for an article'));

      });
   })
   it('Create a 2nd Article with a same permalink', function () {
      return Article.create({title:"beautifull title for an article"}).then(function(article){
        should.exist(article);
        article.should.be.an('object');
        assert.equal(article.title, 'beautifull title for an article');
        should.exist(article.permalink);
        assert.equal(article.id, 2);
        assert.equal(article.permalink, slug('beautifull title for an article')+'-2');
      });
   })
   it('Find 2nd Article', function () {
      return Article.findArticle(slug('beautifull title for an article')+'-2').then(function(article){
        should.exist(article);
        article.should.be.an('object');
        assert.equal(article.title, 'beautifull title for an article');
        assert.equal(article.id, 2);
        should.exist(article.permalink);
        assert.equal(article.permalink, slug('beautifull title for an article')+'-2');
      });
   })
   it('Update 2nd article', function () {
      return Article.findArticle(slug('beautifull title for an article')+'-2').then(function(article){
        article = article.get({plain:true});
        article.title = "the most beautifull title";
        return Article.update(article, {where: {id: article.id}});
      }).then(function(article){
        return Article.findArticle(slug("the most beautifull title"));
      }).then(function(article){
        should.exist(article);
        article.should.be.an('object');
        assert.equal(article.title, 'the most beautifull title');
        assert.equal(article.id, 2);
        should.exist(article.permalink);
        assert.equal(article.permalink, slug('the most beautifull title'));
      });
   })
   it("drop to clean", function(){
       return db.drop();
   })
})
