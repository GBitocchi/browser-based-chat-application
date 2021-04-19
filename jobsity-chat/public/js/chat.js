const socket = io()
const $msgForm = document.querySelector("#user")
const $msgForInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')
const $messages = document.querySelector("#messages")
const msgtemplate = document.querySelector("#msg-template").innerHTML
const sidebartemplate = document.querySelector('#user-rooms').innerHTML

const { username, password, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newmsg = $messages.lastElementChild
    const newmsgStyles = getComputedStyle($newmsg)

    const newMsgMargin = parseInt(newmsgStyles.marginBottom)
    const newmsgheight = $newmsg.offsetHeight + newMsgMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeght = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeght - newmsgheight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on("message", (messagesRoom) => {
    $messages.innerHTML = "";

    for (const msg of messagesRoom.messages) {
        const html = Mustache.render(msgtemplate, {
            username: msg.username,
            msg: msg.text,
            createdAt: moment(msg.createdAt).format('h:m A, DD MMM,YYYY')
        })

        $messages.insertAdjacentHTML("beforeend", html)
        autoscroll()
    }
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$msgForm.addEventListener("submit", (e) => {
    e.preventDefault()

    $msgFormButton.setAttribute('disabled', 'disabled')
    let msg = document.querySelector("input").value

    socket.emit("sendMessage", { username, msg }, (error) => {
        $msgFormButton.removeAttribute('disabled')
        $msgForInput.value = ''
        $msgForInput.focus()
        if (error) {
            return console.log(error)
        }
    })
})

socket.emit('join', { username, password, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})


