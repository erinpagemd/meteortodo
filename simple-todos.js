Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("tasks");

  Template.body.helpers({
    tasks: function(){
      if (Session.get("hideCompleted")){
        //if hide completed checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      }else{
        //otherwise return all of the tasks
        return Tasks.find({}, {sort: {createdAt:-1}});
      }
    },
    hideCompleted: function(){
      return Session.get("hideCompleted");
    },
    incompleteCount: function(){
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "change .hide-completed input": function(event){
      Session.set("hideCompleted", event.target.checked);
    },
    "submit .new-task": function(event){
      var text = event.target.text.value;

      Meteor.call("addTask", text);

      //clear form
      event.target.text.value = "";
    },

    "change .hide-completed input": function(event){
      Session.set("hideCompleted", event.target.checked);
    }

  });

  Template.task.helpers({
    isOwner: function(){
      return this.owner === Meteor.userID();
    }
  });

  Template.task.events({
    "click .toggle-private": function(){
      Meteor.call("setPrivate", this._id, ! this.private);
    },

    "click .toggle-checked": function(){
      //set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },

    "click .delete": function(){
      Meteor.call("deleteTask", this._id);
    }
  });
  //at the bottom of the client code put signup/password
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

// At the bottom of simple-todos.js, outside of the client-only block
Meteor.methods({
  setPrivate: function(taskId, setToPrivate){
    var task = Tasks.findOne(taskId);

    if(task.owner !== Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, {$set: {private: setToPrivate}});
  },

  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  }
});

if(Meteor.isServer){
  //only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function(){
    return Tasks.find({
      $or: [
        {private: {$ne: true}},
        {owner: this.userId}
      ]
    });
  });
}
