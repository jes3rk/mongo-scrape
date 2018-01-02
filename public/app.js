$(document).ready(function() {
  $(".commentBtn").on("click touch", function() {
    var id = $(this).attr("data-id")
    $.get("/api/comments/" + id)
      .done(function(data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
          var p = $("<p/>");
          p.text(data[i].name + " writes: " + data[i].comment);

          var del = $('<button/>');
          del.attr("data-comment", data[i]._id);
          del.text("Remove Comment");
          del.on("click touch", function() {
            var com = $(this).attr("data-comment");
            $.get("/api/del/" + com)
              .then(function() {
                $("#" + com).remove();
              });
          });
          var d = $('<div/>');
          d.attr("id", data[i]._id);
          d.append(p);
          d.append(del);
          $("#" + id).append(d);

          var btn = $('<button/>');
          btn.text("Hide Comments");
          btn.on("click touch", function() {
            $("#" + id).empty();
          });
          $("#" + id).prepend(btn);
        };

      });
  });
});
