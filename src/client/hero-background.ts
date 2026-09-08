(async () => {
  const container = document.getElementById('background') as HTMLElement;

  const currentImage = container.querySelector(
    '.hero-background__image--current'
  ) as HTMLElement;

  const nextImage = container.querySelector(
    '.hero-background__image--next'
  ) as HTMLElement;

  const location = document.getElementById('location') as HTMLElement;

  const photographer = document.getElementById(
    'photographer'
  ) as HTMLLinkElement | null;

  const source = document.getElementById(
    'source'
  ) as HTMLLinkElement | null;

  // ------------------------------------------------------------
  // Load photo data
  // ------------------------------------------------------------

  const groups = await fetch('/assets/photos/index.json')
    .then((response) => response.json())
    .catch(() => []);

  if (!groups.length) {
    return;
  }

  let current = -1;

  // ------------------------------------------------------------
  // Preload + decode an image
  // ------------------------------------------------------------

  const preload = async (url: string) => {
    const img = new Image();

    img.src = url;

    try {
      await img.decode();
    } catch {
      // The image may already be decoded/cached,
      // or the browser may reject decode().
    }

    return img;
  };

  // ------------------------------------------------------------
  // Pick the next photo
  // ------------------------------------------------------------

  const getNextPhoto = () => {
    current = (current + 1) % groups.length;

    const group = groups[current];

    return group[Math.floor(Math.random() * group.length)];
  };

  // ------------------------------------------------------------
  // Update photo information
  // ------------------------------------------------------------

  const updateDetails = (photo: any) => {
    location.textContent = photo.location;

    if (photographer) {
      photographer.textContent = photo.author.name;
      photographer.href = photo.author.url;
    }

    if (source) {
      source.textContent = photo.image.platform;
      source.href = photo.image.original;
    }
  };

  // ------------------------------------------------------------
  // Show the first image
  // ------------------------------------------------------------

  let photo = getNextPhoto();

  await preload(photo.image.path);

  currentImage.style.backgroundImage =
    `url("${photo.image.path}")`;

  updateDetails(photo);

  // ------------------------------------------------------------
  // Prepare the next image immediately
  // ------------------------------------------------------------

  let nextPhoto = getNextPhoto();

  let nextPromise = preload(nextPhoto.image.path);

  // ------------------------------------------------------------
  // Change image every 3 seconds
  // ------------------------------------------------------------

  setInterval(async () => {
    const photoToShow = nextPhoto;

    // This image has already been downloading/decoding
    // while the previous image was visible.
    await nextPromise;

    // Put the decoded image into the next layer.
    nextImage.style.backgroundImage =
      `url("${photoToShow.image.path}")`;

    /*
     * Force the browser to acknowledge the new background
     * before starting the opacity transition.
     */
    void nextImage.offsetWidth;

    // Start the fade.
    nextImage.classList.add('is-visible');

    updateDetails(photoToShow);

    // ----------------------------------------------------------
    // Start preparing the image AFTER this one
    // ----------------------------------------------------------

    nextPhoto = getNextPhoto();
    nextPromise = preload(nextPhoto.image.path);

    // ----------------------------------------------------------
    // After the fade, swap the layers
    // ----------------------------------------------------------

    setTimeout(() => {
      currentImage.style.backgroundImage =
        `url("${photoToShow.image.path}")`;

      nextImage.classList.remove('is-visible');
      nextImage.style.backgroundImage = '';
    }, 320);
  }, 5000);
})();
