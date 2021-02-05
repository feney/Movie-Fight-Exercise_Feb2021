const autoCompleteConfig = { //stripping out every function that's reusable from the creatAutoComplete method
    //could reuse everything except the 'root' element
    renderOption(movie) { //passing in a second property
        const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster; //ternary expression to avoid showing broken image links
        return `
            <img src="${imgSrc}" />
            ${movie.Title}
            `;
        // the html shown for each
    }, 
    inputValue(movie) { //another helper function | purpose is to populate the input field with the movie that's selected
        return movie.Title;
    },
    async fetchData(searchTerm) { //removed the arrow once cut from the autocomplete file
        const response = await axios.get('http://www.omdbapi.com/', {
            params: { //will contain all the different query string parameters to pass along with the request
                apikey:'70a9df85',
                // s: 'avengers' // if wanted to do a search operation
                // i: 'tt0848228', // is a lookup operation; in this, lookup up imdb for avengers
                s: searchTerm
            }
        });
    
        if (response.data.Error) { //if search doesnt turn up, this is returned by the API
            return [];
        }
        //console.log(response.data); //property that only care about is the ".data" property 
        return response.data.Search; //we only need to return the "search" property that's returned in the fetch
    }
};

createAutoComplete({ //configuration object
    ...autoCompleteConfig, //elipses will make a copy of everything inside that object
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie) { //formerly a property of autoCompleteConfig
        document.querySelector('.tutorial').classList.add('is-hidden') //hides the tutorial upon search of a movie
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left'); //passing in a second elemenet to reference where to render the summary to | added a last variable 'left'
    },
    
});
createAutoComplete({ //configuration object
    ...autoCompleteConfig, //elipses will make a copy of everything inside that object
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(movie) { //formerly a property of autoCompleteConfig
        document.querySelector('.tutorial').classList.add('is-hidden') //hides the tutorial upon search of a movie
        onMovieSelect(movie, document.querySelector('#right-summary'), 'right');  //passing in a second elemenet to reference where to render the summary to | added a last variable 'right'
    }
    
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => { //using an async function to allow for await syntax and axios to make the follow up request
    const response = await axios.get('http://www.omdbapi.com/', {
        params: { //will contain all the different query string parameters to pass along with the request
            apikey:'70a9df85',
            i: movie.imdbID //the movie, imdbID
        }
    });

    //once split into dual return, dropped the querySelector(#summary) before innerHTML
    summaryElement.innerHTML = movieTemplate(response.data); //appending HTML from below helper function

    if (side === 'left') {
        leftMovie = response.data;
    } else {
        rightMovie = response.data;
    }
    
    if (leftMovie && rightMovie) { // adding a check to verify if both movies are defined
        runComparison(); // placing all the code for doing this comparison into a helper function called 
    }
};

const runComparison = () => { //the helper function for onMovieSelect()
    // it's clear that we need a way to reach into the DOM to select the 'awards' element on both sides of the screen
    const leftSideStats = document.querySelectorAll(
        '#left-summary .notification'
    );
    
    const rightSideStats = document.querySelectorAll(
        '#right-summary .notification'
    );
  
    //can now loop over each the "leftSideStats" and the "rightSideStats"
    leftSideStats.forEach((leftStat, index) => { //iterate over each element. Will get callback function and then receive each article element | will get index of each stat to get the corresponding element from the right side
        const rightStat = rightSideStats[index];
    
        //console.log(leftStat, rightStat);

        const leftSideValue = parseFloat(leftStat.dataset.value);//we called the data property values "-value"
        const rightSideValue = parseFloat(rightStat.dataset.value);

        //comparison between left and ride side value
        if (rightSideValue > leftSideValue) {
            // would turn the left side yellow if true
            leftStat.classList.remove('is-primary'); //"leftStat" which is the actual article element
            leftStat.classList.add('is-warning');
        } else {
            rightStat.classList.remove('is-primary');
            rightStat.classList.add('is-warning')

        }
    });
    

};


// to aid in calculation comparing the values, should add in a data property to each article and make the data property a numerical version
// a helper function
const movieTemplate = (movieDetail) => {
    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g,'').replace(/,/g,'')) //this was a string, want to remove $ and commas
    //^ because $ sign is a protected value, backslash to escape it
    const metascore = parseInt(movieDetail.Metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g,''));

    //**IN THIS INSTANCE, USING THE 'REDUCE' FUNCTION IN LIEU OF FOR EACH */
    const awards = movieDetail.Awards.split(' ').reduce((prev, word) => { //splitting on space which populates into an array, then iterate through the array and for every number, add numbers
        const value = parseInt(word);

        if (isNaN(value)) {//"isNaN" is a function built into the browser
            return prev;
        } else {
            return prev + value;
        }
    }, 0);
    //**END */

    //**CODE TO STRIP STRING AND ADD THE NUMBERS */
    // let count = 0;
    // const awards = movieDetail.Awards.split(' ').forEach((word) => { //splitting on space which populates into an array, then iterate through the array and for every number, add numbers
    //     const value = parseInt(word);

    //     if (isNaN(value)) {//"isNaN" is a function built into the browser
    //         return;
    //     } else {
    //         count = count + value;
    //     }
    // });
    //**END STRING COUNT */
       


    // writing out html that will get plugged into the html
    return ` 
        <article class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="${movieDetail.Poster}"/>
                </p>
            </figure>
            <div class="media-content">
                <div class="content">
                    <h1>${movieDetail.Title}</h1>
                    <h4>${movieDetail.Genre}</h4>
                    <p>${movieDetail.Plot}</p>
                </div>
            </div>
        </article>
        <article data-value=${awards} class="notification is-primary">
            <p class="title">${movieDetail.Awards}</p>
            <p class="subtitle">Awards</p>
        </article>
        <article data-value=${dollars} class="notification is-primary">
            <p class="title">${movieDetail.BoxOffice}</p>
            <p class="subtitle">Box Office</p>
        </article>
        <article data-value=${metascore} class="notification is-primary">
            <p class="title">${movieDetail.Metascore}</p>
            <p class="subtitle">Metascore</p>
        </article>
        <article data-value=${imdbRating} class="notification is-primary">
            <p class="title">${movieDetail.imdbRating}</p>
            <p class="subtitle">IMDB Rating</p>
        </article>
        <article data-value=${imdbVotes} class="notification is-primary">
            <p class="title">${movieDetail.imdbVotes}</p>
            <p class="subtitle">IMDB Votes</p>
        </article>
    `;
};

