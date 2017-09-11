// Grab the articles as a json
$.getJSON("/articles", function(data) {
  displayArticles(data);
  });

// $.getJSON("/saved", (data) => {
//   sendArticles(data);
// })

//brand button
$(document).on("click", "#brand", () => {
  $.ajax({
    method: "GET",
    url: "/"
  })
})

//Shows saved articles.
$(document).on("click", ".saved-articles", function() {
  $("#articles").empty();
  $.ajax({
    method: "GET",
    url: "/saved"
  }).then($.getJSON("/saved", (data) => {
    displayArticles(data);
  })
  )
})

//Save Button
$(document).on("click", ".save-article", function() {
  // var thisId = $(this)
  // console.log($(this).attr("data-id"));
  let thisId = $(this).attr("data-id");
  // .attr("data-id");
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId
  });
})


//Open Note Modal
$(document).on("click", "#add-note", function() {
  console.log("opening note modal and searching for notes")
  let thisId = $(this).parent().attr("data-id");
  $("#notes-modal").show().attr("data-id", thisId);
  $.getJSON("/articles/notes/" + thisId, (data) => {
    console.log("Note Info:")
    console.log(data.note);
    let singleNote = $("<div><span>" + data.note + "</span><button>X</button</div>")
    $("#notes-list").append(singleNote)
  });
})

// Close Note Modal
$(document).on("click", "#close", (event) => {
  event.preventDefault();
  $("#notes-modal").hide();
})

//Save Note
$(document).on("click", "#note-submit", function(event) {
  event.preventDefault();
  let noteContent = $("#textarea").val().trim()
  let thisId = $(this).parent().parent().attr("data-id");
  console.log(noteContent);
  $.ajax({
    method: "POST",
    url: "/articles/notes/" + thisId,
    dataType: "JSON",
    data: {content : noteContent}
  })
})

let displayArticles = (data) => {
  $('#articles').empty();
  let singleArticle = data.map((data) => {
    // Display the apropos information on the page
    let articleBox =  $("<div class='article-box' id='" + data._id + "' data-id='" + data._id + "'> <button data-id='" + data._id + "' class='save-article'>Save</button><button id='add-note'>Note</button></div>");
    let articleTitle = $("<a href='" + data.link + "'><h2 class='title'>" + data.title + "</h2><button class='save'");
    // let notebutton = $()
    $("#articles").append(articleBox);
    $("#" + data._id + "").append(articleTitle);
  })
}











// Whenever someone clicks a p tag
$(document).on("click", "h2", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  let thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })




    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
