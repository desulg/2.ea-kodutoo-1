var TYPER = function(){

	//singleton
    if (TYPER.instance_) {
        return TYPER.instance_;
    }
    TYPER.instance_ = this;

	// Muutujad
	this.WIDTH = window.innerWidth;
	this.HEIGHT = window.innerHeight;
	this.canvas = null;
	this.ctx = null;

	this.words = []; // kõik sõnad
	this.word = null; // preagu arvamisel olev sõna
	this.word_min_length = 3;
	this.guessed_words = 0; // arvatud sõnade arv

	//mängija objekt, hoiame nime ja skoori
	this.player = {name: null, score: 0};

	this.init();
};

TYPER.prototype = {

	// Funktsioon, mille käivitame alguses
	init: function(){

		// Lisame canvas elemendi ja contexti
		this.canvas = document.getElementsByTagName('canvas')[0];
		this.ctx = this.canvas.getContext('2d');

		// canvase laius ja kõrgus veebisirvija akna suuruseks (nii style, kui reso)
		this.canvas.style.width = this.WIDTH + 'px';
		this.canvas.style.height = this.HEIGHT + 'px';

		//resolutsioon 
		// kui retina ekraan, siis võib ja peaks olema 2 korda suurem
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;

		// laeme sõnad
		this.loadWords();
	}, 

	loadPlayerData: function(){

		// küsime mängija nime ja muudame objektis nime
		var p_name = prompt("Sisesta mängija nimi");

		// Kui ei kirjutanud nime või jättis tühjaks
		if(p_name === null || p_name === ""){
			p_name = "Tundmatu";
		
		}

		// Mänigja objektis muudame nime
		this.player.name = p_name; // player =>>> {name:"Romil", score: 0}
        console.log(this.player);
	},

	loadWords: function(){

        console.log('loading...');

		// AJAX http://www.w3schools.com/ajax/tryit.asp?filename=tryajax_first
		var xmlhttp = new XMLHttpRequest();

		// määran mis juhtub, kui saab vastuse
		xmlhttp.onreadystatechange = function(){

			//console.log(xmlhttp.readyState); //võib teoorias kõiki staatuseid eraldi käsitleda

			// Sai faili tervenisti kätte
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200){

                console.log('successfully loaded');

				// serveri vastuse sisu
				var response = xmlhttp.responseText;
				//console.log(response);

				// tekitame massiivi, faili sisu aluseks, uue sõna algust märgib reavahetuse \n
				var words_from_file = response.split('\n');
				//console.log(words_from_file);
                
                // Kuna this viitab siin xmlhttp päringule siis tuleb läheneda läbi avaliku muutuja
                // ehk this.words asemel tuleb kasutada typerGame.words
                
				//asendan massiivi
				typerGame.words = structureArrayByWordLength(words_from_file);
				console.log(typerGame.words);
				
				// küsime mängija andmed
                typerGame.loadPlayerData();

				// kõik sõnad olemas, alustame mänguga
				typerGame.start();
			}
		};

		xmlhttp.open('GET','./lemmad2013.txt',true);
		xmlhttp.send();
	}, 
	drawAll: function(){

		requestAnimFrame(window.typerGame.drawAll.bind(window.typerGame));
	},
	start: function(){

		// Tekitame sõna objekti Word
		this.generateWord();
		//console.log(this.word);

        //joonista sõna
		this.word.Draw('black');
/*----------------MEIE KOOD----------------*/
		// Kuulame klahvivajutusi
		window.addEventListener('keypress', this.keyPressed.bind(this));
		
		function countdown(element, minutes, seconds) {
			var time = minutes*60 + seconds;
			var interval = setInterval(function() {
				var el = document.getElementById(element);
				// if the time is 0 then end the counter
				if (time <= 0) {
					var text = "Mängu aeg on läbi!";
					el.innerHTML = text;
					setTimeout(function() {
						countdown('clock', 0, 50);
					}, 2000);
					clearInterval(interval);
					localStorage.setItem(typerGame.player.name, typerGame.player.score);
					window.location.replace("scores.html");
					return;
				}
				var minutes = Math.floor( time / 60 );
				if (minutes < 10) minutes = "0" + minutes;
				var seconds = time % 60;
				if (seconds < 10) seconds = "0" + seconds; 
				var text = minutes + ':' + seconds;
				el.innerHTML = text;
				time--;
			}, 1000);
		}
		countdown('clock', 0, 30);
	},
		

	
    generateWord: function(){

        // kui pikk peab sõna tulema, + min pikkus + äraarvatud sõnade arvul jääk 5 jagamisel
        // iga viie sõna tagant suureneb sõna pikkus ühe võrra
		var generated_word_length =  this.word_min_length + parseInt(this.guessed_words/5);
		//salvestan generated_word_lengthi sõnapikkuse, et saaks teises funktsioonis kasutada
		this.last_word_length = generated_word_length;

    	// Saan suvalise arvu vahemikus 0 - (massiivi pikkus -1)
    	var random_index = (Math.random()*(this.words[generated_word_length].length-1)).toFixed();

        // random sõna, mille salvestame siia algseks
    	var word = this.words[generated_word_length][random_index];
    	
    	// Word on defineeritud eraldi Word.js failis
        this.word = new Word(word, this.canvas, this.ctx);
    },
	
	updateScore: function(){
		div = document.getElementsByTagName('div')[1];
		div.innerHTML="Sinu skoor: " + this.player.score;
		localStorage.setItem(this.player.name, this.player.score);

	},

/*----------------MEIE KOOD----------------*/
	keyPressed: function(event){
		//alert(event.keyCode);
		//Backspace kui back nupu funktsioon keelatakse ära
		if(event.keyCode == 8){
			event.preventDefault();
		}

		//console.log(event);
		// event.which annab koodi ja fromcharcode tagastab tähe
		var letter = String.fromCharCode(event.which);
		//console.log(letter);

		// Võrdlen kas meie kirjutatud täht on sama mis järele jäänud sõna esimene
		//console.log(this.word);
		if(letter === this.word.left.charAt(0)){

			// Võtame ühe tähe maha
			this.word.removeFirstLetter();

			// kas sõna sai otsa, kui jah - loosite uue sõna

			if(this.word.left.length === 0){

				this.guessed_words += 1;

				//update player score
				this.player.score += this.last_word_length;
				this.updateScore();

				//loosin uue sõna
				this.generateWord();
			}

			//joonistan uuesti
			this.word.Draw('black');
		}else{
			/*----------------MEIE KOOD----------------*/
			//Vale klahvi vajutuse ajal
			this.word.Draw('red');
			this.player.score--;
			this.updateScore();
		}
	}
}
/*

function saveScore(){
	  localStorage.setItem(this.player.name, this.player.score);
	  document.getElementsByClassName('result').innerHTML = localStorage.getItem(this.player.name);
	  console.log(localStorage.getItem(this.player.score));

}
*/



/* HELPERS */
function structureArrayByWordLength(words){
    // TEEN massiivi ümber, et oleksid jaotatud pikkuse järgi
    // NT this.words[3] on kõik kolmetähelised

    // defineerin ajutise massiivi, kus kõik on õiges jrk
    var temp_array = [];

    // Käime läbi kõik sõnad
    for(var i = 0; i < words.length; i++){

        var word_length = words[i].length;

        // Kui pole veel seda array'd olemas, tegu esimese just selle pikkusega sõnaga
        if(temp_array[word_length] === undefined){
            // Teen uue
            temp_array[word_length] = [];
        }

        // Lisan sõna juurde
        temp_array[word_length].push(words[i]);
    }

    return temp_array;
}


function startGame(){
	div = document.getElementsByTagName('div')[0];
	div.style.display="none";
	var typerGame = new TYPER();
	window.typerGame = typerGame;	
}



/*function endGame () {
	let r = confirm('Mäng on läbi');
	if (r == true) {
		window.typer.guessed_words = 0
		window.typer.score = 0
	} else {
		window.location.href = ''
	}
}
*/

function generateScoreTable(){
	for (var i = 0, len = localStorage.length; i < len; ++i) {
		    let tableRow = document.createElement("tr")
		    let th = document.createElement("th")
		    let textNodeKey = document.createTextNode(localStorage.key(i))
		    th.appendChild(textNodeKey)
		    let td = document.createElement("td")
		    let textNodeValue = document.createTextNode(localStorage.getItem(localStorage.key(i)))
		    td.appendChild(textNodeValue)
		    tableRow.appendChild(th)
		    tableRow.appendChild(td)
		    document.getElementById("scoreTableBody").appendChild(tableRow)
	}
}




