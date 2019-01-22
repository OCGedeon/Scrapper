let mongoose = require('mongoose');
let Schema = mongoose.Schema; 

var commentSchema = new Schema({
  
  
  body: String

});

var Comment = mongoose.model("Comment", commentSchema);


module.exports = Comment;
