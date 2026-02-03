// Music System
const playlist = [
    {
        name: "Cosmic Birthday",
        src: "https://assets.mixkit.co/music/preview/mixkit-space-game-668.mp3",
        type: "audio/mp3"
    },
    {
        name: "Happy Birthday (Orchestral)",
        src: "https://assets.mixkit.co/music/preview/mixkit-happy-birthday-60.mp3",
        type: "audio/mp3"
    },
    {
        name: "Magical Celebration",
        src: "https://assets.mixkit.co/music/preview/mixkit-magical-sunrise-29.mp3",
        type: "audio/mp3"
    },
    {
        name: "Starlight Melody",
        src: "https://assets.mixkit.co/music/preview/mixkit-starlight-melody-19.mp3",
        type: "audio/mp3"
    },
    {
        name: "Party Time",
        src: "https://assets.mixkit.co/music/preview/mixkit-funky-party-221.mp3",
        type: "audio/mp3"
    }
];

let currentSongIndex = 0;
let isPlaying = true;
let isMuted = false;
let audioContext;
let analyser;
let source;
let dataArray;

// Initialize audio system
function initMusicSystem() {
    const audio = document.getElementById('bg-music');
    
    // Create multiple audio sources for playlist
    playlist.forEach((song, index) => {
        const audioSource = document.createElement('source');
        audioSource.src = song.src;
        audioSource.type = song.type;
        if(index === 0) {
            audio.appendChild(audioSource);
        }
    });
    
    // Setup audio context for visualizer
    setupAudioVisualizer();
    
    // Start with first song
    loadSong(0);
    
    // Auto-play (with user gesture)
    document.addEventListener('click', () => {
        if(audio.paused && isPlaying) {
            audio.play();
        }
    }, { once: true });
    
    // Song ended - play next
    audio.addEventListener('ended', () => {
        playNextSong();
    });
    
    // Update progress bar
    audio.addEventListener('timeupdate', updateProgressBar);
    
    // Add visualizer bars
    createVisualizer();
    
    // Start floating notes
    startFloatingNotes();
}

// Setup Web Audio API for visualization
function setupAudioVisualizer() {
    const audio = document.getElementById('bg-music');
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaElementSource(audio);
        
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        updateVisualizer();
    } catch (e) {
        console.log("Web Audio API not supported:", e);
    }
}

// Create visualizer bars
function createVisualizer() {
    const visualizer = document.createElement('div');
    visualizer.className = 'music-visualizer';
    visualizer.id = 'visualizer';
    
    for(let i = 0; i < 8; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        bar.style.height = '10px';
        visualizer.appendChild(bar);
    }
    
    document.body.appendChild(visualizer);
}

// Update visualizer animation
function updateVisualizer() {
    if(!analyser || !dataArray) return;
    
    const visualizerBars = document.querySelectorAll('.visualizer-bar');
    const audio = document.getElementById('bg-music');
    
    function animate() {
        if(!audio.paused) {
            analyser.getByteFrequencyData(dataArray);
            
            visualizerBars.forEach((bar, index) => {
                const value = dataArray[index * 4] || 0;
                const height = Math.max(10, value / 2);
                bar.style.height = `${height}px`;
                
                // Change color based on frequency
                const hue = (value / 255) * 300;
                bar.style.background = `linear-gradient(to top, 
                    hsl(${hue}, 100%, 50%), 
                    hsl(${hue + 60}, 100%, 50%))`;
            });
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Floating music notes animation
function startFloatingNotes() {
    setInterval(() => {
        if(!isPlaying) return;
        
        const notes = ['🎵', '🎶', '🎼', '✨', '🎂', '🎉', '🎁', '🌟'];
        const note = document.createElement('div');
        note.className = 'floating-note';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.left = `${Math.random() * 100}vw`;
        note.style.fontSize = `${Math.random() * 20 + 20}px`;
        note.style.animationDuration = `${Math.random() * 2 + 2}s`;
        
        document.body.appendChild(note);
        
        setTimeout(() => {
            note.remove();
        }, 3000);
    }, 500);
}

// Load a specific song
function loadSong(index) {
    if(index < 0 || index >= playlist.length) return;
    
    currentSongIndex = index;
    const audio = document.getElementById('bg-music');
    const song = playlist[index];
    
    // Update audio source
    audio.src = song.src;
    
    // Update UI
    document.getElementById('currentSong').textContent = song.name;
    document.getElementById('playlist').value = index;
    
    // Play if music was playing
    if(isPlaying) {
        audio.play().catch(e => console.log("Auto-play prevented:", e));
    }
}

// Play next song
function playNextSong() {
    const nextIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(nextIndex);
}

// Update progress bar
function updateProgressBar() {
    const audio = document.getElementById('bg-music');
    const progress = document.querySelector('.progress');
    
    if(audio.duration) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${percentage}%`;
        progress.style.animation = 'none';
    }
}

// Music Controls Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Play button
    document.getElementById('playBtn').addEventListener('click', () => {
        const audio = document.getElementById('bg-music');
        audio.play();
        isPlaying = true;
    });
    
    // Pause button
    document.getElementById('pauseBtn').addEventListener('click', () => {
        const audio = document.getElementById('bg-music');
        audio.pause();
        isPlaying = false;
    });
    
    // Next button
    document.getElementById('nextBtn').addEventListener('click', playNextSong);
    
    // Volume slider
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        const audio = document.getElementById('bg-music');
        audio.volume = e.target.value;
        document.getElementById('muteBtn').textContent = audio.volume > 0 ? '🔊' : '🔇';
    });
    
    // Mute button
    document.getElementById('muteBtn').addEventListener('click', () => {
        const audio = document.getElementById('bg-music');
        if(isMuted) {
            audio.volume = document.getElementById('volumeSlider').value;
            document.getElementById('muteBtn').textContent = '🔊';
        } else {
            audio.volume = 0;
            document.getElementById('muteBtn').textContent = '🔇';
        }
        isMuted = !isMuted;
    });
    
    // Playlist selector
    document.getElementById('playlist').addEventListener('change', (e) => {
        loadSong(parseInt(e.target.value));
    });
    
    // Initialize music system after a short delay
    setTimeout(initMusicSystem, 1000);
});

// Updated initialize function
window.addEventListener('load', () => {
    setTimeout(() => {
        loader.classList.add('hidden');
        experience.classList.remove('hidden');
        initStarfield();
        
        // Initialize music with auto-play attempt
        setTimeout(() => {
            const audio = document.getElementById('bg-music');
            audio.volume = 0.5;
            audio.play().catch(e => {
                console.log("Auto-play prevented, waiting for user interaction");
                // Show play button hint
                document.getElementById('playBtn').style.animation = 'pulse 1s infinite';
            });
        }, 2000);
    }, 2000);
});
