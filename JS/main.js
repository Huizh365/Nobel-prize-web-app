// get elements
const urlMain = 'https://api.nobelprize.org/2.1/laureates?limit=500'
const errorMessage = document.getElementById('errorMessage')
const nameInput = document.getElementById('nameInput')
const motivInput = document.getElementById('motivInput')
const categoryInput = document.getElementById('categoryInput')
const yearInput = document.getElementById('yearInput')
const searchBtn = document.getElementById('searchBtn')
const result = document.getElementById('result')

//click search button 
searchBtn.addEventListener('click', async (e)=>{
    e.preventDefault()
    result.innerHTML = ``
    showErrorMessage (``)
    toggleResult(result)

    //get input values
    const nameValue = getInputValue(nameInput)
    const motivValue = getInputValue(motivInput)
    const categoryValue = getInputValue(categoryInput)
    const yearValue = getInputValue(yearInput)

    //check if any search condition
    if(!nameValue && !motivValue && !categoryValue && !yearValue) {
        showErrorMessage (`Please enter at least one search condition.`)
        return
    }

    //Url based on input values
    const fetchUrl = getUrl(yearValue, nameValue, categoryValue, motivValue)
    if (!fetchUrl) return

    //fetch data and show info 
    try {
        const data = await fetchData(fetchUrl)
        showLaureates(data.laureates)
        console.log(data.laureates)
    } catch (error) {
        console.error("Error fetching laureates:", error)
        result.innerHTML = `<p>Something went wrong, please try again later.</p>`
    }

    toggleResult(result)
})


/*************** functions ***************/

function getInputValue(input) {
    return input.value.trim()
}

//get category abbreviation
function checkCategory(categoryValue) {
    let category = ''
    switch (categoryValue) {
        case 'chemistry':
            category = 'che'
            break
        case 'economic sciences':
            category = 'eco'
            break
        case 'literature':
            category = 'lit'
            break
        case 'peace':
            category = 'pea'
            break
        case 'physics':
            category = 'phy'
            break
        case 'physiology or medicine':
            category = 'med'
    } 
    return category
}

// year validation
function validateYear (yearValue) {
    const thisYear = new Date().getFullYear()
    if (yearValue < 1901 || yearValue > thisYear) {
        showErrorMessage (`Invalid year, it should be between 1901 and ${thisYear}`) 
        return false
    } else {
        return true
    }
}

function showErrorMessage (message) {
    errorMessage.innerText = message
}

//create url based on input values
function getUrl (yearValue, nameValue, categoryValue, motivValue) {
    if (yearValue && !validateYear(yearValue)) {return null}

    let url = urlMain
    if (nameValue) {url += `&name=${encodeURIComponent(nameValue)}`}
    if (categoryValue) {url += `&nobelPrizeCategory=${checkCategory(categoryValue)}`}
    if(motivValue) {url += `&motivation=${encodeURIComponent(motivValue)}`}
    if(yearValue) {url += `&nobelPrizeYear=${yearValue}`}
    return url 
}

async function fetchData(url) {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error (`HTTP error status: ${response.status}, HTTP error message: ${response.statusText}`)
    }
    return response.json();
} 


function showLaureates (laureates) {
    if (!laureates || laureates.length === 0) {
        result.innerHTML = `<p>No laureates found.</p>`
        return
    }
    
    laureates.forEach(laureate => {
        const laureateName = laureate.knownName ? laureate.knownName.en : laureate.orgName.en
        const nobelPrizes = laureate.nobelPrizes
            if(laureateName) {
                result.innerHTML += `
                <div class="laureate">
                    <a href="#" class="laureateName" onclick="showExtraInfo(event, 'person-${laureate.id}')">${laureateName}</a>
                    <div class="extraInfo" id="person-${laureate.id}">${getExtraInfo(laureate)}</div>
                    <div class="prizesList" id="prizes-${laureate.id}"></div>
                </div>
                `
                const prizesList = document.getElementById(`prizes-${laureate.id}`)
                nobelPrizes.forEach(prize => {
                    prizesList.innerHTML += `
                        <p class="yearAndCategory">${prize.categoryFullName.en} ${prize.awardYear}</p>
                        <p class="prizePortion"><strong>Prize share:</strong> ${prize.portion}</p>
                        <p class="motive"><strong>Prize motivation:</strong> ${prize.motivation.en}</p>
                    ` 
                });
            }
        })
    }

//get more info (when clicking the laureate's name)
function getExtraInfo (laureate) {
    if (laureate.founded) {
        const foundedTime = `<p class="foundedDetail foundedTime"><strong>Founded:</strong> ${getFoundedYear(laureate)}</p>`
        const foundedCountry = laureate.founded.place.country ? `<p class="foundedDetail"><strong>Country:</strong> ${laureate.founded.place.country.en}</p>` : ''
        return foundedTime + foundedCountry
    } else if (laureate.birth) {
        console.log(laureate)
        const fullName = `<p class="fullName"><strong>Full name:</strong> ${laureate.fullName.en}</P>`
        const birthInfo = `<p class="birthInfo"><strong>Birth:</strong> ${laureate.birth.date}, ${laureate.birth.place.country.en}</p>`
        const deathInfo = laureate.death ? `<p class="deathInfo"><strong>Death:</strong> ${laureate.death.date},  ${laureate.death.place?.country?.en || ''}</p>`: ''
        return fullName + birthInfo + deathInfo
    } else {
        return `<p class="noInfo">No additional information available.</p>`
    }
}

//get the year from founded date info
function getFoundedYear(laureate) {
    if (laureate.founded.date) {
        const foundedDate = laureate.founded.date
        const foundedYear = parseInt(foundedDate.slice(0, 4))
        if (!isNaN(foundedYear)) {
            return foundedYear
        } else {
            console.log(`Couldn't parsing year from date: ${foundedYear}`)
        }
    }
    return `No information`
}


function showExtraInfo (event, laureateID) {
    event.preventDefault()
    const extraInfo = document.getElementById(`${laureateID}`)
    extraInfo.classList.toggle("show")
}


function toggleResult (element) {
    element.classList.toggle("show", element.children.length > 0)
}
