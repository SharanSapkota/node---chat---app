const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')
const $sendLocationButton = document.querySelector('#send-location')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Options                                              //ignoreQueryPrefix is used to removie '?' in the string
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix:true})   //qs.parse is used to parse the string into objects

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    
   const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight+ newMessageMargin

    // Visible Height
    const VisibleHeight = $messages.offsetHeight

    // Height of Messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + VisibleHeight

    if( containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a') 
    })
    $messages.insertAdjacentHTML('beforeend',html) //adding in to the HTML document
    autoscroll()
})

socket.on('locationMessage',(message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
    username: message.username,
      url : message.url,
      createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})




socket.on('roomData', ({ room, users }) => {
   const html = Mustache.render(sidebarTemplate, {
       room,
       users
   })
   document.querySelector('#sidebar'). innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault() 

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

       if(error) {
           return console.log(error)
       }

       console.log("Message Delivered! ")
    })
    })

    $sendLocationButton.addEventListener('click', () => {

      

    if(!navigator.geolocation) {
        return alert('Your browser does not support geolocation!')
    }
    $sendLocationButton.setAttribute('disabled','Location disabled')

    navigator.geolocation.getCurrentPosition((position) => {

       

        socket.emit('sendLocation',{

           
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {

            $sendLocationButton.removeAttribute('disabled')

            if (error) {
                console.log('location was not shared')
            }
            console.log("the location was shared")
        })
    })
})


socket.emit('join', { username, room }, (error) => {

    if (error) {
        alert(error)
        location.href = '/'
    }

})        //it accepts the username and room

    
