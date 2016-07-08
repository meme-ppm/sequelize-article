var Sequelize = require('sequelize');
var slug = require('slug');
var _Article = undefined;


var insertPermalink=function(article){
  return _Article.count({where:{permalinks:{'$contains': [{refPermalink:article.refPermalink}]}}}).then(function(count){
    if(count != 0){
      article.permalink = article.permalink + '-' + (count+1);
    }
    if(!'permalinks' in article || article.permalinks == undefined){
      article.permalinks = [];
    }
    article.permalinks.push({permalink:article.permalink, refPermalink: article.refPermalink});
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
      if(isTheSamePermalink){
        return article;
      }else{
        return insertPermalink(article);
      }
    })
  }else{
    return insertPermalink(article);
  }
}


module.exports.model = {
  title: {type:Sequelize.STRING, allowNull:false},
  permalink: {type:Sequelize.STRING, allowNull:false},
  refPermalink: {type:Sequelize.STRING, allowNull:false},
  permalinks: {type:Sequelize.ARRAY(Sequelize.JSONB), defaultValue:[]}
};

module.exports.methods = {
                          hooks:{
                              beforeValidate:function(article){
                                return generatePermalink(article);
                              }
                            },
                            classMethods:{
                              findArticle: function(permalink, include){
                                return this.findOne({where: {permalinks:{permalink: permalink}}, include: include});
                              }
                            }
                          };

module.exports.define=function(db, fullModel){
    _Article = db.define(fullModel.tableName, fullModel.model, fullModel.methods);
    return _Article;
}
