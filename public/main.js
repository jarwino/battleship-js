$(document).ready(function () {
  var $you = $('#you');
  var $opponent = $('#opponent');
  var game = new Game({
    $you: $you,
    $opponent: $opponent
  });
  game.setupBoards();
});