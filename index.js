var Sequelize = require('sequelize');
var slug = require('slug');
var permalinkModel = require('./modules/permalink.js');
var favoritModel = require('./modules/favorit.js');
var _Article = undefined;
var _Permalink;
var _Favorit;
var _User;

var generateFinalPermalink=function(article){
  //_db.query('SELECT count(*) AS "count" FROM "articles" AS "article" WHERE "article"."permalinks" @> ARRAY[\'[{"refPermalink":"beautifull-title-for-an-article"}]\'::jsonb]::jsonb[]').then(function(count){
  return _Permalink.count({where:{refPermalink:article.refPermalink}}).then(function(count){
    //_Article.count({where:{title:article.title}}).then(function(count){
    //_Article.count({where:{permalinks:{'$contains': [{refPermalink:article.refPermalink}]}}).then(function(count){
  //  count = count[0][0].count;
    if(count != 0){
      article.permalink = article.permalink + '-' + (count+1);
    }

    return article;
  })
}

var isTheSamePermalink=function(article){
    return _Article.findOne({where: {id: article.id}}).then(function(oldArticle){
    article.permalinks = oldArticle.get('permalinks');
    if(oldArticle.get('refPermalink') === article.refPermalink){
      return true;
    }
    return false;
  })
}

var generatePermalink=function(article){
  article.permalink = slug(article.title);
  article.refPermalink = article.permalink;
  if(article.id){
    return isTheSamePermalink(article).then(function(isTheSame){
      if(isTheSame){
        return article;
      }else{
        var prPermalink = generateFinalPermalink(article);
        prPermalink.then(function(article){
          return _Permalink.create({permalink:article.permalink, refPermalink: article.refPermalink, articleId: article.id}).then(function(){
            return prPermalink.value();
          })
        })
      }
    })
  }else{
    return generateFinalPermalink(article);
  }
}



module.exports.model = {
  title: {type:Sequelize.STRING, allowNull:false},
  permalink: {type:Sequelize.STRING, allowNull:false},
  refPermalink: {type:Sequelize.STRING, allowNull:false}
};

module.exports.methods = {
                          hooks:{
                              beforeValidate:function(article){
                                return generatePermalink(article);
                              },
                              afterCreate:function(article){
                                return _Permalink.create({permalink:article.permalink, refPermalink: article.refPermalink, articleId: article.id});
                              }
                            },
                            classMethods:{
                              favorit(){
                                return _Favorit;
                              },
                              findFromPermalink: function(permalink, includes){
                                if(includes == null){
                                  includes = [];
                                }
                                includes.push({model: _Permalink, where: {permalink: permalink}});
                                return this.findOne({include:includes});
                              },
                              createFavorite(articleId, userId){
                                return _Favorit.create({userId: userId, articleId: articleId});
                              },
                              defineRelations: function(daos){
                                if("User" in daos){
                                  daos.User.hasMany(_Article);
                                  _Article.belongsTo(daos.User);
                                  daos.User.belongsToMany(_Article, {as: "favorits", through : _Favorit});
                                  _Article.belongsToMany(daos.User, {as: "favorits", through : _Favorit});
                                }
                              }
                            }
                          };

module.exports.define=function(db, fullModel){
    _Article = db.define(fullModel.tableName, fullModel.model, fullModel.methods);
    _Permalink = db.define(fullModel.tableName+'_permalink', permalinkModel);
    _Favorit = db.define(fullModel.tableName+'_favorit', favoritModel);
    _Article.hasMany(_Permalink);
    _Permalink.belongsTo(_Article);
    _Article.hasMany(_Favorit);
    _Favorit.belongsTo(_Article);
    return _Article;
}
