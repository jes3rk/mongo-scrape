$(document).ready(function() {
  $(".commentBtn").on("click touch", function() {
    $.GET("/api/comments/" + $(this).attr("id"))
      .done(function(data) {
        console.log(data);
      });
  });
});
