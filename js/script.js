console.log('javascript')
let currentSong = new Audio();
let songs;
let currentFolder;

function formatSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Promise</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div></li>`;
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playMusic = (track, pause=false) => {

    currentSong.src = `/${currentFolder}/` + track
    if(!pause){
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                                fill="none">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" fill="#000"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="songs/${folder}/thumbnail.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
        
    }

    //Add an event listener for trending songs CARD
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
            playMusic(songs[0])
        })
    })
}

async function main() {
    //Get the list of all the songs
    await getSongs("songs/kumasagar");

    playMusic(songs[0], true);

    displayAlbums();

    //Attach an event listener to Play, next and previous.
    play.addEventListener("click", () => {
        let playpausebtn = document.querySelector('.playnow>img');

        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
            playpausebtn.src = "img/pause.svg";
        }

        else {
            currentSong.pause();
            play.src = "img/play.svg";
            playpausebtn.src = "img/play.svg";
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let circleCal = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = circleCal + "%";
        currentSong.currentTime = (currentSong.duration * circleCal)/100;
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })

    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-100%";  
    })

    //Add an event listener for prev button
    prev.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
        else {
            playMusic(songs[songs.length-1])
        }
    })

    //Add an event listener for next button
    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
        else {
            playMusic(songs[0])
        }
    })

    //Add an event listener for Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentSong.volume = parseInt(e.target.value)/100;
    })

    //Add an event listenr to Mute the track
    volumebtn.addEventListener("click", (e)=>{
        let vol = e.target.src.split("/").slice(-1)[0]

        if(vol == "volume.svg"){
            volumebtn.src = "img/mute.svg"
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            volumebtn.src = "img/volume.svg";
            currentSong.volume = 0.10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })
    
}

main()