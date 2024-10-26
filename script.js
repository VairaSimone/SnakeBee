// Snake data
const snakesData = [
    //{ species: "python", age: "baby", title: "Mojave", description: "Specie affascinante.", image: "screenshot.webp" },
];

const snakeCardsContainer = document.getElementById('snake-cards');

// Function to generate snake cards or a message if not available
function generateSnakeCards() {
    if (snakesData.length === 0) {
        // Display a message if there are no snakes available
        snakeCardsContainer.innerHTML = `
                <div class="col text-center">
                    <h4>Non ci sono serpenti disponibili al momento.</h4>
                    <p>Contattaci per maggiori informazioni.</p>
                </div>`
            ;
    } else {
        // Generate snake cards
        snakesData.forEach(snake => {
            const cardHTML = `
                    <div class="col-md-4 snake-card" data-species="${snake.species}" data-age="${snake.age}">
                        <div class="card">
                            <img src="${snake.image}" class="card-img-top" alt="${snake.title}">
                            <div class="card-body">
                                <h5 class="card-title">${snake.title}</h5>
                                <p class="card-text">${snake.description}</p>
                            </div>
                        </div>
                    </div>`
                ;
            snakeCardsContainer.innerHTML += cardHTML;
        });
    }
}
// Gallery data
const galleryData = [
    { image: "image/gallery/animal1.jpg", alt: "Gallery" },
    { image: "image/gallery/animal2.jpg", alt: "Gallery" },
    { image: "image/gallery/animal3.jpg", alt: "Gallery" },
    { image: "image/gallery/animal4.jpg", alt: "Gallery" },
    { image: "image/gallery/animal5.jpg", alt: "Gallery" },
    { image: "image/gallery/animal6.jpg", alt: "Gallery" },
    { image: "image/gallery/animal7.jpg", alt: "Gallery" },
    { image: "image/gallery/animal8.jpg", alt: "Gallery" },
    { image: "image/gallery/animal9.jpg", alt: "Gallery" },
    { image: "image/gallery/animal10.jpg", alt: "Gallery" },
    { image: "image/gallery/animal11.jpg", alt: "Gallery" },
    { image: "image/gallery/animal12.jpg", alt: "Gallery" },
    { image: "image/gallery/animal13.jpg", alt: "Gallery" },
    { image: "image/gallery/animal14.jpg", alt: "Gallery" },
];

const galleryGridContainer = document.getElementById('gallery-grid');
const imagesPerPage = 6; // Number of images per page
let currentGalleryPage = 1;

// Generate gallery images dynamically
function displayGalleryImages(page) {
    const start = (page - 1) * imagesPerPage;
    const end = start + imagesPerPage;
    galleryGridContainer.innerHTML = '';

    galleryData.slice(start, end).forEach(image => {
        const galleryHTML = `
                    <div class="col-md-4">
                        <img src="${image.image}" class="img-fluid" alt="${image.alt}">
                    </div>`
            ;
        galleryGridContainer.innerHTML += galleryHTML;
    });

    document.querySelectorAll('.gallery-grid img').forEach(img => {
        img.addEventListener('click', function () {
            const src = this.getAttribute('src');
            document.getElementById('lightbox-img').setAttribute('src', src);
            const lightboxModal = new bootstrap.Modal(document.getElementById('lightboxModal'));
            lightboxModal.show();
        });
    });

    createGalleryPagination();
}

// Create gallery pagination
function createGalleryPagination() {
    const totalPages = Math.ceil(galleryData.length / imagesPerPage);
    const paginationGallery = document.getElementById('pagination-gallery');
    paginationGallery.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        if (i === currentGalleryPage) li.classList.add('active');

        const link = document.createElement('a');
        link.classList.add('page-link');
        link.href = '#';
        link.textContent = i;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentGalleryPage = i;
            displayGalleryImages(currentGalleryPage);
        });

        li.appendChild(link);
        paginationGallery.appendChild(li);
    }
}

displayGalleryImages(currentGalleryPage);

const filterSpecies = document.getElementById('filter-species');
const filterAge = document.getElementById('filter-age');
const snakeCards = document.querySelectorAll('.snake-card');

const snakesPerPage = 6;
let currentPage = 1;

function filterSnakes() {
    const selectedSpecies = filterSpecies.value;
    const selectedAge = filterAge.value;

    const filteredSnakes = Array.from(snakeCards).filter(card => {
        const species = card.getAttribute('data-species');
        const age = card.getAttribute('data-age');
        return (selectedSpecies === 'all' || species === selectedSpecies) &&
            (selectedAge === 'all' || age === selectedAge);
    });

    displayPage(filteredSnakes, currentPage);
    createPagination(filteredSnakes);
}

function displayPage(snakes, page) {
    const start = (page - 1) * snakesPerPage;
    const end = start + snakesPerPage;
    snakeCards.forEach(card => card.style.display = 'none');
    snakes.slice(start, end).forEach(card => card.style.display = 'block');
}

function createPagination(snakes) {
    const totalPages = Math.ceil(snakes.length / snakesPerPage);
    const paginationSnakes = document.getElementById('pagination-snakes');
    paginationSnakes.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        if (i === currentPage) li.classList.add('active');

        const link = document.createElement('a');
        link.classList.add('page-link');
        link.href = '#';
        link.textContent = i;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            displayPage(snakes, currentPage);
            createPagination(snakes);
        });

        li.appendChild(link);
        paginationSnakes.appendChild(li);
    }
}

filterSpecies.addEventListener('change', () => {
    currentPage = 1;
    filterSnakes();
});

filterAge.addEventListener('change', () => {
    currentPage = 1;
    filterSnakes();
});

window.addEventListener('scroll', function () {
    var navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
generateSnakeCards();
filterSnakes();

(function () {
    emailjs.init("Nq4sxVbeObmkJINnT"); //ID EmailJS
})();

document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const status = document.getElementById('email-status');
    status.innerHTML = 'Invio in corso...';

    emailjs.sendForm('service_wsxft7q', 'template_oblgk9m', this)
        .then(function () {
            status.innerHTML = 'Messaggio inviato con successo!';
            document.getElementById('contact-form').reset();
        }, function (error) {
            status.innerHTML = 'Errore nell\'invio del messaggio, riprova più tardi.';
        });
});
