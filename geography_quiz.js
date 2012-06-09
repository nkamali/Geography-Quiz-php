/*
Author: Navid Kamali
Filename: geography_quiz.js
Date Created: 2/9/2011
*/

// Execution of code starts here once document is ready.
$("document").ready(function() {
	
// The url of the php servlet that takes an SQL query for the world db and returns an
// XML document in the response.
var URL = "worldquery.php"; 

// Checks to see if answeredEntered is in the list > items returned
// Converts answeredEntered and the list items to lowercase before comparing
function doesItemExistInList(answerEntered) 
{
	var didYouGetTheCorrectAnswer = false;
	
	$(list).find('item').each(function() {		
		if($(this).text().toLowerCase() == answerEntered.trim().toLowerCase())
		{
			didYouGetTheCorrectAnswer = true;
		}
	});
	
	return didYouGetTheCorrectAnswer;
}

// Makes an anchor tag with text
// Its onclick event calls the callBack function
function makeAnchorTag(parent, text, callBack, indexOfRadioButtonClickedOn)
{	
	var aTag = $('<a />').text(text);
	aTag.attr('href', '#');
	
	aTag.click(function(){
		eval(callBack + "(indexOfRadioButtonClickedOn, parent)");
	});
	
	return aTag;
}

// Callback function which is called when user clicks on the anchor tag for choosing another question of the same type
function chooseAnotherQuestionOfSameType(indexOfRadioButtonClickedOn, parent)
{
	askTheQuizQuestion(indexOfRadioButtonClickedOn);
}

// Callback function which is called when the user clicks on the anchor tag for Give up?
function giveUp(indexOfRadioButtonClickedOn, parent)
{
	parent.find('input').remove();
	parent.find('a').remove();				
	
	var aTagForAnotherTypeOfQuestionOfSameType = makeAnchorTag(parent, "Another question of same type?", "chooseAnotherQuestionOfSameType", indexOfRadioButtonClickedOn);
	parent.append(aTagForAnotherTypeOfQuestionOfSameType);
	
	parent.parent().attr('class', 'even_bigger');
	
	var msg = "The correct answer";
	
	var numberOfItemsInList = list.children().size();
	if(numberOfItemsInList == 0)
	{
		msg = "The Servlet Returned Zero list > items in the Response XML. The SQL Query May Need To Be Corrected!"
	}
	else if(numberOfItemsInList == 1)
	{
		msg = msg + " is: " + list.find('item').text();
	}
	else // If there are more than 1 items in the list
	{
		var arr = $.makeArray(list.find('item'));
		var newArray = [];
		
		// Each item looks like <item>value</item>. When there is more than one, they should be extracted. 
		// Was trying to use map function with no success yet but will attempt to refactor this later.
		$.each(arr, function(index, value) { 
			value = $(value).text();
			newArray.push(value);
		});
		
		// Separate each item in the list by a comma and display them to user		
		msg = msg + " is one of the following: " + newArray.join(", ");
	}
	
	var spanTag = parent.find('span');
	spanTag.text(msg);
	spanTag.css('color', '#33FF00');
}

// Capitalizes first letter of each word
String.prototype.capitalize = function(){
  return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};

// Checks to see if the quiz answer is in the list of items returned by the servlet
// Ccalled from the sendQuery function.
function checkAnswer(indexOfRadioButtonClickedOn, textFieldAndButtonDiv, inputTag)
{
	// lowercases all letters and then capitalizes the first letter of each word
	var answerEntered = inputTag.val().toLowerCase().capitalize();

	// doesItemExist is true or false
	var doesItemExist = doesItemExistInList(answerEntered);

	if(doesItemExist == true) // If Right Answer
	{
		textFieldAndButtonDiv.hide(function() {
			textFieldAndButtonDiv.find('span').remove();
			textFieldAndButtonDiv.find('a').remove();				
			
			var msg = "Right! " + answerEntered + " is correct!";
			var spanTag = makeSpanTag(textFieldAndButtonDiv, msg, 'left');
			spanTag.css('color', '#33FF00');
			
			var aTagForAnotherTypeOfQuestionOfSameType = makeAnchorTag(textFieldAndButtonDiv, "Another question of same type?", "chooseAnotherQuestionOfSameType", indexOfRadioButtonClickedOn);
			textFieldAndButtonDiv.append(aTagForAnotherTypeOfQuestionOfSameType);
			
			textFieldAndButtonDiv.parent().attr('class', 'even_bigger');
			textFieldAndButtonDiv.find('input').remove();
			
			textFieldAndButtonDiv.show();
		});
	}
	else // If Wrong Answer
	{
		textFieldAndButtonDiv.find('span').remove();
		textFieldAndButtonDiv.find('a').remove();
		
		displayErrorMessageInRed(textFieldAndButtonDiv, "Wrong! " + answerEntered + " is the wrong answer! Try again!");
		inputTag.val('');
		
		var aTagForGivingUp = makeAnchorTag(textFieldAndButtonDiv, "Give up?", "giveUp", indexOfRadioButtonClickedOn);
		textFieldAndButtonDiv.append(aTagForGivingUp);
	}
}
// creates the ContentLoader object that contains the query and sends it along to the servlet
// Sets the global list XML element
function sendQuery(indexOfRadioButtonClickedOn, randomCountryChosen, textFieldAndButtonDiv, inputTag)
{	
	var query_from_json = findSQLQuery(indexOfRadioButtonClickedOn);
	var query = replaceXXXWithActual(query_from_json, randomCountryChosen);

	// POST the XMLHttpRequest via JQuery
	$.post(URL, { q: query },
	function(data){		
		
		// Gets the list back in the XML response. There can be more than one list item.
		// list is a global variable which is used globally in the giveUp function
		list = $(data).find('list');
		checkAnswer(indexOfRadioButtonClickedOn, textFieldAndButtonDiv, inputTag);
	});
}

// Generates a label with an input radio button and a span similar to the following:
//  <label>
//    <input type='radio' class='input_text' name='question_type' value='0-3' />
//    <span>Question</span>
// <label>
RadioButtons.prototype.addLabelWithRadioButton = function(index)
{
	var question = quizTypes[index].type;
	var labelTag = $('<label />');
	var inputTag = $('<input />');
	var spanTag  = $('<span />').text(question);
	
	inputTag.attr({
	  type: 'radio',
	  className: 'input_text',
		name: 'question_type',
		value: index
	});
	
	labelTag.append(inputTag).append(spanTag);
	this.selectNode.append(labelTag);
	
	return inputTag;
}

// adds labels along with their input radio buttons
// assigns onclick event handler to callBack function
RadioButtons.prototype.updateItems=function(enclosingTagId, callBack)
{	
	$('#' + enclosingTagId + ' > label').remove(); // get rid of old labels

	for ( i = 0; i < quizTypes.length; ++i)
	{	
		var inputTag = this.addLabelWithRadioButton(i);
		
		// defines anonymous function which handles the onclick event of the radio buttons
		inputTag.click(function() {			
			indexOfRadioButtonClickedOn = $("input[name='question_type']:checked").val(); 
     			
			$("#user_input_type_of_question label").each(function() {
				
				var input = $(this).find('input');
				
				if(input.is(':checked')) 
				{					
					$(this).css("background", "#333");				
				}
				else
				{
					$(this).css("background", "#1C1C1C");				
				}
			});
			
			// Calls the Callback Function which is called askTheQuizQuestion (in this program)
			eval(callBack + "(indexOfRadioButtonClickedOn)"); 
		});
	}
}

// a class that makes and updates a drop down menu containing "items" as the options,
// the menu is enclosed by "enclosingTagId" and has "callback" as its onchange event.
function RadioButtons(enclosingTagId, callBack)
{	
	this.selectNode = $('#' + enclosingTagId);
	this.updateItems(enclosingTagId, callBack);
}

// Finds the question from quiz_types array in quiz.json file
function findQuestion(indexOfRadioButtonClickedOn)
{
	return quizTypes[indexOfRadioButtonClickedOn].question;
}

// Finds the sql query from quiz_types array in quiz.json file
function findSQLQuery(indexOfRadioButtonClickedOn)
{
	return quizTypes[indexOfRadioButtonClickedOn].sql_query;
}

// Replaces XXX with replacementString and returns it
function replaceXXXWithActual(stringWithXXX, replacementString)
{
	return stringWithXXX.replace('XXX',replacementString);
}

// makes a span tag, adds it to the parent, sets its text and returns it
// SpecificQuestion.prototype.makeSpanTag=function(parent, text, nameOfCSSClass)
function makeSpanTag(parent, text, nameOfCSSClass)
{
	var spanTag = $('<span />').text(text);
	
	parent.append(spanTag);
	
	if(nameOfCSSClass != '')
	{
		spanTag.attr({
			className: nameOfCSSClass
		});
	}
	
	return spanTag;
}

// Displays Red Message Under Text Field Submit Section
function displayErrorMessageInRed(parent, msg)
{
	parent.parent().attr('class', 'even_bigger');
	parent.find('span').remove();	
	var spanTag = makeSpanTag(parent, msg, 'left');
	spanTag.css('color', '#CC0033');
}

// adds labels along with their input field for the question
// assigns onclick event handler to callBack function
SpecificQuestion.prototype.addLabelWithTextField=function(indexOfRadioButtonClickedOn, randomCountryChosen, enclosingTagId, callBack)
{	
	var question = findQuestion(indexOfRadioButtonClickedOn);
	question = replaceXXXWithActual(question, randomCountryChosen);

	$('#' + enclosingTagId + ' > label').remove(); // get rid of old labels
	var labelTag = $('<label />');
	var inputTag = $('<input />');
	var spanTag  = makeSpanTag(labelTag, question, 'left');

	var textFieldAndButtonDiv = $('<div />');
	var button = $('<input />');

	button.attr({
	  type: 'submit',
		className: 'button',
		value: 'Submit'
	});
		
	labelTag.attr({
		className: 'bigger'
	});
	
	inputTag.attr({
	  type: 'text',
		name: 'question_type'
	});
	
	textFieldAndButtonDiv.append(inputTag).append(button);

	labelTag.append(textFieldAndButtonDiv);
	
	this.selectNode.append(labelTag);

	// Allows the user to press Enter in the input text field in order to Submit their answer! 
	inputTag.keyup(function(event){
	  if(event.keyCode == 13){
	    button.click();
	  }
	});
	
	// once user submits button, pass query and check to make sure answer is in response
	// if answer is correct, hide text field and button and display "Correct!"
	// if answer is incorrect, hide text field and button and display "Incorrect! Try again?"		
	button.click( function() {
		var textSubmitted = inputTag.val();
		if(textSubmitted != "")
		{
			sendQuery(indexOfRadioButtonClickedOn, randomCountryChosen, textFieldAndButtonDiv, inputTag);
		}
		else
		{
			textFieldAndButtonDiv.find('a').remove();
			displayErrorMessageInRed(textFieldAndButtonDiv, "Answer was left blank!");
		}
	});

	return inputTag;		
}

function SpecificQuestion(indexOfRadioButtonClickedOn, randomCountryChosen, enclosingTagId, callBack)
{
	this.selectNode = $('#' + enclosingTagId);	
	this.addLabelWithTextField(indexOfRadioButtonClickedOn, randomCountryChosen, enclosingTagId, callBack);
}

// Estimates Google Map Zoom Level based on Surface Area
function calculateZoomLevel(surfaceArea) 
{
	var zoomLevel = 8; // default zoom level
	
	if(surfaceArea < 1000)
	{
		zoomLevel = 9;
	}
	else if(surfaceArea < 45000)
	{
		zoomLevel = 7;
	}
	else if(surfaceArea < 200000)
	{
		zoomLevel = 6;
	}
	else if(surfaceArea < 350000)
	{
		zoomLevel = 5;
	}
	else if(surfaceArea < 3500000)
	{
		zoomLevel = 4;
	}
	else if(surfaceArea < 10000000)
	{
		zoomLevel = 3;
	}
	
	return zoomLevel;
}

// Draws World Map. Drawn Initially when Geography Quiz is Loaded.
function drawMapOfWorld()
{
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode( {'address': 'United States' }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK)
    {
      var latlng = new google.maps.LatLng(1, 1);
      var myOptions = {
        zoom: 1,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions); 
    }
  });
}

// Draws Google Map of Country passed in
function drawMapOfCountry(randomCountryChosen)
{
	// SELECT SurfaceArea FROM world.Country where Name = 'XXX';
	var surfaceAreaQueryFromJSON = SurfaceArea.sql_query;

	// Composes actual query - Replaces XXX in query with randomCountryChosen
	var surfaceAreaQuery = replaceXXXWithActual(surfaceAreaQueryFromJSON, randomCountryChosen);

	$.post(URL, { q: surfaceAreaQuery },
	function(data){	

		// Gets the list back in the XML response. For this query there is only one item in the response
		// list is a global variable which is used globally in the giveUp function
		var surfaceArea = $(data).find('item').text();
		var zoomLevel = calculateZoomLevel(surfaceArea);
		
		var geocoder = new google.maps.Geocoder();
	
		geocoder.geocode( {'address': randomCountryChosen }, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) 
			{
                          var lat = results[0].geometry.location.lat();
			  var lng = results[0].geometry.location.lng();

			  var latlng = new google.maps.LatLng(lat, lng);
			  var myOptions = {
			    zoom: zoomLevel,
			    center: latlng,
			    mapTypeId: google.maps.MapTypeId.ROADMAP
			  };

			  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
			}
		}); // ends function(results, status)

	}); // ends function(data)
	
}

// Asks the specific Quiz question. Chooses a random country.
function askTheQuizQuestion(indexOfRadioButtonClickedOn)
{
	// Choses a random country from SomeCountries (some_countries.json) file.
	var numRand = Math.floor(Math.random()*SomeCountries.length)
	var randomCountryChosen = SomeCountries[numRand];
	
	$('h2').text('Random country chosen: ' + randomCountryChosen); 

	$('#user_input_exact_question').hide();

	$('#map_canvas').hide();

	drawMapOfCountry(randomCountryChosen);
	
	var specificQuestion = new SpecificQuestion(indexOfRadioButtonClickedOn, randomCountryChosen, "user_input_exact_question", "checkTheAnswer");
	$('#user_input_exact_question').fadeIn(1300);
	$('#map_canvas').fadeIn(1300);
	
}

// Shows and Hides Message Blocks depending on how many quiz types are added in the quiz_types array in quiz.json
// This function's purpose is for UI enhancement and for displaying error messages which are based on the quiz.json data read in.
function showsAndHidesMesssageBlocksAndErrors(quizSubject, selectTypeH2, message)
{
	if(quizTypes != -1)
	{
		if(quizTypes.length == 0)
		{
			selectTypeH2.css('display', 'none');			
			message.css('color', 'red').text(quizSubject + " subject missing quiz_types in quiz.json!");
		}
		else if (quizTypes.length == 1)
		{
			message.css('display', 'none');
			selectTypeH2.css('display', 'none');			
		}
	}
	else
	{
		selectTypeH2.css('display', 'none');
		message.css('color', 'red').text(quizSubject + " subject doesn't exist in quiz.json!");		
	}
}

// finds the quiz_types array for the given quizSubject
// returns the quiz_types array of specified quizSubject
// returns -1 if quizSubject entered doesn't exist in JSON file
function findsQuizTypeArray(quizSubject) 
{
	for ( i = 0; i < Quiz.subjects.length; ++i)
	{	
		if(Quiz.subjects[i].name == quizSubject)
		{
			return Quiz.subjects[i].quiz_types;
		}
	}
	return -1;
}

// Modifies the dropdown list that has a select node with "id". Adds options to it
// from "stringArray". The string in each element of "stringArray" becomes one
// option in the dropdown list.
// onChangeFunctionToCall should be a string which is the function name to call 
// when a different select option is chosen. onChangeFunctionToCall can be left blank.

function makeQuizTypes(quizSubject)
{ 	
	var selectTypeH2 = $('h2');
	var message = $('h4#message');
	
	// finds the quizTypes array for a given quizSubject. quizTypes is a global variable
	quizTypes = findsQuizTypeArray(quizSubject);
	showsAndHidesMesssageBlocksAndErrors(quizSubject, selectTypeH2, message);
	
	var radioButtons = new RadioButtons("user_input_type_of_question", "askTheQuizQuestion");
        drawMapOfWorld();
}

makeQuizTypes("geography");

});
