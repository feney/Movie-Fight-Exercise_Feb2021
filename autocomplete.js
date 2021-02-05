// intent of this code is to make it generic in nature / removing reference to movies
const createAutoComplete = ({ 
    root, 
    renderOption, 
    onOptionSelect, 
    inputValue,
    fetchData }) => { //the config object will have the custom functions that specify how the AutoComplete should work
    // above, also destructured off the 'renderOption' function
    // bc root is provided as an option, no longer has to determine where to render --> const root = document.querySelector('.autocomplete'); //destructuring the property out | creating the dropdown widgets | encapsulates everything involving the autocomplete
    root.innerHTML = `
        <label><b>Search</b></label>
        <input class="input" />
        <div class="dropdown">
            <div class="dropdown-menu">
                <div class="dropdown-content results"></div>
            </div>
        </div>
    `; //moving hefty bit of HTML to JS to reduce degree of coupling

    // fetchData(); //commented out as no longer want to search the API automatically when first start
    //instead of looking at entire 'document' am looking at the root element 
    const input = root.querySelector('input');
    const dropdown = root.querySelector('.dropdown');
    const resultsWrapper = root.querySelector('.results'); //will wrap all of the rendered results

    const onInput = async event => {
            const items = await fetchData(event.target.value); //is whatever the user typed into this input  
            //fetch data is an async function, while "fetchData(...) is treating as a sync function | need to add "await" keyword"
            
            if (!items.length) { //if there are no movies
                dropdown.classList.remove('is-active');
                return; //considering list is empty, don't want to render elements below
            }
            resultsWrapper.innerHTML = ''; //clears dropdown menu when empty input field
            dropdown.classList.add('is-active'); //will do this right after fetching all of the data, open the dropdown, and add all of the movies to it.
            for (let item of items) { //to iterate over the returned movies list
                const option  = document.createElement('a'); //added an anchor alement = 'a' instead of 'div'
              
                option.classList.add('dropdown-item');
                option.innerHTML = renderOption(item);
                option.addEventListener('click', () => { //adding a click event handler to the 'option' variable, which is an anchor element.
                    dropdown.classList.remove('is-active'); //close the dropdown
                    input.value = inputValue(item); //rather than calling " = movie.Title" | to change the value inside of an existing input | updating to title that user just clicked on
                   onOptionSelect(item); //changed name of callback to current --> onMovieSelect(movie); //a helper function to fetch additional data on a particular movie.
                });

                resultsWrapper.appendChild(option);
            }


    };

    input.addEventListener('input', debounce(onInput, 500)); //the 'input' event listener is triggerd when the text inside that input is changed

    // ***** TO CLOSE THE DROPDOWN UPON CLICKING ON CERTAIN ELEMENTS *********
    document.addEventListener('click', event => {
        if (!root.contains(event.target)) { //if 'root' which contains distinct elements, then close the dropdown
            dropdown.classList.remove('is-active'); // remove the "dropdown.classList.add('is-active') to close the dropdown"
        }
    }); //adding a global event listener to the document
    // in JS, event bubble which means that if some element contained inside the document. If not handled, will bubble all way up to top document

};