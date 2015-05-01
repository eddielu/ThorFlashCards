/*****************************************************************************/
// Event Listeners
/*****************************************************************************/

// Set event listeners for browser and mobile navigation of cards.
$(document).on("keydown", function (e){
    if (e.keyCode == '32') {
        // spacebar to flip.
	e.preventDefault();
        thorFCflip();
    }
    else if (e.keyCode == '37') {
	// left arrow
	thorFCswipeLeft();
    }
    else if (e.keyCode == '39') {
	// right arrow
	thorFCswipeRight();
    }
});

$(document).on('click','.card',  thorFCflip);
$(document).on('swiperight','.card', thorFCswipeRight);
$(document).on('swipeleft','.card', thorFCswipeLeft); 
$(document).on('unload', storeDeckState); 

/*****************************************************************************/
// Build initial frequency generator and grab cards from server. 
/*****************************************************************************/

/*Get cards in deck from server.*/
var pathname = window.location.href;
var res  = pathname.split("/");
var pk   = res[res.length-2];
var url  = "/api/decks/" + pk;
var response = '';
$.ajax({
    method:"GET",
    url:url,
    async:false,
    success : function(text)
    {
        response = text;
    },
    error: function(jqXHR, textStatus, errorThrown)
    {
	console.log(textStatus);
	console.log(errorThrown);
    }
});

var previousCardLearner = $.cookie("cardLearner");
if (previousCardLearner === undefined)
    previousCardLearner = null;

var cards = response.cards;
var N = cards.length;

if (previousCardLearner == null){
    /* Make a card learner from the number of cards in the deck. */
    var cardLearner = new CardLearner(N);
}
else{
    previousCardLearner = JSON.parse(previousCardLearner);
    N = previousCardLearner.N;
    var probs = previousCardLearner.probs;
    var known = previousCardLearner.known;
    var m = previousCardLearner.m;
    var nKnown = previousCardLearner.nKnown;
    var cardLearner = new CardLearner(N, probs, known, m, nKnown);
}
var cardIndex = cardLearner.next();
var currentCard = cards[cardIndex];
var frontFacing = true;
thorFCloadCard();   

/*****************************************************************************/
// HELPER FUNCTIONS
/*****************************************************************************/

// Loads next card in deck based on cardLearner, displays placeholder if no
// cards are in the deck.
function thorFCloadCard(){
    if (N!= 0){
	$('.stack').append('<div class="card"></div>')
	$('.card').append('<div class="face front"></div><div class="face back"></div>');
	$('.front').text(currentCard.front);
	$('.back').text(currentCard.back);
	$('.card').show();
	frontFacing = true;
    }
    else if (N==0){
	$('.stack').text("Your deck has no cards");
    }
    else {
	$('.stack').text("Your programmer has no brain");
    }
}
// Displays other side of card text. 
function thorFCflip(){
    if (frontFacing){
	frontFacing = false;
	$('.content').find('.card').addClass('flipped');
	$('.front').remove();
       
    }
}
// Callback for swipe functions, sets next card and then loads it. 
function fadeOutComplete(){
    frontFacing = true;
    $('.card').remove();
    cardIndex = cardLearner.next();
    currentCard = cards[cardIndex];
    thorFCloadCard();
}
// Swipe right, displays green background to indicate answered correctly. 
function thorFCswipeRight(){    
    if(!frontFacing){
	$('.card').addClass('rotate-left').delay(700).fadeOut(1, fadeOutComplete);
	cardLearner.learn(cardIndex, true)
    }
}
// Swipe left, displays red background to indicate answered incorrectly.
function thorFCswipeLeft(){
    if(!frontFacing){
	$('.card').addClass('rotate-right').delay(700).fadeOut(1, fadeOutComplete);
	cardLearner.learn(cardIndex, false);
    }
}

// Function to store deck state for future review.
function storeDeckState(){
    var cardLearnerState = cardLearner.dataDump();
    $.cookie("cardLearner", JSON.stringify(cardLearnerState), { expires:10});
}
