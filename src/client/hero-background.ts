(async () => {
  const hero = document.getElementById('locations')!;
  const location = document.getElementById('location')!;
  const photographer = document.getElementById('photographer')! as HTMLLinkElement;
  const source = document.getElementById('source')! as HTMLLinkElement;

  let current = 0;
  let changing = false;

  const photos = await fetch('/assets/photos/index.json')
    .then((response) => response.json())
    .catch((error) => []);

  const displayBackground = (forced: boolean = false) => {
    if (!changing || forced) {
      const style = hero.style;
      current = (current + 1) % photos.length;

      style.setProperty('--prev-image', style.getPropertyValue('--current-image') ?? '');
      style.setProperty('--current-image', `url("${photos[current].image.path}")`);
    }

    if (changing || forced) {
      const details = photos[current];
      location.textContent = details.location;
      photographer.textContent = details.author.name;
      photographer.href = details.author.url;
      source.textContent = details.image.platform;
      source.href = details.image.original;
    }

    hero?.toggleAttribute('animate', changing || forced);
    changing = !(changing || forced);
  };

  displayBackground(true);

  setInterval(displayBackground, 3000);
})();
