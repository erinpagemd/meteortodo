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

      Tasks.insert({
        text: text,
        createdAt: new Date(),                //current time
        owner: Meteor.userId(),              //_id of logged in user
        username: Meteor.user().username    //username of logged in user
      });

      //clear form
      event.target.text.value = "";

      //prevent default form submit
      return false;
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

Meteor.methods({
  addTask: function(text){
    //make sure the user is logged in before inserting a task
    if (! Meteor.userID()){
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text;
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function(taskID){
    Tasks.remove(taskID);
  },
  setChecked: function(taskID, setChecked){
    Tasks.update(taskID, { $set: {checked: setChecked}});
  }
});
