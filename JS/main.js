// get elements
const url1 = 'https://api.nobelprize.org/2.1/laureates?limit=500'
const errorMessage = document.getElementById('errorMessage')
const nameInput = document.getElementById('nameInput')
const motivInput = document.getElementById('motivInput')
const categoryInput = document.getElementById('categoryInput')
const yearInput = document.getElementById('yearInput')
const searchBtn = document.getElementById('searchBtn')
const result = document.getElementById('result')

//search button
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

    if(!nameValue && !motivValue && !categoryValue && !yearValue) {
        showErrorMessage (`Please enter at least one search condition.`)
        return
    }

    const fetchUrl = getUrl(yearValue, nameValue, categoryValue, motivValue)

    try {
        const data = await fetchData(fetchUrl)
        showLaureates(data.laureates)
    } catch (error) {
        // console.error("Error fetching laureates:", error)
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
            break;
        case 'economic sciences':
            category = 'eco'
            break;
        case 'literature':
            category = 'lit'
            break;
        case 'peace':
            category = 'pea'
            break;
        case 'physics':
            category = 'phy'
            break;
        case 'physiology or medicine':
            category = 'med'
    } 
    return category
}

// year validation
function validateYear (yearValue) {
    const thisYear = new Date().getFullYear()
    if (yearValue < 1901 || yearValue > thisYear) {
        showErrorMessage (`Invalid year, it should be between 1901 and this year`) 
        return false
    } else {
        return true
    }
}


function showErrorMessage (message) {
    errorMessage.innerText = message;
}

//create url based on the input values
function getUrl (yearValue, nameValue, categoryValue, motivValue) {
    let url = url1
    if (nameValue) url += `&name=${nameValue}`
    if (categoryValue) url += `&nobelPrizeCategory=${checkCategory(categoryValue)}&`
    if(motivValue) url += `&motivation=${motivValue}&`
    if(yearValue && validateYear (yearValue)) url += `&nobelPrizeYear=${yearValue}&`   
    return url 
}


async function fetchData(url) {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error (`HTTP error status: ${response.status}`)
    }
    return response.json();
} 


function showLaureates (laureates) {
    if (!laureates || laureates.length === 0) {
        result.innerHTML = `<p>No laureates found.</p>`
        return
    }
    console.log(laureates)
    for (let i = 0; i < laureates.length; i++) {
        const laureate =  laureates[i]
        const laureateName = laureate.fullName ? laureate.fullName.en : laureate.nativeName
        const nobelPrize = laureate.nobelPrizes
        for (let j = 0; j < nobelPrize.length; j++) {
            if(laureateName) {
                result.innerHTML += `
                <div class="laureate">
                    <a href="#" class="laureateName">${laureateName}</a>
                    <div class="extraInfo">
                        ${laureate.birth ? `
                            <p><strong>Birth:</strong> ${laureate.birth.date}, ${laureate.birth.place.country.en}</p>
                            <p><strong>Death:</strong> ${laureate.death ? `${laureate.death.date}, ${laureate.death.place.country.en}` : "N/A"}</p>
                        ` : laureate.founded ? `
                            <p><strong>Founded:</strong> ${laureate.founded.date}</p>
                            <p><strong>Country:</strong> ${laureate.founded.place.country.en}</p>
                        ` : `
                            <p>No additional information available.</p>
                        `}
                         <p class="prizePortion">Prize share: ${nobelPrize[j].portion} </P>                
                    </div>
                    
                    <div class="laureateDetail">
                        <p class="yearAndCategory">${nobelPrize[j].categoryFullName.en} ${nobelPrize[j].awardYear}</p>
                        <p class="motive">Prize motivation: ${nobelPrize[j].motivation.en}</p>
                    </div>
                </div>
            `
            }
        }
    }
}

/*
        
        // showExtraInfo(e)

        // function showExtraInfo (e) {
        //     e.preventDefault()
        //     const extraInfo = e.target.nextElementSibling
        //     const personInfo = document.getElementsByClassName("personInfo")[0]
        //     const orgInfo = document.getElementsByClassName("orgInfo")[0]
        //     extraInfo.classList.add("show")
        //     if(laureate.fullName) {
        //         personInfo.classList.add("show")
        //     } else {
        //         orgInfo.classList.add("show")
        //     }

        // }

    }      
}

*/

function toggleResult (element) {
    element.classList.toggle("show", element.children.length > 0)
}
