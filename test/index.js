var assert = require('chai').assert;
var should = require('chai').should();
var Sequelize = require('sequelize');
var userModel = require('sequelize-user');
var slug = require('slug');

var articleModel = require('../index.js');


var db = new Sequelize('postgresql://test1:test1@localhost/test1');
var Article = articleModel.define(db, {model: articleModel.model, methods: articleModel.methods, tableName:"article"});

var User = userModel.define(db, {model:userModel.model, methods: userModel.methods, tableName:'user', options:{email:{send: false,debug:true}}});
Article.defineRelations({User:User});

describe("Test permalink - ", function(){
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
      return Article.findFromPermalink(slug('beautifull title for an article')).then(function(article){
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
      return Article.findFromPermalink(slug('beautifull title for an article')+'-2').then(function(article){
        should.exist(article);
        article.should.be.an('object');
        assert.equal(article.title, 'beautifull title for an article');
        assert.equal(article.id, 2);
        should.exist(article.permalink);
        assert.equal(article.permalink, slug('beautifull title for an article')+'-2');
      });
   })
   it('Update 2nd article', function () {
      return Article.findFromPermalink(slug('beautifull title for an article')+'-2').then(function(article){
        article = article.get({plain:true});
        article.title = "the most beautifull title";
        return Article.update(article, {where: {id: article.id}});
      }).then(function(article){
        return Article.findFromPermalink(slug("the most beautifull title"));
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

describe("Test user - ", function(){
  it('initialize the DB', function () {
     return db.drop().then(function(){
       return db.sync();
     })
  })
  var user1Pr;
  var user2Pr;
  var article1Pr;
  var article2Pr;

  it('create users', function () {
     userPr1 = User.createUser({login:"test1", email:"test1@gmail.com", password:"testTestTest"});
     userPr2 = userPr1.then(function(){
       return User.createUser({login:"test2", email:"test2@gmail.com", password:"testTestTest"});
     });
     return userPr2;
  })
  it('create articles', function () {
     article1Pr = Article.create({title:"beautifull title for an article1", userId:userPr1.value().get({plain:true}).id});
     article2Pr = Article.create({title:"beautifull title for an article2", userId:userPr2.value().get({plain:true}).id});
     return Promise.all([article1Pr, article2Pr]);
  })
  it('create favorit', function () {
     favorit21Pr = Article.createFavorite(article2Pr.value().id, userPr1.value().id);
     favorit22Pr = Article.createFavorite(article2Pr.value().id, userPr2.value().id);
     favorit12Pr = Article.createFavorite(article1Pr.value().id, userPr2.value().id);
     favorit11Pr = Article.createFavorite(article1Pr.value().id, userPr1.value().id);

     return Promise.all([favorit12Pr, favorit22Pr,favorit11Pr, favorit21Pr]);
  })
  it('find user favorit article', function() {
    return User.findOne({include:{model: Article, as: 'favorits'}}).then(function(user){
      console.log("user ", user.get({plain:true}));
    })
  })
  it('find user favorit article', function() {
    return User.findOne({include:{model: Article, as: 'favorits'}}).then(function(user){
      user = user.get({plain:true})
      assert.equal(user.favorits.length, 2);
    })
  })
  it('count article favorits', function() {
  return Article.favorit().findAll({attributes:[ [Sequelize.fn('COUNT', 'article_favorits.id'), 'favorits']], include:{model:Article}, group:['article_favorit.articleId', 'article.id']}).then(function(results){
      results.forEach(function(result){
        console.log("result ", result.get({plain:true}));
      })
    });
    /*return Article.findAll({ attributes:["article.*", [Sequelize.fn('COUNT', 'article_favorits.id'), 'count']],group:['article.id'], include:{model: Article.favorit(), attributes: []}}).then(function(articles){
        articles.forEach(function(article){
          console.log("article ", article.get({plain:true}));
        })
    })*/
  })
  /*it('find article favorits', function () {
      return Article.find({where:{id:article1Pr.value().id}, include:})
  })*/
  it("drop to clean", function(){
      return db.drop();
  })
})
