// Event Listeners

document.querySelector('#search-form').addEventListener('submit', (e) => {
    e.preventDefault()
    searchForBrewery(e.target.query.value)
})

// append breweries for page load
document.addEventListener('DOMContentLoaded', () => {
    getBreweries()
    getSavedBreweriesLength()

})

// event listener for adding saved breweries
document.querySelector('#saved-breweries').addEventListener('click', (e) => {
    removeBreweriesOnPage();
    const h1 = document.querySelector('#breweries');
    h1.textContent = 'My Saved Breweries';
    getSavedBreweries()
})

// Supplementary Functions

function createBreweryObj(brewery) {
    // instantiates a brewery object
    const breweryObj = {
        name: brewery.name,
        phoneNumber: brewery.phone,
        street: brewery.street,
        city: brewery.city,
        state: brewery.state,
        zip: brewery.postal_code,
        website: brewery.website_url
    }
    // uses the object as a parameter in the createBrewCard function
    createBrewCard(breweryObj)
}

function parseAddress(address) {
    // take in an address and return am array of it's individual components
    let parsedAddress = (address).slice(9)
    // separate all elements except state and zip
    parsedAddress = parsedAddress.split(',')
    // create an array separating state and zip as well as the space before them
    parsedAddress[2] = parsedAddress[2].split(' ')
    // get rid of the space before state that was inserted with my post to DOM
    parsedAddress[1] = parsedAddress[1].replace(' ', '')
    return parsedAddress
}

function createObjWithParsedCard(array) {
    // create obj with parsed card data
    const parsedCardObj = {
        name: array[0],
        phoneNumber: array[1],
        street: array[2],
        city: array[3],
        state: array[4],
        zip: array[5],
        website: array[6]
    }
    // post favorite breweries to local db.json
    postBreweries(parsedCardObj)
}

// DOM Manipulators

function removeBreweriesOnPage() {
    // remove all elements that were pre-loaded on the page before creating new cards
    const divCard = document.querySelector('#brewery-collection');
    let child = divCard.lastElementChild;
    // re-assign lastElementChild to the last element in divCard, then re-run the removal till there are none left amd child returns null
    while (child){
        divCard.removeChild(child)
        child = divCard.lastElementChild;
    }
}

function createBrewCard(breweryObj) {
    // create a card with name, address, website, and phone number to append to the site
    const breweryCollection = document.querySelector('#brewery-collection');
    const div = document.createElement('div')
    div.className = 'card';
    const name = document.createElement('h3');
    const phoneNumber = document.createElement('p')
    const address = document.createElement('p')
    const website = document.createElement('a')
    const saveButton = document.createElement('button')

    // create text Content for each element
    name.textContent = breweryObj.name;
    phoneNumber.textContent = `Phone Number: ${breweryObj.phoneNumber}`;
    address.textContent = `Address: ${breweryObj.street}, ${breweryObj.city}, ${breweryObj.state}` + ` ${breweryObj.zip}`
    website.textContent = breweryObj.website;
    saveButton.textContent = "Save Brewery!";

    // make the website a hyperlink
    website.href = breweryObj.website

    // give each tag a unique class name so they can be accessed by the parseCard function
    name.className = 'name';
    phoneNumber.className = 'phone';
    address.className = 'address';
    website.className = 'website';

    //append to page
    breweryCollection.append(div)
    div.append(name, phoneNumber, address, website, saveButton)

    // parse the data from the card that was clicked so it can be saved as an obj to the db
    saveButton.addEventListener('click', (e) => {
        createParsedCardArray(e.path[1])
        // add 1 to the number of saved breweries in the saved breweries button
        getSavedBreweriesLength()
    })

}

function createParsedCardArray(card) {
    // grab each element so I can parse their text content
    const name = card.querySelector('.name');
    const phoneNumber = card.querySelector('.phone');
    const address = card.querySelector('.address');
    const website = card.querySelector('.website');

    // parsed values for those who have redundant data
    const parsedPhoneNumber = (phoneNumber.textContent).slice(14)
    const addressArray = parseAddress(address.textContent)

    // input all parsed values into array
    const arrayOfCardElements = [name.textContent, parsedPhoneNumber, addressArray[0], addressArray[1], addressArray[2][1], addressArray[2][2],website.textContent]

    // call object function to create objects to be posted
    createObjWithParsedCard(arrayOfCardElements)
}

// Server Requests

function getBreweries() {
    fetch(`https://api.openbrewerydb.org/breweries/?_limit=6`)
        .then(resp => resp.json())
        .then(breweries => breweries.forEach(brewery => createBreweryObj(brewery)))
}

function searchForBrewery(brewery) {
    fetch(`https://api.openbrewerydb.org/breweries/search?query=${brewery}`)
        .then(resp => resp.json())
        .then(breweries => {
            removeBreweriesOnPage()
            breweries.forEach(brewery => createBreweryObj(brewery))
        })
}

function postBreweries(breweryObj) {
    fetch('http://localhost:3000/saved_breweries', {
        method: 'POST',
        headers:
        {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(breweryObj)
    })
} 

function getSavedBreweries() {
    fetch('http://localhost:3000/saved_breweries')
        .then(resp => resp.json())
        .then(savedBreweries => {
            savedBreweries.forEach(brewery => createBrewCard(brewery))
        })
}

function getSavedBreweriesLength() {
    fetch('http://localhost:3000/saved_breweries')
        .then(resp => resp.json())
        .then(breweries => {
            // grab savedBreweries button and enter in the amount of saved breweries
            const savedBreweriesButton = document.querySelector('#saved-breweries');
            savedBreweriesButton.textContent = `Saved Breweries (${breweries.length})`
        })
}


// search for a brewery
