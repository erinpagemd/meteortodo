Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client
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

  Template.task.events({
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
