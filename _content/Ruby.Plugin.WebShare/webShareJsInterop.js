var ShareFunctions = {
    prompt: function (message) {
        return prompt(message, 'Type anything here');
    },
    share: function () {
        if (navigator.share) {
            navigator.share({
                title: 'OutQuest',
                text: 'Venez jouer � une de nos qu�tes',
                url: 'https://outquest.fr/lasalamandre'
            }).then(() => {
                console.log('Thanks for sharing!');
            })
                .catch(console.error);
        } else {
            shareDialog.classList.add('is-open');
        }
    },
    share: function (title, text, url) {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: text,
                url: url
            }).then(() => {
                console.log('Thanks for sharing!');
            })
                .catch(console.error);
        } else {
            shareDialog.classList.add('is-open');
        }
    }
}

export { ShareFunctions };