
const debounce = (func, delay) => { //will take an argument of a function | for when need to rate limit
    // the delay argument will be the # of ms that want to wait before fetching
    let timeoutId;
    return (...args) => { //this function is the "wrapper". It's implement the shield that guards how often it can be invoked. |
                    // the "...args" is passing arguments being passed through the func 
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(null, args); //the 'apply' function essentially says call the function as normally would, but take all of the arguments and pass them in as separate arguments to to the original
        }, delay)
    };
};