if (Meteor.isClient) {
  // This code only runs on the client

  Template.body.helpers({
    tasks: [
      {text: "This is task 1"},
      {text: "This is the second task"},
      {text: "And here is the third task"}
    ]
  })
}
