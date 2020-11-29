let socket = io('/host');

window.addEventListener('load', () => {
console.log("Window Loaded")
})

socket.on('answers', (data)=> {
})

socket.on('playJoined', (data)=> {
    console.log(data);
})