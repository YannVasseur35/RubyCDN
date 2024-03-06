var Audio = {
    play: function (elementName) {
        //console.log('Audio.play !');
        document.getElementById(elementName).play();
    },
    pause: function (elementName) {
        //console.log('Audio.pause !');
        document.getElementById(elementName).pause();
    },
    setVolume: function (elementName, volume) {
        //console.log('Audio.pause !');
        document.getElementById(elementName).volume = volume;
    }
}

export { Audio };